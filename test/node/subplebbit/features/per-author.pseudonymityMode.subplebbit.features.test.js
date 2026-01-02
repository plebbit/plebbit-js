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
import { createSigner } from "../../../../dist/node/signer/index.js";
import { signComment } from "../../../../dist/node/signer/signatures.js";
import signers from "../../../fixtures/signers.js";

const remotePlebbitConfigs = getAvailablePlebbitConfigsToTestAgainst({ includeAllPossibleConfigOnEnv: true });

describeSkipIfRpc('subplebbit.features.pseudonymityMode="per-author"', () => {
    describe.concurrent("local anonymization", () => {
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

        it('Spec: same signer maps to a stable pseudonymous author address across all posts and replies when pseudonymityMode="per-author"', async () => {
            const firstPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            const secondPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: authorSigner });
            const reply = await publishRandomReply(secondPost, context.publisherPlebbit, { signer: authorSigner });

            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, firstPost);
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, secondPost);
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, reply);

            const aliasRow = context.subplebbit._dbHandler.queryPseudonymityAliasForAuthor(authorSigner.publicKey);
            expect(aliasRow).to.exist;
            expect(aliasRow.mode).to.equal("per-author");
            const aliasSigner = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });

            const storedFirst = context.subplebbit._dbHandler.queryComment(firstPost.cid);
            const storedSecond = context.subplebbit._dbHandler.queryComment(secondPost.cid);
            const storedReply = context.subplebbit._dbHandler.queryComment(reply.cid);

            for (const stored of [storedFirst, storedSecond, storedReply]) {
                await expectCommentCidToUseAlias(context.publisherPlebbit, stored.cid, aliasSigner);
                expect(stored?.author?.address).to.equal(aliasSigner.address);
                expect(stored?.signature?.publicKey).to.equal(aliasSigner.publicKey);
            }

            expect(storedReply?.parentCid).to.equal(secondPost.cid);
            await firstPost.stop();
            await secondPost.stop();
            await reply.stop();
        });

        it("Spec: two different signers never share the same pseudonymous author address", async () => {
            const thirdPost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: otherSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, thirdPost);

            const firstAlias = context.subplebbit._dbHandler.queryPseudonymityAliasForAuthor(authorSigner.publicKey);
            const secondAlias = context.subplebbit._dbHandler.queryPseudonymityAliasForAuthor(otherSigner.publicKey);

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

        it("Spec: author.address domains resolve and are anonymized consistently", async () => {
            const domainAuthorSigner = await context.publisherPlebbit.createSigner(signers[6]);
            const domainAddress = "plebbit.eth";

            const resolvedAddress = await context.publisherPlebbit.resolveAuthorAddress({ address: domainAddress });
            expect(resolvedAddress).to.equal(domainAuthorSigner.address);

            const domainPost = await context.publisherPlebbit.createComment({
                subplebbitAddress: context.subplebbit.address,
                signer: domainAuthorSigner,
                author: { address: domainAddress, displayName: "Domain author" },
                content: "Domain anonymization content " + Date.now(),
                title: "Domain anonymization title " + Date.now()
            });
            await publishWithExpectedResult(domainPost, true);
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, domainPost);

            const aliasRow = context.subplebbit._dbHandler.queryPseudonymityAliasForAuthor(domainAuthorSigner.publicKey);
            expect(aliasRow).to.exist;
            const aliasSigner = await context.publisherPlebbit.createSigner({
                privateKey: aliasRow.aliasPrivateKey,
                type: "ed25519"
            });

            await resolveWhenConditionIsTrue({
                toUpdate: domainPost,
                predicate: () => domainPost.author?.address === aliasSigner.address
            });

            expect(domainPost.author.address).to.equal(aliasSigner.address);
            expect(domainPost.original?.author?.address).to.equal(domainAddress);

            const stored = context.subplebbit._dbHandler.queryComment(domainPost.cid);
            expect(stored?.author?.address).to.equal(aliasSigner.address);
            expect(stored?.signature?.publicKey).to.equal(aliasSigner.publicKey);
            await expectCommentCidToUseAlias(context.publisherPlebbit, domainPost.cid, aliasSigner);

            await domainPost.stop();
        });

        it("Spec: anonymized publication keeps author displayName while stripping wallets/avatar/flair fields", async () => {
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

            const aliasRow = context.subplebbit._dbHandler.queryPseudonymityAliasForAuthor(authorSigner.publicKey);
            const aliasSigner = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });

            const stored = context.subplebbit._dbHandler.queryComment(noisyPost.cid);
            expect(stored?.author).to.deep.equal({ address: aliasSigner.address, displayName: noisyAuthor.displayName });
            expect(stored?.signature?.publicKey).to.equal(aliasSigner.publicKey);
            await expectCommentCidToUseAlias(context.publisherPlebbit, noisyPost.cid, aliasSigner);
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

            const aliasRow = context.subplebbit._dbHandler.queryPseudonymityAliasForAuthor(chainAuthor.publicKey);
            const aliasSigner = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });
            const stored = context.subplebbit._dbHandler.queryComment(chainedPost.cid);
            expect(stored?.author?.previousCommentCid).to.be.undefined;
            expect(stored?.author?.address).to.equal(aliasSigner.address);
            await expectCommentCidToUseAlias(context.publisherPlebbit, chainedPost.cid, aliasSigner);
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

            const aliasRow = context.subplebbit._dbHandler.queryPseudonymityAliasForAuthor(authorSigner.publicKey);
            expect(aliasRow).to.exist;
            const alias = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });
            const expectOriginalFields = () => {
                expect(authoredPost.original?.author?.address).to.equal(originalAuthor.address);
                expect(authoredPost.original?.author?.displayName).to.equal(originalAuthor.displayName);
                expect(authoredPost.original?.author?.wallets).to.deep.equal(originalAuthor.wallets);
                expect(authoredPost.original?.author?.flair).to.deep.equal(originalAuthor.flair);
                expect(authoredPost.original?.author?.previousCommentCid).to.equal(originalAuthor.previousCommentCid);
                expect(authoredPost.original?.content).to.equal(originalContent);
                expect(authoredPost.original?.signature?.publicKey).to.equal(authorSigner.publicKey);
            };

            const stored = context.subplebbit._dbHandler.queryComment(authoredPost.cid);
            expect(stored?.author?.address).to.equal(alias.address);
            expect(stored?.signature?.publicKey).to.equal(alias.publicKey);
            await expectCommentCidToUseAlias(context.publisherPlebbit, authoredPost.cid, alias);
            expectOriginalFields();

            await authoredPost.update();
            await resolveWhenConditionIsTrue({ toUpdate: authoredPost, predicate: () => authoredPost.updatedAt });

            expect(authoredPost.author.address).to.equal(alias.address);
            expect(authoredPost.author.displayName).to.equal(originalAuthor.displayName);
            expectOriginalFields();

            await authoredPost.stop();
        });

        it("Spec: comment edit signed by original author is accepted and re-signed with anonymized author key", async () => {
            const editSigner = await context.publisherPlebbit.createSigner();
            const editablePost = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: editSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, editablePost);

            const aliasRow = context.subplebbit._dbHandler.queryPseudonymityAliasForAuthor(editSigner.publicKey);
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
            const aliasRow = context.subplebbit._dbHandler.queryPseudonymityAliasForAuthor(freshSigner.publicKey);
            expect(aliasRow).to.exist;
            const aliasSigner = await context.publisherPlebbit.createSigner({
                privateKey: aliasRow.aliasPrivateKey,
                type: "ed25519"
            });
            expect(stored?.signature?.publicKey).to.not.equal(freshSigner.publicKey);
            expect(stored?.signature?.publicKey).to.equal(aliasSigner.publicKey);
            expect(stored?.author?.address).to.equal(aliasSigner.address);
            await expectCommentCidToUseAlias(context.publisherPlebbit, post.cid, aliasSigner);
            await post.stop();
        });

        it("Spec: purging an anonymized comment removes its alias mapping", async () => {
            const purgeSigner = await context.publisherPlebbit.createSigner();
            const purgeTarget = await publishRandomPost(context.subplebbit.address, context.publisherPlebbit, { signer: purgeSigner });
            await waitForStoredCommentUpdateWithAssertions(context.subplebbit, purgeTarget);

            const aliasBeforePurge = context.subplebbit._dbHandler.queryPseudonymityAliasForAuthor(purgeSigner.publicKey);
            expect(aliasBeforePurge).to.exist;

            await context.subplebbit._dbHandler.purgeComment(purgeTarget.cid);

            const aliasAfterPurge = context.subplebbit._dbHandler.queryPseudonymityAliasByCommentCid(purgeTarget.cid);
            expect(aliasAfterPurge).to.be.undefined;
            const commentAfterPurge = context.subplebbit._dbHandler.queryComment(purgeTarget.cid);
            expect(commentAfterPurge).to.be.undefined;
        });

        it("Spec: disabling pseudonymousAuthors stops anonymization for new comments without rewriting old ones", async () => {
            const localContext = await createPerAuthorSubplebbit();
            const plainSigner = await localContext.publisherPlebbit.createSigner();
            let plainPost;

            try {
                await localContext.subplebbit.edit({ features: { pseudonymityMode: undefined } });
                await resolveWhenConditionIsTrue({
                    toUpdate: localContext.subplebbit,
                    predicate: () => localContext.subplebbit.features.pseudonymityMode === undefined
                });

                plainPost = await publishRandomPost(localContext.subplebbit.address, localContext.publisherPlebbit, {
                    signer: plainSigner
                });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, plainPost);

                const stored = localContext.subplebbit._dbHandler.queryComment(plainPost.cid);
                expect(stored?.author?.address).to.equal(plainSigner.address);
                expect(stored?.signature?.publicKey).to.equal(plainSigner.publicKey);
                const alias = localContext.subplebbit._dbHandler.queryPseudonymityAliasForAuthor(plainSigner.publicKey);
                expect(alias).to.be.undefined;
            } finally {
                await plainPost?.stop();
                await localContext.cleanup();
            }
        });

        it("Spec: sub owner can resolve the pseudonymous author address back to the original author address", async () => {
            const aliasRow = context.subplebbit._dbHandler.queryPseudonymityAliasForAuthor(authorSigner.publicKey);
            expect(aliasRow).to.exist;
            expect(aliasRow.originalAuthorSignerPublicKey).to.equal(authorSigner.publicKey);

            const aliasSigner = await context.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });
            expect(aliasSigner.address).to.be.a("string");
        });

        it("Spec: challengerequest emits full publication author.subplebbit fields without anonymization in per-author mode", async () => {
            const localContext = await createPerAuthorSubplebbit();
            const localAuthor = await localContext.publisherPlebbit.createSigner();
            const voter = await localContext.publisherPlebbit.createSigner();

            try {
                const seededPost = await publishRandomPost(localContext.subplebbit.address, localContext.publisherPlebbit, {
                    signer: localAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, seededPost);

                const upvote = await localContext.publisherPlebbit.createVote({
                    subplebbitAddress: localContext.subplebbit.address,
                    commentCid: seededPost.cid,
                    vote: 1,
                    signer: voter
                });
                await publishWithExpectedResult(upvote, true);

                const aliasRow = localContext.subplebbit._dbHandler.queryPseudonymityAliasForAuthor(localAuthor.publicKey);
                expect(aliasRow).to.exist;
                const aliasSigner = await localContext.publisherPlebbit.createSigner({
                    privateKey: aliasRow.aliasPrivateKey,
                    type: "ed25519"
                });

                await resolveWhenConditionIsTrue({
                    toUpdate: localContext.subplebbit,
                    predicate: () => {
                        const aggregated = localContext.subplebbit._dbHandler.querySubplebbitAuthor(localAuthor.address);
                        return (
                            aggregated?.lastCommentCid === seededPost.cid &&
                            aggregated?.firstCommentTimestamp === seededPost.timestamp &&
                            aggregated?.postScore === 1 &&
                            aggregated?.replyScore === 0
                        );
                    }
                });

                const subplebbitAuthorBefore = localContext.subplebbit._dbHandler.querySubplebbitAuthor(localAuthor.address);
                expect(subplebbitAuthorBefore, "expected subplebbit author to exist for original signer").to.be.ok;
                expect(subplebbitAuthorBefore).to.include.keys(["postScore", "replyScore", "lastCommentCid", "firstCommentTimestamp"]);
                expect(subplebbitAuthorBefore.lastCommentCid).to.equal(seededPost.cid);
                expect(subplebbitAuthorBefore.firstCommentTimestamp).to.equal(seededPost.timestamp);
                expect(subplebbitAuthorBefore.postScore).to.equal(1);
                expect(subplebbitAuthorBefore.replyScore).to.equal(0);

                const challengeRequestPromise = new Promise((resolve) => localContext.subplebbit.once("challengerequest", resolve));
                const publication = await localContext.publisherPlebbit.createComment({
                    subplebbitAddress: localContext.subplebbit.address,
                    signer: localAuthor,
                    content: "Challengerequest author.subplebbit check",
                    title: "Challengerequest author.subplebbit check"
                });
                await publishWithExpectedResult(publication, true);

                const challengerequest = await challengeRequestPromise;
                expect(challengerequest.comment.author.address).to.equal(localAuthor.address);
                expect(challengerequest.comment.author.address).to.not.equal(aliasSigner.address);
                expect(challengerequest.comment.author.subplebbit).to.deep.equal(subplebbitAuthorBefore);
                expect(challengerequest.comment.author.subplebbit?.lastCommentCid).to.equal(seededPost.cid);
                expect(challengerequest.comment.author.subplebbit?.firstCommentTimestamp).to.equal(seededPost.timestamp);
                expect(challengerequest.comment.author.subplebbit?.postScore).to.equal(1);
                expect(challengerequest.comment.author.subplebbit?.replyScore).to.equal(0);
                await seededPost.stop();
                await publication.stop();
            } finally {
                await localContext.cleanup();
            }
        });

        it("Spec: author.subplebbit.lastCommentCid tracks the author's latest comment in the subplebbit for per-author mode", async () => {
            const localContext = await createPerAuthorSubplebbit();
            const localAuthor = await localContext.publisherPlebbit.createSigner();

            try {
                const firstPost = await publishRandomPost(localContext.subplebbit.address, localContext.publisherPlebbit, {
                    signer: localAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, firstPost);

                const followUpReply = await publishRandomReply(firstPost, localContext.publisherPlebbit, { signer: localAuthor });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, followUpReply);

                const aggregatedAuthor = localContext.subplebbit._dbHandler.querySubplebbitAuthor(localAuthor.address);
                expect(aggregatedAuthor?.lastCommentCid).to.equal(followUpReply.cid);

                const replyUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: followUpReply.cid });
                expect(replyUpdate?.author?.subplebbit?.lastCommentCid).to.equal(followUpReply.cid);

                const postUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: firstPost.cid });
                expect(postUpdate?.author?.subplebbit?.lastCommentCid).to.equal(followUpReply.cid);

                await firstPost.stop();
                await followUpReply.stop();
            } finally {
                await localContext.cleanup();
            }
        });

        it("Spec: author.subplebbit.banExpiresAt rejects new publications and surfaces on all of the author's comments in per-author mode", async () => {
            const localContext = await createPerAuthorSubplebbit();
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
                const reply = await publishRandomReply(post, localContext.publisherPlebbit, { signer: localAuthor });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, reply);

                const banExpiresAt = timestamp() + 60;
                const banModeration = await localContext.publisherPlebbit.createCommentModeration({
                    subplebbitAddress: localContext.subplebbit.address,
                    commentCid: post.cid,
                    commentModeration: { author: { banExpiresAt }, reason: "ban for test" },
                    signer: moderator
                });
                await publishWithExpectedResult(banModeration, true);

                await post.update();
                await reply.update();
                await resolveWhenConditionIsTrue({
                    toUpdate: localContext.subplebbit,
                    predicate: () =>
                        localContext.subplebbit._dbHandler.querySubplebbitAuthor(localAuthor.address)?.banExpiresAt === banExpiresAt
                });

                await resolveWhenConditionIsTrue({
                    toUpdate: localContext.subplebbit,
                    predicate: () => {
                        const postUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: post.cid });
                        const replyUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: reply.cid });
                        return (
                            postUpdate?.author?.subplebbit?.banExpiresAt === banExpiresAt &&
                            replyUpdate?.author?.subplebbit?.banExpiresAt === banExpiresAt
                        );
                    }
                });

                const postUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: post.cid });
                const replyUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: reply.cid });
                expect(postUpdate?.author?.subplebbit?.banExpiresAt).to.equal(banExpiresAt);
                expect(replyUpdate?.author?.subplebbit?.banExpiresAt).to.equal(banExpiresAt);

                const blockedPost = await localContext.publisherPlebbit.createComment({
                    subplebbitAddress: localContext.subplebbit.address,
                    signer: localAuthor,
                    title: "should be rejected",
                    content: "should be rejected"
                });
                await publishWithExpectedResult(blockedPost, false, messages.ERR_AUTHOR_IS_BANNED);

                await post.stop();
                await reply.stop();
            } finally {
                await localContext.cleanup();
            }
        });

        it("Spec: banning an anonymized comment maps to original and alias author addresses in per-author mode", async () => {
            const localContext = await createPerAuthorSubplebbit();
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

                const aliasRow = localContext.subplebbit._dbHandler.queryPseudonymityAliasForAuthor(localAuthor.publicKey);
                expect(aliasRow).to.exist;
                const aliasSigner = await localContext.publisherPlebbit.createSigner({
                    privateKey: aliasRow.aliasPrivateKey,
                    type: "ed25519"
                });
                expect(aliasSigner.address).to.not.equal(localAuthor.address);

                const banExpiresAt = timestamp() + 60;
                const banModeration = await localContext.publisherPlebbit.createCommentModeration({
                    subplebbitAddress: localContext.subplebbit.address,
                    commentCid: post.cid,
                    commentModeration: { author: { banExpiresAt }, reason: "ban alias mapping test" },
                    signer: moderator
                });
                await publishWithExpectedResult(banModeration, true);

                await resolveWhenConditionIsTrue({
                    toUpdate: localContext.subplebbit,
                    predicate: () => {
                        const originalAuthor = localContext.subplebbit._dbHandler.querySubplebbitAuthor(localAuthor.address);
                        const aliasAuthor = localContext.subplebbit._dbHandler.querySubplebbitAuthor(aliasSigner.address);
                        return originalAuthor?.banExpiresAt === banExpiresAt && aliasAuthor?.banExpiresAt === banExpiresAt;
                    }
                });

                const originalAuthor = localContext.subplebbit._dbHandler.querySubplebbitAuthor(localAuthor.address);
                const aliasAuthor = localContext.subplebbit._dbHandler.querySubplebbitAuthor(aliasSigner.address);
                expect(originalAuthor?.banExpiresAt).to.equal(banExpiresAt);
                expect(aliasAuthor?.banExpiresAt).to.equal(banExpiresAt);

                await post.stop();
            } finally {
                await localContext.cleanup();
            }
        });

        it("Spec: author.subplebbit.postScore is present with total post karma when pseudonymityMode is per-author", async () => {
            const localContext = await createPerAuthorSubplebbit();
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

                const waitForPostScoreInUpdate = async () => {
                    const timeoutMs = 60000;
                    const start = Date.now();
                    while (Date.now() - start < timeoutMs) {
                        const postUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: post.cid });
                        if (postUpdate?.author?.subplebbit?.postScore === 1) return;
                        await new Promise((resolve) => setTimeout(resolve, 50));
                    }
                    throw new Error("Timed out waiting for postScore to update in comment update");
                };
                await waitForPostScoreInUpdate();

                const reply = await publishRandomReply(post, localContext.publisherPlebbit, { signer: localAuthor });
                const secondPost = await publishRandomPost(localContext.subplebbit.address, localContext.publisherPlebbit, {
                    signer: localAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, reply);
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, secondPost);

                await resolveWhenConditionIsTrue({
                    toUpdate: localContext.subplebbit,
                    predicate: () => {
                        const firstReplyUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: reply.cid });
                        const secondPostUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: secondPost.cid });
                        return (
                            firstReplyUpdate?.author?.subplebbit?.postScore === 1 && secondPostUpdate?.author?.subplebbit?.postScore === 1
                        );
                    }
                });

                const postUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: post.cid });
                expect(postUpdate?.author?.subplebbit?.postScore).to.equal(1);
                expect(postUpdate?.author?.subplebbit?.replyScore).to.equal(0);

                const replyUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: reply.cid });
                expect(replyUpdate?.author?.subplebbit?.postScore).to.equal(1);
                expect(replyUpdate?.author?.subplebbit?.replyScore).to.equal(0);

                const secondPostUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: secondPost.cid });
                expect(secondPostUpdate?.author?.subplebbit?.postScore).to.equal(1);
                expect(secondPostUpdate?.author?.subplebbit?.replyScore).to.equal(0);

                await reply.stop();
                await secondPost.stop();
                await post.stop();
            } finally {
                await localContext.cleanup();
            }
        });

        it("Spec: author.subplebbit.postScore adjusts when a vote flips from upvote to downvote", async () => {
            const localContext = await createPerAuthorSubplebbit();
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
                    predicate: () => localContext.subplebbit._dbHandler.querySubplebbitAuthor(localAuthor.address)?.postScore === 1
                });

                const downvote = await localContext.publisherPlebbit.createVote({
                    subplebbitAddress: localContext.subplebbit.address,
                    commentCid: post.cid,
                    vote: -1,
                    signer: voter
                });
                await publishWithExpectedResult(downvote, true);

                await resolveWhenConditionIsTrue({
                    toUpdate: localContext.subplebbit,
                    predicate: () => localContext.subplebbit._dbHandler.querySubplebbitAuthor(localAuthor.address)?.postScore === -1
                });

                const waitForFlippedScoreInUpdate = async () => {
                    const timeoutMs = 60000;
                    const start = Date.now();
                    while (Date.now() - start < timeoutMs) {
                        const postUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: post.cid });
                        if (postUpdate?.author?.subplebbit?.postScore === -1) return;
                        await new Promise((resolve) => setTimeout(resolve, 50));
                    }
                    throw new Error("Timed out waiting for postScore to reflect flipped vote in comment update");
                };
                await waitForFlippedScoreInUpdate();

                const postUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: post.cid });
                expect(postUpdate?.author?.subplebbit?.postScore).to.equal(-1);
                expect(postUpdate?.author?.subplebbit?.replyScore).to.equal(0);

                await post.stop();
            } finally {
                await localContext.cleanup();
            }
        });

        it("Spec: author.subplebbit.replyScore is present with total reply karma when pseudonymityMode is per-author", async () => {
            const localContext = await createPerAuthorSubplebbit();
            const localAuthor = await localContext.publisherPlebbit.createSigner();
            const voter = await localContext.publisherPlebbit.createSigner();

            try {
                const post = await publishRandomPost(localContext.subplebbit.address, localContext.publisherPlebbit, {
                    signer: localAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, post);
                const reply = await publishRandomReply(post, localContext.publisherPlebbit, { signer: localAuthor });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, reply);

                const upvote = await localContext.publisherPlebbit.createVote({
                    subplebbitAddress: localContext.subplebbit.address,
                    commentCid: reply.cid,
                    vote: 1,
                    signer: voter
                });
                await publishWithExpectedResult(upvote, true);

                const waitForReplyScoreInUpdate = async () => {
                    const timeoutMs = 60000;
                    const start = Date.now();
                    while (Date.now() - start < timeoutMs) {
                        const replyUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: reply.cid });
                        if (replyUpdate?.author?.subplebbit?.replyScore === 1) return;
                        await new Promise((resolve) => setTimeout(resolve, 50));
                    }
                    throw new Error("Timed out waiting for replyScore to update in comment update");
                };
                await waitForReplyScoreInUpdate();

                const replyUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: reply.cid });
                expect(replyUpdate?.author?.subplebbit?.replyScore).to.equal(1);
                expect(replyUpdate?.author?.subplebbit?.postScore).to.equal(0);

                await resolveWhenConditionIsTrue({
                    toUpdate: localContext.subplebbit,
                    predicate: () => {
                        const postUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: post.cid });
                        return postUpdate?.author?.subplebbit?.replyScore === 1 && postUpdate?.author?.subplebbit?.postScore === 0;
                    }
                });

                const postUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: post.cid });
                expect(postUpdate?.author?.subplebbit?.replyScore).to.equal(1);
                expect(postUpdate?.author?.subplebbit?.postScore).to.equal(0);

                await post.stop();
                await reply.stop();
            } finally {
                await localContext.cleanup();
            }
        });

        it("Spec: votes from multiple authors aggregate into author.subplebbit.postScore for per-author mode", async () => {
            const localContext = await createPerAuthorSubplebbit();
            const localAuthor = await localContext.publisherPlebbit.createSigner();
            const voterOne = await localContext.publisherPlebbit.createSigner();
            const voterTwo = await localContext.publisherPlebbit.createSigner();

            try {
                const post = await publishRandomPost(localContext.subplebbit.address, localContext.publisherPlebbit, {
                    signer: localAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, post);

                const upvoteOne = await localContext.publisherPlebbit.createVote({
                    subplebbitAddress: localContext.subplebbit.address,
                    commentCid: post.cid,
                    vote: 1,
                    signer: voterOne
                });
                await publishWithExpectedResult(upvoteOne, true);

                const upvoteTwo = await localContext.publisherPlebbit.createVote({
                    subplebbitAddress: localContext.subplebbit.address,
                    commentCid: post.cid,
                    vote: 1,
                    signer: voterTwo
                });
                await publishWithExpectedResult(upvoteTwo, true);

                await resolveWhenConditionIsTrue({
                    toUpdate: localContext.subplebbit,
                    predicate: () => localContext.subplebbit._dbHandler.querySubplebbitAuthor(localAuthor.address)?.postScore === 2
                });

                const waitForAggregatedScoreInUpdate = async () => {
                    const timeoutMs = 60000;
                    const start = Date.now();
                    while (Date.now() - start < timeoutMs) {
                        const postUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: post.cid });
                        if (postUpdate?.author?.subplebbit?.postScore === 2) return;
                        await new Promise((resolve) => setTimeout(resolve, 50));
                    }
                    throw new Error("Timed out waiting for aggregated postScore in comment update");
                };
                await waitForAggregatedScoreInUpdate();

                const postUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: post.cid });
                expect(postUpdate?.author?.subplebbit?.postScore).to.equal(2);
                expect(postUpdate?.author?.subplebbit?.replyScore).to.equal(0);

                const reply = await publishRandomReply(post, localContext.publisherPlebbit, { signer: localAuthor });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, reply);

                await resolveWhenConditionIsTrue({
                    toUpdate: localContext.subplebbit,
                    predicate: () => {
                        const replyUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: reply.cid });
                        return replyUpdate?.author?.subplebbit?.postScore === 2;
                    }
                });

                const replyUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: reply.cid });
                expect(replyUpdate?.author?.subplebbit?.postScore).to.equal(2);
                expect(replyUpdate?.author?.subplebbit?.replyScore).to.equal(0);
                await reply.stop();

                await post.stop();
            } finally {
                await localContext.cleanup();
            }
        });

        it("Spec: author.subplebbit.firstCommentTimestamp is present and matches the first comment time for per-author mode", async () => {
            const localContext = await createPerAuthorSubplebbit();
            const localAuthor = await localContext.publisherPlebbit.createSigner();

            try {
                const firstPost = await publishRandomPost(localContext.subplebbit.address, localContext.publisherPlebbit, {
                    signer: localAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, firstPost);
                const firstTimestamp = firstPost.timestamp;

                const secondComment = await publishRandomReply(firstPost, localContext.publisherPlebbit, { signer: localAuthor });
                await waitForStoredCommentUpdateWithAssertions(localContext.subplebbit, secondComment);

                await secondComment.update();
                await resolveWhenConditionIsTrue({
                    toUpdate: secondComment,
                    predicate: () => typeof secondComment.author?.subplebbit?.firstCommentTimestamp === "number"
                });

                const aggregatedAuthor = localContext.subplebbit._dbHandler.querySubplebbitAuthor(localAuthor.address);
                expect(aggregatedAuthor?.firstCommentTimestamp).to.equal(firstTimestamp);
                expect(secondComment.author?.subplebbit?.firstCommentTimestamp).to.equal(firstTimestamp);

                await resolveWhenConditionIsTrue({
                    toUpdate: localContext.subplebbit,
                    predicate: () =>
                        localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: firstPost.cid })?.author?.subplebbit
                            ?.firstCommentTimestamp === firstTimestamp
                });

                const firstPostUpdate = localContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: firstPost.cid });
                expect(firstPostUpdate?.author?.subplebbit?.firstCommentTimestamp).to.equal(firstTimestamp);

                await firstPost.stop();
                await secondComment.stop();
            } finally {
                await localContext.cleanup();
            }
        });
    });

    describe.concurrent("remote loading with anonymized comments", () => {
        describe("preloaded pages", () => {
            let sharedContext;
            let aliasSigner;
            let signingAuthor;

            before(async () => {
                sharedContext = await createPerAuthorSubplebbit();
                signingAuthor = await sharedContext.publisherPlebbit.createSigner();
                sharedContext.post = await publishRandomPost(sharedContext.subplebbit.address, sharedContext.publisherPlebbit, {
                    signer: signingAuthor
                });
                sharedContext.postDisplayName = sharedContext.post.author.displayName;
                await waitForStoredCommentUpdateWithAssertions(sharedContext.subplebbit, sharedContext.post);
                sharedContext.reply = await publishRandomReply(sharedContext.post, sharedContext.publisherPlebbit, {
                    signer: signingAuthor
                });
                sharedContext.replyDisplayName = sharedContext.reply.author.displayName;
                await waitForStoredCommentUpdateWithAssertions(sharedContext.subplebbit, sharedContext.reply);
                await waitTillPostInSubplebbitPages(sharedContext.post, sharedContext.publisherPlebbit);
                await waitTillReplyInParentPages(sharedContext.reply, sharedContext.publisherPlebbit);

                const aliasRow = sharedContext.subplebbit._dbHandler.queryPseudonymityAliasForAuthor(signingAuthor.publicKey);
                expect(aliasRow).to.exist;
                aliasSigner = await sharedContext.publisherPlebbit.createSigner({ privateKey: aliasRow.aliasPrivateKey, type: "ed25519" });

                sharedContext.editContent = "Edited content for remote load " + Date.now();
                const edit = await sharedContext.publisherPlebbit.createCommentEdit({
                    subplebbitAddress: sharedContext.subplebbit.address,
                    commentCid: sharedContext.post.cid,
                    content: sharedContext.editContent,
                    signer: signingAuthor
                });
                await publishWithExpectedResult(edit, true);
                await resolveWhenConditionIsTrue({
                    toUpdate: sharedContext.subplebbit,
                    predicate: () =>
                        sharedContext.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: sharedContext.post.cid })?.edit?.content ===
                        sharedContext.editContent
                });
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
                            const postInPage = page.comments.find((c) => c.cid === sharedContext.post.cid);
                            expect(postInPage).to.be.ok;
                            expect(postInPage?.author?.address).to.equal(aliasSigner.address);
                            expect(postInPage?.author?.displayName).to.equal(sharedContext.postDisplayName);
                            expect(postInPage?.author?.wallets).to.be.undefined;
                            expect(postInPage?.author?.flair).to.be.undefined;
                            expect(postInPage?.signature?.publicKey).to.equal(aliasSigner.publicKey);
                        }
                    });

                    it("Can load an anonymized comment with getComment and fetch its CommentUpdate", async () => {
                        const remoteComment = await remotePlebbit.getComment({ cid: sharedContext.post.cid });
                        await remoteComment.update();
                        await resolveWhenConditionIsTrue({
                            toUpdate: remoteComment,
                            predicate: () =>
                                typeof remoteComment.updatedAt === "number" && remoteComment.edit?.content === sharedContext.editContent
                        });
                        expect(remoteComment.author.address).to.equal(aliasSigner.address);
                        expect(remoteComment.author.displayName).to.equal(sharedContext.postDisplayName);
                        expect(remoteComment.content).to.equal(sharedContext.editContent);
                        expect(remoteComment.edit?.content).to.equal(sharedContext.editContent);
                        expect(remoteComment.edit?.signature?.publicKey).to.equal(aliasSigner.publicKey);
                        expect(remoteComment.signature.publicKey).to.equal(aliasSigner.publicKey);
                        await remoteComment.stop();
                    });

                    it("Can update an anonymized comment with comment.update()", async () => {
                        const remoteReply = await remotePlebbit.getComment({ cid: sharedContext.reply.cid });
                        await remoteReply.update();
                        await resolveWhenConditionIsTrue({
                            toUpdate: remoteReply,
                            predicate: () => typeof remoteReply.updatedAt === "number"
                        });
                        expect(remoteReply.author.address).to.equal(aliasSigner.address);
                        expect(remoteReply.author.displayName).to.equal(sharedContext.replyDisplayName);

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
            let paginatedForcedChunkingCleanup;

            before(async () => {
                paginatedContext = await createPerAuthorSubplebbit();
                paginatedSigningAuthor = await paginatedContext.publisherPlebbit.createSigner();
                paginatedContext.post = await publishRandomPost(paginatedContext.subplebbit.address, paginatedContext.publisherPlebbit, {
                    signer: paginatedSigningAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(paginatedContext.subplebbit, paginatedContext.post);
                paginatedContext.reply = await publishRandomReply(paginatedContext.post, paginatedContext.publisherPlebbit, {
                    signer: paginatedSigningAuthor
                });
                await waitForStoredCommentUpdateWithAssertions(paginatedContext.subplebbit, paginatedContext.reply);
                const { cleanup } = await forceLocalSubPagesToAlwaysGenerateMultipleChunks({
                    subplebbit: paginatedContext.subplebbit,
                    parentComment: paginatedContext.post
                });
                paginatedForcedChunkingCleanup = cleanup;
                await forceSubplebbitToGenerateAllPostsPages(paginatedContext.subplebbit);
                await waitTillPostInSubplebbitPages(paginatedContext.post, paginatedContext.publisherPlebbit);
                await waitTillReplyInParentPages(paginatedContext.reply, paginatedContext.publisherPlebbit);

                const aliasRow = paginatedContext.subplebbit._dbHandler.queryPseudonymityAliasForAuthor(paginatedSigningAuthor.publicKey);
                expect(aliasRow).to.exist;
                paginatedAliasSigner = await paginatedContext.publisherPlebbit.createSigner({
                    privateKey: aliasRow.aliasPrivateKey,
                    type: "ed25519"
                });
            });

            after(async () => {
                await paginatedContext?.post?.stop();
                await paginatedContext?.reply?.stop();
                await paginatedForcedChunkingCleanup?.();
                await paginatedContext?.cleanup();
            });

            remotePlebbitConfigs.forEach((config) => {
                describe.concurrent(`${config.name} - paginated`, () => {
                    let remotePlebbit;

                    before(async () => {
                        remotePlebbit = await config.plebbitInstancePromise();
                        await waitTillPostInSubplebbitPages(paginatedContext.post, remotePlebbit);
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
                        expect(
                            Object.keys(remoteParent.replies.pageCids || {}),
                            "expected replies.pageCids to be populated for paginated replies"
                        ).to.not.be.empty;
                        const replyPageCid = Object.values(remoteParent.replies.pageCids || {})[0];
                        expect(replyPageCid, "expected a replies page cid after forcing pagination").to.be.ok;
                        const repliesPage = await remoteParent.replies.getPage({ cid: replyPageCid });
                        const replyEntryInPage = repliesPage.comments.find((c) => c.cid === paginatedContext.reply.cid);
                        expect(replyEntryInPage?.author?.address).to.equal(paginatedAliasSigner.address);
                        expect(replyEntryInPage?.signature?.publicKey).to.equal(paginatedAliasSigner.publicKey);
                        await remoteParent.stop();
                    });
                });
            });
        });
    });

    describe("Spec: existing replies keep original pseudonymityMode while new replies follow current mode", () => {
        it("Spec: per-author replies stay per-author after switching to per-post", async () => {
            await assertPseudonymityModeTransition({ initialMode: "per-author", nextMode: "per-post" });
        });

        it("Spec: per-author replies stay per-author after switching to per-reply", async () => {
            await assertPseudonymityModeTransition({ initialMode: "per-author", nextMode: "per-reply" });
        });
    });
});

