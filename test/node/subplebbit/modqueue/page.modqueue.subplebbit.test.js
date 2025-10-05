import { expect } from "chai";
import {
    mockPlebbit,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    publishToModQueueWithDepth,
    publishRandomReply
} from "../../../../dist/node/test/test-util.js";
import { testCommentFieldsInModQueuePageJson } from "../../../node-and-browser/pages/pages-test-util.js";

const depthsToTest = [0, 1, 2, 3, 4, 5];

describe("Modqueue depths", () => {
    let plebbit, subplebbit, modSigner;
    const pendingComments = [];

    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await plebbit.createSubplebbit();
        modSigner = await plebbit.createSigner();
        await subplebbit.edit({
            roles: {
                [modSigner.address]: { role: "moderator" }
            },
            settings: {
                challenges: [
                    {
                        ...subplebbit.settings.challenges[0],
                        pendingApproval: true
                    }
                ]
            }
        });

        await subplebbit.start();
        await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.updatedAt);
    });

    beforeEach(async () => {
        // make sure to reset purging state
        const pendingRows = subplebbit._dbHandler.queryCommentsPendingApproval();
        pendingRows.forEach((row) => subplebbit._dbHandler.purgeComment(row.cid));
    });

    after(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
    });

    // should be a for loop that iterates over all depths
    for (const depth of depthsToTest) {
        it(`should support mod queue pages with comments of the same depth, depth = ${depth}`, async () => {
            const numOfComments = 2;
            const pendingComments = [];
            for (let i = 0; i < numOfComments; i++) {
                pendingComments.push(await publishToModQueueWithDepth({ subplebbit, depth, modCommentProps: { signer: modSigner } }));
            }

            await new Promise((resolve) => setTimeout(resolve, 3000)); // wait till subplebbit updates modqueue

            await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.modQueue.pageCids.pendingApproval);

            const modQueuepageLoaded = await subplebbit.modQueue.getPage(subplebbit.modQueue.pageCids.pendingApproval);

            expect(modQueuepageLoaded.comments.every((comment) => comment.depth === depth)).to.be.true;
        });
    }

    it("Should support modqueue pages with comments of different depths", async () => {
        // TODO: Create a mix of top-level posts and nested replies in pending approval
        // and verify modqueue page rendering/order handles varying depths correctly
        const pendingComments = [];

        for (const depth of depthsToTest) {
            pendingComments.push(await publishToModQueueWithDepth({ subplebbit, depth, modCommentProps: { signer: modSigner } }));
        }
        // different depths should show up in mod queue

        await new Promise((resolve) => setTimeout(resolve, 3000)); // wait till subplebbit updates modqueue

        await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.modQueue.pageCids.pendingApproval);

        const modQueuepageLoaded = await subplebbit.modQueue.getPage(subplebbit.modQueue.pageCids.pendingApproval);

        for (let i = 0; i < pendingComments.length; i++) {
            // this will test both order and that all depths do exist in the page
            // order of mod queue is newest first, so it's the reverse of pendingComments
            expect(pendingComments[i].comment.depth).to.equal(
                modQueuepageLoaded.comments[modQueuepageLoaded.comments.length - i - 1].depth
            );

            testCommentFieldsInModQueuePageJson(
                modQueuepageLoaded.comments[modQueuepageLoaded.comments.length - i - 1],
                subplebbit.address
            );
        }
    });
});
