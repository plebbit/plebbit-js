import { expect } from "chai";
import { generateMockPost, getRemotePlebbitConfigs, publishWithExpectedResult } from "../../../../dist/node/test/test-util.js";
import signers from "../../../fixtures/signers.js";
getRemotePlebbitConfigs({ includeOnlyTheseTests: ["remote-kubo-rpc", "remote-libp2pjs"] }).map((config) => {
    describe(`Pubsub request fields in plebbit.createComment - ${config.name}`, async () => {
        let plebbit;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`plebbit.createComment({challengeRequest: challengeAnswers}) includes challengeAnswers in request pubsub message`, async () => {
            const challengeRequestFields = { challengeAnswers: ["12345"] };
            const comment = await generateMockPost(signers[0].address, plebbit, false, { challengeRequest: challengeRequestFields });
            expect(comment.challengeRequest).to.deep.equal(challengeRequestFields);

            expect(comment.toJSONPubsubRequestToEncrypt().challengeAnswers).to.deep.equal(challengeRequestFields.challengeAnswers);
            let challengeRequestPromise = new Promise((resolve) => comment.once("challengerequest", resolve));
            await publishWithExpectedResult(comment, true);
            const challengeRequestFromEvent = await challengeRequestPromise;
            const challengeRequestFromInstance = comment._publishedChallengeRequests[0];
            for (const challengerequest of [challengeRequestFromEvent, challengeRequestFromInstance])
                expect(challengerequest.challengeAnswers).to.deep.equal(challengeRequestFields.challengeAnswers);
        });
        it(`plebbit.createComment({challengeRequest: challengeCommentCids}) includes challengeCommentCids in request pubsub message`, async () => {
            const challengeRequestFields = { challengeCommentCids: ["QmXsYKgNH7XoZXdLko5uDvtWSRNE2AXuQ4u8KxVpCacrZx"] }; // random cid
            const comment = await generateMockPost(signers[0].address, plebbit, false, { challengeRequest: challengeRequestFields });

            expect(comment.toJSONPubsubRequestToEncrypt().challengeCommentCids).to.deep.equal(challengeRequestFields.challengeCommentCids);
            let challengeRequestPromise = new Promise((resolve) => comment.once("challengerequest", resolve));
            await publishWithExpectedResult(comment, true);
            const challengeRequestFromEvent = await challengeRequestPromise;
            const challengeRequestFromInstance = comment._publishedChallengeRequests[0];
            for (const challengerequest of [challengeRequestFromEvent, challengeRequestFromInstance])
                expect(challengerequest.challengeCommentCids).to.deep.equal(challengeRequestFields.challengeCommentCids);
        });

        it(`Pubsub fields are copied properly with JSON.parse(JSON.stringify(comment)))`, async () => {
            const challengeRequestFields = {
                challengeCommentCids: ["QmXsYKgNH7XoZXdLko5uDvtWSRNE2AXuQ4u8KxVpCacrZx"],
                challengeAnswers: ["12345"]
            }; // random cid
            const comment = await generateMockPost(signers[0].address, plebbit, false, { challengeRequest: challengeRequestFields });
            const recreatedComment = await plebbit.createComment(JSON.parse(JSON.stringify(comment)));
            expect(recreatedComment.challengeRequest).to.deep.equal(comment.challengeRequest);

            expect(recreatedComment.toJSONPubsubRequestToEncrypt().challengeCommentCids).to.deep.equal(
                challengeRequestFields.challengeCommentCids
            );
            expect(recreatedComment.toJSONPubsubRequestToEncrypt().challengeAnswers).to.deep.equal(challengeRequestFields.challengeAnswers);
            let challengeRequestPromise = new Promise((resolve) => recreatedComment.once("challengerequest", resolve));

            await publishWithExpectedResult(recreatedComment, true);
            const challengeRequestFromEvent = await challengeRequestPromise;
            const challengeRequestFromInstance = recreatedComment._publishedChallengeRequests[0];
            for (const challengerequest of [challengeRequestFromEvent, challengeRequestFromInstance]) {
                expect(challengerequest.challengeCommentCids).to.deep.equal(challengeRequestFields.challengeCommentCids);
                expect(challengerequest.challengeAnswers).to.deep.equal(challengeRequestFields.challengeAnswers);
            }
        });
    });
});
