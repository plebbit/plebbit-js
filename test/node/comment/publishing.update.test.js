import { expect } from "chai";
import { describeSkipIfRpc } from "../../../dist/node/test/test-util.js";
import signers from "../../fixtures/signers.js";
import { DbHandler } from "../../../dist/node/runtime/node/subplebbit/db-handler.js";
import { LocalSubplebbit } from "../../../dist/node/runtime/node/subplebbit/local-subplebbit.js";
import { createSigner } from "../../../dist/node/signer/index.js";
import { of as calculateIpfsCidV0Lib } from "typestub-ipfs-only-hash";

const SUBPLEBBIT_ADDRESS = signers[0].address;
const PROTOCOL_VERSION = "1.0.0";
const DEFAULT_SIGNATURE = {
    type: "ed25519",
    signature: "0xmocksignature",
    publicKey: "0xmockpublickey",
    signedPropertyNames: []
};
const depthsToTest = [1, 2, 3, 15, 30];

describeSkipIfRpc("comment.update publishing depth coverage", function () {
    depthsToTest.forEach((depth) => {
        it(`Local sub generates comment updates for replies at depth ${depth}`, async () => {
            const context = await createPublishingTestContext({ targetDepth: depth });
            try {
                const leafRow = context.rowsByDepth.get(depth);
                expect(leafRow, "Leaf comment should exist").to.exist;
                const leafResult = await context.calculateUpdate(leafRow);
                const expectedLeaf = context.expectedUpdates.get(leafRow.cid);

                expect(leafResult.newCommentUpdate.replyCount).to.equal(expectedLeaf.replyCount);
                expect(leafResult.newCommentUpdate.childCount).to.equal(expectedLeaf.childCount);
                expect(leafResult.newCommentUpdate.updatedAt).to.be.a("number");

                if (depth > 0) {
                    const parentRow = context.rowsByDepth.get(depth - 1);
                    const parentResult = await context.calculateUpdate(parentRow);
                    const expectedParent = context.expectedUpdates.get(parentRow.cid);

                    expect(parentResult.newCommentUpdate.replyCount).to.equal(expectedParent.replyCount);
                    expect(parentResult.newCommentUpdate.childCount).to.equal(expectedParent.childCount);

                    const replies = parentResult.newCommentUpdate.replies?.pages?.best?.comments || [];
                    expect(replies.map((reply) => reply.cid)).to.include(leafRow.cid);
                    expect(leafResult.localMfsPath).to.be.undefined;
                } else {
                    expect(leafResult.localMfsPath).to.be.a("string");
                }
            } finally {
                await context.cleanup();
            }
        });
    });
});

async function createPublishingTestContext({ targetDepth }) {
    const dbHandler = await createTestDbHandler();
    const { rows, childrenByParent } = await seedCommentChain({
        depth: targetDepth,
        dbHandler
    });
    const rowsByDepth = new Map(rows.map((row) => [row.depth, row]));
    const calculatedUpdates = new Map(rows.map((row) => [row.cid, dbHandler.queryCalculatedCommentUpdate(row)]));
    const pageGenerator = new MockPageGenerator(childrenByParent, calculatedUpdates);
    const signer = await createSigner();

    const fakeSub = {
        address: SUBPLEBBIT_ADDRESS,
        signer,
        _pageGenerator: pageGenerator,
        _postUpdatesBuckets: [86400, 604800, 2592000, 3153600000],
        _plebbit: { validatePages: false },
        _cidsToUnPin: new Set(),
        _mfsPathsToRemove: new Set(),
        _dbHandler: {
            queryStoredCommentUpdate: () => undefined,
            queryCalculatedCommentUpdate: (comment) => clone(calculatedUpdates.get(comment.cid))
        }
    };

    fakeSub._calculateLocalMfsPathForCommentUpdate = LocalSubplebbit.prototype._calculateLocalMfsPathForCommentUpdate.bind(fakeSub);
    fakeSub._validateCommentUpdateSignature = async () => {};

    return {
        rowsByDepth,
        expectedUpdates: calculatedUpdates,
        calculateUpdate: (commentRow) => LocalSubplebbit.prototype._calculateNewCommentUpdate.call(fakeSub, commentRow),
        cleanup: async () => {
            await dbHandler.destoryConnection();
        }
    };
}

