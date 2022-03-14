import {Plebbit} from "../src/index.js"
import {IPFS_API_URL, IPFS_GATEWAY_URL} from "../secrets.js";
import assert from 'assert';
import {loadIpfsFileAsJson, sleep, unsubscribeAllPubsubTopics} from "../src/Util.js";
import {SORTED_COMMENTS_TYPES, SortedComments} from "../src/SortHandler.js";
import {generateMockComment} from "./MockUtil.js";

const plebbit = await Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});

const post = await plebbit.getPostOrComment("QmSeDvgKzg556Qyv4xueUaDkkjMB69jLwxsUQAuUzR6fqT");

const mockComments = [];
describe("Test Post and Comment", async function () {
    before(async () => await unsubscribeAllPubsubTopics(plebbit.ipfsClient));
    before(async () => {
        post.subplebbit.setProvideCaptchaCallback((challengeWithMsg) => [null, null]);
        await post.subplebbit.startPublishing();
    });
    after(async () => await post.subplebbit.stopPublishing());
    after(async () => await unsubscribeAllPubsubTopics(plebbit.ipfsClient));


    it("Can publish new comment under post", async function () {
        return new Promise(async (resolve, reject) => {
            const mockComment = await generateMockComment(post, post.subplebbit);
            mockComment.publish().then(async (challengeVerificationMessage) => {
                const loadedComment = await plebbit.getPostOrComment(mockComment.commentCid);
                assert.equal(JSON.stringify(loadedComment), JSON.stringify(mockComment));

                await mockComment.fetchParent();
                await mockComment.parent.fetchCommentIpns();
                assert.equal(mockComment.parent.commentIpns.latestCommentCid, mockComment.commentCid);
                assert.equal(mockComment.parent.commentIpns.preloadedComments[0].commentCid, mockComment.commentCid);
                const loadedParentPost = await plebbit.getPostOrComment(mockComment.postCid);
                await loadedParentPost.fetchCommentIpns();
                assert.equal(loadedParentPost.commentIpns.latestCommentCid, mockComment.commentCid, "Failed to include latest comment in Post");
                mockComments.push(mockComment);
                resolve();
            }).catch(reject);
        });
    });

    it(`New comments under a post are sorted by their timestamps`, async () => {

        const actualComments = [];
        for (let i = 0; i < 4; i++) {
            actualComments.push(await generateMockComment(post, post.subplebbit));
            await sleep(1000);
        }
        await Promise.all(actualComments.map(async post => post.publish()));
        mockComments.push(actualComments[0]);
        const commentIpns = await post.fetchCommentIpns();
        let sortedCommentsPage = new SortedComments(await loadIpfsFileAsJson(commentIpns.sortedCommentsCids[SORTED_COMMENTS_TYPES.NEW], plebbit.ipfsClient));
        let sortedComments = sortedCommentsPage.comments;
        while (sortedCommentsPage.nextSortedCommentsCid) {
            sortedCommentsPage = new SortedComments(await loadIpfsFileAsJson(sortedCommentsPage.nextSortedCommentsCid, plebbit.ipfsClient));
            sortedComments = sortedComments.concat(sortedCommentsPage.comments);
        }
        for (let i = 0; i < sortedComments.length - 1; i++)
            if (sortedComments[i].timestamp < sortedComments[i + 1].timestamp)
                assert.fail("New Comments under a post are not sorted according to their timestamp");

    });


    it("Can publish new comments under comment", async () => {
        return new Promise(async (resolve, reject) => {
            const mockComment = await generateMockComment(mockComments[0], mockComments[0].subplebbit);
            mockComment.publish().then(async challengeVerificationMessage => {
                await mockComment.fetchParent();
                assert.equal(mockComment.parent.commentCid, mockComments[0].commentCid);
                assert.equal(mockComment.parentCommentCid, mockComments[0].commentCid);

                await mockComment.parent.fetchCommentIpns();
                assert.equal(mockComment.parent.commentIpns.latestCommentCid, mockComment.commentCid);
                assert.equal(mockComment.parent.commentIpns.preloadedComments[0].commentCid, mockComment.commentCid);
                mockComments.push(mockComment);
                resolve();
            }).catch(reject);
        });
    });
});