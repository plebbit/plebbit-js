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
    waitTillPostInSubplebbitPages,
    waitTillReplyInParentPages
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";

const remotePlebbitConfigs = getAvailablePlebbitConfigsToTestAgainst({ includeAllPossibleConfigOnEnv: true });

describeSkipIfRpc('subplebbit.features.anonymityMode="per-author"', () => {
    describe("local anonymization", () => {
        let context;
        let authorSigner;
        let otherSigner;

        before(async () => {
            context = await createPerAuthorSubplebbit();
            authorSigner = await context.publisherPlebbit.createSigner();
            otherSigner = await context.publisherPlebbit.createSigner();
        });

        after(async () => {
            await context.cleanup();
        });

        it('Spec: same signer maps to a stable pseudonymous author address across all posts and replies when anonymityMode="per-author"', async () => {
            const firstPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            const secondPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            const reply = await publishRandomReply(secondPost, context.publisherPlebbit, { signer: authorSigner });

            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, firstPost);
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, secondPost);
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, reply);

            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasForAuthor(authorSigner.publicKey);
            expect(aliasRow).to.exist;
            expect(aliasRow.mode).to.equal("per-author");
            const aliasSigner = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });

            const storedFirst = context.subplebbit._dbHandler.queryComment(firstPost.cid);
            const storedSecond = context.subplebbit._dbHandler.queryComment(secondPost.cid);
            const storedReply = context.subplebbit._dbHandler.queryComment(reply.cid);

            [storedFirst, storedSecond, storedReply].forEach((stored) => {
                expect(stored?.author?.address).to.equal(aliasSigner.address);
                expect(stored?.signature?.publicKey).to.equal(aliasSigner.publicKey);
            });
            expect(storedReply?.parentCid).to.equal(secondPost.cid);
            await firstPost.stop();
            await secondPost.stop();
            await reply.stop();
        });

        it("Spec: two different signers never share the same pseudonymous author address", async () => {
            const thirdPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: otherSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, thirdPost);

            const firstAlias = context.subplebbit._dbHandler.queryAnonymityAliasForAuthor(authorSigner.publicKey);
            const secondAlias = context.subplebbit._dbHandler.queryAnonymityAliasForAuthor(otherSigner.publicKey);

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
            await thirdPost.stop();
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

            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasForAuthor(authorSigner.publicKey);
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

            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasForAuthor(chainAuthor.publicKey);
            const aliasSigner = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });
            const stored = context.subplebbit._dbHandler.queryComment(chainedPost.cid);
            expect(stored?.author?.previousCommentCid).to.be.undefined;
            expect(stored?.author?.address).to.equal(aliasSigner.address);
            await previousPost.stop();
            await chainedPost.stop();
        });

        it("Spec: author receives anonymized comment but comment.original keeps original fields", async () => {
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
            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasForAuthor(authorSigner.publicKey);
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

            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasForAuthor(editSigner.publicKey);
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

        it("Spec: purging an anonymized comment removes its alias mapping", async () => {
            const purgeSigner = await context.publisherPlebbit.createSigner();
            const purgeTarget = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: purgeSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, purgeTarget);

            const aliasBeforePurge = context.subplebbit._dbHandler.queryAnonymityAliasForAuthor(purgeSigner.publicKey);
            expect(aliasBeforePurge).to.exist;

            await context.subplebbit._dbHandler.purgeComment(purgeTarget.cid);

            const aliasAfterPurge = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(purgeTarget.cid);
            expect(aliasAfterPurge).to.be.undefined;
            const commentAfterPurge = context.subplebbit._dbHandler.queryComment(purgeTarget.cid);
            expect(commentAfterPurge).to.be.undefined;
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
            const alias = context.subplebbit._dbHandler.queryAnonymityAliasForAuthor(plainSigner.publicKey);
            expect(alias).to.be.undefined;
            await plainPost.stop();
        });

        it("Spec: sub owner can resolve the pseudonymous author address back to the original author address", async () => {
            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasForAuthor(authorSigner.publicKey);
            expect(aliasRow).to.exist;
            expect(aliasRow.originalAuthorSignerPublicKey).to.equal(authorSigner.publicKey);

            const aliasSigner = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });
            expect(aliasSigner.address).to.be.a("string");
        });
    });

    describe.sequential("remote loading with anonymized comments", () => {
        let sharedContext;
        let aliasSigner;
        let signingAuthor;

        before(async () => {
            sharedContext = await createPerAuthorSubplebbit();
            signingAuthor = await sharedContext.publisherPlebbit.createSigner();
            sharedContext.post = await publishRandomPost(sharedContext.subplebbit.address, sharedContext.publisherPlebbit, {
                signer: signingAuthor
            });
            await waitForStoredCommentUpdateWithAssertions(sharedContext.subplebbit, sharedContext.post);
            sharedContext.reply = await publishRandomReply(sharedContext.post, sharedContext.publisherPlebbit, { signer: signingAuthor });
            await waitForStoredCommentUpdateWithAssertions(sharedContext.subplebbit, sharedContext.reply);
            await waitTillPostInSubplebbitPages(sharedContext.post, sharedContext.publisherPlebbit);
            await waitTillReplyInParentPages(sharedContext.reply, sharedContext.publisherPlebbit);

            const aliasRow = sharedContext.subplebbit._dbHandler.queryAnonymityAliasForAuthor(signingAuthor.publicKey);
            expect(aliasRow).to.exist;
            aliasSigner = await sharedContext.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });
        });

        after(async () => {
            await sharedContext?.post?.stop();
            await sharedContext?.reply?.stop();
            await sharedContext?.cleanup();
        });

        remotePlebbitConfigs.forEach((config) => {
            describe.sequential(config.name, () => {
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

                it("Spec: subplebbit.posts.getPage({ cid }) loads a page with anonymized comments", async () => {
                    const remoteSubplebbit = await remotePlebbit.getSubplebbit({ address: sharedContext.subplebbit.address });
                    expect(Object.keys(remoteSubplebbit.posts.pageCids).length).to.be.greaterThan(0);
                    for (const firstPageCid of Object.values(remoteSubplebbit.posts.pageCids)) {
                        const page = await remoteSubplebbit.posts.getPage({ cid: firstPageCid });
                        const postInPage = page.comments.find((c) => c.cid === sharedContext.post.cid);
                        expect(postInPage?.author?.address).to.equal(aliasSigner.address);
                        expect(postInPage?.signature?.publicKey).to.equal(aliasSigner.publicKey);
                    }
                });

                it("Spec: comment.replies.getPage({ cid }) loads a page with anonymized replies", async () => {
                    const remoteParent = await remotePlebbit.getComment({ cid: sharedContext.post.cid });
                    await remoteParent.update();
                    const replyPageCid = Object.values(remoteParent.replies.pageCids || {})[0];
                    expect(replyPageCid).to.be.a("string");
                    const repliesPage = await remoteParent.replies.getPage({ cid: replyPageCid });
                    const replyEntryInPage = repliesPage.comments.find((c) => c.cid === sharedContext.reply.cid);
                    expect(replyEntryInPage?.author?.address).to.equal(aliasSigner.address);
                    expect(replyEntryInPage?.signature?.publicKey).to.equal(aliasSigner.publicKey);
                    await remoteParent.stop();
                });

                it("Can load an anonymized comment with getComment", async () => {
                    const remoteComment = await remotePlebbit.getComment({ cid: sharedContext.post.cid });
                    await remoteComment.update();
                    await resolveWhenConditionIsTrue({
                        toUpdate: remoteReply,
                        predicate: () => typeof remoteComment.updatedAt === "number"
                    });
                    expect(remoteComment.author.address).to.equal(aliasSigner.address);
                    expect(remoteComment.author.displayName).to.be.undefined;
                    expect(remoteComment.signature.publicKey).to.equal(aliasSigner.publicKey);
                    await remoteComment.stop();
                });

                it("Can update an anonymized comment with comment.update()", async () => {
                    const remoteReply = await remotePlebbit.getComment({ cid: sharedContext.reply.cid });
                    await remoteReply.update();
                    await resolveWhenConditionIsTrue({ toUpdate: remoteReply, predicate: () => typeof remoteReply.updatedAt === "number" });
                    expect(remoteReply.author.address).to.equal(aliasSigner.address);
                    expect(remoteReply.signature.publicKey).to.equal(aliasSigner.publicKey);
                    await remoteReply.stop();
                });
            });
        });
    });
});

async function createPerAuthorSubplebbit() {
    const publisherPlebbit = await mockPlebbit();
    const subplebbit = await createSubWithNoChallenge({}, publisherPlebbit);
    await subplebbit.edit({ features: { anonymityMode: "per-author" } });
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
    const timeoutMs = 60000;
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const stored = subplebbit._dbHandler.queryStoredCommentUpdate({ cid });
        if (stored) return stored;
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error(`Timed out waiting for stored comment update for ${cid}`);
}
