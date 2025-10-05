import { expect } from "chai";
import {
    mockPlebbit,
    generateMockPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    publishToModQueueWithDepth
} from "../../../../dist/node/test/test-util.js";

describe(`Modqueue limits`, () => {
    let plebbit;
    let subplebbit;
    const pendingComments = [];

    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await plebbit.createSubplebbit();
        await subplebbit.start();
        await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.updatedAt);
    });

    after(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
    });

    it("Should default maxPendingApprovalCount to 500", async function () {
        this.timeout(30000);

        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.settings?.maxPendingApprovalCount === "number");
        expect(subplebbit.settings?.maxPendingApprovalCount).to.equal(500);
    });

    it("Should allow comments to be published to pending approvals over maxPendingApprovalCount ", async function () {
        this.timeout(60000);

        const limit = 2;
        const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
        const challengeWithPendingApproval = {
            ...subplebbit.settings.challenges[0],
            pendingApproval: true
        };

        await subplebbit.edit({
            settings: {
                challenges: [challengeWithPendingApproval],
                maxPendingApprovalCount: limit
            }
        });
        await updatePromise;

        expect(subplebbit.settings.maxPendingApprovalCount).to.equal(limit);

        const totalToPublish = limit + 2;

        for (let index = 0; index < totalToPublish; index++) {
            const { comment, challengeVerification } = await publishToModQueueWithDepth({ subplebbit, depth: 0 });
            expect(comment.pendingApproval).to.be.true;
            pendingComments.push(comment);
        }
        // none of the comments got rejected, instead 2 of them got removed from pending queue
    });

    it("Should remove old pending comments from DB when hitting maxPendingApprovalCount limit", async function () {
        const limit = subplebbit.settings.maxPendingApprovalCount;
        await resolveWhenConditionIsTrue(subplebbit, async () => subplebbit._dbHandler.queryCommentsPendingApproval().length === limit);

        const pendingRows = subplebbit._dbHandler.queryCommentsPendingApproval();
        expect(pendingRows).to.have.length(limit);

        const expectedPendingCids = pendingComments
            .slice(-limit)
            .map((comment) => comment.cid)
            .reverse();
        expect(pendingRows.map((row) => row.cid)).to.deep.equal(expectedPendingCids);

        for (let i = 0; i < limit; i++) {
            const cidOfCommentThatGotRemovedFromPending = pendingComments[i].cid;
            expect(subplebbit._dbHandler.queryComment(cidOfCommentThatGotRemovedFromPending)).to.be.undefined;
        }
    });

    it("Should drop oldest pending comment from modqueue pages", async function () {
        const limit = subplebbit.settings.maxPendingApprovalCount;

        await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.modQueue.pageCids?.pendingApproval);

        await new Promise((resolve) => setTimeout(resolve, 3000));

        const currentPageCid = subplebbit.modQueue.pageCids.pendingApproval;
        const page = await subplebbit.modQueue.getPage(currentPageCid);
        const pageCommentCids = page.comments.map((comment) => comment.cid);

        const expectedPendingCids = pendingComments
            .slice(-limit)
            .map((comment) => comment.cid)
            .reverse();
        expect(pageCommentCids).to.deep.equal(expectedPendingCids);

        for (let i = 0; i < limit; i++) {
            const cidOfCommentThatGotRemovedFromPending = pendingComments[i].cid;
            expect(pageCommentCids).to.not.include(cidOfCommentThatGotRemovedFromPending);
        }
    });
});
