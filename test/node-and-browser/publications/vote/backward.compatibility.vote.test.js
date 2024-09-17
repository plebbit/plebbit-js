import {
    generateMockVote,
    getRemotePlebbitConfigs,
    itSkipIfRpc,
    mockPlebbit,
    publishRandomPost,
    publishWithExpectedResult,
    setExtraPropOnVoteAndSign
} from "../../../../dist/node/test/test-util.js";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

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

        itSkipIfRpc(`Publishing vote.extraProp should fail if it's not included in vote.signature.signedPropertyNames`, async () => {
            // We skip with RPC because rpc server will check if signature is valid before publishing
            // If signature is invalid, like in this test, it will throw before publishing
            const vote = await generateMockVote(commentToVoteOn, 1, plebbit);
            await setExtraPropOnVoteAndSign(vote, { extraProp: "1234" }, false); // will include extra prop in request.vote, but not in signedPropertyNames

            await plebbit.createVote(JSON.parse(JSON.stringify(vote))); // attempt to create just to see if createVote will throw due to extra prop
            await publishWithExpectedResult(vote, false, messages.ERR_VOTE_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES);
            expect(vote._publishedChallengeRequests[0].vote.extraProp).to.equal("1234");
        });

        it(`publishing vote.extraProp should succeed if it's included in vote.signature.signedPropertyNames`, async () => {
            const vote = await generateMockVote(commentToVoteOn, 1, plebbit);
            await setExtraPropOnVoteAndSign(vote, { extraProp: "1234" }, true); // will include extra prop in request.vote, and signedPropertyNames

            await publishWithExpectedResult(vote, true);
            expect(vote._publishedChallengeRequests[0].vote.extraProp).to.equal("1234");
        });

        it(`Publishing vote.reservedField should be rejected`, async () => {
            const vote = await generateMockVote(commentToVoteOn, 1, plebbit);
            await setExtraPropOnVoteAndSign(vote, { insertedAt: "1234" }, true);

            await publishWithExpectedResult(vote, false, messages.ERR_VOTE_HAS_RESERVED_FIELD);
            expect(vote._publishedChallengeRequests[0].vote.insertedAt).to.equal("1234");
        });

        describe(`Publishing vote with extra props in author field - ${config.name}`, async () => {
            it(`Publishing with extra prop for author should fail if it's a reserved field`, async () => {
                const vote = await generateMockVote(commentToVoteOn, 1, plebbit);
                await setExtraPropOnVoteAndSign(vote, { author: { ...vote._pubsubMsgToPublish.author, subplebbit: "random" } }, true);

                await publishWithExpectedResult(vote, false, messages.ERR_PUBLICATION_AUTHOR_HAS_RESERVED_FIELD);
                expect(vote._publishedChallengeRequests[0].vote.author.subplebbit).to.equal("random");
            });
            it(`Publishing with extra prop for author should succeed`, async () => {
                const vote = await generateMockVote(commentToVoteOn, 1, plebbit);
                const extraProps = { extraProp: "1234" };
                await setExtraPropOnVoteAndSign(vote, { author: { ...vote._pubsubMsgToPublish.author, ...extraProps } }, true);

                await plebbit.createVote(JSON.parse(JSON.stringify(vote))); // attempt to create just to see if createVote will throw due to extra prop
                await publishWithExpectedResult(vote, true);
                expect(vote._publishedChallengeRequests[0].vote.author.extraProp).to.equal(extraProps.extraProp);
            });
        });
    });
});
