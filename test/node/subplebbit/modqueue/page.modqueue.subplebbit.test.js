import { expect } from "chai";
import {
    mockPlebbit,
    resolveWhenConditionIsTrue,
    publishToModQueueWithDepth,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    createPendingApprovalChallenge
} from "../../../../dist/node/test/test-util.js";
import { describe, expect } from "vitest";
import { testCommentFieldsInModQueuePageJson } from "../../../node-and-browser/pages/pages-test-util.js";

const depthsToTest = [0, 1, 2, 3, 10, 15, 25, 35];
const pendingApprovalCommentProps = { challengeRequest: { challengeAnswers: ["pending"] } };

const setupSubplebbitWithModerator = async () => {
    const plebbit = await mockPlebbit();
    const subplebbit = await plebbit.createSubplebbit();
    const modSigner = await plebbit.createSigner();
    await subplebbit.edit({
        roles: {
            [modSigner.address]: { role: "moderator" }
        },
        settings: {
            challenges: [createPendingApprovalChallenge()]
        }
    });

    await subplebbit.start();
    await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => subplebbit.updatedAt });
    return { plebbit, subplebbit, modSigner };
};

describe.concurrent("Modqueue depths", () => {
    // should be a for loop that iterates over all depths
    for (const depth of depthsToTest) {
        it(`should support mod queue pages with comments of the same depth, depth = ${depth}`, async () => {
            const { plebbit, subplebbit, modSigner } = await setupSubplebbitWithModerator();
            expect(subplebbit.lastPostCid).to.be.undefined;
            const numOfComments = 3;
            const remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();

            try {
                const pendingComments = await Promise.all(
                    new Array(numOfComments).fill(null).map(() =>
                        publishToModQueueWithDepth({
                            subplebbit,
                            depth,
                            modCommentProps: { signer: modSigner },
                            plebbit: remotePlebbit,
                            commentProps: pendingApprovalCommentProps
                        })
                    )
                );

                await resolveWhenConditionIsTrue({
                    toUpdate: subplebbit,
                    predicate: async () => {
                        if (!subplebbit.modQueue.pageCids.pendingApproval) return false;
                        const modQueuePage = await subplebbit.modQueue.getPage(subplebbit.modQueue.pageCids.pendingApproval);
                        return modQueuePage.comments.length === numOfComments;
                    }
                });

                const modQueuepageLoaded = await subplebbit.modQueue.getPage(subplebbit.modQueue.pageCids.pendingApproval);

                expect(modQueuepageLoaded.comments.length).to.equal(numOfComments);

                for (let i = 0; i < pendingComments.length; i++) {
                    // this will test both order and that all depths do exist in the page
                    // order of mod queue is newest first, so it's the reverse of pendingComments
                    expect(pendingComments[i].comment.depth).to.equal(depth);
                    expect(modQueuepageLoaded.comments[i].depth).to.equal(depth);

                    testCommentFieldsInModQueuePageJson(modQueuepageLoaded.comments[i], subplebbit.address);
                }
            } finally {
                await remotePlebbit.destroy();
                await subplebbit.delete();
                await plebbit.destroy();
            }
        });
    }

    it("Should support modqueue pages with comments of different depths", async () => {
        const { plebbit, subplebbit, modSigner } = await setupSubplebbitWithModerator();
        // TODO: Create a mix of top-level posts and nested replies in pending approval
        // and verify modqueue page rendering/order handles varying depths correctly

        const remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();

        try {
            const pendingComments = await Promise.all(
                depthsToTest.map((depth) =>
                    publishToModQueueWithDepth({
                        subplebbit,
                        depth,
                        modCommentProps: { signer: modSigner },
                        plebbit: remotePlebbit,
                        commentProps: pendingApprovalCommentProps
                    })
                )
            );

            // different depths should show up in mod queue

            await resolveWhenConditionIsTrue({
                toUpdate: subplebbit,
                predicate: async () => {
                    if (!subplebbit.modQueue.pageCids.pendingApproval) return false;
                    const modQueuePage = await subplebbit.modQueue.getPage(subplebbit.modQueue.pageCids.pendingApproval);
                    return modQueuePage.comments.length === pendingComments.length;
                }
            });

            const modQueuepageLoaded = await subplebbit.modQueue.getPage(subplebbit.modQueue.pageCids.pendingApproval);

            expect(modQueuepageLoaded.comments.length).to.equal(pendingComments.length);
            for (let i = 0; i < pendingComments.length; i++) {
                // this will test both order and that all depths do exist in the page
                const pendingInPage = modQueuepageLoaded.comments.find((c) => c.cid === pendingComments[i].comment.cid);

                expect(pendingComments[i].comment.depth).to.equal(pendingInPage.depth);

                testCommentFieldsInModQueuePageJson(pendingInPage, subplebbit.address);
            }
        } finally {
            await remotePlebbit.destroy();
            await subplebbit.delete();
            await plebbit.destroy();
        }
    });
});
