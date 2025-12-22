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
    forceLocalSubPagesToAlwaysGenerateMultipleChunks,
    waitTillPostInSubplebbitPages,
    waitTillReplyInParentPages,
    waitTillReplyInParentPagesInstance
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";
import { timestamp } from "../../../../dist/node/util.js";
import signers from "../../../fixtures/signers.js";

const remotePlebbitConfigs = getAvailablePlebbitConfigsToTestAgainst({ includeAllPossibleConfigOnEnv: true });

describeSkipIfRpc('subplebbit.features.anonymityMode="per-reply"', () => {
    describe.concurrent("local anonymization", () => {
        let context;
        let authorSigner;
        let otherSigner;

        before(async () => {
            context = await createPerReplySubplebbit();
            authorSigner = await context.publisherPlebbit.createSigner();
            otherSigner = await context.publisherPlebbit.createSigner();
        });

        after(async () => {
            await context.cleanup();
        });

        it('Spec: sub re-signs every new comment with a fresh anonymized author address when anonymityMode="per-reply"', async () => {
            const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

            const reply = await publishRandomReply(post, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, reply);

            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(reply.cid);
            expect(aliasRow).to.exist;
            expect(aliasRow.mode).to.equal("per-reply");
            expect(aliasRow.originalAuthorSignerPublicKey).to.equal(authorSigner.publicKey);

            const aliasSigner = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });
            const stored = context.subplebbit._dbHandler.queryComment(reply.cid);

            expect(stored?.author?.address).to.equal(aliasSigner.address);
            expect(stored?.signature?.publicKey).to.equal(aliasSigner.publicKey);
            expect(stored?.signature?.publicKey).to.not.equal(authorSigner.publicKey);
            await expectCommentCidToUseAlias(context.publisherPlebbit, reply.cid, aliasSigner);
            await post.stop();
            await reply.stop();
        });
        it("Spec: same signer uses different anonymized author addresses for consecutive replies in the same post", async () => {
            const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

            const firstReply = await publishRandomReply(post, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, firstReply);
            const secondReply = await publishRandomReply(post, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, secondReply);

            const firstAlias = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(firstReply.cid);
            const secondAlias = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(secondReply.cid);

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
            await expectCommentCidToUseAlias(context.publisherPlebbit, firstReply.cid, firstAliasSigner);
            await expectCommentCidToUseAlias(context.publisherPlebbit, secondReply.cid, secondAliasSigner);
            await post.stop();
            await firstReply.stop();
            await secondReply.stop();
        });
        it("Spec: anonymized author addresses are never reused for the same signer across replies", async () => {
            const firstPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, firstPost);
            const firstReply = await publishRandomReply(firstPost, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, firstReply);

            const secondPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, secondPost);
            const secondReply = await publishRandomReply(secondPost, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, secondReply);

            const firstAlias = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(firstReply.cid);
            const secondAlias = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(secondReply.cid);

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
            await expectCommentCidToUseAlias(context.publisherPlebbit, firstReply.cid, firstAliasSigner);
            await expectCommentCidToUseAlias(context.publisherPlebbit, secondReply.cid, secondAliasSigner);
            await firstPost.stop();
            await secondPost.stop();
            await firstReply.stop();
            await secondReply.stop();
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

            const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

            const noisyReply = await publishRandomReply(post, context.publisherPlebbit, {
                author: noisyAuthor,
                signer: authorSigner
            });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, noisyReply);

            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(noisyReply.cid);
            const aliasSigner = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });

            const stored = context.subplebbit._dbHandler.queryComment(noisyReply.cid);
            expect(stored?.author).to.deep.equal({ address: aliasSigner.address });
            expect(stored?.signature?.publicKey).to.equal(aliasSigner.publicKey);
            await expectCommentCidToUseAlias(context.publisherPlebbit, noisyReply.cid, aliasSigner);
            await post.stop();
            await noisyReply.stop();
        });

        it("Spec: anonymized publication omits author.previousCommentCid", async () => {
            const chainAuthor = await context.publisherPlebbit.createSigner();
            const previousPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: chainAuthor });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, previousPost);

            const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: chainAuthor });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

            const chainedReply = await publishRandomReply(post, context.publisherPlebbit, {
                signer: chainAuthor,
                author: { previousCommentCid: previousPost.cid, address: chainAuthor.address }
            });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, chainedReply);

            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(chainedReply.cid);
            const aliasSigner = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });
            const stored = context.subplebbit._dbHandler.queryComment(chainedReply.cid);
            expect(stored?.author?.previousCommentCid).to.be.undefined;
            expect(stored?.author?.address).to.equal(aliasSigner.address);
            await expectCommentCidToUseAlias(context.publisherPlebbit, chainedReply.cid, aliasSigner);
            await previousPost.stop();
            await post.stop();
            await chainedReply.stop();
        });

        it("Spec: comment edit signed by original author is accepted and re-signed with anonymized author key", async () => {
            const editSigner = await context.publisherPlebbit.createSigner();
            const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: editSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

            const editableReply = await publishRandomReply(post, context.publisherPlebbit, { signer: editSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, editableReply);

            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(editableReply.cid);
            expect(aliasRow).to.exist;
            const aliasSigner = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });

            const editedContent = "Edited content - " + Date.now();
            const edit = await context.publisherPlebbit.createCommentEdit({
                subplebbitAddress: editableReply.subplebbitAddress,
                commentCid: editableReply.cid,
                content: editedContent,
                signer: editSigner
            });
            await publishWithExpectedResult(edit, true);

            await resolveWhenConditionIsTrue({
                toUpdate: context.subplebbit,
                predicate: () =>
                    context.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: editableReply.cid })?.edit?.content === editedContent
            });

            const storedUpdate = context.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: editableReply.cid });
            expect(storedUpdate?.edit?.content).to.equal(editedContent);
            expect(storedUpdate?.edit?.signature?.publicKey).to.equal(aliasSigner.publicKey);
            const storedComment = context.subplebbit._dbHandler.queryComment(editableReply.cid);
            expect(storedComment?.author?.address).to.equal(aliasSigner.address);
            await expectCommentCidToUseAlias(context.publisherPlebbit, editableReply.cid, aliasSigner);
            await post.stop();
            await editableReply.stop();
        });

        it("Spec: comment edit is rejected when original author does not match stored anonymization mapping", async () => {
            const ownerSigner = await context.publisherPlebbit.createSigner();
            const intruderSigner = await context.publisherPlebbit.createSigner();
            const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: ownerSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

            const targetReply = await publishRandomReply(post, context.publisherPlebbit, { signer: ownerSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, targetReply);

            const badEdit = await context.publisherPlebbit.createCommentEdit({
                subplebbitAddress: targetReply.subplebbitAddress,
                commentCid: targetReply.cid,
                content: "Unauthorized edit " + Date.now(),
                signer: intruderSigner
            });
            await publishWithExpectedResult(badEdit, false, messages.ERR_COMMENT_EDIT_CAN_NOT_EDIT_COMMENT_IF_NOT_ORIGINAL_AUTHOR);

            const storedUpdate = context.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: targetReply.cid });
            expect(storedUpdate?.edit).to.be.undefined;
            await post.stop();
            await targetReply.stop();
        });

        it("Spec: anonymized comment.signature.publicKey differs from original author's signer publicKey", async () => {
            const freshSigner = await context.publisherPlebbit.createSigner();
            const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: freshSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

            const reply = await publishRandomReply(post, context.publisherPlebbit, { signer: freshSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, reply);

            const stored = context.subplebbit._dbHandler.queryComment(reply.cid);
            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(reply.cid);
            expect(aliasRow).to.exist;
            const aliasSigner = await context.publisherPlebbit.createSigner({
                privateKey: aliasRow.aliasPrivateKey,
                type: "ed25519"
            });
            expect(stored?.signature?.publicKey).to.not.equal(freshSigner.publicKey);
            expect(stored?.signature?.publicKey).to.equal(aliasSigner.publicKey);
            expect(stored?.author?.address).to.equal(aliasSigner.address);
            await expectCommentCidToUseAlias(context.publisherPlebbit, reply.cid, aliasSigner);
            await post.stop();
            await reply.stop();
        });

        it("Spec: purging an anonymized comment removes its alias mapping", async () => {
            const purgeSigner = await context.publisherPlebbit.createSigner();
            const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: purgeSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

            const purgeTarget = await publishRandomReply(post, context.publisherPlebbit, { signer: purgeSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, purgeTarget);

            const aliasBeforePurge = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(purgeTarget.cid);
            expect(aliasBeforePurge).to.exist;

            await context.subplebbit._dbHandler.purgeComment(purgeTarget.cid);

            const aliasAfterPurge = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(purgeTarget.cid);
            expect(aliasAfterPurge).to.be.undefined;
            const commentAfterPurge = context.subplebbit._dbHandler.queryComment(purgeTarget.cid);
            expect(commentAfterPurge).to.be.undefined;
            await post.stop();
            await purgeTarget.stop();
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

            const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

            const authoredReply = await context.publisherPlebbit.createComment({
                subplebbitAddress: context.subplebbit.address,
                signer: authorSigner,
                author: originalAuthor,
                content: originalContent,
                parentCid: post.cid,
                postCid: post.cid
            });
            await publishWithExpectedResult(authoredReply, true);
            expect(authoredReply.original).to.be.ok;
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, authoredReply);

            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(authoredReply.cid);
            expect(aliasRow).to.exist;
            const alias = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });
            const expectOriginalFields = () => {
                expect(authoredReply.original?.author?.address).to.equal(originalAuthor.address);
                expect(authoredReply.original?.author?.displayName).to.equal(originalAuthor.displayName);
                expect(authoredReply.original?.author?.wallets).to.deep.equal(originalAuthor.wallets);
                expect(authoredReply.original?.author?.flair).to.deep.equal(originalAuthor.flair);
                expect(authoredReply.original?.author?.previousCommentCid).to.equal(originalAuthor.previousCommentCid);
                expect(authoredReply.original?.content).to.equal(originalContent);
                expect(authoredReply.original?.signature?.publicKey).to.equal(authorSigner.publicKey);
            };

            const stored = context.subplebbit._dbHandler.queryComment(authoredReply.cid);
            expect(stored?.author?.address).to.equal(alias.address);
            expect(stored?.signature?.publicKey).to.equal(alias.publicKey);
            await expectCommentCidToUseAlias(context.publisherPlebbit, authoredReply.cid, alias);
            expectOriginalFields();

            await authoredReply.update();

            expect(authoredReply.author.address).to.equal(alias.address);
            expect(authoredReply.author.displayName).to.be.undefined;

            expectOriginalFields();

            await post.stop();
            await authoredReply.stop();
        });
        it("Spec: per-reply alias stays stable across multiple edits to the same reply but is unique per newly created reply", async () => {
            const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

            const firstReply = await publishRandomReply(post, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, firstReply);

            const secondReply = await publishRandomReply(post, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, secondReply);

            // Get alias for first reply
            const firstAlias = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(firstReply.cid);
            expect(firstAlias).to.exist;

            // Make multiple edits to the same reply
            const firstEditContent = "First edit - " + Date.now();
            const firstEdit = await context.publisherPlebbit.createCommentEdit({
                subplebbitAddress: firstReply.subplebbitAddress,
                commentCid: firstReply.cid,
                content: firstEditContent,
                signer: authorSigner
            });
            await publishWithExpectedResult(firstEdit, true);

            await resolveWhenConditionIsTrue({
                toUpdate: context.subplebbit,
                predicate: () =>
                    context.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: firstReply.cid })?.edit?.content === firstEditContent
            });

            const secondEditContent = "Second edit - " + Date.now();
            const secondEdit = await context.publisherPlebbit.createCommentEdit({
                subplebbitAddress: firstReply.subplebbitAddress,
                commentCid: firstReply.cid,
                content: secondEditContent,
                signer: authorSigner
            });
            await publishWithExpectedResult(secondEdit, true);

            await resolveWhenConditionIsTrue({
                toUpdate: context.subplebbit,
                predicate: () =>
                    context.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: firstReply.cid })?.edit?.content === secondEditContent
            });

            // Verify alias stayed the same across edits
            const aliasAfterEdits = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(firstReply.cid);
            expect(aliasAfterEdits).to.exist;
            expect(aliasAfterEdits.aliasPrivateKey).to.equal(firstAlias.aliasPrivateKey);

            // Verify different replies have different aliases
            const secondAlias = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(secondReply.cid);
            expect(secondAlias).to.exist;
            expect(secondAlias.aliasPrivateKey).to.not.equal(firstAlias.aliasPrivateKey);
            const aliasSigner = await context.publisherPlebbit.createSigner({
                privateKey: aliasAfterEdits.aliasPrivateKey,
                type: "ed25519"
            });
            const secondAliasSigner = await context.publisherPlebbit.createSigner({
                privateKey: secondAlias.aliasPrivateKey,
                type: "ed25519"
            });
            await expectCommentCidToUseAlias(context.publisherPlebbit, firstReply.cid, aliasSigner);
            await expectCommentCidToUseAlias(context.publisherPlebbit, secondReply.cid, secondAliasSigner);

            await post.stop();
            await firstReply.stop();
            await secondReply.stop();
        });

        it("Spec: same signer posting replies across different posts gets a fresh anonymized address for each reply (no cross-post reuse)", async () => {
            const firstPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, firstPost);

            const firstReply = await publishRandomReply(firstPost, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, firstReply);

            const secondPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, secondPost);

            const secondReply = await publishRandomReply(secondPost, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, secondReply);

            const firstAlias = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(firstReply.cid);
            const secondAlias = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(secondReply.cid);

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
            await expectCommentCidToUseAlias(context.publisherPlebbit, firstReply.cid, firstAliasSigner);
            await expectCommentCidToUseAlias(context.publisherPlebbit, secondReply.cid, secondAliasSigner);
            await firstPost.stop();
            await secondPost.stop();
            await firstReply.stop();
            await secondReply.stop();
        });

        it("Spec: author.address domains resolve and are anonymized per reply", async () => {
            const domainSigner = await context.publisherPlebbit.createSigner(signers[6]);
            const domainAddress = "plebbit.eth";
            const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: domainSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

            const resolvedAddress = await context.publisherPlebbit.resolveAuthorAddress({ address: domainAddress });
            expect(resolvedAddress).to.equal(domainSigner.address);

            const domainReply = await context.publisherPlebbit.createComment({
                subplebbitAddress: context.subplebbit.address,
                signer: domainSigner,
                author: { address: domainAddress, displayName: "Domain author" },
                content: "Domain anonymization content " + Date.now(),
                parentCid: post.cid,
                postCid: post.cid
            });
            await publishWithExpectedResult(domainReply, true);
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, domainReply);

            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(domainReply.cid);
            expect(aliasRow).to.exist;
            const aliasSigner = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });

            const stored = context.subplebbit._dbHandler.queryComment(domainReply.cid);
            expect(stored?.author?.address).to.equal(aliasSigner.address);
            expect(stored?.signature?.publicKey).to.equal(aliasSigner.publicKey);
            expect(domainReply.original?.author?.address).to.equal(domainAddress);
            await expectCommentCidToUseAlias(context.publisherPlebbit, domainReply.cid, aliasSigner);

            await post.stop();
            await domainReply.stop();
        });

        it("Spec: reply-to-reply (nested) anonymization creates a unique alias distinct from parent/post aliases and still strips author metadata", async () => {
            const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

            const reply = await publishRandomReply(post, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, reply);

            const nestedReply = await publishRandomReply(reply, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, nestedReply);

            const replyAlias = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(reply.cid);
            const nestedAlias = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(nestedReply.cid);

            expect(replyAlias).to.exist;
            expect(nestedAlias).to.exist;
            expect(replyAlias.aliasPrivateKey).to.not.equal(nestedAlias.aliasPrivateKey);

            const replyAliasSigner = await context.publisherPlebbit.createSigner({
                privateKey: replyAlias.aliasPrivateKey,
                type: "ed25519"
            });
            const nestedAliasSigner = await context.publisherPlebbit.createSigner({
                privateKey: nestedAlias.aliasPrivateKey,
                type: "ed25519"
            });

            expect(replyAliasSigner.address).to.not.equal(nestedAliasSigner.address);

            const storedNested = context.subplebbit._dbHandler.queryComment(nestedReply.cid);
            expect(storedNested?.author?.address).to.equal(nestedAliasSigner.address);
            expect(storedNested?.author?.displayName).to.be.undefined;
            expect(storedNested?.author?.wallets).to.be.undefined;
            await expectCommentCidToUseAlias(context.publisherPlebbit, nestedReply.cid, nestedAliasSigner);

            await post.stop();
            await reply.stop();
            await nestedReply.stop();
        });

        it.sequential(
            "Spec: disabling pseudonymousAuthors stops anonymization for new replies without rewriting previously stored anonymized replies",
            async () => {
                // Create anonymized reply before disabling
                const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
                await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

                const anonymizedReply = await publishRandomReply(post, context.publisherPlebbit, { signer: authorSigner });
                await waitForStoredCommentUpdateWithAssertions(context.subplebbit, anonymizedReply);

                const anonymizedAlias = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(anonymizedReply.cid);
                expect(anonymizedAlias).to.exist;

                // Disable anonymization
                await context.subplebbit.edit({ features: { anonymityMode: undefined } });
                await resolveWhenConditionIsTrue({
                    toUpdate: context.subplebbit,
                    predicate: () => typeof context.subplebbit.updatedAt === "number"
                });

                // Create new reply after disabling - should not be anonymized
                const plainReply = await publishRandomReply(post, context.publisherPlebbit, { signer: authorSigner });
                await waitForStoredCommentUpdateWithAssertions(context.subplebbit, plainReply);

                const storedPlain = context.subplebbit._dbHandler.queryComment(plainReply.cid);
                expect(storedPlain?.author?.address).to.equal(authorSigner.address);
                expect(storedPlain?.signature?.publicKey).to.equal(authorSigner.publicKey);

                const plainAlias = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(plainReply.cid);
                expect(plainAlias).to.be.undefined;

                // Verify old anonymized reply is still anonymized
                const storedAnonymized = context.subplebbit._dbHandler.queryComment(anonymizedReply.cid);
                expect(storedAnonymized?.author?.address).to.not.equal(authorSigner.address);
                expect(storedAnonymized?.signature?.publicKey).to.not.equal(authorSigner.publicKey);
                await expectCommentCidToUseAlias(context.publisherPlebbit, anonymizedReply.cid, {
                    address: storedAnonymized?.author?.address,
                    publicKey: storedAnonymized?.signature?.publicKey
                });

                await post.stop();
                await anonymizedReply.stop();
                await plainReply.stop();

                await context.subplebbit.edit({ features: { anonymityMode: "per-reply" } }); // need to reset
            }
        );

        it.sequential(
            "Spec: purging one anonymized reply removes only that reply's alias mapping and leaves other replies (even from the same signer) intact",
            async () => {
                const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
                await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

                const firstReply = await publishRandomReply(post, context.publisherPlebbit, { signer: authorSigner });
                await waitForStoredCommentUpdateWithAssertions(context.subplebbit, firstReply);

                const secondReply = await publishRandomReply(post, context.publisherPlebbit, { signer: authorSigner });
                await waitForStoredCommentUpdateWithAssertions(context.subplebbit, secondReply);

                // Verify both aliases exist
                const firstAliasBefore = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(firstReply.cid);
                const secondAliasBefore = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(secondReply.cid);
                expect(firstAliasBefore).to.exist;
                expect(secondAliasBefore).to.exist;

                // Purge only the first reply
                await context.subplebbit._dbHandler.purgeComment(firstReply.cid);

                // Verify first reply and alias are gone
                const firstAliasAfter = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(firstReply.cid);
                const firstCommentAfter = context.subplebbit._dbHandler.queryComment(firstReply.cid);
                expect(firstAliasAfter).to.be.undefined;
                expect(firstCommentAfter).to.be.undefined;

                // Verify second reply and alias are still there
                const secondAliasAfter = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(secondReply.cid);
                const secondCommentAfter = context.subplebbit._dbHandler.queryComment(secondReply.cid);
                expect(secondAliasAfter).to.exist;
                expect(secondCommentAfter).to.exist;
                expect(secondAliasAfter.aliasPrivateKey).to.equal(secondAliasBefore.aliasPrivateKey);

                await post.stop();
                await firstReply.stop();
                await secondReply.stop();
            }
        );

        it.sequential(
            "Spec: sub owner can resolve multiple anonymized addresses created by the same signer across several replies and map each back to the original signer",
            async () => {
                const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
                await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

                const firstReply = await publishRandomReply(post, context.publisherPlebbit, { signer: authorSigner });
                await waitForStoredCommentUpdateWithAssertions(context.subplebbit, firstReply);

                const secondReply = await publishRandomReply(post, context.publisherPlebbit, { signer: authorSigner });
                await waitForStoredCommentUpdateWithAssertions(context.subplebbit, secondReply);

                const thirdReply = await publishRandomReply(post, context.publisherPlebbit, { signer: authorSigner });
                await waitForStoredCommentUpdateWithAssertions(context.subplebbit, thirdReply);

                // Verify all aliases exist and map to the same original signer
                const firstAlias = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(firstReply.cid);
                const secondAlias = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(secondReply.cid);
                const thirdAlias = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(thirdReply.cid);

                expect(firstAlias).to.exist;
                expect(secondAlias).to.exist;
                expect(thirdAlias).to.exist;

                expect(firstAlias.originalAuthorSignerPublicKey).to.equal(authorSigner.publicKey);
                expect(secondAlias.originalAuthorSignerPublicKey).to.equal(authorSigner.publicKey);
                expect(thirdAlias.originalAuthorSignerPublicKey).to.equal(authorSigner.publicKey);

                // Verify all aliases are unique
                expect(firstAlias.aliasPrivateKey).to.not.equal(secondAlias.aliasPrivateKey);
                expect(firstAlias.aliasPrivateKey).to.not.equal(thirdAlias.aliasPrivateKey);
                expect(secondAlias.aliasPrivateKey).to.not.equal(thirdAlias.aliasPrivateKey);

                await post.stop();
                await firstReply.stop();
                await secondReply.stop();
                await thirdReply.stop();
            }
        );

        it.sequential("Spec: sub owner can resolve anonymized author addresses back to the original author address", async () => {
            const post = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, post);

            const reply = await publishRandomReply(post, context.publisherPlebbit, { signer: authorSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, reply);

            const aliasRow = context.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(reply.cid);
            expect(aliasRow).to.exist;
            expect(aliasRow.mode).to.equal("per-reply");
            expect(aliasRow.originalAuthorSignerPublicKey).to.equal(authorSigner.publicKey);

            const aliasSigner = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });
            expect(aliasSigner.address).to.be.a("string");
            expect(aliasSigner.address).to.not.equal(authorSigner.address);

            await post.stop();
            await reply.stop();
        });

        it("Spec: challengerequest emits full publication author.subplebbit fields without anonymization in per-reply mode", async () => {
            const localContext = await createPerReplySubplebbit();
            const localAuthor = await localContext.publisherPlebbit.createSigner();
            const voter = await localContext.publisherPlebbit.createSigner();

            try {
                const seededPost = await publishRandomPost(localContext.subplebbit.address, localContext.publisherPlebbit, {
                    signer: localAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, seededPost);

                await resolveWhenConditionIsTrue({
                    toUpdate: localContext.subplebbit,
                    predicate: () => !!localContext.subplebbit._dbHandler.querySubplebbitAuthor(localAuthor.address)
                });

                const subplebbitAuthorBefore = localContext.subplebbit._dbHandler.querySubplebbitAuthor(localAuthor.address);
                expect(subplebbitAuthorBefore, "expected subplebbit author to exist for original signer").to.be.ok;
                expect(subplebbitAuthorBefore.lastCommentCid).to.equal(seededPost.cid);
                expect(subplebbitAuthorBefore.firstCommentTimestamp).to.equal(seededPost.timestamp);
                expect(subplebbitAuthorBefore.postScore).to.equal(0);
                expect(subplebbitAuthorBefore.replyScore).to.equal(0);

                const challengeRequestPromise = new Promise((resolve) => localContext.subplebbit.once("challengerequest", resolve));
                const publication = await localContext.publisherPlebbit.createComment({
                    subplebbitAddress: localContext.subplebbit.address,
                    signer: localAuthor,
                    content: "per-reply challengerequest author.subplebbit check",
                    title: "per-reply challengerequest author.subplebbit check"
                });
                await publishWithExpectedResult(publication, true);

                const challengerequest = await challengeRequestPromise;
                expect(challengerequest.comment.author.address).to.equal(localAuthor.address);
                expect(challengerequest.comment.author.subplebbit).to.deep.equal(subplebbitAuthorBefore);
                expect(challengerequest.comment.author.subplebbit?.lastCommentCid).to.equal(seededPost.cid);
                expect(challengerequest.comment.author.subplebbit?.firstCommentTimestamp).to.equal(seededPost.timestamp);
                expect(challengerequest.comment.author.subplebbit?.postScore).to.equal(0);
                expect(challengerequest.comment.author.subplebbit?.replyScore).to.equal(0);

                await seededPost.stop();
                await publication.stop();
            } finally {
                await localContext.cleanup();
            }
        });

        it("Spec: author.subplebbit.lastCommentCid equals the publication cid when anonymityMode is per-reply", async () => {
            const localContext = await createPerReplySubplebbit();
            const localAuthor = await localContext.publisherPlebbit.createSigner();

            try {
                const post = await publishRandomPost(localContext.subplebbit.address, localContext.publisherPlebbit, {
                    signer: localAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, post);

                const reply = await publishRandomReply(post, localContext.publisherPlebbit, { signer: localAuthor });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, reply);

                const postUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: post.cid });
                const replyUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: reply.cid });
                expect(postUpdate?.author?.subplebbit?.lastCommentCid).to.equal(post.cid);
                expect(replyUpdate?.author?.subplebbit?.lastCommentCid).to.equal(reply.cid);

                await post.stop();
                await reply.stop();
            } finally {
                await localContext.cleanup();
            }
        });

        it("Spec: author.subplebbit.banExpiresAt rejects publications and only surfaces on the specific banned comment when anonymityMode is per-reply", async () => {
            const localContext = await createPerReplySubplebbit();
            const localAuthor = await localContext.publisherPlebbit.createSigner();
            const moderator = await localContext.publisherPlebbit.createSigner();

            await localContext.subplebbit.edit({ roles: { [moderator.address]: { role: "moderator" } } });
            await resolveWhenConditionIsTrue({
                toUpdate: localContext.subplebbit,
                predicate: () => typeof localContext.subplebbit.updatedAt === "number"
            });

            try {
                const post = await publishRandomPost(localContext.subplebbit.address, localContext.publisherPlebbit, {
                    signer: localAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, post);

                const firstReply = await publishRandomReply(post, localContext.publisherPlebbit, { signer: localAuthor });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, firstReply);

                const secondReply = await publishRandomReply(post, localContext.publisherPlebbit, { signer: localAuthor });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, secondReply);

                const banExpiresAt = timestamp() + 60;
                const banModeration = await localContext.publisherPlebbit.createCommentModeration({
                    subplebbitAddress: localContext.subplebbit.address,
                    commentCid: firstReply.cid,
                    commentModeration: { author: { banExpiresAt }, reason: "ban for per-reply test" },
                    signer: moderator
                });
                await publishWithExpectedResult(banModeration, true);

                await resolveWhenConditionIsTrue({
                    toUpdate: localContext.subplebbit,
                    predicate: () =>
                        localContext.subplebbit._dbHandler.querySubplebbitAuthor(localAuthor.address)?.banExpiresAt === banExpiresAt
                });

                await resolveWhenConditionIsTrue({
                    toUpdate: localContext.subplebbit,
                    predicate: () => {
                        const firstUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: firstReply.cid });
                        return firstUpdate?.author?.subplebbit?.banExpiresAt === banExpiresAt;
                    }
                });

                const secondUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: secondReply.cid });
                expect(secondUpdate?.author?.subplebbit?.banExpiresAt).to.be.undefined;

                const blockedReply = await localContext.publisherPlebbit.createComment({
                    subplebbitAddress: localContext.subplebbit.address,
                    signer: localAuthor,
                    parentCid: post.cid,
                    postCid: post.cid,
                    content: "should be blocked"
                });
                await publishWithExpectedResult(blockedReply, false, messages.ERR_AUTHOR_IS_BANNED);

                await post.stop();
                await firstReply.stop();
                await secondReply.stop();
            } finally {
                await localContext.cleanup();
            }
        });

        it("Spec: author.subplebbit.postScore stays 0 when anonymityMode is per-reply even if author has post karma", async () => {
            const localContext = await createPerReplySubplebbit();
            const localAuthor = await localContext.publisherPlebbit.createSigner();
            const voter = await localContext.publisherPlebbit.createSigner();

            try {
                const post = await publishRandomPost(localContext.subplebbit.address, localContext.publisherPlebbit, {
                    signer: localAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, post);

                const upvote = await localContext.publisherPlebbit.createVote({
                    subplebbitAddress: localContext.subplebbit.address,
                    commentCid: post.cid,
                    vote: 1,
                    signer: voter
                });
                await publishWithExpectedResult(upvote, true);

                await resolveWhenConditionIsTrue({
                    toUpdate: localContext.subplebbit,
                    predicate: () => Boolean(localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: post.cid }))
                });

                const postUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: post.cid });
                expect(postUpdate?.author?.subplebbit?.postScore).to.equal(0);

                await post.stop();
            } finally {
                await localContext.cleanup();
            }
        });

        it("Spec: author.subplebbit.replyScore reflects that single reply's karma when anonymityMode is per-reply", async () => {
            const localContext = await createPerReplySubplebbit();
            const localAuthor = await localContext.publisherPlebbit.createSigner();
            const voter = await localContext.publisherPlebbit.createSigner();

            try {
                const post = await publishRandomPost(localContext.subplebbit.address, localContext.publisherPlebbit, {
                    signer: localAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, post);
                const reply = await publishRandomReply(post, localContext.publisherPlebbit, { signer: localAuthor });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, reply);

                // TODO publish upvote to post, and make sure its replyScore = 0
                const upvote = await localContext.publisherPlebbit.createVote({
                    subplebbitAddress: localContext.subplebbit.address,
                    commentCid: reply.cid,
                    vote: 1,
                    signer: voter
                });
                await publishWithExpectedResult(upvote, true);

                await resolveWhenConditionIsTrue({
                    toUpdate: localContext.subplebbit,
                    predicate: () =>
                        localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: reply.cid })?.author?.subplebbit?.replyScore ===
                        1
                });

                const postUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: post.cid });
                const replyUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: reply.cid });
                expect(postUpdate?.author?.subplebbit?.replyScore).to.equal(0);
                expect(replyUpdate?.author?.subplebbit?.replyScore).to.equal(1);

                await post.stop();
                await reply.stop();
            } finally {
                await localContext.cleanup();
            }
        });

        it("Spec: author.subplebbit.replyScore is tracked per reply when anonymityMode is per-reply", async () => {
            const localContext = await createPerReplySubplebbit();
            const localAuthor = await localContext.publisherPlebbit.createSigner();
            const voter = await localContext.publisherPlebbit.createSigner();

            try {
                const post = await publishRandomPost(localContext.subplebbit.address, localContext.publisherPlebbit, {
                    signer: localAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, post);

                const firstReply = await publishRandomReply(post, localContext.publisherPlebbit, { signer: localAuthor });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, firstReply);

                const secondReply = await publishRandomReply(post, localContext.publisherPlebbit, { signer: localAuthor });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, secondReply);

                const upvoteSecondReply = await localContext.publisherPlebbit.createVote({
                    subplebbitAddress: localContext.subplebbit.address,
                    commentCid: secondReply.cid,
                    vote: 1,
                    signer: voter
                });
                await publishWithExpectedResult(upvoteSecondReply, true);

                await resolveWhenConditionIsTrue({
                    toUpdate: localContext.subplebbit,
                    predicate: () => {
                        const firstUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: firstReply.cid });
                        const secondUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: secondReply.cid });
                        return (
                            !!firstUpdate &&
                            secondUpdate?.author?.subplebbit?.replyScore === 1 &&
                            typeof firstUpdate?.author?.subplebbit?.replyScore === "number"
                        );
                    }
                });

                const postUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: post.cid });
                const firstReplyUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: firstReply.cid });
                const secondReplyUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: secondReply.cid });

                expect(postUpdate?.author?.subplebbit?.replyScore).to.equal(0);
                expect(firstReplyUpdate?.author?.subplebbit?.replyScore).to.equal(0);
                expect(secondReplyUpdate?.author?.subplebbit?.replyScore).to.equal(1);

                await post.stop();
                await firstReply.stop();
                await secondReply.stop();
            } finally {
                await localContext.cleanup();
            }
        });

        it("Spec: author.subplebbit.firstCommentTimestamp is the reply timestamp when anonymityMode is per-reply", async () => {
            const localContext = await createPerReplySubplebbit();
            const localAuthor = await localContext.publisherPlebbit.createSigner();

            try {
                const post = await publishRandomPost(localContext.subplebbit.address, localContext.publisherPlebbit, {
                    signer: localAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, post);

                const postUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: post.cid });
                expect(postUpdate?.author?.subplebbit?.firstCommentTimestamp).to.equal(post.timestamp);

                const reply = await publishRandomReply(post, localContext.publisherPlebbit, { signer: localAuthor });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, reply);
                const replyUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: reply.cid });
                expect(replyUpdate?.author?.subplebbit?.firstCommentTimestamp).to.equal(reply.timestamp);

                await post.stop();
                await reply.stop();
            } finally {
                await localContext.cleanup();
            }
        });

        it("Spec: banning a reply in per-reply mode surfaces banExpiresAt on that reply and blocks further replies and posts", async () => {
            const localContext = await createPerReplySubplebbit();
            const localAuthor = await localContext.publisherPlebbit.createSigner();
            const moderator = await localContext.publisherPlebbit.createSigner();

            await localContext.subplebbit.edit({ roles: { [moderator.address]: { role: "moderator" } } });
            await resolveWhenConditionIsTrue({
                toUpdate: localContext.subplebbit,
                predicate: () => typeof localContext.subplebbit.updatedAt === "number"
            });

            try {
                const post = await publishRandomPost(localContext.subplebbit.address, localContext.publisherPlebbit, {
                    signer: localAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, post);
                const firstReply = await publishRandomReply(post, localContext.publisherPlebbit, { signer: localAuthor });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, firstReply);

                const secondReply = await publishRandomReply(post, localContext.publisherPlebbit, { signer: localAuthor });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, secondReply);

                const banExpiresAt = timestamp() + 60;
                const banModeration = await localContext.publisherPlebbit.createCommentModeration({
                    subplebbitAddress: localContext.subplebbit.address,
                    commentCid: firstReply.cid,
                    commentModeration: { author: { banExpiresAt }, reason: "ban for per-reply test" },
                    signer: moderator
                });
                await publishWithExpectedResult(banModeration, true);

                await resolveWhenConditionIsTrue({
                    toUpdate: localContext.subplebbit,
                    predicate: () => {
                        const update = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: firstReply.cid });
                        return update?.author?.subplebbit?.banExpiresAt === banExpiresAt;
                    }
                });

                const secondUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: secondReply.cid });
                expect(secondUpdate?.author?.subplebbit?.banExpiresAt).to.be.undefined;

                await resolveWhenConditionIsTrue({
                    toUpdate: localContext.subplebbit,
                    predicate: () =>
                        localContext.subplebbit._dbHandler.querySubplebbitAuthor(localAuthor.address)?.banExpiresAt === banExpiresAt
                });

                const blockedReply = await localContext.publisherPlebbit.createComment({
                    subplebbitAddress: localContext.subplebbit.address,
                    signer: localAuthor,
                    parentCid: post.cid,
                    postCid: post.cid,
                    content: "blocked after ban"
                });
                await publishWithExpectedResult(blockedReply, false, messages.ERR_AUTHOR_IS_BANNED);

                const blockedPost = await localContext.publisherPlebbit.createComment({
                    subplebbitAddress: localContext.subplebbit.address,
                    signer: localAuthor,
                    title: "blocked post after ban",
                    content: "blocked post after ban"
                });
                await publishWithExpectedResult(blockedPost, false, messages.ERR_AUTHOR_IS_BANNED);

                await post.stop();
                await firstReply.stop();
                await secondReply.stop();
            } finally {
                await localContext.cleanup();
            }
        });
    });

    describe.concurrent("remote loading with anonymized comments", () => {
        describe("preloaded pages", () => {
            let sharedContext;
            let signingAuthor;
            let replyAliasSigner;

            before(async () => {
                sharedContext = await createPerReplySubplebbit();
                signingAuthor = await sharedContext.publisherPlebbit.createSigner();

                // Create post and replies
                sharedContext.post = await publishRandomPost(sharedContext.subplebbit.address, sharedContext.publisherPlebbit, {
                    signer: signingAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(sharedContext.subplebbit, sharedContext.post);

                sharedContext.firstReply = await publishRandomReply(sharedContext.post, sharedContext.publisherPlebbit, {
                    signer: signingAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(sharedContext.subplebbit, sharedContext.firstReply);

                sharedContext.secondReply = await publishRandomReply(sharedContext.post, sharedContext.publisherPlebbit, {
                    signer: signingAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(sharedContext.subplebbit, sharedContext.secondReply);

                await waitTillPostInSubplebbitPages(sharedContext.post, sharedContext.publisherPlebbit);
                await waitTillReplyInParentPages(sharedContext.firstReply, sharedContext.publisherPlebbit);
                await waitTillReplyInParentPages(sharedContext.secondReply, sharedContext.publisherPlebbit);

                // Get alias signer for verification
                const firstReplyAlias = sharedContext.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(sharedContext.firstReply.cid);
                expect(firstReplyAlias).to.exist;
                replyAliasSigner = await sharedContext.publisherPlebbit.createSigner({
                    privateKey: firstReplyAlias.aliasPrivateKey,
                    type: "ed25519"
                });
            });

            after(async () => {
                await sharedContext?.post?.stop();
                await sharedContext?.firstReply?.stop();
                await sharedContext?.secondReply?.stop();
                await sharedContext?.cleanup();
            });

            remotePlebbitConfigs.forEach((config) => {
                describe.concurrent(`${config.name} - preloaded`, () => {
                    let remotePlebbit;

                    before(async () => {
                        remotePlebbit = await config.plebbitInstancePromise();
                        await waitTillPostInSubplebbitPages(sharedContext.post, remotePlebbit);
                        await waitTillReplyInParentPages(sharedContext.firstReply, remotePlebbit);
                        await waitTillReplyInParentPages(sharedContext.secondReply, remotePlebbit);
                    });

                    after(async () => {
                        await remotePlebbit?.destroy();
                    });

                    it("Spec: loads preloaded pages with anonymized posts/replies without failing verification", async () => {
                        const remoteSubplebbit = await remotePlebbit.getSubplebbit({ address: sharedContext.subplebbit.address });
                        expect(Object.keys(remoteSubplebbit.posts.pages).length).to.be.greaterThan(0);

                        // Check posts in pages (posts are not anonymized, only replies are)
                        for (const sortName of Object.keys(remoteSubplebbit.posts.pages)) {
                            const page = remoteSubplebbit.posts.pages[sortName];
                            const postInPage = page?.comments?.find((c) => c.cid === sharedContext.post.cid);
                            if (postInPage) {
                                expect(postInPage?.author?.address).to.equal(sharedContext.post.author.address);
                                expect(postInPage?.signature?.publicKey).to.equal(sharedContext.post.signature.publicKey);
                            }
                        }

                        // Check replies in pages - they should be anonymized
                        const remoteParent = await remotePlebbit.getComment({ cid: sharedContext.post.cid });
                        await remoteParent.update();
                        await resolveWhenConditionIsTrue({
                            toUpdate: remoteParent,
                            predicate: () => typeof remoteParent.updatedAt === "number"
                        });

                        const firstReplyInPreloaded = remoteParent.replies.pages?.best?.comments?.find(
                            (c) => c.cid === sharedContext.firstReply.cid
                        );
                        if (firstReplyInPreloaded) {
                            expect(firstReplyInPreloaded.author.address).to.not.equal(signingAuthor.address);
                            expect(firstReplyInPreloaded.author.displayName).to.be.undefined;
                            expect(firstReplyInPreloaded.author.wallets).to.be.undefined;
                            expect(firstReplyInPreloaded.signature.publicKey).to.not.equal(signingAuthor.publicKey);
                        }

                        await remoteParent.stop();
                    });

                    it("Spec: getComment on an anonymized reply returns stripped author fields and keeps the per-reply alias stable after comment.update()", async () => {
                        const remoteReply = await remotePlebbit.getComment({ cid: sharedContext.firstReply.cid });
                        await remoteReply.update();
                        await resolveWhenConditionIsTrue({
                            toUpdate: remoteReply,
                            predicate: () => typeof remoteReply.updatedAt === "number"
                        });

                        expect(remoteReply.author.address).to.not.equal(signingAuthor.address);
                        expect(remoteReply.author.displayName).to.be.undefined;
                        expect(remoteReply.author.wallets).to.be.undefined;
                        expect(remoteReply.author.flair).to.be.undefined;
                        expect(remoteReply.signature.publicKey).to.not.equal(signingAuthor.publicKey);

                        // Update again to verify alias stability
                        await remoteReply.update();
                        expect(remoteReply.author.address).to.not.equal(signingAuthor.address);
                        expect(remoteReply.signature.publicKey).to.not.equal(signingAuthor.publicKey);

                        await remoteReply.stop();
                    });
                });
            });
        });

        describe("paginated pages", () => {
            let paginatedContext;
            let paginatedSigningAuthor;
            let firstReplyAliasSigner;
            let secondReplyAliasSigner;
            let paginatedForcedChunkingCleanup;
            let nestedForcedChunkingCleanup;

            before(async () => {
                paginatedContext = await createPerReplySubplebbit();
                paginatedSigningAuthor = await paginatedContext.publisherPlebbit.createSigner();

                // Create post and multiple replies for pagination testing
                paginatedContext.post = await publishRandomPost(paginatedContext.subplebbit.address, paginatedContext.publisherPlebbit, {
                    signer: paginatedSigningAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(paginatedContext.subplebbit, paginatedContext.post);

                paginatedContext.firstReply = await publishRandomReply(paginatedContext.post, paginatedContext.publisherPlebbit, {
                    signer: paginatedSigningAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(paginatedContext.subplebbit, paginatedContext.firstReply);

                paginatedContext.secondReply = await publishRandomReply(paginatedContext.post, paginatedContext.publisherPlebbit, {
                    signer: paginatedSigningAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(paginatedContext.subplebbit, paginatedContext.secondReply);

                // Create nested replies
                paginatedContext.firstNestedReply = await publishRandomReply(
                    paginatedContext.firstReply,
                    paginatedContext.publisherPlebbit,
                    {
                        signer: paginatedSigningAuthor
                    }
                );
                await waitForStoredCommentUpdateWithAssertions(paginatedContext.subplebbit, paginatedContext.firstNestedReply);
                const { cleanup } = await forceLocalSubPagesToAlwaysGenerateMultipleChunks({
                    subplebbit: paginatedContext.subplebbit,
                    parentComment: paginatedContext.post
                });
                paginatedForcedChunkingCleanup = cleanup;
                const { cleanup: cleanupNested } = await forceLocalSubPagesToAlwaysGenerateMultipleChunks({
                    subplebbit: paginatedContext.subplebbit,
                    parentComment: paginatedContext.firstReply
                });
                nestedForcedChunkingCleanup = cleanupNested;

                await forceSubplebbitToGenerateAllPostsPages(paginatedContext.subplebbit);
                await waitTillPostInSubplebbitPages(paginatedContext.post, paginatedContext.publisherPlebbit);
                await waitTillReplyInParentPages(paginatedContext.firstReply, paginatedContext.publisherPlebbit);
                await waitTillReplyInParentPages(paginatedContext.secondReply, paginatedContext.publisherPlebbit);
                await waitTillReplyInParentPages(paginatedContext.firstNestedReply, paginatedContext.publisherPlebbit);

                // Get alias signers for verification
                const firstReplyAlias = paginatedContext.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(
                    paginatedContext.firstReply.cid
                );
                const secondReplyAlias = paginatedContext.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(
                    paginatedContext.secondReply.cid
                );
                const nestedReplyAlias = paginatedContext.subplebbit._dbHandler.queryAnonymityAliasByCommentCid(
                    paginatedContext.firstNestedReply.cid
                );

                expect(firstReplyAlias).to.exist;
                expect(secondReplyAlias).to.exist;
                expect(nestedReplyAlias).to.exist;

                firstReplyAliasSigner = await paginatedContext.publisherPlebbit.createSigner({
                    privateKey: firstReplyAlias.aliasPrivateKey,
                    type: "ed25519"
                });
                secondReplyAliasSigner = await paginatedContext.publisherPlebbit.createSigner({
                    privateKey: secondReplyAlias.aliasPrivateKey,
                    type: "ed25519"
                });
            });

            after(async () => {
                await paginatedContext?.post?.stop();
                await paginatedContext?.firstReply?.stop();
                await paginatedContext?.secondReply?.stop();
                await paginatedContext?.firstNestedReply?.stop();
                await paginatedForcedChunkingCleanup?.();
                await nestedForcedChunkingCleanup?.();
                await paginatedContext?.cleanup();
            });

            remotePlebbitConfigs.forEach((config) => {
                describe.sequential(`${config.name} - paginated`, () => {
                    let remotePlebbit;

                    before(async () => {
                        remotePlebbit = await config.plebbitInstancePromise();
                        await waitTillPostInSubplebbitPages(paginatedContext.post, remotePlebbit);
                        await waitTillReplyInParentPages(paginatedContext.firstReply, remotePlebbit);
                        await waitTillReplyInParentPages(paginatedContext.secondReply, remotePlebbit);
                        await waitTillReplyInParentPages(paginatedContext.firstNestedReply, remotePlebbit);
                    });

                    after(async () => {
                        await remotePlebbit.destroy();
                    });

                    it.sequential("Spec: subplebbit.posts.getPage({ cid }) loads a page with anonymized comments", async () => {
                        const remoteSubplebbit = await remotePlebbit.getSubplebbit({ address: paginatedContext.subplebbit.address });
                        expect(Object.keys(remoteSubplebbit.posts.pageCids).length).to.be.greaterThan(0);

                        for (const firstPageCid of Object.values(remoteSubplebbit.posts.pageCids)) {
                            let currentCid = firstPageCid;
                            let found;
                            while (currentCid && !found) {
                                const page = await remoteSubplebbit.posts.getPage({ cid: currentCid });
                                const postInPage = page.comments.find((c) => c.cid === paginatedContext.post.cid);
                                if (postInPage) {
                                    // Posts are not anonymized, only replies are
                                    expect(postInPage?.author?.address).to.equal(paginatedContext.post.author.address);
                                    expect(postInPage?.signature?.publicKey).to.equal(paginatedContext.post.signature.publicKey);
                                    found = true;
                                } else {
                                    currentCid = page.nextCid;
                                }
                            }
                            expect(found, "expected paginated post to appear in one of the pages").to.be.true;
                        }
                    });

                    it("Spec: comment.replies.getPage({ cid }) loads a page with anonymized replies", async () => {
                        const remoteParent = await remotePlebbit.getComment({ cid: paginatedContext.post.cid });
                        await remoteParent.update();
                        await waitTillReplyInParentPagesInstance(paginatedContext.firstReply, remoteParent);
                        expect(
                            Object.keys(remoteParent.replies.pageCids || {}),
                            "expected replies.pageCids to be populated for paginated replies"
                        ).to.not.be.empty;
                        const replyPageCid = Object.values(remoteParent.replies.pageCids || {})[0];
                        expect(replyPageCid, "expected a replies page cid after forcing pagination").to.be.ok;
                        const repliesPage = await remoteParent.replies.getPage({ cid: replyPageCid });
                        const firstReplyEntryInPage = repliesPage.comments.find((c) => c.cid === paginatedContext.firstReply.cid);
                        const secondReplyEntryInPage = repliesPage.comments.find((c) => c.cid === paginatedContext.secondReply.cid);

                        expect(firstReplyEntryInPage?.author?.address).to.not.equal(paginatedSigningAuthor.address);
                        expect(firstReplyEntryInPage?.author?.displayName).to.be.undefined;
                        expect(firstReplyEntryInPage?.signature?.publicKey).to.not.equal(paginatedSigningAuthor.publicKey);

                        expect(secondReplyEntryInPage?.author?.address).to.not.equal(paginatedSigningAuthor.address);
                        expect(secondReplyEntryInPage?.author?.displayName).to.be.undefined;
                        expect(secondReplyEntryInPage?.signature?.publicKey).to.not.equal(paginatedSigningAuthor.publicKey);

                        // Verify replies have different anonymized addresses
                        expect(firstReplyEntryInPage?.author?.address).to.not.equal(secondReplyEntryInPage?.author?.address);
                        await remoteParent.stop();
                    });

                    it("Spec: paginated replies from the same signer show distinct anonymized addresses per reply with valid signatures across pages", async () => {
                        const remoteParent = await remotePlebbit.getComment({ cid: paginatedContext.post.cid });
                        await remoteParent.update();
                        await waitTillReplyInParentPagesInstance(paginatedContext.firstReply, remoteParent);
                        await waitTillReplyInParentPagesInstance(paginatedContext.secondReply, remoteParent);

                        const seenReplyAddresses = new Map();
                        const replyPageCids = remoteParent.replies.pageCids || {};
                        expect(Object.keys(replyPageCids), "expected replies.pageCids to be populated").to.not.be.empty;
                        for (const firstPageCid of Object.values(replyPageCids)) {
                            let currentCid = firstPageCid;
                            while (currentCid) {
                                const page = await remoteParent.replies.getPage({ cid: currentCid });
                                page.comments.forEach((comment) => {
                                    if (comment.cid === paginatedContext.firstReply.cid) {
                                        seenReplyAddresses.set(comment.cid, {
                                            address: comment.author.address,
                                            publicKey: comment.signature.publicKey
                                        });
                                    }
                                    if (comment.cid === paginatedContext.secondReply.cid) {
                                        seenReplyAddresses.set(comment.cid, {
                                            address: comment.author.address,
                                            publicKey: comment.signature.publicKey
                                        });
                                    }
                                });
                                if (
                                    page.nextCid &&
                                    (!seenReplyAddresses.has(paginatedContext.firstReply.cid) ||
                                        !seenReplyAddresses.has(paginatedContext.secondReply.cid))
                                )
                                    currentCid = page.nextCid;
                                else break;
                            }
                        }

                        expect(seenReplyAddresses.has(paginatedContext.firstReply.cid)).to.be.true;
                        expect(seenReplyAddresses.has(paginatedContext.secondReply.cid)).to.be.true;

                        const firstEntry = seenReplyAddresses.get(paginatedContext.firstReply.cid);
                        const secondEntry = seenReplyAddresses.get(paginatedContext.secondReply.cid);

                        expect(firstEntry.address).to.not.equal(paginatedSigningAuthor.address);
                        expect(secondEntry.address).to.not.equal(paginatedSigningAuthor.address);
                        expect(firstEntry.address).to.not.equal(secondEntry.address);
                        expect(firstEntry.publicKey).to.not.equal(secondEntry.publicKey);
                        await remoteParent.stop();
                    });

                    it("Spec: replies-to-replies fetched via comment.replies.getPage remain anonymized and verifiable (distinct per reply)", async () => {
                        const remoteParentReply = await remotePlebbit.getComment({ cid: paginatedContext.firstReply.cid });
                        await remoteParentReply.update();
                        await waitTillReplyInParentPagesInstance(paginatedContext.firstNestedReply, remoteParentReply);

                        const nestedReplyPageCid = Object.values(remoteParentReply.replies.pageCids || {})[0];
                        expect(Object.keys(remoteParentReply.replies.pageCids || {}), "expected nested replies.pageCids to be populated").to
                            .not.be.empty;
                        expect(nestedReplyPageCid, "expected a nested replies page cid after forcing pagination").to.be.ok;
                        const nestedRepliesPage = await remoteParentReply.replies.getPage({ cid: nestedReplyPageCid });
                        const nestedReplyEntryInPage = nestedRepliesPage.comments.find(
                            (c) => c.cid === paginatedContext.firstNestedReply.cid
                        );

                        expect(nestedReplyEntryInPage?.author?.address).to.not.equal(paginatedSigningAuthor.address);
                        expect(nestedReplyEntryInPage?.author?.displayName).to.be.undefined;
                        expect(nestedReplyEntryInPage?.signature?.publicKey).to.not.equal(paginatedSigningAuthor.publicKey);

                        // Verify nested reply has different anonymized address from parent replies
                        expect(nestedReplyEntryInPage?.author?.address).to.not.equal(firstReplyAliasSigner.address);
                        expect(nestedReplyEntryInPage?.author?.address).to.not.equal(secondReplyAliasSigner.address);
                        await remoteParentReply.stop();
                    });
                });
            });
        });
    });
});

async function expectCommentCidToUseAlias(plebbit, cid, aliasSigner) {
    const fetched = JSON.parse(await plebbit.fetchCid({ cid }));
    expect(fetched?.author?.address).to.equal(aliasSigner.address);
    expect(fetched?.signature?.publicKey).to.equal(aliasSigner.publicKey);
}

async function createPerReplySubplebbit() {
    const publisherPlebbit = await mockPlebbit();
    const subplebbit = await createSubWithNoChallenge({}, publisherPlebbit);
    await subplebbit.edit({ features: { anonymityMode: "per-reply" } });
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
