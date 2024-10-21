import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    setExtraPropOnCommentAndSign,
    getRemotePlebbitConfigs,
    publishWithExpectedResult,
    findCommentInPage,
    waitTillCommentIsInParentPages,
    resolveWhenConditionIsTrue
} from "../../../../dist/node/test/test-util.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { messages } from "../../../../dist/node/errors.js";
import { _signJson, verifyCommentIpfs } from "../../../../dist/node/signer/signatures.js";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

getRemotePlebbitConfigs().map((config) => {
    describe(`Comments with extra props - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        describe(`Comments with extra props in challengeRequest.encrypted - ${config.name}`, async () => {
            it(`An extra prop in challengeRequest.encrypted should be accepted by the sub`, async () => {
                const comment = await generateMockPost(subplebbitAddress, plebbit);
                comment.challengeRequest = { extraProp: "1234" };
                const challengeRequestPromise = new Promise((resolve) => comment.once("challengerequest", resolve));

                await publishWithExpectedResult(comment, true);
                const challengeRequest = await challengeRequestPromise;
                expect(challengeRequest.extraProp).to.equal("1234");
            });
        });

        describe(`Publishing comments with extra props - ${config.name}`, async () => {
            it(`A CommentPubsub with a field not included in signature.signedPropertyNames will be rejected`, async () => {
                // Skip for rpc because it's gonna throw due to invalid signature
                const post = await generateMockPost(subplebbitAddress, plebbit);
                const extraProps = { extraProp: "1234" };
                await setExtraPropOnCommentAndSign(post, extraProps, false);

                await publishWithExpectedResult(
                    post,
                    false,
                    messages.ERR_COMMENT_PUBSUB_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES
                );
                expect(post._publishedChallengeRequests[0].comment.extraProp).to.equal(extraProps.extraProp);
            });

            it(`A CommentPubsub with an extra field as a reserved field name will be rejected`, async () => {
                const post = await generateMockPost(subplebbitAddress, plebbit);
                const extraProps = { cid: "1234" };
                await setExtraPropOnCommentAndSign(post, extraProps, true);

                await publishWithExpectedResult(post, false, messages.ERR_COMMENT_HAS_RESERVED_FIELD);
                expect(post._publishedChallengeRequests[0].comment.cid).to.equal(extraProps.cid);
            });

            it(`A CommentPubsub with an extra field included in signature.signedPropertyNames will be accepted`, async () => {
                const post = await generateMockPost(subplebbitAddress, plebbit);
                const extraProps = { extraProp: "1234" };
                await setExtraPropOnCommentAndSign(post, extraProps, true);

                let challengeVerification;
                post.once("challengeverification", (_verification) => (challengeVerification = _verification));
                await publishWithExpectedResult(post, true);
                expect(post._publishedChallengeRequests[0].comment.extraProp).to.equal(extraProps.extraProp);
                expect(challengeVerification.comment.extraProp).to.equal(extraProps.extraProp);
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

    describe(`Comments with extra props in author`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });
        describe(`Publishing comment with extra props in author field - ${config.name}`, async () => {
            it(`Publishing with extra prop for author should fail if it's a reserved field`, async () => {
                const post = await generateMockPost(subplebbitAddress, plebbit);
                await setExtraPropOnCommentAndSign(post, { author: { ...post._pubsubMsgToPublish.author, subplebbit: "random" } }, true);

                await publishWithExpectedResult(post, false, messages.ERR_PUBLICATION_AUTHOR_HAS_RESERVED_FIELD);
                expect(post._publishedChallengeRequests[0].comment.author.subplebbit).to.equal("random");
            });
            it(`Publishing with extra prop for author should succeed`, async () => {
                const post = await generateMockPost(subplebbitAddress, plebbit);
                const extraProps = { extraProp: "1234" };
                await setExtraPropOnCommentAndSign(post, { author: { ...post._pubsubMsgToPublish.author, ...extraProps } }, true);

                await publishWithExpectedResult(post, true);
                expect(post._publishedChallengeRequests[0].comment.author.extraProp).to.equal(extraProps.extraProp);
                expect(post.author.extraProp).to.equal(extraProps.extraProp);
            });
        });

        describe(`Loading a comment with author.extraProp`, async () => {
            let postWithExtraAuthorProp;
            const extraProps = { extraProp: "1234" };

            before(async () => {
                postWithExtraAuthorProp = await generateMockPost(subplebbitAddress, plebbit);
                await setExtraPropOnCommentAndSign(
                    postWithExtraAuthorProp,
                    { author: { ...postWithExtraAuthorProp._pubsubMsgToPublish.author, ...extraProps } },
                    true
                );

                await publishWithExpectedResult(postWithExtraAuthorProp, true);
            });
            it(`Can load a CommentIpfs with author.extraProp`, async () => {
                const loadedPost = await plebbit.getComment(postWithExtraAuthorProp.cid);

                const loadedPostFromCreate = await plebbit.createComment({ cid: postWithExtraAuthorProp.cid });
                await loadedPostFromCreate.update();
                await resolveWhenConditionIsTrue(loadedPostFromCreate, () => typeof loadedPostFromCreate.updatedAt === "number");
                await loadedPostFromCreate.stop();

                const shapes = [
                    loadedPost,
                    JSON.parse(JSON.stringify(loadedPost)),
                    await plebbit.createComment(loadedPost),
                    await plebbit.createComment(JSON.parse(JSON.stringify(loadedPost))),
                    loadedPostFromCreate,
                    JSON.parse(JSON.stringify(loadedPostFromCreate)),
                    await plebbit.createComment(loadedPostFromCreate),
                    await plebbit.createComment(JSON.parse(JSON.stringify(loadedPostFromCreate)))
                ];

                for (const shape of shapes) expect(shape.author.extraProp).to.equal(extraProps.extraProp);
            });
            it(`Can load a page with comment.author.extraProp`, async () => {
                await waitTillCommentIsInParentPages(postWithExtraAuthorProp, plebbit);

                const subplebbit = await plebbit.getSubplebbit(postWithExtraAuthorProp.subplebbitAddress);
                const postInPage = await findCommentInPage(postWithExtraAuthorProp.cid, subplebbit.posts.pageCids.new, subplebbit.posts);
                // postInPage is the json representation of page.comments

                const shapes = [postInPage, await plebbit.createComment(postInPage)];

                for (const shape of shapes) expect(shape.author.extraProp).to.equal(extraProps.extraProp);
            });
        });
    });
});
