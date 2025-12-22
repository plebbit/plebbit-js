import { expect } from "chai";
import signers from "../../../../fixtures/signers.js";
import {
    generateMockPost,
    generateMockComment,
    publishWithExpectedResult,
    mockRemotePlebbit,
    publishRandomPost,
    createStaticSubplebbitRecordForComment,
    overrideCommentInstancePropsAndSign,
    setExtraPropOnCommentAndSign,
    disableValidationOfSignatureBeforePublishing,
    itSkipIfRpc
} from "../../../../../dist/node/test/test-util.js";
import * as remeda from "remeda";
import { messages } from "../../../../../dist/node/errors.js";
import { describe, it } from "vitest";
const subplebbitAddress = signers[0].address;

describe.sequential(`Client side verification`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });

    after(async () => {
        await plebbit.destroy();
    });

    it(".publish() throws if publication has invalid signature", async () => {
        const mockComment = await generateMockPost(subplebbitAddress, plebbit, false, { signer: signers[0] });
        const pubsubPublication = JSON.parse(JSON.stringify(mockComment.toJSONPubsubMessagePublication()));
        pubsubPublication.timestamp += 1; // corrupts signature
        mockComment.toJSONPubsubMessagePublication = () => pubsubPublication;

        try {
            await mockComment.publish();
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.code).to.equal("ERR_SIGNATURE_IS_INVALID");
        }
    });

    itSkipIfRpc.sequential(`.publish() throws if fetched subplebbit has an invalid signature`, async () => {
        // this test is flaky in CI for some reason
        const { commentCid, subAddress } = await createStaticSubplebbitRecordForComment({ invalidateSubplebbitSignature: true });
        const mockPost = await generateMockPost(subAddress, plebbit);
        mockPost._getSubplebbitCache = () => undefined;

        try {
            await mockPost.publish();
            expect.fail("should fail");
        } catch (e) {
            expect(e.code).to.equal("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID", "Got a different error than expected: " + JSON.stringify(e));
        }
    });
});

