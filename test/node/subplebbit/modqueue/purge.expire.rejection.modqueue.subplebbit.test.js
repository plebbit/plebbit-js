import { expect } from "chai";
import {
    mockPlebbit,
    mockGatewayPlebbit,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    publishToModQueueWithDepth,
    describeSkipIfRpc
} from "../../../../dist/node/test/test-util.js";

const ONE_MINUTE = 60;
const DEFAULT_MOD_PROPS = { approved: false, reason: "Expired disapproval" };

async function createTestContext({ retentionSeconds } = {}) {
    const plebbit = await mockPlebbit();
    const remotePlebbit = await mockGatewayPlebbit();
    const subplebbit = await plebbit.createSubplebbit();
    subplebbit.setMaxListeners(100);
    await subplebbit.start();
    const modSigner = await plebbit.createSigner();

    const initialSettings = JSON.parse(JSON.stringify(subplebbit.settings ?? {}));
    const mergedChallenges = Array.isArray(initialSettings.challenges)
        ? initialSettings.challenges.map((challenge, idx) => (idx === 0 ? { ...challenge, pendingApproval: true } : challenge))
        : [
              {
                  name: "question",
                  options: { question: "1+1?", answer: "2" },
                  pendingApproval: true
              }
          ];

    const editedSettings = {
        ...initialSettings,
        challenges: mergedChallenges
    };

    if (typeof retentionSeconds === "number") editedSettings.purgeDisapprovedCommentsOlderThan = retentionSeconds;
    else delete editedSettings.purgeDisapprovedCommentsOlderThan;

    const editArgs = {
        roles: { [modSigner.address]: { role: "moderator" } },
        settings: editedSettings
    };

    if (initialSettings.purgeDisapprovedCommentsOlderThan === undefined && retentionSeconds === undefined)
        delete editArgs.settings.purgeDisapprovedCommentsOlderThan;

    await subplebbit.edit(editArgs);
    await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.updatedAt);

    async function cleanup() {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    }

    return { plebbit, remotePlebbit, subplebbit, modSigner, retentionSeconds, cleanup };
}

async function createDisapprovedComment(ctx, { depth = 1, moderationProps = DEFAULT_MOD_PROPS } = {}) {
    const pending = await publishToModQueueWithDepth({
        subplebbit: ctx.subplebbit,
        plebbit: ctx.remotePlebbit,
        depth,
        modCommentProps: { signer: ctx.modSigner }
    });
    const pendingComment = pending.comment;
    await resolveWhenConditionIsTrue(ctx.subplebbit, () => Boolean(ctx.subplebbit.modQueue?.pageCids?.pendingApproval));

    const commentModeration = await ctx.plebbit.createCommentModeration({
        subplebbitAddress: ctx.subplebbit.address,
        signer: ctx.modSigner,
        commentModeration: moderationProps,
        commentCid: pendingComment.cid
    });
    await publishWithExpectedResult(commentModeration, true);

    await resolveWhenConditionIsTrue(ctx.subplebbit, () => {
        const storedUpdate = ctx.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: pendingComment.cid });
        return Boolean(storedUpdate && storedUpdate.approved === false);
    });

    return pendingComment;
}

async function createApprovedComment(ctx, { depth = 1 } = {}) {
    const pending = await publishToModQueueWithDepth({
        subplebbit: ctx.subplebbit,
        plebbit: ctx.remotePlebbit,
        depth,
        modCommentProps: { signer: ctx.modSigner }
    });
    const pendingComment = pending.comment;
    await resolveWhenConditionIsTrue(ctx.subplebbit, () => Boolean(ctx.subplebbit.modQueue?.pageCids?.pendingApproval));

    const commentModeration = await ctx.plebbit.createCommentModeration({
        subplebbitAddress: ctx.subplebbit.address,
        signer: ctx.modSigner,
        commentModeration: { approved: true },
        commentCid: pendingComment.cid
    });
    await publishWithExpectedResult(commentModeration, true);

    await resolveWhenConditionIsTrue(ctx.subplebbit, () => {
        const storedUpdate = ctx.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: pendingComment.cid });
        return Boolean(storedUpdate && storedUpdate.approved === true);
    });

    return pendingComment;
}
async function setPendingApproval(ctx, commentCid, pending = true) {
    ctx.subplebbit._dbHandler._db.prepare(`UPDATE comments SET pendingApproval = ? WHERE cid = ?`).run(pending ? 1 : 0, commentCid);
    await resolveWhenConditionIsTrue(ctx.subplebbit, () => {
        const comment = ctx.subplebbit._dbHandler.queryComment(commentCid);
        return Boolean(comment && (pending ? comment.pendingApproval : !comment.pendingApproval));
    });
}

