import { expect } from "chai";
import {
    mockPlebbit,
    generateMockPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    mockGatewayPlebbit,
    generateMockVote,
    generateMockComment,
    publishPostToModQueue,
    publishRandomPost,
    publishRandomReply
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";

const depthsToTest = [0, 1, 2, 3, 4, 5];

describe("Modqueue depths", () => {
    let plebbit, subplebbit, modSigner;
    const pendingComments = [];

    const publishToModQueueWithDepth = async ({ subplebbit, depth }) => {
        if (depth === 0) return publishPostToModQueue({ subplebbit });
        else {
            // we assume mod can publish comments without mod queue
            const commentsPublishedByMod = [await publishRandomPost(subplebbit.address, subplebbit._plebbit, { signer: modSigner })];
            for (let i = 1; i < depth; i++) {
                commentsPublishedByMod.push(
                    await publishRandomReply(commentsPublishedByMod[i - 1], subplebbit._plebbit, { signer: modSigner })
                );
            }
            // we have created a tree of comments and now we can publish the pending comment underneath it
            const pendingReply = await generateMockComment(
                commentsPublishedByMod[commentsPublishedByMod.length - 1],
                subplebbit._plebbit,
                false,
                {
                    content: "Pending reply" + " " + Math.random()
                }
            );

            pendingReply.removeAllListeners("challenge");

            pendingReply.once("challenge", async () => {
                await pendingReply.publishChallengeAnswers([Math.random() + "12"]); // wrong answer
            });

            const challengeVerificationPromise = new Promise((resolve) => pendingReply.once("challengeverification", resolve));

            await publishWithExpectedResult(pendingReply, true); // a pending approval is technically challengeSucess = true

            if (!pendingReply.pendingApproval) throw Error("The reply did not go to pending approval");
            return { comment: pendingReply, challengeVerification: await challengeVerificationPromise };
        }
    };

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
                        pendingApproval: true,
                        exclude: [
                            {
                                role: ["moderator", "admin", "owner"],
                                publicationType: {
                                    commentModeration: true,
                                    subplebbitEdit: true,
                                    post: true,
                                    reply: true,
                                    commentEdit: true,
                                    vote: true
                                }
                            }
                        ]
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
                pendingComments.push(await publishToModQueueWithDepth({ subplebbit, depth }));
            }

            await new Promise((resolve) => setTimeout(resolve, 3000)); // wait till subplebbit updates modqueue

            await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.modQueue.pageCids.pendingApproval);

            const pageLoaded = await subplebbit.modQueue.getPage(subplebbit.modQueue.pageCids.pendingApproval);

            expect(pageLoaded.comments.every((comment) => comment.depth === depth)).to.be.true;
        });
    }

    it("Should support modqueue pages with comments of different depths", async () => {
        // TODO: Create a mix of top-level posts and nested replies in pending approval
        // and verify modqueue page rendering/order handles varying depths correctly
    });
});

describe("Modqueue page validation", () => {
    it("Should fail getPage if a modqueue comment belongs to a different sub", async () => {
        // TODO: Ensure cross-sub comments cannot appear under another sub's modqueue
        // and that the operation fails or rejects with an appropriate error
    });
});
