import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    setExtraPropOnCommentAndSign,
    getAvailablePlebbitConfigsToTestAgainst,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    iterateThroughPagesToFindCommentInParentPagesInstance,
    waitTillPostInSubplebbitPages
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";
import { _signJson } from "../../../../dist/node/signer/signatures.js";
import { describe, it } from "vitest";

const subplebbitAddress = signers[0].address;

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe.concurrent(`Comments with extra props - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });
        after(async () => {
            await plebbit.destroy();
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

        describe.concurrent(`Publishing comments with extra props - ${config.name}`, async () => {
            it(`A CommentPubsub with a field not included in signature.signedPropertyNames will be rejected`, async () => {
                // Skip for rpc because it's gonna throw due to invalid signature
                const post = await generateMockPost(subplebbitAddress, plebbit);
                const extraProps = { extraProp: "1234" };
                await setExtraPropOnCommentAndSign(post, extraProps, false);

                const challengeRequestPromise = new Promise((resolve) => post.once("challengerequest", resolve));
                await publishWithExpectedResult(
                    post,
                    false,
                    messages.ERR_COMMENT_PUBSUB_RECORD_INCLUDES_FIELD_NOT_IN_SIGNED_PROPERTY_NAMES
                );
                const challengeRequest = await challengeRequestPromise;
                expect(challengeRequest.comment.extraProp).to.equal(extraProps.extraProp);
            });

            it(`A CommentPubsub with an extra field as a reserved field name will be rejected`, async () => {
                const post = await generateMockPost(subplebbitAddress, plebbit);
                const extraProps = { cid: "1234" };
                await setExtraPropOnCommentAndSign(post, extraProps, true);

                const challengeRequestPromise = new Promise((resolve) => post.once("challengerequest", resolve));

                await publishWithExpectedResult(post, false, messages.ERR_COMMENT_HAS_RESERVED_FIELD);
                const challengeRequest = await challengeRequestPromise;
                expect(challengeRequest.comment.cid).to.equal(extraProps.cid);
            });

            it(`A CommentPubsub with an extra field included in signature.signedPropertyNames will be accepted`, async () => {
                const post = await generateMockPost(subplebbitAddress, plebbit);
                const extraProps = { extraProp: "1234" };
                await setExtraPropOnCommentAndSign(post, extraProps, true);

                const challengeVerificationPromise = new Promise((resolve) => post.once("challengeverification", resolve));

                const challengeRequestPromise = new Promise((resolve) => post.once("challengerequest", resolve));

                await publishWithExpectedResult(post, true);
                const challengeRequest = await challengeRequestPromise;
                expect(challengeRequest.comment.extraProp).to.equal(extraProps.extraProp);
                const challengeVerification = await challengeVerificationPromise;
                expect(challengeVerification.comment.extraProp).to.equal(extraProps.extraProp);
                expect(post.extraProp).to.equal(extraProps.extraProp);
            });
        });

        describe.concurrent(`Loading comments with extra prop`, async () => {
            let commentWithExtraProps;
            let extraProps;

            before(async () => {
                commentWithExtraProps = await generateMockPost(subplebbitAddress, plebbit);
                extraProps = { extraProp: "1234" };
                await setExtraPropOnCommentAndSign(commentWithExtraProps, extraProps, true);
                await publishWithExpectedResult(commentWithExtraProps, true);
                await waitTillPostInSubplebbitPages(commentWithExtraProps, plebbit);
            });
            it(`Can load CommentIpfs with extra props`, async () => {
                const loadedCommentWithExtraProps = await plebbit.getComment({cid: commentWithExtraProps.cid});

                // we wanna make sure the extra prop exists on all shapes
                const shapes = [
                    loadedCommentWithExtraProps.raw.comment,
                    loadedCommentWithExtraProps,
                    JSON.parse(JSON.stringify(loadedCommentWithExtraProps)),
                    await plebbit.createComment(loadedCommentWithExtraProps),
                    await plebbit.createComment(JSON.parse(JSON.stringify(loadedCommentWithExtraProps)))
                ];

                for (const shape of shapes) expect(shape.extraProp).to.equal(extraProps.extraProp);
            });

            it(`Can load pages with comments that has extra props in them`, async () => {
                const subplebbit = await plebbit.getSubplebbit({address: commentWithExtraProps.subplebbitAddress});

                const commentInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(
                    commentWithExtraProps.cid,
                    subplebbit.posts
                );

                const shapes = [
                    JSON.parse(JSON.stringify(commentInPage)),
                    await plebbit.createComment(commentInPage),
                    await plebbit.createComment(await plebbit.createComment(commentInPage))
                ];

                for (const shape of shapes) expect(shape.extraProp).to.equal(extraProps.extraProp);
            });
        });
    });

    describe.concurrent(`Comments with extra props in author`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });
        after(async () => {
            await plebbit.destroy();
        });
        describe.concurrent(`Publishing comment with extra props in author field - ${config.name}`, async () => {
            it(`Publishing with extra prop for author should fail if it's a reserved field`, async () => {
                const post = await generateMockPost(subplebbitAddress, plebbit);
                await setExtraPropOnCommentAndSign(
                    post,
                    { author: { ...post.raw.pubsubMessageToPublish.author, subplebbit: "random" } },
                    true
                );

                const challengeRequestPromise = new Promise((resolve) => post.once("challengerequest", resolve));

                await publishWithExpectedResult(post, false, messages.ERR_PUBLICATION_AUTHOR_HAS_RESERVED_FIELD);
                const challengeRequest = await challengeRequestPromise;
                expect(challengeRequest.comment.author.subplebbit).to.equal("random");
            });
            it(`Publishing with extra prop for author should succeed`, async () => {
                const post = await generateMockPost(subplebbitAddress, plebbit);
                const extraProps = { extraProp: "1234" };
                await setExtraPropOnCommentAndSign(post, { author: { ...post.raw.pubsubMessageToPublish.author, ...extraProps } }, true);

                const challengeRequestPromise = new Promise((resolve) => post.once("challengerequest", resolve));

                await publishWithExpectedResult(post, true);
                const challengeRequest = await challengeRequestPromise;
                expect(challengeRequest.comment.author.extraProp).to.equal(extraProps.extraProp);
                expect(post.author.extraProp).to.equal(extraProps.extraProp);
            });
        });

        describe.concurrent(`Loading a comment with author.extraProp - ${config.name}`, async () => {
            let postWithExtraAuthorProp;
            const extraProps = { extraProp: "1234" };

            before(async () => {
                postWithExtraAuthorProp = await generateMockPost(subplebbitAddress, plebbit);
                await setExtraPropOnCommentAndSign(
                    postWithExtraAuthorProp,
                    { author: { ...postWithExtraAuthorProp.raw.pubsubMessageToPublish.author, ...extraProps } },
                    true
                );

                await publishWithExpectedResult(postWithExtraAuthorProp, true);
            });
            it.sequential(`Can load a CommentIpfs with author.extraProp`, async () => {
                const loadedPost = await plebbit.getComment({cid: postWithExtraAuthorProp.cid});

                const loadedPostFromCreate = await plebbit.createComment({ cid: postWithExtraAuthorProp.cid });
                await loadedPostFromCreate.update();
                await resolveWhenConditionIsTrue({
                    toUpdate: loadedPostFromCreate,
                    predicate: () => typeof loadedPostFromCreate.updatedAt === "number"
                });
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
                await waitTillPostInSubplebbitPages(postWithExtraAuthorProp, plebbit);

                const subplebbit = await plebbit.getSubplebbit({address: postWithExtraAuthorProp.subplebbitAddress});
                const postInPage = await iterateThroughPagesToFindCommentInParentPagesInstance(
                    postWithExtraAuthorProp.cid,
                    subplebbit.posts
                );
                // postInPage is the json representation of page.comments

                const shapes = [postInPage, await plebbit.createComment(postInPage)];

                for (const shape of shapes) expect(shape.author.extraProp).to.equal(extraProps.extraProp);
            });
        });
    });
});