function backdateAllDisapprovals(ctx, commentCid, secondsAgo) {
    const cutoffTimestamp = Math.floor(Date.now() / 1000) - secondsAgo;
    ctx.subplebbit._dbHandler._db
        .prepare(`UPDATE commentModerations SET timestamp = ? WHERE commentCid = ?`)
        .run(cutoffTimestamp, commentCid);
    return cutoffTimestamp;
}

function updateSpecificModerationTimestamp(ctx, commentCid, rowIndex, secondsAgo) {
    const row = ctx.subplebbit._dbHandler._db
        .prepare(`SELECT rowid FROM commentModerations WHERE commentCid = ? ORDER BY rowid ASC LIMIT 1 OFFSET ?`)
        .get(commentCid, rowIndex);
    if (!row) throw new Error(`Expected moderation row at index ${rowIndex}`);
    const cutoffTimestamp = Math.floor(Date.now() / 1000) - secondsAgo;
    ctx.subplebbit._dbHandler._db.prepare(`UPDATE commentModerations SET timestamp = ? WHERE rowid = ?`).run(cutoffTimestamp, row.rowid);
    return cutoffTimestamp;
}

function backdateCommentUpdate(ctx, commentCid, secondsAgo) {
    const cutoffTimestamp = Math.floor(Date.now() / 1000) - secondsAgo;
    ctx.subplebbit._dbHandler._db.prepare(`UPDATE commentUpdates SET updatedAt = ? WHERE cid = ?`).run(cutoffTimestamp, commentCid);
    return cutoffTimestamp;
}