async function expectCommentCidToUseAlias(plebbit, cid, aliasSigner) {
    const fetched = JSON.parse(await plebbit.fetchCid({ cid }));
    expect(fetched?.author?.address).to.equal(aliasSigner.address);
    expect(fetched?.signature?.publicKey).to.equal(aliasSigner.publicKey);
}

const PROTOCOL_VERSION = "1.0.0";

async function assertPseudonymityModeTransition({ initialMode, nextMode }) {
    const context = await createAnonymityTransitionContext(initialMode);
    const authorSigner = await createSigner({ privateKey: signers[0].privateKey, type: signers[0].type });

    try {
        const parentPost = await buildSignedPostPublication({
            signer: authorSigner,
            subplebbitAddress: context.subplebbitAddress
        });
        const storedParentPost = await context.subplebbit.storePublication({ comment: parentPost });
        const postCid = storedParentPost.cid;

        const originalReply = await buildSignedReplyPublication({
            signer: authorSigner,
            subplebbitAddress: context.subplebbitAddress,
            postCid,
            parentCid: postCid
        });
        const oldStored = await context.subplebbit.storePublication({ comment: originalReply });
        const oldReplyCid = oldStored.cid;
        const oldAliasRow = context.dbHandler.queryPseudonymityAliasByCommentCid(oldReplyCid);
        expect(oldAliasRow?.mode).to.equal(initialMode);

        const oldAliasSigner = await createSigner({ privateKey: oldAliasRow.aliasPrivateKey, type: "ed25519" });
        expectStoredCommentToUseAlias(context.dbHandler, oldReplyCid, oldAliasSigner);

        await context.subplebbit.edit({ features: { pseudonymityMode: nextMode } });
        await ensureSubplebbitDbReady(context.subplebbit);

        const newReply = await buildSignedReplyPublication({
            signer: authorSigner,
            subplebbitAddress: context.subplebbitAddress,
            postCid,
            parentCid: postCid
        });
        const newReplyStored = await context.subplebbit.storePublication({ comment: newReply });
        const newReplyAliasRow = context.dbHandler.queryPseudonymityAliasByCommentCid(newReplyStored.cid);
        expect(newReplyAliasRow?.mode).to.equal(nextMode);

        const newReplyAliasSigner = await createSigner({ privateKey: newReplyAliasRow.aliasPrivateKey, type: "ed25519" });
        expect(newReplyAliasRow.aliasPrivateKey).to.not.equal(oldAliasRow.aliasPrivateKey);
        expectStoredCommentToUseAlias(context.dbHandler, newReplyStored.cid, newReplyAliasSigner);

        const newPost = await buildSignedPostPublication({
            signer: authorSigner,
            subplebbitAddress: context.subplebbitAddress
        });
        const newPostStored = await context.subplebbit.storePublication({ comment: newPost });
        const newPostAliasRow = context.dbHandler.queryPseudonymityAliasByCommentCid(newPostStored.cid);
        expect(newPostAliasRow?.mode).to.equal(nextMode);

        const newPostAliasSigner = await createSigner({ privateKey: newPostAliasRow.aliasPrivateKey, type: "ed25519" });
        expect(newPostAliasRow.aliasPrivateKey).to.not.equal(oldAliasRow.aliasPrivateKey);
        expectStoredCommentToUseAlias(context.dbHandler, newPostStored.cid, newPostAliasSigner);

        const storedAliasAfter = context.dbHandler.queryPseudonymityAliasByCommentCid(oldReplyCid);
        expect(storedAliasAfter?.mode).to.equal(initialMode);
        expect(storedAliasAfter?.aliasPrivateKey).to.equal(oldAliasRow.aliasPrivateKey);
    } finally {
        await context.cleanup();
    }
}

