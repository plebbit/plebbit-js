import { expect } from "chai";
import signers from "../../fixtures/signers.js";
import {
    generateMockPost,
    setExtraPropOnChallengeRequestAndSign,
    describeSkipIfRpc,
    getRemotePlebbitConfigs,
    publishChallengeMessageWithExtraProps,
    publishChallengeAnswerMessageWithExtraProps
} from "../../../dist/node/test/test-util.js";
import { v4 as uuidV4 } from "uuid";

import { _signJson, _signPubsubMsg } from "../../../dist/node/signer/signatures.js";
import { messages } from "../../../dist/node/errors.js";
const mathCliSubplebbitAddress = signers[1].address;

getRemotePlebbitConfigs().map((config) => {
    describeSkipIfRpc(`Publishing pubsub messages with extra props`, async () => {
        let plebbit;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });
        describe(`ChallengeRequest with extra props`, async () => {
            it(`A challenge request with an extra prop not included in signature.signedPropertyNames will get ignored`, async () => {
                const post = await generateMockPost(signers[0].address, plebbit);
                const extraProps = { extraProp: 1234 };
                await setExtraPropOnChallengeRequestAndSign(post, extraProps, false);
                let responseOfSub;
                let requestFromEvent;

                post.once("challengeverification", (request) => (responseOfSub = request));
                post.once("challengerequest", (request) => {
                    requestFromEvent = request;
                });

                await post.publish();

                expect(requestFromEvent.extraProp).to.equal(extraProps.extraProp);

                // will get ignored because the signature of request is invalid, which means all peers on the network will validate that
                // No need to publish a challenge verification
                await new Promise((resolve) => setTimeout(resolve, 2000));
                expect(responseOfSub).to.be.undefined;
            });

            it(`Can publish a challenge request with extra prop, as long as extra props is part of request.signature.signedPropertyNames`, async () => {
                const post = await generateMockPost(signers[0].address, plebbit);
                const extraProps = { extraProp: 1234 };
                await setExtraPropOnChallengeRequestAndSign(post, extraProps, true);

                let requestFromEvent;

                post.once("challengerequest", (request) => (requestFromEvent = request));
                await post.publish();

                expect(requestFromEvent).to.be.a("object");
                expect(requestFromEvent.extraProp).to.equal(extraProps.extraProp);

                // TODO need to test challenge request on the sub side as well

                const challengeVerification = await new Promise((resolve) => post.once("challengeverification", resolve)); // we received a challenge verification, meaning there is no issue with challenge request

                expect(challengeVerification).to.be.a("object");
            });
        });

        describe(`ChallengeMessage with extra props`, async () => {
            it(`A challenge message with an extra prop not included in signature.signedPropertyNames will get emit cause the Publication class to emit an error`, async () => {
                const pubsubSigner = await plebbit.createSigner();
                const post = await generateMockPost(signers[0].address, plebbit);

                post._getSubplebbitCache = () => ({
                    address: post.subplebbitAddress,
                    pubsubTopic: pubsubSigner.address,
                    encryption: {
                        type: "ed25519-aes-gcm",
                        publicKey: pubsubSigner.publicKey
                    }
                });
                const extraProps = { extraProp: 1234 };

                await post.publish();

                let emittedChallenge;

                post.once("challenge", (_challenge) => (emittedChallenge = _challenge));

                await publishChallengeMessageWithExtraProps(post, pubsubSigner, extraProps, false);

                const error = await new Promise((resolve) => post.once("error", resolve));
                expect(error.code).to.equal("ERR_CHALLENGE_SIGNATURE_IS_INVALID");
                expect(error.details.reason).to.equal(messages.ERR_CHALLENGE_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES);

                expect(emittedChallenge).to.be.undefined;
            });

            it(`A challenge message with an extra prop included in signature.signedPropertyNames will be accepted`, async () => {
                const pubsubSigner = await plebbit.createSigner();
                const post = await generateMockPost(signers[0].address, plebbit);

                post._getSubplebbitCache = () => ({
                    address: post.subplebbitAddress,
                    pubsubTopic: pubsubSigner.address,
                    encryption: {
                        type: "ed25519-aes-gcm",
                        publicKey: pubsubSigner.publicKey
                    }
                });
                const extraProps = { extraProp: 1234 };

                await post.publish();

                await publishChallengeMessageWithExtraProps(post, pubsubSigner, extraProps, true);

                const emittedChallenge = await new Promise((resolve) => post.once("challenge", resolve));

                expect(emittedChallenge.extraProp).to.equal(extraProps.extraProp);
            });
        });

        describe(`ChallengeAnswerMessage with extra props`, async () => {
            it(`A challenge answer message with an extra prop not included in signature.signedPropertyNames will get ignored`, async () => {
                const post = await generateMockPost(mathCliSubplebbitAddress, plebbit);
                await post.publish();

                await new Promise((resolve) => post.once("challenge", resolve));

                const extraProps = { extraProp: "1234" };
                await publishChallengeAnswerMessageWithExtraProps(post, ["2"], extraProps, false);

                let challengeVerifcation;

                post.once("challengeverification", (_verif) => (challengeVerifcation = _verif));

                await new Promise((resolve) => setTimeout(resolve, plebbit.publishInterval * 2));
                expect(challengeVerifcation).to.be.undefined; // should be ignored
            });

            it(`A challenge answer message with an extra prop included in signature.signedPropertyNames will be accepted`, async () => {
                const post = await generateMockPost(mathCliSubplebbitAddress, plebbit);
                await post.publish();

                await new Promise((resolve) => post.once("challenge", resolve));

                const extraProps = { extraProp: "1234" };
                await publishChallengeAnswerMessageWithExtraProps(post, ["2"], extraProps, true);

                const challengeVerification = await new Promise((resolve) => post.once("challengeverification", resolve));
                expect(challengeVerification.challengeSuccess).to.be.true;
                expect(challengeVerification.reason).to.be.undefined;
                expect(challengeVerification.publication).to.be.a("object");
            });
        });
    });
});
