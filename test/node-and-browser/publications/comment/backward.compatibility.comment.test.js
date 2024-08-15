import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    setExtraPropOnCommentAndSign,
    getRemotePlebbitConfigs,
    publishWithExpectedResult,
    addStringToIpfs,
    findCommentInPage,
    waitTillCommentIsInParentPages,
    itSkipIfRpc
} from "../../../../dist/node/test/test-util.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { messages } from "../../../../dist/node/errors.js";
import validCommentFixture from "../../../fixtures/signatures/comment/commentUpdate/valid_comment_ipfs.json" assert { type: "json" };
import { _signJson, verifyCommentIpfs } from "../../../../dist/node/signer/signatures.js";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

// TODO need a separate file for testing extra props in CommentUpdate
// TODO Need to test re-pinning of a comment ipfs with extra prop

getRemotePlebbitConfigs().map((config) => {
    let plebbit;

    before(async () => {
        plebbit = await config.plebbitInstancePromise();
    });
    describe(`Publishing comments with extra props - ${config.name}`, async () => {
        itSkipIfRpc(`A CommentPubsub with a field not included in signature.signedPropertyNames will be rejected`, async () => {
            // Skip for rpc because it's gonna throw due to invalid signature
            const post = await generateMockPost(subplebbitAddress, plebbit);
            const extraProps = { extraProp: "1234" };
            await setExtraPropOnCommentAndSign(post, extraProps, false);

            await publishWithExpectedResult(post, false, messages.ERR_COMMENT_PUBSUB_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES);
            expect(post._publishedChallengeRequests[0].publication.extraProp).to.equal(extraProps.extraProp);
        });

        it(`A CommentPubsub with an extra field as a reserved field name will be rejected`, async () => {
            const post = await generateMockPost(subplebbitAddress, plebbit);
            const extraProps = { cid: "1234" };
            await setExtraPropOnCommentAndSign(post, extraProps, true);

            await publishWithExpectedResult(post, false, messages.ERR_COMMENT_HAS_RESERVED_FIELD);
            expect(post._publishedChallengeRequests[0].publication.cid).to.equal(extraProps.cid);
        });

        it(`A CommentPubsub with an extra field included in signature.signedPropertyNames will be accepted`, async () => {
            const post = await generateMockPost(subplebbitAddress, plebbit);
            const extraProps = { extraProp: "1234" };
            await setExtraPropOnCommentAndSign(post, extraProps, true);

            let challengeVerification;
            post.once("challengeverification", (_verification) => (challengeVerification = _verification));
            await publishWithExpectedResult(post, true);
            expect(post._publishedChallengeRequests[0].publication.extraProp).to.equal(extraProps.extraProp);
            expect(challengeVerification.publication.extraProp).to.equal(extraProps.extraProp);
            expect(post.extraProp).to.equal(extraProps.extraProp);
        });

    });

    describe(`Loading comments with extra prop`, async () => {
        let commentWithExtraProps;
        let extraProps;

        before(async () => {
            commentWithExtraProps = await generateMockPost(subplebbitAddress, plebbit);
            extraProps = { extraProp: "1234" };
            await setExtraPropOnCommentAndSign(commentWithExtraProps, extraProps, true);
            await publishWithExpectedResult(commentWithExtraProps, true);
            await waitTillCommentIsInParentPages(commentWithExtraProps, plebbit);
        });
        it(`Can load CommentIpfs with extra props`, async () => {
            const loadedCommentWithExtraProps = await plebbit.getComment(commentWithExtraProps.cid);

            // we wanna make sure the extra prop exists on all shapes
            const shapes = [
                loadedCommentWithExtraProps._rawCommentIpfs,
                loadedCommentWithExtraProps,
                JSON.parse(JSON.stringify(loadedCommentWithExtraProps)),
                await plebbit.createComment(loadedCommentWithExtraProps),
                await plebbit.createComment(JSON.parse(JSON.stringify(loadedCommentWithExtraProps)))
            ];

            for (const shape of shapes) expect(shape.extraProp).to.equal(extraProps.extraProp);
        });

        it(`Can load pages with comments that has extra props in them`, async () => {
            const subplebbit = await plebbit.getSubplebbit(commentWithExtraProps.subplebbitAddress);
            const commentInPage = await findCommentInPage(commentWithExtraProps.cid, subplebbit.posts.pageCids.new, subplebbit.posts);

            const shapes = [
                JSON.parse(JSON.stringify(commentInPage)),
                await plebbit.createComment(commentInPage),
                await plebbit.createComment(await plebbit.createComment(commentInPage))
            ];

            for (const shape of shapes) expect(shape.extraProp).to.equal(extraProps.extraProp);
        });
    });
});