async function buildSignedReplyPublication({ signer, subplebbitAddress, postCid, parentCid }) {
    const base = {
        signer,
        author: { address: signer.address },
        subplebbitAddress,
        timestamp: timestamp(),
        protocolVersion: PROTOCOL_VERSION,
        content: `transition-reply-${Date.now()}`,
        postCid,
        parentCid
    };
    const signature = await signComment(base, {});
    const publication = { ...base, signature };
    delete publication.signer;
    return publication;
}

async function buildSignedPostPublication({ signer, subplebbitAddress }) {
    const base = {
        signer,
        author: { address: signer.address },
        subplebbitAddress,
        timestamp: timestamp(),
        protocolVersion: PROTOCOL_VERSION,
        title: `transition-post-${Date.now()}`,
        content: `transition-post-content-${Date.now()}`
    };
    const signature = await signComment(base, {});
    const publication = { ...base, signature };
    delete publication.signer;
    return publication;
}

async function ensureSubplebbitDbReady(subplebbit) {
    if (typeof subplebbit.initDbHandlerIfNeeded === "function") {
        await subplebbit.initDbHandlerIfNeeded();
    }
    await subplebbit._dbHandler.initDbIfNeeded({ fileMustExist: false });
}

function expectStoredCommentToUseAlias(dbHandler, cid, aliasSigner) {
    const stored = dbHandler.queryComment(cid);
    expect(stored?.author?.address).to.equal(aliasSigner.address);
    expect(stored?.signature?.publicKey).to.equal(aliasSigner.publicKey);
}

async function createAnonymityTransitionContext(initialMode) {
    const plebbit = await mockPlebbit();
    const subplebbit = await createSubWithNoChallenge({}, plebbit);
    await subplebbit.edit({ features: { pseudonymityMode: initialMode } });
    await subplebbit._dbHandler.initDbIfNeeded({ fileMustExist: false });
    await subplebbit._dbHandler.createOrMigrateTablesIfNeeded();
    return {
        subplebbit,
        dbHandler: subplebbit._dbHandler,
        plebbit,
        subplebbitAddress: subplebbit.address,
        cleanup: async () => {
            await subplebbit.delete();
            await plebbit.destroy();
        }
    };
}

async function createPerAuthorSubplebbit() {
    const publisherPlebbit = await mockPlebbit();
    const subplebbit = await createSubWithNoChallenge({}, publisherPlebbit);
    await subplebbit.edit({ features: { pseudonymityMode: "per-author" } });
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
