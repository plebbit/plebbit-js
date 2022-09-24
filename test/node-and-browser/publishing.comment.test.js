const Plebbit = require("../../dist/node");
const signers = require("../fixtures/signers");
const { waitTillCommentsUpdate, randomElement } = require("../../dist/node/util");
const { generateMockPost, generateMockComment } = require("../../dist/node/test-util");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

let plebbit;
const subplebbitAddress = signers[0].address;
const mockComments = [];
const updateInterval = 100;

describe("publishing", async () => {
    before(async () => {
        plebbit = await Plebbit({
            ipfsHttpClientOptions: "http://localhost:5001/api/v0",
            pubsubHttpClientOptions: `http://localhost:5002/api/v0`
        });
        plebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) => {
            if (authorAddress === "plebbit.eth") return signers[6].address;
            else if (authorAddress === "testgibbreish.eth") throw new Error(`Domain (${authorAddress}) has no plebbit-author-address`);
            return authorAddress;
        };
    });

    it("Can publish a post", async function () {
        return new Promise(async (resolve, reject) => {
            const mockPost = await generateMockPost(subplebbitAddress, plebbit, signers[0]);
            await mockPost.publish();
            mockPost.once("challengeverification", (challengeVerificationMessage, updatedComment) => {
                mockComments.push(mockPost);
                resolve();
            });
        });
    });

    it(`(comment: Comment) === plebbit.createComment(JSON.parse(JSON.stringify(comment)))`, async () => {
        const comment = await generateMockComment(mockComments[0], plebbit, randomElement(signers));
        const commentFromStringifiedComment = await plebbit.createComment(JSON.parse(JSON.stringify(comment)));
        expect(JSON.stringify(comment)).to.equal(JSON.stringify(commentFromStringifiedComment));
    });

    it(`(post: Post) === plebbit.createComment(JSON.parse(JSON.stringify(post)))`, async () => {
        const post = await generateMockPost(subplebbitAddress, plebbit, randomElement(signers));
        const postFromStringifiedPost = await plebbit.createComment(JSON.parse(JSON.stringify(post)));
        expect(JSON.stringify(post)).to.equal(JSON.stringify(postFromStringifiedPost));
    });

    it("Throws an error when publishing a duplicate post", async function () {
        return new Promise(async (resolve, reject) => {
            await mockComments[0].publish();
            mockComments[0].once("challengeverification", (challengeVerificationMessage, updatedComment) => {
                expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                expect(challengeVerificationMessage.reason).to.be.a("string");
                resolve();
            });
        });
    });

    it(`Publish a post with only link`, async () =>
        new Promise(async (resolve) => {
            const postLink = "https://demo.plebbit.eth.limo";
            const post = await plebbit.createComment({
                title: "Post with link",
                link: postLink,
                subplebbitAddress: subplebbitAddress,
                signer: await plebbit.createSigner()
            });

            expect(post.link).to.equal(postLink);

            await post.publish();

            post.once("challengeverification", (challengeVerificationMessage, updatedComment) => {
                expect(challengeVerificationMessage.challengeSuccess).to.be.true;
                expect(challengeVerificationMessage.reason).to.be.a("string");
                expect(updatedComment.link).to.equal(postLink);
                resolve();
            });
        }));

    it(`Publish a post with spoiler`, async () =>
        new Promise(async (resolve) => {
            const post = await plebbit.createComment({
                title: "Post with link" + Date.now(),
                spoiler: true,
                subplebbitAddress: subplebbitAddress,
                signer: await plebbit.createSigner()
            });

            expect(post.spoiler).to.be.true;

            await post.publish();

            post.once("challengeverification", (challengeVerificationMessage, updatedComment) => {
                expect(challengeVerificationMessage.challengeSuccess).to.be.true;
                expect(challengeVerificationMessage.reason).to.be.a("string");
                expect(updatedComment.spoiler).to.be.true;
                resolve();
            });
        }));

    [1, 2].map((depth) =>
        it(`Can publish comment with depth = ${depth}`, async () => {
            return new Promise(async (resolve, reject) => {
                const parentComment = mockComments[depth - 1];
                const mockComment = await generateMockComment(parentComment, plebbit, signers[0]);
                await waitTillCommentsUpdate([parentComment], updateInterval);
                await parentComment.update(updateInterval);
                expect(parentComment.updatedAt).to.be.a("number");
                const originalReplyCount = parentComment.replyCount;
                expect(originalReplyCount).to.be.equal(0);
                await mockComment.publish();
                parentComment.once("update", async (updatedParentComment) => {
                    expect(mockComment.parentCid).to.be.equal(updatedParentComment.cid);
                    expect(mockComment.depth).to.be.equal(depth);
                    expect(updatedParentComment.replyCount).to.equal(originalReplyCount + 1);
                    const parentLatestCommentCid = (await updatedParentComment.replies.getPage(updatedParentComment.replies.pageCids.new))
                        .comments[0]?.cid;
                    expect(parentLatestCommentCid).to.equal(mockComment.cid, "parentComment.replies.new should include new comment");
                    mockComments.push(mockComment);
                    await parentComment.stop();
                    resolve();
                });
            });
        })
    );
});
