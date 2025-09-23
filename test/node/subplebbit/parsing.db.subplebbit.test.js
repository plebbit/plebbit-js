import { expect } from "chai";
import { Plebbit } from "../../../dist/node/plebbit/plebbit.js";
import { createSchemaRowParser } from "../../../dist/node/schema/schema-util.js";
import { CommentUpdateTableRowSchema, CommentsTableRowSchema } from "../../../dist/node/publications/comment/schema.js";
import { parseCommentsTableRow } from "../../../dist/node/runtime/node/subplebbit/db-row-parser.js";
import { parseDbResponses } from "../../../dist/node/util.js";
import { describeSkipIfRpc } from "../../../dist/node/test/test-util.js";

import { JsonSignatureSchema } from "../../../dist/node/schema/schema.js";

function buildSignature(overrides = {}) {
    const base = {
        type: "ed25519",
        signature: "signature-value",
        publicKey: "public-key",
        signedPropertyNames: []
    };
    const result = { ...base, ...overrides };
    // Ensure signature obeys schema to guard against future refactors.
    return JsonSignatureSchema.parse(result);
}

describe("createSchemaRowParser", () => {
    it("parses comment update rows from raw sqlite values", () => {
        const parseCommentUpdateRow = createSchemaRowParser(CommentUpdateTableRowSchema);

        const rawRow = {
            cid: "QmYHzA8euDgUpNy3fh7JRwpPwt6jCgF35YTutYkyGGyr8f",
            upvoteCount: 10,
            downvoteCount: 2,
            replyCount: 4,
            childCount: 1,
            flair: JSON.stringify({ text: "blue" }),
            spoiler: 1,
            nsfw: 0,
            pinned: 1,
            locked: "0",
            removed: "1",
            approved: "true",
            reason: "moderated",
            updatedAt: 1700000000,
            author: JSON.stringify({
                address: "authorAddress",
                subplebbit: {
                    postScore: 1,
                    replyScore: 0,
                    firstCommentTimestamp: 1699999999,
                    lastCommentCid: "QmX7yV8dWgyMUiw5DSBt5ABToBWqi55GVEtnidAbNGGFoG"
                }
            }),
            lastChildCid: "QmX7yV8dWgyMUiw5DSBt5ABToBWqi55GVEtnidAbNGGFoG",
            lastReplyTimestamp: 1700000100,
            signature: JSON.stringify(buildSignature()),
            protocolVersion: "1",
            replies: JSON.stringify({ pages: {} }),
            postUpdatesBucket: 42,
            postCommentUpdateCid: "QmYwAPJzv5CZsnAzt8auVTLsLUs16u9mPqT1WQE6B4wX9T",
            publishedToPostUpdatesMFS: 0,
            insertedAt: 1700000200,
            legacyField: "legacy"
        };

        const { data, extras } = parseCommentUpdateRow(rawRow);

        expect(data.cid).to.equal("QmYHzA8euDgUpNy3fh7JRwpPwt6jCgF35YTutYkyGGyr8f");
        expect(data.spoiler).to.equal(true);
        expect(data.nsfw).to.equal(false);
        expect(data.pinned).to.equal(true);
        expect(data.locked).to.equal(false);
        expect(data.removed).to.equal(true);
        expect(data.approved).to.equal(true);
        expect(data.signature).to.deep.equal(buildSignature());
        expect(data.replies).to.deep.equal({ pages: {} });
        expect(extras).to.deep.equal({ legacyField: "legacy" });
    });

    it("handles prefixed rows and leaves unknown prefixed fields in extras", () => {
        const parsePrefixedCommentUpdate = createSchemaRowParser(CommentUpdateTableRowSchema, { prefix: "commentUpdate_" });

        const { data, extras } = parsePrefixedCommentUpdate({
            commentUpdate_cid: "QmYHzA8euDgUpNy3fh7JRwpPwt6jCgF35YTutYkyGGyr8f",
            commentUpdate_upvoteCount: 5,
            commentUpdate_downvoteCount: 1,
            commentUpdate_replyCount: 0,
            commentUpdate_childCount: 0,
            commentUpdate_flair: JSON.stringify({ text: "blue" }),
            commentUpdate_spoiler: 0,
            commentUpdate_nsfw: 1,
            commentUpdate_pinned: 0,
            commentUpdate_locked: 0,
            commentUpdate_removed: 0,
            commentUpdate_updatedAt: 1700000300,
            commentUpdate_signature: JSON.stringify(buildSignature()),
            commentUpdate_protocolVersion: "1",
            commentUpdate_insertedAt: 1700000400,
            commentUpdate_publishedToPostUpdatesMFS: 1,
            commentUpdate_extraProps: JSON.stringify({ foo: "bar" }),
            commentUpdate_legacy: "legacy",
            unrelated: "shouldBeIgnored"
        });

        expect(data.cid).to.equal("QmYHzA8euDgUpNy3fh7JRwpPwt6jCgF35YTutYkyGGyr8f");
        expect(extras).to.deep.equal({ extraProps: "{\"foo\":\"bar\"}", legacy: "legacy" });
    });

    it("throws with helpful metadata when JSON parsing fails", () => {
        const parseCommentUpdateRow = createSchemaRowParser(CommentUpdateTableRowSchema);
        const badRow = {
            cid: "cid789",
            upvoteCount: 0,
            downvoteCount: 0,
            replyCount: 0,
            updatedAt: 1,
            signature: "{not-json",
            protocolVersion: "1",
            insertedAt: 1,
            publishedToPostUpdatesMFS: 1
        };

        expect(() => parseCommentUpdateRow(badRow)).to.throw();
    });

    it("treats null database values as undefined for optional comment fields", () => {
        const signature = buildSignature();
        const rawRow = {
            cid: "QmZg4TCKqKoMTVHCpQbVmGBkcGaA4vHwaC7xaoZ3nfJm8k",
            postCid: "QmYHzA8euDgUpNy3fh7JRwpPwt6jCgF35YTutYkyGGyr8f",
            depth: 0,
            authorSignerAddress: "signer",
            subplebbitAddress: "sub",
            timestamp: 1700000500,
            insertedAt: 1700000501,
            protocolVersion: "1",
            author: JSON.stringify({ address: "authorAddress" }),
            signature: JSON.stringify(signature),
            content: null,
            title: null,
            link: null,
            linkWidth: null,
            linkHeight: null,
            linkHtmlTagName: null,
            parentCid: null,
            previousCid: null,
            thumbnailUrl: null,
            thumbnailUrlWidth: null,
            thumbnailUrlHeight: null,
            flair: null,
            spoiler: null,
            nsfw: null,
            pendingApproval: null,
            extraProps: null
        };

        const parsed = parseCommentsTableRow(rawRow);

        expect(parsed.cid).to.equal("QmZg4TCKqKoMTVHCpQbVmGBkcGaA4vHwaC7xaoZ3nfJm8k");
        expect(parsed.content).to.be.undefined;
        expect(parsed.flair).to.be.undefined;
        expect(parsed.pendingApproval).to.be.undefined;
        expect(parsed.extraProps).to.be.undefined;
    });
});

