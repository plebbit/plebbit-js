import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    publishRandomPost,
    publishRandomReply,
    jsonifyCommentAndRemoveInstanceProps,
    loadAllPages,
    resolveWhenConditionIsTrue,
    getRemotePlebbitConfigs,
    publishWithExpectedResult
} from "../../../../dist/node/test/test-util.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

getRemotePlebbitConfigs().map((config) => {
    describe(`plebbit.createComment - Remote (${config.name})`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        it.skip(`comment = await createComment(await createComment)`, async () => {
            // For now we're not supporting creating a comment instance from another instance
            const props = {
                content: `test comment = await createComment(await createComment) ${Date.now()}`,
                subplebbitAddress,
                author: {
                    address: signers[4].address,
                    displayName: `Mock Author - comment = await createComment(await createComment)`
                },
                signer: signers[4],
                timestamp: 2345324
            };
            const comment = await plebbit.createComment(props);

            const nestedComment = await plebbit.createComment(comment);

            expect(comment.content).to.equal(props.content);
            expect(comment.subplebbitAddress).to.equal(props.subplebbitAddress);
            expect(comment.author.address).to.equal(props.author.address);
            expect(comment.author.displayName).to.equal(props.author.displayName);
            expect(comment.timestamp).to.equal(props.timestamp);

            expect(comment.toJSON()).to.deep.equal(nestedComment.toJSON());
        });

        it(`Can recreate a stringifed local Comment instance before publishing with plebbit.createComment`, async () => {
            const localComment = await generateMockPost(subplebbitAddress, plebbit, {}, false);
            const commentClone = await plebbit.createComment(JSON.parse(JSON.stringify(localComment)));
            const commentCloneJson = jsonifyCommentAndRemoveInstanceProps(commentClone);
            const localCommentJson = jsonifyCommentAndRemoveInstanceProps(localComment);

            expect(localCommentJson).to.deep.equal(commentCloneJson);
        });

        it(`Can recreate a stringifed local Comment instance after publishing with plebbit.createComment`, async () => {
            const localComment = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
            const commentClone = await plebbit.createComment(JSON.parse(JSON.stringify(localComment)));
            const commentCloneJson = jsonifyCommentAndRemoveInstanceProps(commentClone);
            const localCommentJson = jsonifyCommentAndRemoveInstanceProps(localComment);

            expect(localCommentJson).to.deep.equal(commentCloneJson);
        });

        it(`Can recreate a stringified local comment instance after comment.update() with plebbit.createComment`, async () => {
            const localComment = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
            await localComment.update();
            await resolveWhenConditionIsTrue(localComment, () => typeof localComment.updatedAt === "number");
            await localComment.stop();
            const commentClone = await plebbit.createComment(JSON.parse(JSON.stringify(localComment)));
            const commentCloneJson = jsonifyCommentAndRemoveInstanceProps(commentClone);
            expect(commentCloneJson.signer).to.be.a("object");
            const localCommentJson = jsonifyCommentAndRemoveInstanceProps(localComment);
            expect(localCommentJson).to.deep.equal(commentCloneJson);
        });

        it(`Can create a Comment instance with subplebbit.posts.pages.hot.comments[0]`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const commentFromPage = subplebbit.posts.pages.hot.comments[0];
            const commentClone = await plebbit.createComment(commentFromPage);
            const commentCloneJson = jsonifyCommentAndRemoveInstanceProps(commentClone);
            const commentFromPageJson = jsonifyCommentAndRemoveInstanceProps(commentFromPage);

            expect(commentCloneJson).to.deep.equal(commentFromPageJson);
        });

        it(`Can recreate a Comment instance with replies with plebbit.createComment`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const newComments = await loadAllPages(subplebbit.posts.pageCids.new, subplebbit.posts);
            const commentToCloneFromPage = newComments.find((comment) => comment.replyCount > 0);
            expect(commentToCloneFromPage.replies).to.be.a("object");
            const commentCloneInstance = await plebbit.createComment(commentToCloneFromPage);
            expect(commentCloneInstance.replies).to.be.a("object");
            const commentCloneInstanceJson = jsonifyCommentAndRemoveInstanceProps(commentCloneInstance);
            const commentToCloneFromPageJson = jsonifyCommentAndRemoveInstanceProps(commentToCloneFromPage);
            expect(commentToCloneFromPageJson).to.deep.equal(commentCloneInstanceJson);
        });

        it(`Can recreate a stringified Comment instance with replies with plebbit.createComment`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const newComments = await loadAllPages(subplebbit.posts.pageCids.new, subplebbit.posts);
            const commentToCloneFromPage = newComments.find((comment) => comment.replyCount > 0);
            expect(commentToCloneFromPage.replies).to.be.a("object");
            const commentCloneInstance = await plebbit.createComment(JSON.parse(JSON.stringify(commentToCloneFromPage)));
            expect(commentCloneInstance.replies).to.be.a("object");
            const commentCloneInstanceJson = jsonifyCommentAndRemoveInstanceProps(commentCloneInstance);
            const commentToCloneFromPageJson = jsonifyCommentAndRemoveInstanceProps(commentToCloneFromPage);
            expect(commentCloneInstanceJson).to.deep.equal(commentToCloneFromPageJson);
        });

        it(`Can recreate a stringified Post instance with plebbit.createComment`, async () => {
            const post = await generateMockPost(subplebbitAddress, plebbit, false);
            const postFromStringifiedPost = await plebbit.createComment(JSON.parse(JSON.stringify(post)));
            const postJson = jsonifyCommentAndRemoveInstanceProps(post);
            const postFromStringifiedPostJson = jsonifyCommentAndRemoveInstanceProps(postFromStringifiedPost);
            expect(postJson).to.deep.equal(postFromStringifiedPostJson);
        });

        it("comment instance created with {subplebbitAddress, cid} prop can call getPage", async () => {
            const post = await publishRandomPost(subplebbitAddress, plebbit, {}, true);
            expect(post.replies).to.be.a("object");
            await publishRandomReply(post, plebbit, {}, true);
            await post.update();
            await resolveWhenConditionIsTrue(post, () => typeof post.updatedAt === "number");
            expect(post.content).to.be.a("string");
            expect(post.replyCount).to.equal(1);
            expect(post.replies.pages.topAll.comments.length).to.equal(1);

            await post.stop();

            const pageCid = post.replies.pageCids.new;
            expect(pageCid).to.be.a("string");

            const postClone = await plebbit.createComment({ subplebbitAddress: post.subplebbitAddress, cid: post.cid });
            expect(postClone.content).to.be.undefined;

            const page = await postClone.replies.getPage(pageCid);
            expect(page.comments.length).to.be.equal(1);
        });

        it(`Can create a new comment with author.shortAddress and publish it`, async () => {
            // it should delete author.shortAddress before publishing however
            const comment = await generateMockPost(subplebbitAddress, plebbit, false, { author: { shortAddress: "12345" } });
            expect(comment.author.shortAddress).to.be.a("string").and.not.equal("12345");
            await publishWithExpectedResult(comment, true);

            const commentLoaded = await plebbit.getComment(comment.cid);
            expect(commentLoaded.author.shortAddress).to.be.a("string").and.not.equal("12345");
        });

        it(`Can create a new comment with author.subplebbit and publish it`, async () => {
            // it should delete author.sublebbit before publishing however
            const comment = await generateMockPost(subplebbitAddress, plebbit, false, { author: { subplebbit: { postScore: 100 } } });
            expect(comment.author.subplebbit).to.be.undefined;
            await publishWithExpectedResult(comment, true);

            const commentLoaded = await plebbit.getComment(comment.cid);
            expect(commentLoaded.author.subplebbit).to.be.undefined;
        });
    });
});
