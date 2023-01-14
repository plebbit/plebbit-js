const Plebbit = require("../../dist/node");
const signers = require("../fixtures/signers");
const { generateMockPost, generateMockComment, publishRandomReply, publishWithExpectedResult } = require("../../dist/node/test/test-util");
const lodash = require("lodash");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { mockPlebbit } = require("../../dist/node/test/test-util");
const { default: waitUntil } = require("async-wait-until");
const messages = require("../../dist/node/errors");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

let plebbit, signer;
const subplebbitAddress = signers[0].address;
const mockComments = [];
const updateInterval = 300;

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
        const comment = await generateMockComment(mockComments[0], plebbit, lodash.sample(signers));
        const commentFromStringifiedComment = await plebbit.createComment(JSON.parse(JSON.stringify(comment)));
        expect(JSON.stringify(comment)).to.equal(JSON.stringify(commentFromStringifiedComment));
    });

    it(`(post: Post) === plebbit.createComment(JSON.parse(JSON.stringify(post)))`, async () => {
        const post = await generateMockPost(subplebbitAddress, plebbit, lodash.sample(signers));
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
            const parentComment = mockComments[depth - 1];
            parentComment._updateIntervalMs = updateInterval;
            await parentComment.update();
            await waitUntil(() => typeof parentComment.updatedAt === "number", { timeout: 200000 });

            const originalReplyCount = lodash.clone(parentComment.replyCount);
            expect(originalReplyCount).to.be.equal(0);

            const reply = await publishRandomReply(parentComment, plebbit, { signer });

            await waitUntil(() => parentComment.replyCount === 1, { timeout: 200000 });

            expect(reply.parentCid).to.be.equal(parentComment.cid);
            expect(reply.depth).to.be.equal(depth);
            expect(parentComment.replyCount).to.equal(originalReplyCount + 1);
            expect(parentComment.author.subplebbit.postScore).to.equal(0);
            expect(parentComment.author.subplebbit.replyScore).to.equal(0);
            expect(parentComment.author.subplebbit.lastCommentCid).to.equal(reply.cid);
            const parentLatestCommentCid = (await parentComment.replies.getPage(parentComment.replies.pageCids.new)).comments[0]?.cid;
            expect(parentLatestCommentCid).to.equal(reply.cid);
            mockComments.push(reply);
            await parentComment.stop();
        })
    );
});

// TODO include tests for replies later. Not needed as of now
describe(`Posts with forbidden fields are rejected during challenge exchange`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    const forbiddenFieldsWithValue = [
        { cid: "Qm12345" },
        { signer: signers[1] },
        { ipnsKeyName: "adwad2" },
        { previousCid: "Qm12345" },
        { ipnsName: "Qm12345" },
        { depth: 0 },
        { postCid: "Qm12345" },
        { original: { Test: " hello" } },
        { upvoteCount: 1 },
        { downvoteCount: 1 },
        { replyCount: 1 },
        { updatedAt: 1234567 },
        { replies: { test: "testl" } },
        { authorEdit: { test: "werw" } },
        { deleted: true },
        { pinned: true },
        { locked: true },
        { removed: true },
        { moderatorReason: "Test forbidden" }
    ];
    forbiddenFieldsWithValue.map((forbiddenType) =>
        it(`comment.${Object.keys(forbiddenType)[0]} is rejected by sub`, async () => {
            const post = await generateMockPost(subplebbitAddress, plebbit, undefined, undefined);
            const postSkeletonJsonPrior = post.toJSONSkeleton();
            const postJsonPrior = post.toJSON();
            post.toJSONSkeleton = () => ({ ...postSkeletonJsonPrior, ...forbiddenType });
            post.toJSON = () => postJsonPrior;
            await publishWithExpectedResult(
                post,
                false,
                Object.keys(forbiddenType)[0] === "signer" ? messages.ERR_FORBIDDEN_SIGNER_FIELD : messages.ERR_FORBIDDEN_COMMENT_FIELD
            );
        })
    );
});

describe("Posts with forbidden author fields are rejected", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    const forbiddenFieldsWithValue = [
        { subplebbit: { lastCommentCid: "QmRxNUGsYYg3hxRnhnbvETdYSc16PXqzgF8WP87UXpb9Rs", postScore: 0, replyScore: 0 } },
        { flair: { text: "12345" } },
        { banExpiresAt: 0 },
        { previousCommentCid: "QmRxNUGsYYg3hxRnhnbvETdYSc16PXqzgF8WP87UXpb9Rs" }
    ];

    forbiddenFieldsWithValue.map((forbiddenType) =>
        it(`comment.author.${Object.keys(forbiddenType)[0]} is rejected by sub`, async () => {
            const post = await generateMockPost(subplebbitAddress, plebbit, undefined, undefined);
            const postSkeletonJsonPrior = post.toJSONSkeleton();
            const postJsonPrior = post.toJSON();
            post.toJSONSkeleton = () => ({ ...postSkeletonJsonPrior, author: { ...postSkeletonJsonPrior.author, ...forbiddenType } });
            post.toJSON = () => postJsonPrior;
            await publishWithExpectedResult(post, false, messages.ERR_FORBIDDEN_AUTHOR_FIELD);
        })
    );
});