describeSkipIfRpc(`parseDbResponses`, () => {
    it(`parses JSON strings into objects`, () => {
        const raw = {
            author:
                '{"address":"12D3KooWN5rLmRJ8fWMwTtkDN7w2RgPPGRM4mtWTnfbjpi1Sh7zR","displayName":"Mock Author - 1676110849.7439198"}'
        };
        const parsed = parseDbResponses(raw);
        expect(parsed.author).to.deep.equal({
            address: "12D3KooWN5rLmRJ8fWMwTtkDN7w2RgPPGRM4mtWTnfbjpi1Sh7zR",
            displayName: "Mock Author - 1676110849.7439198"
        });
    });

    it(`converts known boolean fields to booleans`, () => {
        const parsed = parseDbResponses({ removed: 1 });
        expect(parsed.removed).to.equal(true);
    });

    it(`parses stringified arrays`, () => {
        const parsed = parseDbResponses({ acceptedChallengeTypes: '["test"]' });
        expect(parsed.acceptedChallengeTypes).to.deep.equal(["test"]);
    });

    it(`only parses one JSON level`, () => {
        const author = {
            address: "12D3KooWL8oSq4yRKyw1cB83t9GeNcvxrDEQVkdE5F3PjBunzcVq",
            avatar: {
                address: "0x52e6cD20f5FcA56DA5a0E489574C92AF118B8188",
                chainTicker: "matic",
                id: "9842",
                signature: {
                    signature:
                        '{"domainSeparator":"plebbit-author-avatar","authorAddress":"12D3KooWJsiCyvG9mjRtWzc8TqzS7USKUrFFNs9s2AJuGqNhn9uU","timestamp":1709879936,"tokenAddress":"0x52e6cD20f5FcA56DA5a0E489574C92AF118B8188","tokenId":"9842"}',
                    type: "eip191"
                }
            }
        };
        const parsed = parseDbResponses({ author });
        expect(parsed.author.avatar.signature.signature).to.be.a("string");
    });
});
