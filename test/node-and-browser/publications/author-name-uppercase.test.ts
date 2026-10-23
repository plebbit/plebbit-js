// Issue #447: communities reject a publication whose author.name has an uppercase letter
// (ERR_AUTHOR_NAME_HAS_CAPITAL_LETTER). Creating one should fail on the client, before signing, instead of
// failing at the community after the challenge exchange. Same rule as a community name
// (ERR_COMMUNITY_NAME_HAS_CAPITAL_LETTER), so one author is never spelled two ways on the wire.
import signers from "../../fixtures/signers.js";
import { getAvailablePKCConfigsToTestAgainst } from "../../../dist/node/test/test-util.js";
import { describe, it, beforeAll, afterAll } from "vitest";
import type { PKC } from "../../../dist/node/pkc/pkc.js";

const communityAddress = signers[0].address;
const commentCid = "QmYNCCoJoYdYpHDp5fbC1RZfBZd2orKXDdj7UWjUwEsbLD";

getAvailablePKCConfigsToTestAgainst().map((config) => {
    describe.concurrent(`creating a publication with an uppercase author.name (#447) - ${config.name}`, async () => {
        let pkc: PKC;
        beforeAll(async () => {
            pkc = await config.pkcInstancePromise();
        });

        afterAll(async () => {
            await pkc.destroy();
        });

        const creators: Record<string, (author: Record<string, string>) => Promise<unknown>> = {
            createComment: (author) =>
                pkc.createComment({ communityAddress, signer: signers[1], author, content: `uppercase ${Date.now()}` }),
            createVote: (author) => pkc.createVote({ communityAddress, signer: signers[1], author, commentCid, vote: 1 }),
            createCommentEdit: (author) =>
                pkc.createCommentEdit({ communityAddress, signer: signers[1], author, commentCid, content: "edited" }),
            createCommentModeration: (author) =>
                pkc.createCommentModeration({
                    communityAddress,
                    signer: signers[1],
                    author,
                    commentCid,
                    commentModeration: { locked: true }
                }),
            createCommunityEdit: (author) =>
                pkc.createCommunityEdit({ communityAddress, signer: signers[1], author, communityEdit: { title: "edited" } })
        };

        for (const [creatorName, create] of Object.entries(creators)) {
            for (const name of ["Uppercase-447.bso", "uppercase-447.BSO", "Uppercase-447.sol"]) {
                it(`${creatorName} throws for author.name "${name}"`, async ({ expect }) => {
                    await expect(create({ name })).rejects.toMatchObject({ code: "ERR_AUTHOR_NAME_HAS_CAPITAL_LETTER" });
                });
            }

            it(`${creatorName} throws for a domain author.address with an uppercase letter`, async ({ expect }) => {
                // A domain author.address is the legacy way to set the name, and is signed as author.name.
                await expect(create({ address: "Uppercase-447.eth" })).rejects.toMatchObject({
                    code: "ERR_AUTHOR_NAME_HAS_CAPITAL_LETTER"
                });
            });

            it(`${creatorName} accepts an all-lowercase author.name`, async ({ expect }) => {
                await expect(create({ name: "lowercase-447.bso" })).resolves.toBeTruthy();
            });
        }
    });
});