describeSkipIfRpc("purgeDisapprovedCommentsOlderThan expirations", function () {
    this.timeout(120_000);

    describe("default retention configuration", () => {
        let plebbit;
        let subplebbit;

        before(async () => {
            plebbit = await mockPlebbit();
            subplebbit = await plebbit.createSubplebbit();
            subplebbit.setMaxListeners(100);
            await subplebbit.start();
            await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.updatedAt);
        });

        after(async () => {
            if (subplebbit) await subplebbit.delete();
            if (plebbit) await plebbit.destroy();
        });

        it("applies two-week default when unset", () => {
            expect(subplebbit.settings.purgeDisapprovedCommentsOlderThan).to.equal(1.21e6);
        });
    });

    describe("when the first disapproval exceeds the retention window", () => {
        const retentionSeconds = ONE_MINUTE;
        let ctx;
        let disapprovedComment;
        let commentBeforePurge;
        let parentCid;
        let parentUpdateBefore;
        let parentUpdateAfterPurge;
        let parentUpdateAfterRefresh;

        before(async () => {
            ctx = await createTestContext({ retentionSeconds });
            disapprovedComment = await createDisapprovedComment(ctx);
            parentCid = disapprovedComment.parentCid;
            commentBeforePurge = ctx.subplebbit._dbHandler.queryComment(disapprovedComment.cid);
            if (parentCid) ctx.subplebbit._dbHandler.markCommentsAsPublishedToPostUpdates([parentCid]);
            parentUpdateBefore = parentCid ? ctx.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: parentCid }) : undefined;
            backdateAllDisapprovals(ctx, disapprovedComment.cid, retentionSeconds + 10);
            ctx.subplebbit._dbHandler.purgeDisapprovedCommentsOlderThan(retentionSeconds);
            parentUpdateAfterPurge = parentCid ? ctx.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: parentCid }) : undefined;
            if (parentCid) {
                await ctx.subplebbit._updateCommentsThatNeedToBeUpdated();
                parentUpdateAfterRefresh = ctx.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: parentCid });
            }
        });

        after(async () => {
            if (ctx) await ctx.cleanup();
        });

        it("purges the disapproved comment", () => {
            expect(commentBeforePurge).to.exist;
            const after = ctx.subplebbit._dbHandler.queryComment(disapprovedComment.cid);
            expect(after).to.be.undefined;
            const updateAfter = ctx.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: disapprovedComment.cid });
            expect(updateAfter).to.be.undefined;
        });

        it("removes the purged comment from kubo pins", async () => {
            const kuboRpc = Object.values(ctx.plebbit.clients.kuboRpcClients)[0]._client;
            for await (const pin of kuboRpc.pin.ls()) {
                expect(pin.cid.toString()).to.not.equal(disapprovedComment.cid);
            }
        });

        it("forces parent comment to republish", () => {
            if (!parentCid) return;
            expect(parentUpdateBefore).to.exist;
            expect(parentUpdateAfterPurge).to.exist;
            expect(parentUpdateAfterPurge?.publishedToPostUpdatesMFS).to.be.false;
        });

        it("refreshes parent metadata after regeneration", () => {
            if (!parentCid) return;
            expect(parentUpdateAfterRefresh).to.exist;
            if (typeof parentUpdateBefore?.updatedAt === "number" && typeof parentUpdateAfterRefresh?.updatedAt === "number")
                expect(parentUpdateAfterRefresh.updatedAt).to.not.equal(parentUpdateBefore.updatedAt);
            expect(parentUpdateAfterRefresh?.lastChildCid).to.not.equal(disapprovedComment.cid);
            const replies = parentUpdateAfterRefresh?.replies;
            if (replies?.pageCids) {
                Object.values(replies.pageCids).forEach((cid) => {
                    if (typeof cid === "string") expect(cid).to.not.equal(disapprovedComment.cid);
                });
            }
        });
    });

    describe("when moderation is strictly {approved:false}", () => {
        let ctx;
        let commentCid;
        let parentCid;
        let commentBeforeModeration;
        let parentUpdateAfterImmediatePurge;

        before(async () => {
            ctx = await createTestContext({ retentionSeconds: ONE_MINUTE });
            const pending = await publishToModQueueWithDepth({
                subplebbit: ctx.subplebbit,
                plebbit: ctx.remotePlebbit,
                depth: 1,
                modCommentProps: { signer: ctx.modSigner }
            });
            commentCid = pending.comment.cid;
            parentCid = pending.comment.parentCid;
            await resolveWhenConditionIsTrue(ctx.subplebbit, () => Boolean(ctx.subplebbit.modQueue?.pageCids?.pendingApproval));
            commentBeforeModeration = ctx.subplebbit._dbHandler.queryComment(commentCid);

            const moderation = await ctx.plebbit.createCommentModeration({
                subplebbitAddress: ctx.subplebbit.address,
                signer: ctx.modSigner,
                commentModeration: { approved: false },
                commentCid
            });
            await publishWithExpectedResult(moderation, true);

            await resolveWhenConditionIsTrue(ctx.subplebbit, () => !ctx.subplebbit._dbHandler.queryComment(commentCid));
            parentUpdateAfterImmediatePurge = parentCid
                ? ctx.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: parentCid })
                : undefined;
        });

        after(async () => {
            if (ctx) await ctx.cleanup();
        });

        it("stores the pending comment before moderation runs", () => {
            expect(commentBeforeModeration).to.exist;
            expect(commentBeforeModeration?.pendingApproval).to.be.true;
        });

        it("purges the comment immediately after moderation", () => {
            const commentAfter = ctx.subplebbit._dbHandler.queryComment(commentCid);
            expect(commentAfter).to.be.undefined;
            const updateAfter = ctx.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: commentCid });
            expect(updateAfter).to.be.undefined;
        });

        it("ensures immediately purged comment is not pinned in kubo", async () => {
            const kuboRpc = Object.values(ctx.plebbit.clients.kuboRpcClients)[0]._client;
            for await (const pin of kuboRpc.pin.ls()) {
                expect(pin.cid.toString()).to.not.equal(commentCid);
            }
        });

        it("forces parent comment to refresh", () => {
            if (!parentCid) return;
            expect(parentUpdateAfterImmediatePurge).to.exist;
            expect(parentUpdateAfterImmediatePurge?.publishedToPostUpdatesMFS).to.be.false;
        });
    });

    describe("when the disapproved item is a post", () => {
        const retentionSeconds = ONE_MINUTE;
        let ctx;
        let disapprovedPost;
        let postBeforePurge;
        let postUpdatesBucket;
        let postUpdatesPath;

        before(async () => {
            ctx = await createTestContext({ retentionSeconds });
            disapprovedPost = await createDisapprovedComment(ctx, {
                depth: 0,
                moderationProps: { approved: false, reason: "post rejection" }
            });
            postBeforePurge = ctx.subplebbit._dbHandler.queryComment(disapprovedPost.cid);
            const storedUpdateBefore = ctx.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: disapprovedPost.cid });
            expect(storedUpdateBefore?.postUpdatesBucket).to.be.a("number");
            postUpdatesBucket = storedUpdateBefore.postUpdatesBucket;
            postUpdatesPath = `/${ctx.subplebbit.address}/postUpdates/${postUpdatesBucket}/${disapprovedPost.cid}/update`;
            console.log("[debug] pre-purge postUpdates path", postUpdatesPath);

            const kuboClientBefore = ctx.subplebbit._clientsManager.getDefaultKuboRpcClient()._client;
            const statBefore = await kuboClientBefore.files.stat(postUpdatesPath);
            expect(statBefore.size).to.be.greaterThan(0);

            backdateAllDisapprovals(ctx, disapprovedPost.cid, retentionSeconds + 10);
            await ctx.subplebbit._purgeDisapprovedCommentsOlderThan();
        });

        after(async () => {
            if (ctx) await ctx.cleanup();
        });

        it(" stores the post prior to purge", () => {
            expect(postBeforePurge).to.exist;
            expect(postBeforePurge?.depth).to.equal(0);
            expect(postUpdatesBucket).to.be.a("number");
        });

        it(" purges the post once retention is exceeded", async () => {
            await new Promise((resolve) => setTimeout(resolve, 2000)); // wait till new post updates is flushed
            const after = ctx.subplebbit._dbHandler.queryComment(disapprovedPost.cid);
            expect(after).to.be.undefined;
            const updateAfter = ctx.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: disapprovedPost.cid });
            expect(updateAfter).to.be.undefined;
            const kuboClientAfter = ctx.subplebbit._clientsManager.getDefaultKuboRpcClient()._client;
            try {
                const res = await kuboClientAfter.files.stat(postUpdatesPath);
                expect.fail("should fail");
            } catch (error) {
                expect(error.message).to.equal("file does not exist");
            }
        });
    });

    describe("when {approved:false} is published on a post", () => {
        let ctx;
        let commentCid;
        let commentBeforeModeration;

        before(async () => {
            ctx = await createTestContext({ retentionSeconds: ONE_MINUTE });
            const pending = await publishToModQueueWithDepth({
                subplebbit: ctx.subplebbit,
                plebbit: ctx.remotePlebbit,
                depth: 0,
                modCommentProps: { signer: ctx.modSigner }
            });
            commentCid = pending.comment.cid;
            await resolveWhenConditionIsTrue(ctx.subplebbit, () => Boolean(ctx.subplebbit.modQueue?.pageCids?.pendingApproval));
            commentBeforeModeration = ctx.subplebbit._dbHandler.queryComment(commentCid);

            const moderation = await ctx.plebbit.createCommentModeration({
                subplebbitAddress: ctx.subplebbit.address,
                signer: ctx.modSigner,
                commentModeration: { approved: false },
                commentCid
            });
            await publishWithExpectedResult(moderation, true);
            await resolveWhenConditionIsTrue(ctx.subplebbit, () => !ctx.subplebbit._dbHandler.queryComment(commentCid));
        });

        after(async () => {
            if (ctx) await ctx.cleanup();
        });

        it(" removes the post immediately", () => {
            expect(commentBeforeModeration).to.exist;
            expect(commentBeforeModeration?.depth).to.equal(0);
            const after = ctx.subplebbit._dbHandler.queryComment(commentCid);
            expect(after).to.be.undefined;
        });
    });

    describe("when a pending reply is approved", () => {
        const retentionSeconds = ONE_MINUTE;
        let ctx;
        let commentCid;
        let commentBeforePurge;
        let commentAfterPurge;

        before(async () => {
            ctx = await createTestContext({ retentionSeconds });
            const approved = await createApprovedComment(ctx);
            commentCid = approved.cid;
            commentBeforePurge = ctx.subplebbit._dbHandler.queryComment(commentCid);
            backdateCommentUpdate(ctx, commentCid, retentionSeconds + 120);
            ctx.subplebbit._dbHandler.purgeDisapprovedCommentsOlderThan(retentionSeconds);
            commentAfterPurge = ctx.subplebbit._dbHandler.queryComment(commentCid);
        });

        after(async () => {
            if (ctx) await ctx.cleanup();
        });

        it(" stores the reply after approval", () => {
            expect(commentBeforePurge).to.exist;
            expect(commentBeforePurge?.depth).to.be.greaterThan(0);
        });

        it(" keeps the reply in database after purge", () => {
            expect(commentAfterPurge).to.exist;
            const update = ctx.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: commentCid });
            expect(update).to.exist;
            expect(update?.approved).to.equal(true);
        });
    });

    describe("when a pending post is approved", () => {
        const retentionSeconds = ONE_MINUTE;
        let ctx;
        let commentCid;
        let commentBeforePurge;
        let commentAfterPurge;

        before(async () => {
            ctx = await createTestContext({ retentionSeconds });
            const approved = await createApprovedComment(ctx, { depth: 0 });
            commentCid = approved.cid;
            commentBeforePurge = ctx.subplebbit._dbHandler.queryComment(commentCid);
            backdateCommentUpdate(ctx, commentCid, retentionSeconds + 120);
            ctx.subplebbit._dbHandler.purgeDisapprovedCommentsOlderThan(retentionSeconds);
            commentAfterPurge = ctx.subplebbit._dbHandler.queryComment(commentCid);
        });

        after(async () => {
            if (ctx) await ctx.cleanup();
        });

        it(" stores the post after approval", () => {
            expect(commentBeforePurge).to.exist;
            expect(commentBeforePurge?.depth).to.equal(0);
        });

        it(" keeps the post in database after purge", () => {
            expect(commentAfterPurge).to.exist;
            const update = ctx.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: commentCid });
            expect(update).to.exist;
            expect(update?.approved).to.equal(true);
        });
    });

    describe("when the disapproval is still inside the retention window", () => {
        const retentionSeconds = ONE_MINUTE * 10;
        let ctx;
        let disapprovedComment;

        before(async () => {
            ctx = await createTestContext({ retentionSeconds });
            disapprovedComment = await createDisapprovedComment(ctx);
            backdateAllDisapprovals(ctx, disapprovedComment.cid, retentionSeconds - 5);
            ctx.subplebbit._dbHandler.purgeDisapprovedCommentsOlderThan(retentionSeconds);
        });

        after(async () => {
            if (ctx) await ctx.cleanup();
        });

        it("keeps the disapproved comment", () => {
            const stored = ctx.subplebbit._dbHandler.queryComment(disapprovedComment.cid);
            expect(stored).to.exist;
        });
    });

    describe("when retention is missing or invalid", () => {
        const retentionSeconds = ONE_MINUTE;
        let ctx;
        let disapprovedComment;

        before(async () => {
            ctx = await createTestContext({ retentionSeconds });
            disapprovedComment = await createDisapprovedComment(ctx);
            backdateAllDisapprovals(ctx, disapprovedComment.cid, retentionSeconds + 20);
        });

        after(async () => {
            if (ctx) await ctx.cleanup();
        });

        it("does nothing when retention is undefined", () => {
            ctx.subplebbit._dbHandler.purgeDisapprovedCommentsOlderThan(undefined);
            const stored = ctx.subplebbit._dbHandler.queryComment(disapprovedComment.cid);
            expect(stored).to.exist;
        });

        it("does nothing when retention is non-positive", () => {
            ctx.subplebbit._dbHandler.purgeDisapprovedCommentsOlderThan(0);
            const stored = ctx.subplebbit._dbHandler.queryComment(disapprovedComment.cid);
            expect(stored).to.exist;
        });

        it("purges once a valid retention is provided", () => {
            ctx.subplebbit._dbHandler.purgeDisapprovedCommentsOlderThan(retentionSeconds);
            const stored = ctx.subplebbit._dbHandler.queryComment(disapprovedComment.cid);
            expect(stored).to.be.undefined;
        });
    });

    describe("when multiple disapprovals are recorded", () => {
        const retentionSeconds = ONE_MINUTE;
        let ctx;
        let disapprovedComment;

        before(async () => {
            ctx = await createTestContext({ retentionSeconds });
            disapprovedComment = await createDisapprovedComment(ctx, {
                moderationProps: { approved: false, reason: "first disapproval" }
            });

            await setPendingApproval(ctx, disapprovedComment.cid, true);

            const secondModeration = await ctx.plebbit.createCommentModeration({
                subplebbitAddress: ctx.subplebbit.address,
                signer: ctx.modSigner,
                commentModeration: { approved: false, reason: "second disapproval" },
                commentCid: disapprovedComment.cid
            });
            await publishWithExpectedResult(secondModeration, true);
            await resolveWhenConditionIsTrue(ctx.subplebbit, () => {
                const updates = ctx.subplebbit._dbHandler._db
                    .prepare(`SELECT COUNT(1) as count FROM commentModerations WHERE commentCid = ?`)
                    .get(disapprovedComment.cid);
                return updates?.count >= 2;
            });

            updateSpecificModerationTimestamp(ctx, disapprovedComment.cid, 0, retentionSeconds + 15);
            updateSpecificModerationTimestamp(ctx, disapprovedComment.cid, 1, 5);
            ctx.subplebbit._dbHandler.purgeDisapprovedCommentsOlderThan(retentionSeconds);
        });

        after(async () => {
            if (ctx) await ctx.cleanup();
        });

        it("uses the earliest disapproval timestamp for expiration", () => {
            const stored = ctx.subplebbit._dbHandler.queryComment(disapprovedComment.cid);
            expect(stored).to.be.undefined;
        });
    });

    describe("when a comment gets reapproved before the cutoff", () => {
        const retentionSeconds = ONE_MINUTE;
        let ctx;
        let disapprovedComment;

        before(async () => {
            ctx = await createTestContext({ retentionSeconds });
            disapprovedComment = await createDisapprovedComment(ctx);
            await setPendingApproval(ctx, disapprovedComment.cid, true);

            const approval = await ctx.plebbit.createCommentModeration({
                subplebbitAddress: ctx.subplebbit.address,
                signer: ctx.modSigner,
                commentModeration: { approved: true },
                commentCid: disapprovedComment.cid
            });
            await publishWithExpectedResult(approval, true);

            await resolveWhenConditionIsTrue(ctx.subplebbit, () => {
                const stored = ctx.subplebbit._dbHandler.queryStoredCommentUpdate({ cid: disapprovedComment.cid });
                return Boolean(stored && stored.approved === true);
            });

            backdateAllDisapprovals(ctx, disapprovedComment.cid, retentionSeconds + 30);
            ctx.subplebbit._dbHandler.purgeDisapprovedCommentsOlderThan(retentionSeconds);
        });

        after(async () => {
            if (ctx) await ctx.cleanup();
        });

        it("keeps the comment because it is no longer disapproved", () => {
            const stored = ctx.subplebbit._dbHandler.queryComment(disapprovedComment.cid);
            expect(stored).to.exist;
        });
    });

    describe("when no moderation record exists", () => {
        const retentionSeconds = ONE_MINUTE;
        let ctx;
        let disapprovedComment;

        before(async () => {
            ctx = await createTestContext({ retentionSeconds });
            disapprovedComment = await createDisapprovedComment(ctx);
            ctx.subplebbit._dbHandler._db.prepare(`DELETE FROM commentModerations WHERE commentCid = ?`).run(disapprovedComment.cid);
            backdateCommentUpdate(ctx, disapprovedComment.cid, retentionSeconds + 25);
            ctx.subplebbit._dbHandler.purgeDisapprovedCommentsOlderThan(retentionSeconds);
        });

        after(async () => {
            if (ctx) await ctx.cleanup();
        });

        it("falls back to the comment update timestamp for expiration", () => {
            const stored = ctx.subplebbit._dbHandler.queryComment(disapprovedComment.cid);
            expect(stored).to.be.undefined;
        });
    });
});
