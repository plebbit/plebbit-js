const Plebbit = require("../../dist/node");
const signers = require("../fixtures/signers");
const { randomElement } = require("../../dist/node/util");
const { generateMockPost, generateMockComment } = require("../../dist/node/test/test-util");
const lodash = require("lodash");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { mockPlebbit } = require("../../dist/node/test/test-util");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

let plebbit, signer;
const subplebbitAddress = signers[0].address;
const mockComments = [];
const updateInterval = 100;

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe("publishing", async () => {
    before(async () => {
        plebbit = await mockPlebbit();
        signer = await plebbit.createSigner();
    });

    it("Can publish a post", async function () {
        return new Promise(async (resolve, reject) => {
            const mockPost = await generateMockPost(subplebbitAddress, plebbit, signer);
            await mockPost.publish();
            mockPost.once("challengeverification", (challengeVerificationMessage, updatedComment) => {
                expect(challengeVerificationMessage.challengeSuccess).to.be.true;
                expect(challengeVerificationMessage.reason).to.be.a("string");
                expect(challengeVerificationMessage.publication).to.be.a("object");
                expect(challengeVerificationMessage.encryptedPublication).to.be.a("object");
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
                expect(challengeVerificationMessage.reason).to.be.a("string"); // TODO add check for message here
                expect(challengeVerificationMessage.publication).to.be.undefined;
                expect(challengeVerificationMessage.encryptedPublication).to.be.undefined;

                resolve();
            });
        });
    });

    it(`Publish a post with only link`, async () =>
        new Promise(async (resolve) => {
            const postLink = "https://demo.plebbit.eth.limo";
            const post = await plebbit.createComment({
                title: "Post with link " + Date.now(),
                link: postLink,
                subplebbitAddress,
                signer
            });

            expect(post.link).to.equal(postLink);

            await post.publish();

            post.once("challengeverification", (challengeVerificationMessage, updatedComment) => {
                expect(challengeVerificationMessage.challengeSuccess).to.be.true;
                expect(challengeVerificationMessage.reason).to.be.a("string");
                expect(challengeVerificationMessage.publication).to.be.a("object");
                expect(challengeVerificationMessage.encryptedPublication).to.be.a("object");
                expect(updatedComment.link).to.equal(postLink);
                expect(challengeVerificationMessage.publication.link).to.equal(postLink);
                resolve();
            });
        }));

    it(`Can publish a comment with author.avatar. Can also validate it after publishing`, async () => {
        const post = await plebbit.createComment({
            title: "Post with author.avatar " + Date.now(),
            author: {
                avatar: {
                    address: "0x890a2e81836e0E76e0F49995e6b51ca6ce6F39ED",
                    chainTicker: "matic",
                    id: "8",
                    signature: {
                        signature:
                            "0x52d29d32fcb1c5b3cd3638ccd67573985c4b01816a5e77fdfb0122488a0fdeb854ca6dae4fbdb0594db88e36ba83e87a321321fcfde498f84310a6b5cd543f3f1c",
                        signedPropertyNames: ["domainSeparator", "authorAddress", "tokenAddress", "tokenId"],
                        type: "eip191"
                    }
                }
            },
            content: "Test content" + Date.now(),
            signer: signers[8],
            subplebbitAddress
        });

        await post.publish();

        await new Promise((resolve) =>
            post.once("challengeverification", (challengeVerificationMessage, updatedComment) => {
                expect(challengeVerificationMessage.challengeSuccess).to.be.true;
                expect(challengeVerificationMessage.reason).to.be.a("string");
                expect(challengeVerificationMessage.publication).to.be.a("object");
                expect(challengeVerificationMessage.encryptedPublication).to.be.a("object");
                expect(challengeVerificationMessage.publication.author.avatar).to.deep.equal(post.author.avatar);
                expect(challengeVerificationMessage.publication.title).to.equal(post.title);
                resolve();
            })
        );

        const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
        subplebbit._updateIntervalMs = updateInterval;

        await new Promise((resolve) => {
            subplebbit.update();
            subplebbit.on("update", (updatedSubplebbit) => {
                const hotPageComments = updatedSubplebbit.posts.pages.hot.comments;
                const avatarCommentInPage = hotPageComments.filter((comment) => comment.title === post.title)[0];

                if (avatarCommentInPage) {
                    expect(JSON.stringify(lodash.omit(avatarCommentInPage.author, "subplebbit"))).to.equal(
                        JSON.stringify(post.author.toJSON())
                    );
                    expect(avatarCommentInPage.title).to.equal(post.title);
                    subplebbit.stop() && resolve();
                }
            });
        });
    });

    it(`Publish a post with spoiler`, async () =>
        new Promise(async (resolve) => {
            const post = await plebbit.createComment({
                title: "Post with spoiler" + Date.now(),
                content: "Content that should be hidden under spoiler" + Date.now(),
                spoiler: true,
                subplebbitAddress,
                signer
            });

            expect(post.spoiler).to.be.true;

            await post.publish();

            post.once("challengeverification", (challengeVerificationMessage, updatedComment) => {
                expect(challengeVerificationMessage.challengeSuccess).to.be.true;
                expect(challengeVerificationMessage.reason).to.be.a("string");
                expect(challengeVerificationMessage.publication).to.be.a("object");
                expect(challengeVerificationMessage.encryptedPublication).to.be.a("object");
                expect(updatedComment.spoiler).to.be.true;
                expect(challengeVerificationMessage.publication.spoiler).to.be.true;

                resolve();
            });
        }));

    [1, 2].map((depth) =>
        it(`Can publish comment with depth = ${depth}`, async () => {
            return new Promise(async (resolve, reject) => {
                const parentComment = mockComments[depth - 1];
                parentComment._updateIntervalMs = updateInterval;
                await Promise.all([new Promise((resolve) => parentComment.once("update", resolve)), parentComment.update()]);

                const mockComment = await generateMockComment(parentComment, plebbit, signer);

                expect(parentComment.updatedAt).to.be.a("number");
                const originalReplyCount = parentComment.replyCount;
                expect(originalReplyCount).to.be.equal(0);
                await mockComment.publish();
                parentComment.once("update", async (updatedParentComment) => {
                    expect(mockComment.parentCid).to.be.equal(updatedParentComment.cid);
                    expect(mockComment.depth).to.be.equal(depth);
                    expect(updatedParentComment.replyCount).to.equal(originalReplyCount + 1);
                    expect(updatedParentComment.author.subplebbit.postScore).to.equal(0);
                    expect(updatedParentComment.author.subplebbit.replyScore).to.equal(0);
                    expect(updatedParentComment.author.subplebbit.lastCommentCid).to.equal(mockComment.cid);
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
