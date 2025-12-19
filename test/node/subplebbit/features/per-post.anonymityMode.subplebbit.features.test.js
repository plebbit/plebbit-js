import { expect } from "chai";
import { describe, it } from "vitest";
import {
    createSubWithNoChallenge,
    describeSkipIfRpc,
    getAvailablePlebbitConfigsToTestAgainst,
    mockPlebbit,
    publishRandomPost,
    publishRandomReply,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    forceSubplebbitToGenerateAllPostsPages,
    waitTillPostInSubplebbitPages,
    waitTillReplyInParentPages,
    waitTillReplyInParentPagesInstance
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";

const remotePlebbitConfigs = getAvailablePlebbitConfigsToTestAgainst({ includeAllPossibleConfigOnEnv: true });

describeSkipIfRpc('subplebbit.features.anonymityMode="per-post"', () => {
    describe.sequential("local anonymization", () => {
        let context;
        let authorSigner;
        let otherSigner;

        before(async () => {
            context = await createPerPostSubplebbit();
            authorSigner = await context.publisherPlebbit.createSigner();
            otherSigner = await context.publisherPlebbit.createSigner();
        });

        after(async () => {
            await context.cleanup();
        });

        it('Spec: sub re-signs comments with an anonymized author address when anonymityMode="per-post"', async () => {
            const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(post.cid);
            expect(aliasRow).to.exist;
            expect(aliasRow?.mode).to.equal("per-post");
            expect(aliasRow?.originalAuthorSignerPublicKey).to.equal(authorSigner.publicKey);

            const aliasSigner = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });
            const stored = context.subplebbit._dbHandler.queryComment(post.cid);

            expect(stored?.author?.address).to.equal(aliasSigner.address);
            expect(stored?.signature?.publicKey).to.equal(aliasSigner.publicKey);
            expect(stored?.signature?.publicKey).to.not.equal(authorSigner.publicKey);
            await post.stop();
        });

        it("Spec: same signer maps to the same anonymized author address within a single post thread", async () => {
            const threadSigner = await context.publisherPlebbit.createSigner();
            const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: threadSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);
            const reply = await publishRandomReply(post, context.publisherPlebbit, { signer: threadSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, reply);

            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasForPost(threadSigner.publicKey, post.cid);
            expect(aliasRow).to.exist;
            const aliasSigner = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });

            const storedPost = context.subplebbit._dbHandler.queryComment(post.cid);
            const storedReply = context.subplebbit._dbHandler.queryComment(reply.cid);

            [storedPost, storedReply].forEach((stored) => {
                expect(stored?.author?.address).to.equal(aliasSigner.address);
                expect(stored?.signature?.publicKey).to.equal(aliasSigner.publicKey);
            });
            expect(storedReply?.parentCid).to.equal(post.cid);
            await post.stop();
            await reply.stop();
        });

        it("Spec: two different signers never share the same anonymized author address within a single post thread", async () => {
            const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

            const replyFromAuthor = await publishRandomReply(post, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, replyFromAuthor);
            const replyFromOther = await publishRandomReply(post, context.publisherPlebbit, { signer: otherSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, replyFromOther);

            const firstAlias = context.subplebbit._dbHandler.queryAnonymityAliasForPost(authorSigner.publicKey, post.cid);
            const secondAlias = context.subplebbit._dbHandler.queryAnonymityAliasForPost(otherSigner.publicKey, post.cid);

            expect(firstAlias).to.exist;
            expect(secondAlias).to.exist;

            const firstAliasSigner = await context.publisherPlebbit.createSigner({
                privateKey: firstAlias.aliasPrivateKey,
                type: "ed25519"
            });
            const secondAliasSigner = await context.publisherPlebbit.createSigner({
                privateKey: secondAlias.aliasPrivateKey,
                type: "ed25519"
            });

            expect(firstAliasSigner.address).to.not.equal(secondAliasSigner.address);
            expect(firstAlias.aliasPrivateKey).to.not.equal(secondAlias.aliasPrivateKey);
            await post.stop();
            await replyFromAuthor.stop();
            await replyFromOther.stop();
        });

        it("Spec: same signer maps to a different anonymized author address across different posts", async () => {
            const firstPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, firstPost);
            const secondPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, secondPost);

            const firstAlias = context.subplebbit._dbHandler.queryAnonymityAliasForPost(authorSigner.publicKey, firstPost.cid);
            const secondAlias = context.subplebbit._dbHandler.queryAnonymityAliasForPost(authorSigner.publicKey, secondPost.cid);
            expect(firstAlias).to.exist;
            expect(secondAlias).to.exist;
            expect(firstAlias.aliasPrivateKey).to.not.equal(secondAlias.aliasPrivateKey);

            const firstAliasSigner = await context.publisherPlebbit.createSigner({
                privateKey: firstAlias.aliasPrivateKey,
                type: "ed25519"
            });
            const secondAliasSigner = await context.publisherPlebbit.createSigner({
                privateKey: secondAlias.aliasPrivateKey,
                type: "ed25519"
            });

            expect(firstAliasSigner.address).to.not.equal(secondAliasSigner.address);
            await firstPost.stop();
            await secondPost.stop();
        });

        it("Spec: replies and edits under a post reuse that post's anonymized author mapping", async () => {
            const threadSigner = await context.publisherPlebbit.createSigner();
            const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: threadSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);
            const reply = await publishRandomReply(post, context.publisherPlebbit, { signer: threadSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, reply);

            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasForPost(threadSigner.publicKey, post.cid);
            expect(aliasRow).to.exist;
            const aliasSigner = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });

            const editedContent = "Edited content " + Date.now();
            const edit = await context.publisherPlebbit.createCommentEdit({
                subplebbitAddress: post.subplebbitAddress,
                commentCid: post.cid,
                content: editedContent,
                signer: threadSigner
            });
            await publishWithExpectedResult(edit, true);

            await resolveWhenConditionIsTrue({
                toUpdate: context.subplebbit,
                predicate: () => context.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: post.cid })?.edit?.content === editedContent
            });

            const storedPost = context.subplebbit._dbHandler.queryComment(post.cid);
            const storedReply = context.subplebbit._dbHandler.queryComment(reply.cid);
            expect(storedPost?.author?.address).to.equal(aliasSigner.address);
            expect(storedReply?.author?.address).to.equal(aliasSigner.address);

            const storedUpdate = context.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: post.cid });
            expect(storedUpdate?.edit?.signature?.publicKey).to.equal(aliasSigner.publicKey);
            await post.stop();
            await reply.stop();
        });

        it("Spec: anonymized publication strips author displayName/wallets/avatar/flair fields", async () => {
            const noisyAuthor = {
                address: authorSigner.address,
                displayName: "Noisy Display Name",
                wallets: {
                    eth: {
                        address: "0x1234",
                        timestamp: Math.round(Date.now() / 1000),
                        signature: { signature: "signature", type: "ed25519" }
                    }
                },
                avatar: {
                    chainTicker: "eth",
                    address: "0x5678",
                    id: "1",
                    timestamp: Math.round(Date.now() / 1000),
                    signature: { signature: "signature", type: "ed25519" }
                },
                flair: { text: "flair" },
                previousCommentCid: "QmYwAPJzv5CZsnAzt8auVTL8gdD5pqqBYn2fvDMLoG34he"
            };
            const noisyPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, {
                author: noisyAuthor,
                signer: authorSigner
            });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, noisyPost);

            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasForPost(authorSigner.publicKey, noisyPost.cid);
            const aliasSigner = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });

            const stored = context.subplebbit._dbHandler.queryComment(noisyPost.cid);
            expect(stored?.author).to.deep.equal({ address: aliasSigner.address });
            expect(stored?.signature?.publicKey).to.equal(aliasSigner.publicKey);
            await noisyPost.stop();
        });

        it("Spec: anonymized publication omits author.previousCommentCid", async () => {
            const chainAuthor = await context.publisherPlebbit.createSigner();
            const previousPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: chainAuthor });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, previousPost);

            const chainedPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, {
                signer: chainAuthor,
                author: { previousCommentCid: previousPost.cid, address: chainAuthor.address }
            });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, chainedPost);

            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasForPost(chainAuthor.publicKey, chainedPost.cid);
            const aliasSigner = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });
            const stored = context.subplebbit._dbHandler.queryComment(chainedPost.cid);
            expect(stored?.author?.previousCommentCid).to.be.undefined;
            expect(stored?.author?.address).to.equal(aliasSigner.address);
            await previousPost.stop();
            await chainedPost.stop();
        });

        it("Spec: anonymized publication preserves original author fields in comment.original while public fields are stripped", async () => {
            const originalAuthor = {
                address: authorSigner.address,
                displayName: "Original Display",
                wallets: {
                    eth: {
                        address: "0x5678",
                        timestamp: Math.round(Date.now() / 1000),
                        signature: { signature: "signature", type: "ed25519" }
                    }
                },
                flair: { text: "OG flair" },
                previousCommentCid: "QmYwAPJzv5CZsnAzt8auVTL8gdD5pqqBYn2fvDMLoG34he"
            };
            const originalContent = "Content before anonymization";
            const originalTitle = "Title before anonymization";

            const authoredPost = await context.publisherPlebbit.createComment({
                subplebbitAddress: context.subplebbit.address,
                signer: authorSigner,
                author: originalAuthor,
                content: originalContent,
                title: originalTitle
            });
            await publishWithExpectedResult(authoredPost, true);
            expect(authoredPost.original).to.be.ok;
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, authoredPost);

            await authoredPost.update();
            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasForPost(authorSigner.publicKey, authoredPost.cid);
            expect(aliasRow).to.exist;
            const alias = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });

            expect(authoredPost.author.address).to.equal(alias.address);
            expect(authoredPost.author.displayName).to.be.undefined;

            expect(authoredPost.original?.author?.address).to.equal(originalAuthor.address);
            expect(authoredPost.original?.author?.displayName).to.equal(originalAuthor.displayName);
            expect(authoredPost.original?.author?.wallets).to.deep.equal(originalAuthor.wallets);
            expect(authoredPost.original?.author?.flair).to.deep.equal(originalAuthor.flair);
            expect(authoredPost.original?.author?.previousCommentCid).to.equal(originalAuthor.previousCommentCid);
            expect(authoredPost.original?.content).to.equal(originalContent);
            expect(authoredPost.original?.signature?.publicKey).to.equal(authorSigner.publicKey);

            await authoredPost.stop();
        });

        it("Spec: comment edit signed by original author is accepted and re-signed with anonymized author key", async () => {
            const editSigner = await context.publisherPlebbit.createSigner();
            const editablePost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: editSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, editablePost);

            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasForPost(editSigner.publicKey, editablePost.cid);
            expect(aliasRow).to.exist;
            const aliasSigner = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });

            const editedContent = "Edited content - " + Date.now();
            const edit = await context.publisherPlebbit.createCommentEdit({
                subplebbitAddress: editablePost.subplebbitAddress,
                commentCid: editablePost.cid,
                content: editedContent,
                signer: editSigner
            });
            await publishWithExpectedResult(edit, true);

            await resolveWhenConditionIsTrue({
                toUpdate: context.subplebbit,
                predicate: () =>
                    context.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: editablePost.cid })?.edit?.content === editedContent
            });

            const storedUpdate = context.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: editablePost.cid });
            expect(storedUpdate?.edit?.content).to.equal(editedContent);
            expect(storedUpdate?.edit?.signature?.publicKey).to.equal(aliasSigner.publicKey);
            await editablePost.stop();
        });

        it("Spec: comment edit is rejected when original author does not match stored anonymization mapping", async () => {
            const ownerSigner = await context.publisherPlebbit.createSigner();
            const intruderSigner = await context.publisherPlebbit.createSigner();
            const targetPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: ownerSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, targetPost);

            const badEdit = await context.publisherPlebbit.createCommentEdit({
                subplebbitAddress: targetPost.subplebbitAddress,
                commentCid: targetPost.cid,
                content: "Unauthorized edit " + Date.now(),
                signer: intruderSigner
            });
            await publishWithExpectedResult(badEdit, false, messages.ERR_COMMENT_EDIT_CAN_NOT_EDIT_COMMENT_IF_NOT_ORIGINAL_AUTHOR);

            const storedUpdate = context.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: targetPost.cid });
            expect(storedUpdate?.edit).to.be.undefined;
            await targetPost.stop();
        });

        it("Spec: anonymized comment.signature.publicKey differs from original author's signer publicKey", async () => {
            const freshSigner = await context.publisherPlebbit.createSigner();
            const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: freshSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

            const stored = context.subplebbit._dbHandler.queryComment(post.cid);
            expect(stored?.signature?.publicKey).to.not.equal(freshSigner.publicKey);
            await post.stop();
        });

        it("Spec: purging an anonymized post without postCid still removes its alias mapping", async () => {
            const purgeSigner = await context.publisherPlebbit.createSigner();
            // publish post, alias will be generated without postCid available to reuse
            const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: purgeSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(post.cid);
            expect(aliasRow).to.exist;

            await context.subplebbit._dbHandler.purgeComment(post.cid);

            const aliasAfterPurge = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(post.cid);
            expect(aliasAfterPurge).to.be.undefined;
            const commentAfterPurge = context.subplebbit._dbHandler.queryComment(post.cid);
            expect(commentAfterPurge).to.be.undefined;
            await post.stop();
        });

        it("Spec: purging an anonymized comment removes only that thread's alias mapping", async () => {
            const purgeSigner = await context.publisherPlebbit.createSigner();
            const firstPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: purgeSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, firstPost);
            const secondPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: purgeSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, secondPost);

            const aliasFirst = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(firstPost.cid);
            const aliasSecond = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(secondPost.cid);
            expect(aliasFirst).to.exist;
            expect(aliasSecond).to.exist;

            await context.subplebbit._dbHandler.purgeComment(firstPost.cid);

            const aliasAfterFirstPurge = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(firstPost.cid);
            expect(aliasAfterFirstPurge).to.be.undefined;
            const aliasAfterSecond = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(secondPost.cid);
            expect(aliasAfterSecond).to.exist;

            const commentAfterPurge = context.subplebbit._dbHandler.queryComment(firstPost.cid);
            expect(commentAfterPurge).to.be.undefined;
            await firstPost.stop();
            await secondPost.stop();
        });

        it("Spec: sub owner can resolve an anonymized author address back to the original author address", async () => {
            const resolvablePost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, resolvablePost);

            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasForPost(authorSigner.publicKey, resolvablePost.cid);
            expect(aliasRow).to.exist;
            expect(aliasRow?.originalAuthorSignerPublicKey).to.equal(authorSigner.publicKey);

            const aliasSigner = await context.publisherPlebbit.createSigner({
                privateKey: aliasRow.aliasPrivateKey,
                type: "ed25519"
            });
            expect(aliasSigner.address).to.be.a("string");
            await resolvablePost.stop();
        });

        it("Spec: owner resolution differentiates multiple anonymized addresses created by the same signer across different posts", async () => {
            const firstPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, firstPost);
            const secondPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, secondPost);

            const firstAlias = context.subplebbit._dbHandler.queryAnonymityAliasForPost(authorSigner.publicKey, firstPost.cid);
            const secondAlias = context.subplebbit._dbHandler.queryAnonymityAliasForPost(authorSigner.publicKey, secondPost.cid);
            expect(firstAlias).to.exist;
            expect(secondAlias).to.exist;
            expect(firstAlias?.originalAuthorSignerPublicKey).to.equal(authorSigner.publicKey);
            expect(secondAlias?.originalAuthorSignerPublicKey).to.equal(authorSigner.publicKey);

            const firstAliasSigner = await context.publisherPlebbit.createSigner({
                privateKey: firstAlias.aliasPrivateKey,
                type: "ed25519"
            });
            const secondAliasSigner = await context.publisherPlebbit.createSigner({
                privateKey: secondAlias.aliasPrivateKey,
                type: "ed25519"
            });

            expect(firstAliasSigner.address).to.not.equal(secondAliasSigner.address);
            await firstPost.stop();
            await secondPost.stop();
        });

        it("Spec: disabling pseudonymousAuthors stops anonymization for new comments without rewriting old ones", async () => {
            await context.subplebbit.edit({ features: { anonymityMode: undefined } });
            await resolveWhenConditionIsTrue({
                toUpdate: context.subplebbit,
                predicate: () => typeof context.subplebbit.updatedAt === "number"
            });

            const plainSigner = await context.publisherPlebbit.createSigner();
            const plainPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: plainSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, plainPost);

            const stored = context.subplebbit._dbHandler.queryComment(plainPost.cid);
            expect(stored?.author?.address).to.equal(plainSigner.address);
            expect(stored?.signature?.publicKey).to.equal(plainSigner.publicKey);
            const alias = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(plainPost.cid);
            expect(alias).to.be.undefined;
            await plainPost.stop();
        });
    });

    describe.concurrent("remote loading with anonymized comments", () => {
        describe("preloaded pages", () => {
            let sharedContext;
            let aliasSigner;
            let signingAuthor;

            before(async () => {
                sharedContext = await createPerPostSubplebbit();
                signingAuthor = await sharedContext.publisherPlebbit.createSigner();
                sharedContext.post = await publishRandomPost(sharedContext.subplebbit.address, sharedContext.publisherPlebbit, {
                    signer: signingAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(sharedContext.subplebbit, sharedContext.post);
                sharedContext.reply = await publishRandomReply(sharedContext.post, sharedContext.publisherPlebbit, {
                    signer: signingAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(sharedContext.subplebbit, sharedContext.reply);
                await waitTillPostInSubplebbitPages(sharedContext.post, sharedContext.publisherPlebbit);
                await waitTillReplyInParentPages(sharedContext.reply, sharedContext.publisherPlebbit);

                const aliasRow = sharedContext.subplebbit._dbHandler.queryAnonymityAliasForPost(
                    signingAuthor.publicKey,
                    sharedContext.post.cid
                );
                expect(aliasRow).to.exist;
                aliasSigner = await sharedContext.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });
            });

            after(async () => {
                await sharedContext?.post?.stop();
                await sharedContext?.reply?.stop();
                await sharedContext?.cleanup();
            });

            remotePlebbitConfigs.forEach((config) => {
                describe.concurrent(`${config.name} - preloaded`, () => {
                    let remotePlebbit;

                    before(async () => {
                        remotePlebbit = await config.plebbitInstancePromise();
                        await waitTillPostInSubplebbitPages(sharedContext.post, remotePlebbit);
                        await waitTillReplyInParentPages(sharedContext.reply, remotePlebbit);
                    });

                    after(async () => {
                        await remotePlebbit?.destroy();
                    });

                    it("Spec: loads preloaded pages with anonymized posts/replies without failing verification", async () => {
                        const remoteSubplebbit = await remotePlebbit.getSubplebbit({ address: sharedContext.subplebbit.address });
                        expect(Object.keys(remoteSubplebbit.posts.pages).length).to.be.greaterThan(0);
                        for (const sortName of Object.keys(remoteSubplebbit.posts.pages)) {
                            const page = remoteSubplebbit.posts.pages[sortName];
                            const postInPage = page?.comments?.find((c) => c.cid === sharedContext.post.cid);
                            expect(postInPage).to.be.ok;
                            expect(postInPage?.author?.address).to.equal(aliasSigner.address);
                            expect(postInPage?.author?.displayName).to.be.undefined;
                            expect(postInPage?.author?.wallets).to.be.undefined;
                            expect(postInPage?.author?.flair).to.be.undefined;
                            expect(postInPage?.signature?.publicKey).to.equal(aliasSigner.publicKey);
                        }
                    });

                    it("Spec: getComment returns an anonymized post/reply and keeps per-post alias stable on update", async () => {
                        const remoteComment = await remotePlebbit.getComment({ cid: sharedContext.post.cid });
                        await remoteComment.update();
                        await resolveWhenConditionIsTrue({
                            toUpdate: remoteComment,
                            predicate: () => typeof remoteComment.updatedAt === "number"
                        });
                        expect(remoteComment.author.address).to.equal(aliasSigner.address);
                        expect(remoteComment.author.displayName).to.be.undefined;
                        expect(remoteComment.signature.publicKey).to.equal(aliasSigner.publicKey);
                        await remoteComment.stop();
                    });

                    it("Spec: comment.update() on an anonymized reply keeps per-post alias and signature verification passing", async () => {
                        const remoteReply = await remotePlebbit.getComment({ cid: sharedContext.reply.cid });
                        await remoteReply.update();
                        await resolveWhenConditionIsTrue({
                            toUpdate: remoteReply,
                            predicate: () => typeof remoteReply.updatedAt === "number"
                        });
                        expect(remoteReply.author.address).to.equal(aliasSigner.address);
                        expect(remoteReply.signature.publicKey).to.equal(aliasSigner.publicKey);
                        await remoteReply.stop();
                    });
                });
            });
        });

        describe.concurrent("paginated pages", () => {
            let paginatedContext;
            let paginatedAliasSigner;
            let paginatedSigningAuthor;
            let secondPostAliasSigner;

            before(async () => {
                paginatedContext = await createPerPostSubplebbit();
                paginatedSigningAuthor = await paginatedContext.publisherPlebbit.createSigner();
                paginatedContext.post = await publishRandomPost(paginatedContext.subplebbit.address, paginatedContext.publisherPlebbit, {
                    signer: paginatedSigningAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(paginatedContext.subplebbit, paginatedContext.post);
                paginatedContext.reply = await publishRandomReply(paginatedContext.post, paginatedContext.publisherPlebbit, {
                    signer: paginatedSigningAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(paginatedContext.subplebbit, paginatedContext.reply);

                paginatedContext.secondPost = await publishRandomPost(
                    paginatedContext.subplebbit.address,
                    paginatedContext.publisherPlebbit,
                    {
                        signer: paginatedSigningAuthor
                    }
                );
                await waitForStoredCommentUpdateWithAssertions(paginatedContext.subplebbit, paginatedContext.secondPost);

                await forceSubplebbitToGenerateAllPostsPages(paginatedContext.subplebbit);
                await waitTillPostInSubplebbitPages(paginatedContext.post, paginatedContext.publisherPlebbit);
                await waitTillPostInSubplebbitPages(paginatedContext.secondPost, paginatedContext.publisherPlebbit);
                await waitTillReplyInParentPages(paginatedContext.reply, paginatedContext.publisherPlebbit);

                const aliasRow = paginatedContext.subplebbit._dbHandler.queryAnonymityAliasForPost(
                    paginatedSigningAuthor.publicKey,
                    paginatedContext.post.cid
                );
                const secondAliasRow = paginatedContext.subplebbit._dbHandler.queryAnonymityAliasForPost(
                    paginatedSigningAuthor.publicKey,
                    paginatedContext.secondPost.cid
                );
                expect(aliasRow).to.exist;
                expect(secondAliasRow).to.exist;
                paginatedAliasSigner = await paginatedContext.publisherPlebbit.createSigner({
                    privateKey: aliasRow.aliasPrivateKey,
                    type: "ed25519"
                });
                secondPostAliasSigner = await paginatedContext.publisherPlebbit.createSigner({
                    privateKey: secondAliasRow.aliasPrivateKey,
                    type: "ed25519"
                });
            });

            after(async () => {
                await paginatedContext?.post?.stop();
                await paginatedContext?.reply?.stop();
                await paginatedContext?.secondPost?.stop();
                await paginatedContext?.cleanup();
            });

            remotePlebbitConfigs.forEach((config) => {
                describe.sequential(`${config.name} - paginated`, () => {
                    let remotePlebbit;

                    before(async () => {
                        remotePlebbit = await config.plebbitInstancePromise();
                        await waitTillPostInSubplebbitPages(paginatedContext.post, remotePlebbit);
                        await waitTillPostInSubplebbitPages(paginatedContext.secondPost, remotePlebbit);
                        await waitTillReplyInParentPages(paginatedContext.reply, remotePlebbit);
                    });

                    after(async () => {
                        await remotePlebbit?.destroy();
                    });

                    it("Spec: subplebbit.posts.getPage({ cid }) loads a page with anonymized comments", async () => {
                        const remoteSubplebbit = await remotePlebbit.getSubplebbit({ address: paginatedContext.subplebbit.address });
                        expect(Object.keys(remoteSubplebbit.posts.pageCids).length).to.be.greaterThan(0);
                        for (const firstPageCid of Object.values(remoteSubplebbit.posts.pageCids)) {
                            let currentCid = firstPageCid;
                            let found;
                            while (currentCid && !found) {
                                const page = await remoteSubplebbit.posts.getPage({ cid: currentCid });
                                const postInPage = page.comments.find((c) => c.cid === paginatedContext.post.cid);
                                if (postInPage) {
                                    expect(postInPage?.author?.address).to.equal(paginatedAliasSigner.address);
                                    expect(postInPage?.signature?.publicKey).to.equal(paginatedAliasSigner.publicKey);
                                    found = true;
                                } else currentCid = page.nextCid;
                            }
                            expect(found, "expected paginated post to appear in one of the pages").to.be.true;
                        }
                    });

                    it("Spec: comment.replies.getPage({ cid }) loads a page with anonymized replies", async () => {
                        const remoteParent = await remotePlebbit.getComment({ cid: paginatedContext.post.cid });
                        await remoteParent.update();
                        await waitTillReplyInParentPagesInstance(paginatedContext.reply, remoteParent);
                        const replyPageCid = Object.values(remoteParent.replies.pageCids || {})[0];
                        if (!replyPageCid) {
                            const preloadedBest = remoteParent.replies.pages?.best;
                            expect(
                                preloadedBest?.comments.length,
                                "expected preloaded replies to exist when no pageCid is present"
                            ).to.be.greaterThan(0);
                            const replyEntry = preloadedBest.comments.find((c) => c.cid === paginatedContext.reply.cid);
                            expect(replyEntry?.author?.address).to.equal(paginatedAliasSigner.address);
                            expect(replyEntry?.signature?.publicKey).to.equal(paginatedAliasSigner.publicKey);
                        } else {
                            const repliesPage = await remoteParent.replies.getPage({ cid: replyPageCid });
                            const replyEntryInPage = repliesPage.comments.find((c) => c.cid === paginatedContext.reply.cid);
                            expect(replyEntryInPage?.author?.address).to.equal(paginatedAliasSigner.address);
                            expect(replyEntryInPage?.signature?.publicKey).to.equal(paginatedAliasSigner.publicKey);
                        }
                        await remoteParent.stop();
                    });

                    it("Spec: when two posts share the same signer, paginated pages surface distinct anonymized addresses per post with valid signatures", async () => {
                        const remoteSubplebbit = await remotePlebbit.getSubplebbit({ address: paginatedContext.subplebbit.address });
                        const seenAddresses = new Map();

                        for (const firstPageCid of Object.values(remoteSubplebbit.posts.pageCids)) {
                            let currentCid = firstPageCid;
                            while (currentCid) {
                                const page = await remoteSubplebbit.posts.getPage({ cid: currentCid });
                                page.comments.forEach((comment) => {
                                    if (comment.cid === paginatedContext.post.cid) {
                                        seenAddresses.set(comment.cid, {
                                            address: comment.author.address,
                                            publicKey: comment.signature.publicKey
                                        });
                                    }
                                    if (comment.cid === paginatedContext.secondPost.cid) {
                                        seenAddresses.set(comment.cid, {
                                            address: comment.author.address,
                                            publicKey: comment.signature.publicKey
                                        });
                                    }
                                });
                                if (
                                    page.nextCid &&
                                    (!seenAddresses.has(paginatedContext.post.cid) || !seenAddresses.has(paginatedContext.secondPost.cid))
                                )
                                    currentCid = page.nextCid;
                                else break;
                            }
                        }

                        expect(seenAddresses.has(paginatedContext.post.cid)).to.be.true;
                        expect(seenAddresses.has(paginatedContext.secondPost.cid)).to.be.true;
                        const firstEntry = seenAddresses.get(paginatedContext.post.cid);
                        const secondEntry = seenAddresses.get(paginatedContext.secondPost.cid);
                        expect(firstEntry.address).to.equal(paginatedAliasSigner.address);
                        expect(firstEntry.publicKey).to.equal(paginatedAliasSigner.publicKey);
                        expect(secondEntry.address).to.equal(secondPostAliasSigner.address);
                        expect(secondEntry.publicKey).to.equal(secondPostAliasSigner.publicKey);
                        expect(firstEntry.address).to.not.equal(secondEntry.address);
                    });
                });
            });
        });
    });
});

async function createPerPostSubplebbit() {
    const publisherPlebbit = await mockPlebbit();
    const subplebbit = await createSubWithNoChallenge({}, publisherPlebbit);
    await subplebbit.edit({ features: { anonymityMode: "per-post" } });
    await subplebbit.start();
    await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" });

    return {
        publisherPlebbit,
        subplebbit,
        cleanup: async () => {
            await subplebbit.delete();
            await publisherPlebbit.destroy();
        }
    };
}

async function waitForStoredCommentUpdateWithAssertions(subplebbit, comment) {
    if (!comment.cid) throw new Error("waitForStoredCommentUpdateWithAssertions expects comment.cid to be defined");
    const storedUpdate = await waitForStoredCommentUpdate(subplebbit, comment.cid);
    expect(storedUpdate.cid).to.equal(comment.cid);
    expect(storedUpdate.updatedAt).to.be.a("number");
    expect(storedUpdate.replyCount).to.be.a("number");
    expect(storedUpdate.protocolVersion).to.be.a("string");
    expect(storedUpdate.signature).to.be.an("object");
    expect(storedUpdate.signature.signedPropertyNames).to.be.an("array").that.is.not.empty;
    return storedUpdate;
}

async function waitForStoredCommentUpdate(subplebbit, cid) {
    if (!cid) throw new Error("waitForStoredCommentUpdate requires a cid");
    const timeoutMs = 60000;
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const stored = subplebbit._dbHandler.queryStoredCommentUpdate({ cid });
        if (stored) return stored;
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error(`Timed out waiting for stored comment update for ${cid}`);
}