describe.concurrent("Subplebbit rejection of incorrect values of fields", async () => {
    let plebbit, post;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        post = await publishRandomPost(subplebbitAddress, plebbit);
    });

    after(async () => {
        await plebbit.destroy();
    });

    it(`Subplebbit reject a comment with subplebbitAddress that is not equal to its subplebbit.address`);
    it(`Subplebbit reject publish a comment without author.address`);
    it(`Subplebbit reject publish a comment with non valid signature.signedPropertyNames`);

    it("Subplebbit reject a comment under a non existent parent", async () => {
        const comment = await plebbit.createComment({
            parentCid: "QmV8Q8tWqbLTPYdrvSXHjXgrgWUR1fZ9Ctj56ETPi58FDY", // random cid that's not related to this sub,
            postCid: "QmV8Q8tWqbLTPYdrvSXHjXgrgWUR1fZ9Ctj56ETPi58FDY",
            signer: remeda.sample(signers, 1)[0],
            content: `Random Content` + Date.now(),
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

    itSkipIfRpc(`Throws an error when a comment has no title, link or content`, async () => {
        // should fail both locally in plebbit.createComment, and when we publish to the sub
        try {
            await generateMockPost(subplebbitAddress, plebbit, false, {
                link: undefined,
                content: undefined,
                title: undefined
            });
            expect.fail("Should fail if no link, content and title are defined");
        } catch (e) {
            expect(e.code).to.equal("ERR_INVALID_CREATE_COMMENT_ARGS_SCHEMA");
            expect(e.details.zodError.issues[0].message).to.equal(messages.ERR_COMMENT_HAS_NO_CONTENT_LINK_TITLE);
        }

        const mockPost = await generateMockPost(subplebbitAddress, plebbit); // regular post with everything defined
        await overrideCommentInstancePropsAndSign(mockPost, {
            link: undefined,
            content: undefined,
            title: undefined
        });

        await publishWithExpectedResult(mockPost, false, messages.ERR_REQUEST_PUBLICATION_HAS_INVALID_SCHEMA);
    });

    it.skip(`Throws an error if author.avatar.signature.signature is of a json string instead of a 0x string`, async () => {
        const test = {
            address: "0x52e6cD20f5FcA56DA5a0E489574C92AF118B8188",
            chainTicker: "matic",
            id: "9842",
            signature: {
                signature:
                    '{"domainSeparator":"plebbit-author-avatar","authorAddress":"12D3KooWJsiCyvG9mjRtWzc8TqzS7USKUrFFNs9s2AJuGqNhn9uU","timestamp":1709879936,"tokenAddress":"0x52e6cD20f5FcA56DA5a0E489574C92AF118B8188","tokenId":"9842"}',
                type: "eip191"
            }
        };
        const mockPost = await generateMockPost(subplebbitAddress, plebbit, false, { author: { avatar: test } });
        await publishWithExpectedResult(mockPost, false, "zxc");
    });

    itSkipIfRpc(`Subs respond with error if an author submits an encrypted field with invalid json`, async () => {
        const post = await generateMockPost(subplebbitAddress, plebbit, false);
        post.toJSONPubsubRequestToEncrypt = () => "<html>dwad"; // Publication will encrypt this invalid json
        disableValidationOfSignatureBeforePublishing(post);
        await publishWithExpectedResult(post, false, messages.ERR_REQUEST_PUBLICATION_HAS_INVALID_SCHEMA);
    });

    it(`Subs respond with error if you attempt to publish a reply without postCid defined`, async () => {
        try {
            await generateMockComment(post, plebbit, false, { postCid: undefined });
            expect.fail("Should fail to create a reply without postCid defined");
        } catch (e) {
            expect(e.code).to.equal("ERR_INVALID_CREATE_COMMENT_ARGS_SCHEMA");
            expect(e.details.zodError.issues[0].message).to.equal(messages.ERR_REPLY_HAS_NOT_DEFINED_POST_CID);
        }
        const reply = await generateMockComment(post, plebbit, false);
        await setExtraPropOnCommentAndSign(reply, { postCid: undefined }, true);
        expect(reply.postCid).to.be.undefined;
        const challengerequestPromise = new Promise((resolve) => reply.once("challengerequest", resolve));
        await publishWithExpectedResult(reply, false, messages.ERR_REPLY_HAS_NOT_DEFINED_POST_CID);
        const challengeRequest = await challengerequestPromise;
        expect(challengeRequest.comment.postCid).to.be.undefined;
    });
});

describe.concurrent(`Posts with forbidden fields are rejected during challenge exchange`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });

    after(async () => {
        await plebbit.destroy();
    });

    it(`Can't publish a post to sub with signer being part of CommentPubsubMessage`, async () => {
        const post = await generateMockPost(subplebbitAddress, plebbit, false);
        await setExtraPropOnCommentAndSign(post, { signer: { privateKey: post.signer.privateKey } }, true);
        await publishWithExpectedResult(post, false, messages.ERR_COMMENT_HAS_RESERVED_FIELD);
    });

    const forbiddenFieldsWithValue = [
        { cid: "QmVZR5Ts9MhRc66hr6TsYnX1A2oPhJ2H1fRJknxgjLLwrh" },
        { previousCid: "QmVZR5Ts9MhRc66hr6TsYnX1A2oPhJ2H1fRJknxgjLLwrh" },
        { depth: "0" },
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
        { shortCid: "QmVZR5Ts9MhRc66hr6TsYnX1A2oPhJ2H1fRJknxgjLLwrh" }
    ];
    forbiddenFieldsWithValue.map((forbiddenType) =>
        itSkipIfRpc(`comment.${Object.keys(forbiddenType)[0]} is rejected by sub`, async () => {
            const post = await generateMockPost(subplebbitAddress, plebbit, false);
            await setExtraPropOnCommentAndSign(post, forbiddenType, true);
            await publishWithExpectedResult(post, false, messages.ERR_COMMENT_HAS_RESERVED_FIELD);
        })
    );
});

describe("Posts with forbidden author fields are rejected", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });

    after(async () => {
        await plebbit.destroy();
    });

    const forbiddenFieldsWithValue = {
        subplebbit: { lastCommentCid: "QmRxNUGsYYg3hxRnhnbvETdYSc16PXqzgF8WP87UXpb9Rs", postScore: 0, replyScore: 0, banExpiresAt: 0 },
        shortAddress: "12345"
    };
    Object.keys(forbiddenFieldsWithValue).map((forbiddenFieldName) =>
        it(`publication.author.${forbiddenFieldName} is rejected by sub`, async () => {
            const signer = await plebbit.createSigner();
            const post = await plebbit.createComment({
                subplebbitAddress,
                title: "Nonsense" + Date.now(),
                signer: signer
            });
            await setExtraPropOnCommentAndSign(
                post,
                {
                    author: { ...post.author, [forbiddenFieldName]: forbiddenFieldsWithValue[forbiddenFieldName] }
                },
                true
            );
            await publishWithExpectedResult(post, false, messages.ERR_PUBLICATION_AUTHOR_HAS_RESERVED_FIELD);
        })
    );
});
