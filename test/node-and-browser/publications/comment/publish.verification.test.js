const Plebbit = require("../../../../dist/node");
const signers = require("../../../fixtures/signers");
const {
    generateMockPost,
    generateMockComment,
    publishWithExpectedResult,
    mockPlebbit,
    publishRandomPost
} = require("../../../../dist/node/test/test-util");
const { messages } = require("../../../../dist/node/errors");
const lodash = require("lodash");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe(`Client side verification`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(".publish() throws if publication has invalid signature", async () => {
        const mockComment = await generateMockPost(subplebbitAddress, plebbit, false, { signer: signers[0] });
        mockComment.timestamp += 1; // Corrupts signature
        await assert.isRejected(mockComment.publish(), messages.ERR_SIGNATURE_IS_INVALID);
    });
});

describe("Subplebbit rejection of incorrect values of fields", async () => {
    let plebbit, post;
    before(async () => {
        plebbit = await mockPlebbit();
        post = await publishRandomPost(subplebbitAddress, plebbit);
    });

    it(`Subplebbit reject a comment with subplebbitAddress that is not equal subplebbit.address`);
    it(`Subplebbit reject publish a comment without author.address`);
    it(`Subplebbit reject publish a comment with non valid signature.signedPropertyNames`);

    it("Subplebbit reject a comment under a non existent parent", async () => {
        const comment = await plebbit.createComment({
            parentCid: "gibberish", // invalid parentCid,
            signer: lodash.sample(signers),
            subplebbitAddress
        });
        await publishWithExpectedResult(comment, false, messages.ERR_SUB_COMMENT_PARENT_DOES_NOT_EXIST);
    });

    it(`A reply with timestamp earlier than its parent is rejected`, async () => {
        const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
        const parentPost = await plebbit.getComment(subplebbit.lastPostCid);
        expect(parentPost.timestamp).to.be.a("number");
        const reply = await generateMockComment(parentPost, plebbit, false, { signer: signers[0], timestamp: parentPost.timestamp - 1 });
        expect(reply.timestamp).to.be.lessThan(parentPost.timestamp);
        await publishWithExpectedResult(reply, false, messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT);
    });

    it("Throws an error when publishing a duplicate post", async function () {
        await publishWithExpectedResult(post, false, messages.ERR_DUPLICATE_COMMENT);
    });
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
        { upvoteCount: 1 },
        { downvoteCount: 1 },
        { replyCount: 1 },
        { updatedAt: 1234567 },
        { replies: { test: "testl" } },
        { edit: { content: "werw" } },
        { deleted: true },
        { pinned: true },
        { locked: true },
        { removed: true },
        { reason: "Test forbidden" }
    ];
    forbiddenFieldsWithValue.map((forbiddenType) =>
        it(`comment.${Object.keys(forbiddenType)[0]} is rejected by sub`, async () => {
            const post = await generateMockPost(subplebbitAddress, plebbit, false);
            const postPubsubJsonPrior = post.toJSONPubsubMessagePublication();
            post.toJSONPubsubMessagePublication = () => ({ ...postPubsubJsonPrior, ...forbiddenType });
            post._validateSignature = async () => {}; // Disable signature validation before publishing
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
    // TODO redo this
    const forbiddenFieldsWithValue = [
        { subplebbit: { lastCommentCid: "QmRxNUGsYYg3hxRnhnbvETdYSc16PXqzgF8WP87UXpb9Rs", postScore: 0, replyScore: 0, banExpiresAt: 0 } }
    ];

    forbiddenFieldsWithValue.map((forbiddenType) =>
        it(`comment.author.${Object.keys(forbiddenType)[0]} is rejected by sub`, async () => {
            const post = await generateMockPost(subplebbitAddress, plebbit);
            const postPubsubJsonPrior = post.toJSONPubsubMessagePublication();
            post.toJSONPubsubMessagePublication = () => ({
                ...postPubsubJsonPrior,
                author: { ...postPubsubJsonPrior.author, ...forbiddenType }
            });
            post._validateSignature = async () => {}; // Disable signature validation before publishing
            await publishWithExpectedResult(post, false, messages.ERR_FORBIDDEN_AUTHOR_FIELD);
        })
    );
});
