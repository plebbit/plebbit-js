import { expect } from "chai";
import signers from "../../fixtures/signers.js";
import {
    generateMockPost,
    setExtraPropOnChallengeRequestAndSign,
    describeSkipIfRpc,
    publishChallengeVerificationMessageWithEncryption,
    publishChallengeMessageWithExtraProps,
    publishChallengeAnswerMessageWithExtraProps,
    publishChallengeVerificationMessageWithExtraProps,
    getRemotePlebbitConfigs,
    mockPlebbitNoDataPathWithOnlyKuboClient
} from "../../../dist/node/test/test-util.js";
import validCommentUpdateFixture from "../../fixtures/signatures/comment/commentUpdate/valid_comment_update.json" with { type: "json" };
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";
import * as remeda from "remeda";

import { _signJson, _signPubsubMsg } from "../../../dist/node/signer/signatures.js";
import { messages } from "../../../dist/node/errors.js";
const mathCliSubplebbitAddress = signers[1].address;

// TODO make these tests work with RPC clients
getRemotePlebbitConfigs({ includeOnlyTheseTests: ["remote-kubo-rpc"] }).map((config) => {
    describe(`Publishing  and receiving pubsub messages with extra props - ${config.name}`, async () => {
        let plebbit;

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
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
                await post.stop();
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
                await post.stop();
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
                await post.stop();
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

                await post.stop();
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
                await post.stop();
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
                expect(challengeVerification.publication).to.be.undefined;
                expect(challengeVerification.comment).to.be.a("object");
                expect(challengeVerification.commentUpdate).to.be.a("object");

                await post.stop();
            });
        });

        describe(`ChallengeVerification with extra props`, async () => {
            it(`A challenge verification message with an extra prop not included in signature.signedPropertyNames will get emit cause the Publication class to emit an error`, async () => {
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

                let emittedChallengeVerification;

                post.once("challengeverification", (_challenge) => (emittedChallengeVerification = _challenge));

                await publishChallengeVerificationMessageWithExtraProps(post, pubsubSigner, extraProps, false);

                const error = await new Promise((resolve) => post.once("error", resolve));
                expect(error.code).to.equal("ERR_CHALLENGE_VERIFICATION_SIGNATURE_IS_INVALID");
                expect(error.details.reason).to.equal(messages.ERR_CHALLENGE_VERIFICATION_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES);

                expect(emittedChallengeVerification).to.be.undefined;
                await post.stop();
            });

            it(`A challenge verification message with an extra prop included in signature.signedPropertyNames will be accepted`, async () => {
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

                await publishChallengeVerificationMessageWithExtraProps(post, pubsubSigner, extraProps, true);

                const emittedChallengeVerification = await new Promise((resolve) => post.once("challengeverification", resolve));

                expect(emittedChallengeVerification.extraProp).to.equal(extraProps.extraProp);

                await post.stop();
            });

            it(`A challenge verification message with extra prop in challengeVerification.encrypted will be accepted`, async () => {
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

                const mockCommentIpfs = { ...post.raw.pubsubMessageToPublish, depth: 0 };

                const commentUpdate = JSON.parse(JSON.stringify(validCommentUpdateFixture));
                commentUpdate.cid = await calculateIpfsHash(JSON.stringify(mockCommentIpfs));

                const extraPropsInEncrypted = { extraProp: 1234 };

                commentUpdate.signature = await _signJson(
                    remeda.keys.strict(remeda.omit(commentUpdate, ["signature"])),
                    commentUpdate,
                    pubsubSigner
                );

                await post.publish();

                await publishChallengeVerificationMessageWithEncryption(post, pubsubSigner, {
                    commentUpdate,
                    comment: mockCommentIpfs,
                    ...extraPropsInEncrypted
                });

                // verification.encrypted should decrypt to {comment, commentUpdate, extraProp}

                const challengeVerification = await new Promise((resolve) => post.once("challengeverification", resolve));

                await post.stop();
                expect(challengeVerification.extraProp).to.equal(extraPropsInEncrypted.extraProp);
            });
        });
    });
});
