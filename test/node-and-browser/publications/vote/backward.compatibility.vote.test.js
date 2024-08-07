import {
    disableZodValidationOfPublication,
    generateMockVote,
    getRemotePlebbitConfigs,
    mockPlebbit,
    publishRandomPost,
    publishWithExpectedResult
} from "../../../../dist/node/test/test-util";

import { messages } from "../../../../dist/node/errors.js";
import signers from "../../../fixtures/signers.js";

getRemotePlebbitConfigs().map((config) => {
    describe(`Backward compatibility for Vote - ${config.name}`, async () => {
        // A subplebbit should accept a vote with unknown props
        // However, it should not process the unknown props, it should strip them out after validation

        let plebbit;
        let commentToVoteOn;
        before(async () => {
            plebbit = await mockPlebbit();
            commentToVoteOn = await publishRandomPost(signers[0].address, plebbit, {}, false);
        });

        it(`Publishing vote.extraProp should work`, async () => {
            const vote = await generateMockVote(commentToVoteOn, 1, plebbit);
            const orgPublication = vote.toJSONPubsubMessagePublication();
            vote.toJSONPubsubMessagePublication = () => ({ ...orgPublication, extraProp: "1234" });
            disableZodValidationOfPublication(vote);

            await publishWithExpectedResult(vote, true);
        });

        it(`Publishing vote.reservedField should be rejected`, async () => {
            const vote = await generateMockVote(commentToVoteOn, 1, plebbit);
            const orgPublication = vote.toJSONPubsubMessagePublication();
            vote.toJSONPubsubMessagePublication = () => ({ ...orgPublication, insertedAt: "1234" });
            disableZodValidationOfPublication(vote);

            await publishWithExpectedResult(vote, false, messages.ERR_VOTE_HAS_RESERVED_FIELD);
        });
    });
});
