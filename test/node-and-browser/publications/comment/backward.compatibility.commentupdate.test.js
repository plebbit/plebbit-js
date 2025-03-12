import signers from "../../../fixtures/signers.js";
import {
    getRemotePlebbitConfigs,
    addStringToIpfs,
    resolveWhenConditionIsTrue,
    publishRandomPost,
    generateMockPost,
    publishChallengeVerificationMessageWithEncryption,
    mockCommentToReturnSpecificCommentUpdate,
    itSkipIfRpc
} from "../../../../dist/node/test/test-util.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { messages } from "../../../../dist/node/errors.js";
import { _signJson } from "../../../../dist/node/signer/signatures.js";
import validCommentUpdateFixture from "../../../fixtures/signatures/comment/commentUpdate/valid_comment_update.json" assert { type: "json" };
import * as remeda from "remeda";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

const subWithNoResponseSigner = signers[4]; // this sub will never respond via pubsub

getRemotePlebbitConfigs().map((config) => {
    describe(`Loading CommentUpdate with extra prop - ${config.name}`, async () => {
        let plebbit, post, subplebbit;
        const extraProps = { extraPropUpdate: "1234" };

        before(async () => {
            plebbit = await config.plebbitInstancePromise();
            subplebbit = await plebbit.getSubplebbit(subplebbitAddress);

            post = await publishRandomPost(subplebbit.address, plebbit);
            await post.update();
            await resolveWhenConditionIsTrue(post, () => typeof post.updatedAt === "number");
            await post.stop();
        });

        itSkipIfRpc(`Loading CommentUpdate whose extra props are not in signedPropertyNames should throw`, async () => {
            const invalidCommentUpdate = remeda.clone(post._rawCommentUpdate);
            Object.assign(invalidCommentUpdate, extraProps);

            const postToUpdate = await plebbit.getComment(post.cid);
            let updateEmitted = false;
            postToUpdate.once("update", () => (updateEmitted = true));
            const errorPromise = new Promise((resolve) => postToUpdate.once("error", resolve));

            // should emit an error because we did not include extraProp in signedPropertyNames

            await postToUpdate.update();
            mockCommentToReturnSpecificCommentUpdate(postToUpdate, JSON.stringify(invalidCommentUpdate));

            const error = await errorPromise;

            await postToUpdate.stop();

            expect(updateEmitted).to.be.false;

            expect(postToUpdate.updatedAt).to.be.undefined; // should not accept the comment update

            if (postToUpdate.clients.kuboRpcClients) {
                expect(error.code).to.equal("ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID");
                expect(error.details.signatureValidity).to.deep.equal({
                    valid: false,
                    reason: messages.ERR_COMMENT_UPDATE_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES
                });
            } else {
                // gateways
                expect(error.code).to.equal("ERR_FAILED_TO_FETCH_COMMENT_UPDATE_FROM_GATEWAYS");
                expect(error.details.gatewayToError["http://localhost:18080"].code).to.equal("ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID");
                expect(error.details.gatewayToError["http://localhost:18080"].details.signatureValidity).to.deep.equal({
                    valid: false,
                    reason: messages.ERR_COMMENT_UPDATE_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES
                });
            }
        });
        itSkipIfRpc(`Can load CommentUpdate with extra props if they're included in signedPropertyNames`, async () => {
            const commentUpdateWithExtraProps = remeda.clone(post._rawCommentUpdate);
            Object.assign(commentUpdateWithExtraProps, extraProps);

            commentUpdateWithExtraProps.signature = await _signJson(
                [...commentUpdateWithExtraProps.signature.signedPropertyNames, ...Object.keys(extraProps)],
                commentUpdateWithExtraProps,
                signers[0]
            );

            const postToUpdate = await plebbit.getComment(post.cid);

            await postToUpdate.update();
            mockCommentToReturnSpecificCommentUpdate(postToUpdate, JSON.stringify(commentUpdateWithExtraProps));

            await resolveWhenConditionIsTrue(postToUpdate, () => typeof postToUpdate.updatedAt === "number");

            await postToUpdate.stop();

            // should accept the comment update because the extra prop is part of signedPropertyNames

            const shapes = [
                postToUpdate,
                postToUpdate._rawCommentUpdate,
                await plebbit.createComment(postToUpdate),
                await plebbit.createComment(JSON.parse(JSON.stringify(postToUpdate)))
            ];

            for (const shape of shapes) expect(shape.extraPropUpdate).to.equal(extraProps.extraPropUpdate);
        });

        itSkipIfRpc(`Can load CommentUpdate with extra props in commentUpdate.author`, async () => {
            const commentUpdateWithExtraProps = remeda.clone(post._rawCommentUpdate);
            Object.assign(commentUpdateWithExtraProps.author, extraProps);

            commentUpdateWithExtraProps.signature = await _signJson(
                commentUpdateWithExtraProps.signature.signedPropertyNames,
                commentUpdateWithExtraProps,
                signers[0]
            );

            const postToUpdate = await plebbit.getComment(post.cid);

            await postToUpdate.update();
            mockCommentToReturnSpecificCommentUpdate(postToUpdate, JSON.stringify(commentUpdateWithExtraProps));

            await resolveWhenConditionIsTrue(postToUpdate, () => typeof postToUpdate.updatedAt === "number");

            await postToUpdate.stop();

            const shapes = [
                postToUpdate,
                postToUpdate._rawCommentUpdate,
                await plebbit.createComment(postToUpdate),
                await plebbit.createComment(JSON.parse(JSON.stringify(postToUpdate)))
            ];

            for (const commentShape of shapes) expect(commentShape.author.extraPropUpdate).to.equal(extraProps.extraPropUpdate);
        });

        itSkipIfRpc(`Can load pages with CommentUpdate that has extra props in them`, async () => {
            const commentUpdateWithExtraProps = JSON.parse(JSON.stringify(post._rawCommentUpdate));
            Object.assign(commentUpdateWithExtraProps, extraProps);

            commentUpdateWithExtraProps.signature = await _signJson(
                [...commentUpdateWithExtraProps.signature.signedPropertyNames, ...Object.keys(extraProps)],
                commentUpdateWithExtraProps,
                signers[0]
            );

            const pageIpfs = JSON.parse(await plebbit.fetchCid(subplebbit.posts.pageCids.new));

            pageIpfs.comments.push({
                comment: post._rawCommentIpfs,
                commentUpdate: commentUpdateWithExtraProps
            });

            const pageIpfsCid = await addStringToIpfs(JSON.stringify(pageIpfs));

            subplebbit.posts.pageCids.new = pageIpfsCid; // just so that it wouldn't throw

            const fetchedPage = await subplebbit.posts.getPage(pageIpfsCid); // If this succeeds, it means signature has been verified and everything

            const commentInPageJson = fetchedPage.comments[fetchedPage.comments.length - 1];

            const shapes = [
                commentInPageJson,
                JSON.parse(JSON.stringify(commentInPageJson)),
                await plebbit.createComment(commentInPageJson),
                await plebbit.createComment(await plebbit.createComment(commentInPageJson))
            ];
            for (const shape of shapes) expect(shape.extraPropUpdate).to.equal(extraProps.extraPropUpdate);
        });

        itSkipIfRpc(`Can load pages with CommentUpdate that has extra props in commentUpdate.author`, async () => {
            const commentUpdateWithExtraProps = JSON.parse(JSON.stringify(post._rawCommentUpdate));
            Object.assign(commentUpdateWithExtraProps.author, extraProps);

            commentUpdateWithExtraProps.signature = await _signJson(
                commentUpdateWithExtraProps.signature.signedPropertyNames,
                commentUpdateWithExtraProps,
                signers[0]
            );

            const pageIpfs = JSON.parse(await plebbit.fetchCid(subplebbit.posts.pageCids.new));

            pageIpfs.comments.push({
                comment: post._rawCommentIpfs,
                commentUpdate: commentUpdateWithExtraProps
            });

            const pageIpfsCid = await addStringToIpfs(JSON.stringify(pageIpfs));
            subplebbit.posts.pageCids.new = pageIpfsCid; // just so that it wouldn't throw

            const fetchedPage = await subplebbit.posts.getPage(pageIpfsCid); // If this succeeds, it means signature has been verified and everything

            const commentInPageJson = fetchedPage.comments[fetchedPage.comments.length - 1];

            const shapes = [
                commentInPageJson,
                JSON.parse(JSON.stringify(commentInPageJson)),
                await plebbit.createComment(commentInPageJson),
                await plebbit.createComment(await plebbit.createComment(commentInPageJson))
            ];
            for (const shape of shapes) expect(shape.author.extraPropUpdate).to.equal(extraProps.extraPropUpdate);
        });
    });

    describe(`Extra props in decryptedChallengeVerification.commentUpdate - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });
        it(`Extra props in decryptedVerification.commentUpdate should fail if they're not part of commentUpdate.signature.signedPropertyNames`, async () => {
            const post = await generateMockPost(subWithNoResponseSigner.address, plebbit);

            const commentUpdate = JSON.parse(JSON.stringify(validCommentUpdateFixture));
            const extraProps = { extraProp: 1234 };

            Object.assign(commentUpdate, extraProps);

            const errorPromise = new Promise((resolve) => post.once("error", resolve));

            await post.publish();

            await publishChallengeVerificationMessageWithEncryption(post, subWithNoResponseSigner, {
                commentUpdate,
                comment: { ...post._pubsubMsgToPublish, depth: 0 }
            });

            const error = await errorPromise;

            expect(error.code).to.equal("ERR_SUB_SENT_CHALLENGE_VERIFICATION_WITH_INVALID_COMMENTUPDATE");
            expect(error.details.reason).to.equal(messages["ERR_COMMENT_UPDATE_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES"]);
            await post.stop();
        });
        it(`Extra props in decryptedVerification.commentUpdate should be accepted if they're part of commentUpdate.signature.signedPropertyNames`, async () => {
            const post = await generateMockPost(subWithNoResponseSigner.address, plebbit);

            const mockCommentIpfs = { ...post._pubsubMsgToPublish, depth: 0 };

            const commentUpdate = JSON.parse(JSON.stringify(validCommentUpdateFixture));
            commentUpdate.cid = await calculateIpfsHash(JSON.stringify(mockCommentIpfs));

            const extraProps = { extraProp: 1234 };

            Object.assign(commentUpdate, extraProps);

            commentUpdate.signature = await _signJson(
                remeda.keys.strict(remeda.omit(commentUpdate, ["signature"])),
                commentUpdate,
                subWithNoResponseSigner
            );

            await post.publish();

            const verificationPromise = new Promise((resolve) => post.once("challengeverification", resolve));

            await publishChallengeVerificationMessageWithEncryption(post, subWithNoResponseSigner, {
                commentUpdate,
                comment: mockCommentIpfs
            });

            const challengeVerification = await verificationPromise;
            await post.stop();
            expect(challengeVerification.commentUpdate.extraProp).to.equal(extraProps.extraProp);

            expect(post.extraProp).to.equal(extraProps.extraProp);
        });

        it(`Extra props in decryptedVerification.commentUpdate.author should be accepted`, async () => {
            const post = await generateMockPost(subWithNoResponseSigner.address, plebbit);

            const mockCommentIpfs = { ...post._pubsubMsgToPublish, depth: 0 };

            const commentUpdate = JSON.parse(JSON.stringify(validCommentUpdateFixture));
            commentUpdate.cid = await calculateIpfsHash(JSON.stringify(mockCommentIpfs));

            const extraProps = { extraProp: 1234 };

            Object.assign(commentUpdate.author, extraProps);

            commentUpdate.signature = await _signJson(
                remeda.keys.strict(remeda.omit(commentUpdate, ["signature"])),
                commentUpdate,
                subWithNoResponseSigner
            );

            const verificationPromise = new Promise((resolve) => post.once("challengeverification", resolve));

            await post.publish();

            await publishChallengeVerificationMessageWithEncryption(post, subWithNoResponseSigner, {
                commentUpdate,
                comment: mockCommentIpfs
            });

            const challengeVerification = await verificationPromise;
            await post.stop();
            expect(challengeVerification.commentUpdate.author.extraProp).to.equal(extraProps.extraProp);

            expect(post.author.extraProp).to.equal(extraProps.extraProp);
        });
    });
});