async function createTestDbHandler() {
    const subplebbitAddress = `${SUBPLEBBIT_ADDRESS}-${Date.now()}-${Math.random()}`;
    const fakePlebbit = { noData: true };
    const fakeSubplebbit = { address: subplebbitAddress, _plebbit: fakePlebbit };
    const handler = new DbHandler(fakeSubplebbit);
    await handler.initDbIfNeeded({ filename: ":memory:", fileMustExist: false });
    await handler.createOrMigrateTablesIfNeeded();
    return handler;
}

async function seedCommentChain({ depth, dbHandler }) {
    const rows = [];
    const childrenByParent = new Map();
    const baseTimestamp = Math.floor(Date.now() / 1000);
    let rootCid;
    let previousCid = null;

    for (let curDepth = 0; curDepth <= depth; curDepth++) {
        const cid = await createMockCid(`publish-depth-${depth}-${curDepth}`);
        if (!rootCid) rootCid = cid;
        const timestamp = baseTimestamp + curDepth;
        const row = {
            cid,
            authorSignerAddress: `author-${cid}`,
            author: { address: `author-${cid}` },
            content: `content-${cid}`,
            title: curDepth === 0 ? `title-${cid}` : null,
            subplebbitAddress: SUBPLEBBIT_ADDRESS,
            timestamp,
            depth: curDepth,
            postCid: rootCid,
            parentCid: curDepth === 0 ? null : previousCid,
            signature: DEFAULT_SIGNATURE,
            protocolVersion: PROTOCOL_VERSION,
            pendingApproval: null,
            insertedAt: timestamp,
            flair: null,
            spoiler: 0,
            nsfw: 0,
            locked: 0,
            previousCid: null,
            link: null,
            linkWidth: null,
            linkHeight: null,
            thumbnailUrl: null,
            thumbnailUrlWidth: null,
            thumbnailUrlHeight: null,
            extraProps: null
        };
        dbHandler.insertComments([row]);
        rows.push(row);
        if (row.parentCid) {
            if (!childrenByParent.has(row.parentCid)) childrenByParent.set(row.parentCid, []);
            childrenByParent.get(row.parentCid).push(row);
        }
        previousCid = cid;
    }

    return { rows, childrenByParent };
}

class MockPageGenerator {
    constructor(childrenByParent, calculatedUpdates) {
        this.childrenByParent = childrenByParent;
        this.calculatedUpdates = calculatedUpdates;
    }

    async generatePostPages(comment) {
        return this._buildPagePayload(comment.cid);
    }

    async generateReplyPages(comment) {
        return this._buildPagePayload(comment.cid);
    }

    _buildPagePayload(parentCid) {
        const children = this.childrenByParent.get(parentCid);
        if (!children || children.length === 0) return undefined;
        return {
            singlePreloadedPage: {
                best: {
                    comments: children.map((childRow) => buildRepliesPageEntry(childRow, clone(this.calculatedUpdates.get(childRow.cid))))
                }
            }
        };
    }
}

function buildRepliesPageEntry(row, commentUpdate) {
    const author = buildAuthor(row.authorSignerAddress);
    const comment = buildCommentIpfsFromRow(row, author);
    const entry = {
        cid: row.cid,
        postCid: row.postCid,
        depth: row.depth,
        subplebbitAddress: row.subplebbitAddress,
        timestamp: row.timestamp,
        shortCid: row.cid.slice(0, 8),
        shortSubplebbitAddress: row.subplebbitAddress.slice(0, 8),
        author,
        original: { content: row.content },
        commentUpdate,
        raw: { comment, commentUpdate }
    };
    if (row.parentCid) entry.parentCid = row.parentCid;
    return entry;
}

function buildAuthor(address) {
    return {
        address,
        displayName: `Author-${address.slice(-4)}`,
        shortAddress: `${address.slice(0, 4)}…${address.slice(-4)}`
    };
}

function buildCommentIpfsFromRow(row, author) {
    const comment = {
        cid: row.cid,
        postCid: row.postCid,
        depth: row.depth,
        subplebbitAddress: row.subplebbitAddress,
        timestamp: row.timestamp,
        content: row.content,
        signature: DEFAULT_SIGNATURE,
        author,
        protocolVersion: PROTOCOL_VERSION,
        spoiler: false,
        nsfw: false,
        previousCid: null
    };
    if (row.parentCid) comment.parentCid = row.parentCid;
    if (row.title) comment.title = row.title;
    return comment;
}

async function createMockCid(seed) {
    return calculateIpfsCidV0Lib(`${seed}-${Date.now()}-${Math.random()}`);
}

const clone = (value) => JSON.parse(JSON.stringify(value));
