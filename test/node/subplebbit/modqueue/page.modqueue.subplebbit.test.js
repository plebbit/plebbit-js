import { expect } from "chai";
import {
    mockPlebbit,
    generateMockPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    mockGatewayPlebbit,
    generateMockVote,
    generateMockComment
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";



describe("Modqueue depths", () => {
    let plebbit, subplebbit, pendingComment, modSigner;

    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await plebbit.createSubplebbit();
        await subplebbit.start();
        modSigner = await plebbit.createSigner();
        await subplebbit.edit({
            roles: {
                [modSigner.address]: { role: "moderator" }
            }
        });
    });

    after(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
    });

    it(`should support mod queue pages with comments of the same depth, depth = 0`);

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
