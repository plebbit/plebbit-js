import signers from "../../../fixtures/signers.js";
import {
    getRemotePlebbitConfigs,
    addStringToIpfs,
    resolveWhenConditionIsTrue,
    publishRandomPost,
    itSkipIfRpc
} from "../../../../dist/node/test/test-util.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { messages } from "../../../../dist/node/errors.js";
import { _signJson } from "../../../../dist/node/signer/signatures.js";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

getRemotePlebbitConfigs().map((config) => {
    let plebbit, post, subplebbit;

    before(async () => {
        plebbit = await config.plebbitInstancePromise();
        subplebbit = await plebbit.getSubplebbit(subplebbitAddress);

        post = await publishRandomPost(subplebbit.address, plebbit);
        await post.update();
        await resolveWhenConditionIsTrue(post, () => typeof post.updatedAt === "number");
        await post.stop();
    });

    // pageIpfs.comments[0].update
    // PageJson.comments[0]

    describe(`Loading CommentUpdate with extra prop - ${config.name}`, async () => {
        const extraProps = { extraPropUpdate: "1234" };

        itSkipIfRpc(`Loading CommentUpdate whose extra props are not in signedPropertyNames should throw`, async () => {
            const invalidCommentUpdate = JSON.parse(JSON.stringify(post._rawCommentUpdate));
            Object.assign(invalidCommentUpdate, extraProps);

            const invalidCommentUpdateCid = await addStringToIpfs(JSON.stringify(invalidCommentUpdate));

            const postToUpdate = await plebbit.getComment(post.cid);
            postToUpdate._clientsManager._calculatePathForCommentUpdate = () => invalidCommentUpdateCid;

            // should emit an error because we did not include extraProp in signedPropertyNames

            let error;

            postToUpdate.once("error", (_err) => (error = _err));

            await postToUpdate.update();

            await new Promise((resolve) => setTimeout(resolve, plebbit.updateInterval * 2));

            await postToUpdate.stop();

            expect(postToUpdate.updatedAt).to.be.undefined; // should not expect the comment update

            if (postToUpdate.clients.ipfsClients) {
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
            const commentUpdateWithExtraProps = JSON.parse(JSON.stringify(post._rawCommentUpdate));
            Object.assign(commentUpdateWithExtraProps, extraProps);

            commentUpdateWithExtraProps.signature = await _signJson(
                [...commentUpdateWithExtraProps.signature.signedPropertyNames, ...Object.keys(extraProps)],
                commentUpdateWithExtraProps,
                signers[0]
            );

            const commentUpdateWithExtraPropsCid = await addStringToIpfs(JSON.stringify(commentUpdateWithExtraProps));

            const postToUpdate = await plebbit.getComment(post.cid);
            postToUpdate._clientsManager._calculatePathForCommentUpdate = () => commentUpdateWithExtraPropsCid;

            await postToUpdate.update();

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

        it(`Can load pages with CommentUpdate that has extra props in them`, async () => {
            const commentUpdateWithExtraProps = JSON.parse(JSON.stringify(post._rawCommentUpdate));
            Object.assign(commentUpdateWithExtraProps, extraProps);

            commentUpdateWithExtraProps.signature = await _signJson(
                [...commentUpdateWithExtraProps.signature.signedPropertyNames, ...Object.keys(extraProps)],
                commentUpdateWithExtraProps,
                signers[0]
            );

            const pageIpfs = JSON.parse(await plebbit.fetchCid(subplebbit.posts.pageCids.new));

            pageIpfs.comments.push({
                comment: { ...post._rawCommentIpfs, cid: post.cid, postCid: post.postCid },
                update: commentUpdateWithExtraProps
            });

            const pageIpfsCid = await addStringToIpfs(JSON.stringify(pageIpfs));

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
    });
});
