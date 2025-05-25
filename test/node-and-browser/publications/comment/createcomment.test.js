import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    publishRandomPost,
    publishRandomReply,
    jsonifyCommentAndRemoveInstanceProps,
    loadAllPages,
    resolveWhenConditionIsTrue,
    getRemotePlebbitConfigs,
    publishWithExpectedResult,
    addStringToIpfs
} from "../../../../dist/node/test/test-util.js";
const subplebbitAddress = signers[0].address;

getRemotePlebbitConfigs().map((config) => {
    describe(`plebbit.createComment - Remote (${config.name})`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
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
            const localComment = await publishRandomPost(subplebbitAddress, plebbit);
            expect(localComment.author.subplebbit).to.be.a("object"); // should get it from subplebbit
            const commentClone = await plebbit.createComment(JSON.parse(JSON.stringify(localComment)));
            expect(commentClone.author.subplebbit).to.be.a("object"); // should get it from subplebbit
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
            const postWithReplyToCloneFromPage = subplebbit.posts.pages.hot.comments.find((comment) => comment.replyCount > 0);
            expect(postWithReplyToCloneFromPage.replies).to.be.a("object");
            const commentCloneInstance = await plebbit.createComment(postWithReplyToCloneFromPage);
            expect(commentCloneInstance.replies).to.be.a("object");
            const commentCloneInstanceJson = jsonifyCommentAndRemoveInstanceProps(commentCloneInstance);
            const commentToCloneFromPageJson = jsonifyCommentAndRemoveInstanceProps(postWithReplyToCloneFromPage);
            expect(commentToCloneFromPageJson).to.deep.equal(commentCloneInstanceJson);
        });

        it(`Can recreate a stringified Comment instance with replies with plebbit.createComment`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const postWithReplyToCloneFromPage = subplebbit.posts.pages.hot.comments.find((comment) => comment.replyCount > 0);
            expect(postWithReplyToCloneFromPage.replies).to.be.a("object");
            const commentCloneInstance = await plebbit.createComment(JSON.parse(JSON.stringify(postWithReplyToCloneFromPage)));
            expect(commentCloneInstance.replies).to.be.a("object");
            const commentCloneInstanceJson = jsonifyCommentAndRemoveInstanceProps(commentCloneInstance);
            const commentToCloneFromPageJson = jsonifyCommentAndRemoveInstanceProps(postWithReplyToCloneFromPage);
            expect(commentCloneInstanceJson).to.deep.equal(commentToCloneFromPageJson);
        });

        it(`Can recreate a stringified Post instance with plebbit.createComment`, async () => {
            const post = await generateMockPost(subplebbitAddress, plebbit, false);
            const postFromStringifiedPost = await plebbit.createComment(JSON.parse(JSON.stringify(post)));
            const postJson = jsonifyCommentAndRemoveInstanceProps(post);
            const postFromStringifiedPostJson = jsonifyCommentAndRemoveInstanceProps(postFromStringifiedPost);
            expect(postJson).to.deep.equal(postFromStringifiedPostJson);
        });

        it("comment instance created with {subplebbitAddress, cid, depth, postCid} prop can call getPage", async () => {
            const post = await publishRandomPost(subplebbitAddress, plebbit);
            expect(post.replies).to.be.a("object");
            await publishRandomReply(post, plebbit);
            await post.update();
            await resolveWhenConditionIsTrue(post, () => post.replyCount >= 1);
            expect(post.content).to.be.a("string");
            expect(post.replyCount).to.equal(1);
            expect(post.replies.pages.best.comments.length).to.equal(1);

            await post.stop();

            const pageCid = await addStringToIpfs(JSON.stringify({ comments: [post.replies.pages.best["comments"][0].raw] }));
            expect(pageCid).to.be.a("string");

            const postClone = await plebbit.createComment({
                subplebbitAddress: post.subplebbitAddress,
                cid: post.cid,
                depth: post.depth,
                postCid: post.postCid
            });
            expect(postClone.content).to.be.undefined;
            expect(postClone.subplebbitAddress).to.equal(post.subplebbitAddress);
            expect(postClone.cid).to.equal(post.cid);
            expect(postClone.depth).to.equal(post.depth);
            expect(postClone.postCid).to.equal(post.postCid);

            postClone.replies.pageCids.new = pageCid; // mock it to have pageCids
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

        it(`Can create comment with {subplebbitAddress: string, cid: string}`, async () => {
            const cid = "QmQ9mK33zshLf4Bj8dVSQimdbyXGgw5QFRoUQpsCqqz6We";
            const comment = await plebbit.createComment({ cid, subplebbitAddress });
            expect(comment.cid).to.equal(cid);
            expect(comment.subplebbitAddress).to.equal(subplebbitAddress);
        });
    });
});
