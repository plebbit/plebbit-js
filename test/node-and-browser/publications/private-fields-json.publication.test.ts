import signers from "../../fixtures/signers.js";
import { getAvailablePKCConfigsToTestAgainst } from "../../../dist/node/test/test-util.js";
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import type { PKC } from "../../../dist/node/pkc/pkc.js";

// A publication's internal state lives in fields starting with "_", which hideClassPrivateProps makes non-enumerable so
// they stay out of JSON.stringify(publication). A field only declared (not initialized) does not exist yet when the
// constructor hides them, so it becomes enumerable once assigned and leaks into the JSON a client stores or passes back
// to createX. _signedWithKnownCommunityFields (#401) is assigned for every publication created with the community's key.
const communityAddress = signers[0].address;
const commentCid = "QmVZR5Ts9MhRc66hr6TsYnX1A2oPhJ2H1fRJknxgjLLwrh";

const privateKeysInJson = (publication: unknown) =>
    Object.keys(JSON.parse(JSON.stringify(publication)) as Record<string, unknown>).filter((key) => key.startsWith("_"));

getAvailablePKCConfigsToTestAgainst().map((config) => {
    describe.concurrent(`Private fields stay out of a publication's JSON - ${config.name}`, async () => {
        let pkc: PKC;

        beforeAll(async () => {
            pkc = await config.pkcInstancePromise();
        });

        afterAll(async () => {
            await pkc.destroy();
        });

        it(`a comment created with the community's key`, async () => {
            const comment = await pkc.createComment({ communityAddress, title: "title", content: "content", signer: signers[1] });
            expect(privateKeysInJson(comment)).to.deep.equal([]);
        });

        it(`a vote created with the community's key`, async () => {
            const vote = await pkc.createVote({ communityAddress, commentCid, vote: 1, signer: signers[1] });
            expect(privateKeysInJson(vote)).to.deep.equal([]);
        });

        it(`a commentEdit created with the community's key`, async () => {
            const commentEdit = await pkc.createCommentEdit({ communityAddress, commentCid, content: "edited", signer: signers[1] });
            expect(privateKeysInJson(commentEdit)).to.deep.equal([]);
        });

        it(`a commentModeration created with the community's key`, async () => {
            const commentModeration = await pkc.createCommentModeration({
                communityAddress,
                commentCid,
                commentModeration: { removed: true },
                signer: signers[1]
            });
            expect(privateKeysInJson(commentModeration)).to.deep.equal([]);
        });

        it(`a communityEdit created with the community's key`, async () => {
            const communityEdit = await pkc.createCommunityEdit({
                communityAddress,
                communityEdit: { title: "new title" },
                signer: signers[1]
            });
            expect(privateKeysInJson(communityEdit)).to.deep.equal([]);
        });
    });
});
