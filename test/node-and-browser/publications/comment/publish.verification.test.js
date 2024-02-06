import signers from "../../../fixtures/signers";
import {
    generateMockPost,
    generateMockComment,
    publishWithExpectedResult,
    mockRemotePlebbit,
    publishRandomPost,
    isRpcFlagOn
} from "../../../../dist/node/test/test-util";
import lodash from "lodash";
import { messages } from "../../../../dist/node/errors";
import { signComment, verifyComment, verifySubplebbit } from "../../../../dist/node/signer/signatures";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

describe(`Client side verification`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });
    it(".publish() throws if publication has invalid signature", async () => {
        const mockComment = await generateMockPost(subplebbitAddress, plebbit, false, { signer: signers[0] });
        mockComment.timestamp += 1; // Corrupts signature
        await assert.isRejected(mockComment.publish(), messages.ERR_SIGNATURE_IS_INVALID);
    });

    //prettier-ignore
    if (!isRpcFlagOn())
    it(`.publish() throws if fetched subplebbit has an invalid signature`, async () => {
        const customPlebbit = await mockRemotePlebbit();
        const subJson = (await customPlebbit.getSubplebbit(subplebbitAddress)).toJSONIpfs();
        subJson.updatedAt += 1; // should invalidate the signature
        expect(await verifySubplebbit(subJson, customPlebbit.resolveAuthorAddresses, customPlebbit._clientsManager)).to.deep.equal({
            valid: false,
            reason: messages.ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID
        });

        const mockPost = await generateMockPost(subplebbitAddress, customPlebbit);
        mockPost._getSubplebbitCache = () => undefined;
        mockPost._clientsManager._fetchCidP2P = (address) => JSON.stringify(subJson);

        await assert.isRejected(mockPost.publish(), messages.ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID);
    });
});

//prettier-ignore
if (!isRpcFlagOn())
describe("Subplebbit rejection of incorrect values of fields", async () => {
    let plebbit, post;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        post = await publishRandomPost(subplebbitAddress, plebbit, {}, false);
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
        expect(post.timestamp).to.be.a("number");
        const reply = await generateMockComment(post, plebbit, false, { signer: signers[0], timestamp: post.timestamp - 1 });
        expect(reply.timestamp).to.be.lessThan(post.timestamp);
        await publishWithExpectedResult(reply, false, messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT);
    });

    it("Throws an error when publishing a duplicate post", async function () {
        const newPost = await generateMockPost(subplebbitAddress, plebbit);
        newPost.toJSONPubsubMessagePublication = () => post.toJSONPubsubMessagePublication();
        await publishWithExpectedResult(newPost, false, messages.ERR_DUPLICATE_COMMENT);
    });

    it(`Throws an error when comment is over size`, async () => {
        const veryLongString = "Hello".repeat(10000);
        const mockPost = await generateMockPost(signers[0].address, plebbit, false, { content: veryLongString });
        // Size of post should be ~50kb now

        await publishWithExpectedResult(mockPost, false, messages.ERR_COMMENT_OVER_ALLOWED_SIZE);
    });
});

// TODO include tests for replies later. Not needed as of now
//prettier-ignore
if (!isRpcFlagOn())
describe(`Posts with forbidden fields are rejected during challenge exchange`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });
    const forbiddenFieldsWithValue = [
        { cid: "Qm12345" },
        { signer: signers[1] },
        { previousCid: "Qm12345" },
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
        { reason: "Test forbidden" },
        { shortCid: "Qm1234" }
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

//prettier-ignore
if (!isRpcFlagOn())
describe("Posts with forbidden author fields are rejected", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });
    const forbiddenFieldsWithValue = {
        subplebbit: { lastCommentCid: "QmRxNUGsYYg3hxRnhnbvETdYSc16PXqzgF8WP87UXpb9Rs", postScore: 0, replyScore: 0, banExpiresAt: 0 },
        shortAddress: "12345"
    };
    Object.keys(forbiddenFieldsWithValue).map((forbiddenFieldName) =>
        it(`publication.author.${forbiddenFieldName} is rejected by sub`, async () => {
            const post = await plebbit.createComment({
                subplebbitAddress,
                title: "Nonsense" + Date.now(),
                author: { [forbiddenFieldName]: forbiddenFieldsWithValue[forbiddenFieldName] },
                signer: await plebbit.createSigner()
            });
            const pubsubJsonPrior = post.toJSONPubsubMessagePublication();
            const pubsubJsonAfterChange = {
                ...pubsubJsonPrior,
                author: { ...pubsubJsonPrior.author, [forbiddenFieldName]: forbiddenFieldsWithValue[forbiddenFieldName] }
            };

            pubsubJsonAfterChange.signature = await signComment(pubsubJsonAfterChange, post.signer, plebbit);
            post.toJSONPubsubMessagePublication = () => pubsubJsonAfterChange;
            expect(
                await verifyComment(JSON.parse(JSON.stringify(post.toJSONPubsubMessagePublication())), false, post._clientsManager, false)
            ).to.deep.equal({
                valid: true
            });
            post._validateSignature = async () => {}; // Disable signature validation before publishing
            await publishWithExpectedResult(post, false, messages.ERR_FORBIDDEN_AUTHOR_FIELD);
        })
    );
});
