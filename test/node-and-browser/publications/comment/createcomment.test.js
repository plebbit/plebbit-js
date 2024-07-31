import Plebbit from "../../../../dist/node/index.js";
import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    mockRemotePlebbit,
    publishRandomPost,
    publishRandomReply,
    loadAllPages,
    resolveWhenConditionIsTrue,
    getRemotePlebbitConfigs
} from "../../../../dist/node/test/test-util.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { stringify as deterministicStringify } from "safe-stable-stringify";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

getRemotePlebbitConfigs().map((config) => {
    describe(`plebbit.createComment - Remote (${config.name})`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        it(`comment = await createComment(await createComment)`, async () => {
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

        it(`Can recreate a stringifed Comment instance with plebbit.createComment`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const commentClone = await plebbit.createComment(JSON.parse(JSON.stringify(subplebbit.posts.pages.hot.comments[0])));
            expect(deterministicStringify(subplebbit.posts.pages.hot.comments[0])).to.equal(deterministicStringify(commentClone));
        });

        it(`Can create a Comment instance with subplebbit.posts.pages.hot.comments[0]`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const commentFromPage = subplebbit.posts.pages.hot.comments[0];
            const commentClone = await plebbit.createComment(commentFromPage);
            expect(deterministicStringify(commentFromPage)).to.equal(deterministicStringify(commentClone.toJSON()));
        });

        it(`Can recreate a Comment instance with replies with plebbit.createComment`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const newComments = await loadAllPages(subplebbit.posts.pageCids.new, subplebbit.posts);
            const commentToCloneFromPage = newComments.find((comment) => comment.replyCount > 0);
            expect(commentToCloneFromPage.replies).to.be.a("object");
            const commentCloneInstance = await plebbit.createComment(commentToCloneFromPage);
            expect(commentCloneInstance.replies).to.be.a("object");
            expect(deterministicStringify(commentToCloneFromPage)).to.equal(deterministicStringify(commentCloneInstance.toJSON()));
        });

        it(`Can recreate a stringified Comment instance with replies with plebbit.createComment`, async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const newComments = await loadAllPages(subplebbit.posts.pageCids.new, subplebbit.posts);
            const commentToCloneFromPage = newComments.find((comment) => comment.replyCount > 0);
            expect(commentToCloneFromPage.replies).to.be.a("object");
            const commentCloneInstance = await plebbit.createComment(JSON.parse(JSON.stringify(commentToCloneFromPage)));
            expect(commentCloneInstance.replies).to.be.a("object");
            expect(deterministicStringify(commentToCloneFromPage)).to.equal(deterministicStringify(commentCloneInstance.toJSON()));
        });

        it(`Can recreate a stringified Post instance with plebbit.createComment`, async () => {
            const post = await generateMockPost(subplebbitAddress, plebbit, false);
            const postFromStringifiedPost = await plebbit.createComment(JSON.parse(JSON.stringify(post)));
            expect(deterministicStringify(post)).to.equal(deterministicStringify(postFromStringifiedPost));
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
    });
});
