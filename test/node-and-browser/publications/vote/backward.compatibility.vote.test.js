import {
    generateMockVote,
    getRemotePlebbitConfigs,
    mockPlebbit,
    publishRandomPost,
    publishWithExpectedResult,
    setExtraPropOnVoteAndSign
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
            plebbit = await config.plebbitInstancePromise();
            commentToVoteOn = await publishRandomPost(signers[0].address, plebbit, {}, false);
        });

        it(`Publishing vote.extraProp should fail if it's not included in vote.signature.signedPropertyNames`, async () => {
            const vote = await generateMockVote(commentToVoteOn, 1, plebbit);
            await setExtraPropOnVoteAndSign(vote, { extraProp: "1234" }, false); // will include extra prop in request.publication, but not in signedPropertyNames

            await publishWithExpectedResult(vote, false, messages.ERR_VOTE_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES);
        });

        it(`publishing vote.extraProp should succeed if it's included in vote.signature.signedPropertyNames`, async () => {
            const vote = await generateMockVote(commentToVoteOn, 1, plebbit);
            await setExtraPropOnVoteAndSign(vote, { extraProp: "1234" }, true); // will include extra prop in request.publication, and signedPropertyNames

            await publishWithExpectedResult(vote, true);
        });

        it(`Publishing vote.reservedField should be rejected`, async () => {
            const vote = await generateMockVote(commentToVoteOn, 1, plebbit);
            await setExtraPropOnVoteAndSign(vote, { insertedAt: "1234" }, true);

            await publishWithExpectedResult(vote, false, messages.ERR_VOTE_HAS_RESERVED_FIELD);
        });
    });
});
