import { expect } from "chai";
import { describeSkipIfRpc, resolveWhenConditionIsTrue } from "../../../dist/node/test/test-util.js";
import signers from "../../fixtures/signers.js";
import { Comment } from "../../../dist/node/publications/comment/comment.js";
import { of as calculateIpfsCidV0Lib } from "typestub-ipfs-only-hash";
import { EventEmitter } from "events";

const SUBPLEBBIT_ADDRESS = signers[0].address;
const PROTOCOL_VERSION = "1";
const DEFAULT_SIGNATURE = {
    type: "ed25519",
    signature: "0xmocksignature",
    publicKey: "0xmockpublickey",
    signedPropertyNames: []
};
const clone = (value) => JSON.parse(JSON.stringify(value));

class MockPlebbit extends EventEmitter {
    constructor() {
        super();
        this.clients = {
            kuboRpcClients: {},
            plebbitRpcClients: {},
            ipfsGateways: {},
            pubsubKuboRpcClients: {},
            libp2pJsClients: {}
        };
        this.chainProviders = {};
        this.resolveAuthorAddresses = false;
        this.validatePages = false;
        this.updateInterval = 50;
        this._storage = { getItem: async () => undefined, setItem: async () => undefined };
        this._memCaches = {
            subplebbitForPublishing: {
                get: () => undefined,
                has: () => false,
                set: () => undefined
            }
        };
        this._timeouts = { "comment-ipfs": 1000 };
        this._updatingComments = {};
        this._updatingSubplebbits = {};
        this._startedSubplebbits = {};
    }
}

class MockCommentDb {
    constructor(subplebbitAddress) {
        this.subplebbitAddress = subplebbitAddress;
        this.comments = new Map();
        this.commentUpdates = new Map();
        this._pageCounter = 0;
    }

    insertComment(row) {
        this.comments.set(row.cid, row);
        return row;
    }

    insertCommentUpdate(row) {
        this.commentUpdates.set(row.cid, row);
        return row;
    }

    getComment(cid) {
        return this.comments.get(cid);
    }

    getCommentUpdate(cid) {
        return this.commentUpdates.get(cid);
    }

    getChildren(parentCid) {
        return [...this.comments.values()].filter((comment) => comment.parentCid === parentCid);
    }

    async createRepliesPage(parentCid) {
        const children = this.getChildren(parentCid).sort((a, b) => b.timestamp - a.timestamp);
        const pageCid = await createMockCid(`page-${parentCid}-${this._pageCounter++}`);
        return {
            pageCid,
            page: {
                comments: children.map((child) => this._asRepliesPageEntry(child)),
                nextCid: undefined
            }
        };
    }

    _asRepliesPageEntry(commentRow) {
        const commentUpdate = clone(this.commentUpdates.get(commentRow.cid));
        if (!commentUpdate) throw new Error(`Missing commentUpdate for ${commentRow.cid}`);

        return {
            cid: commentRow.cid,
            parentCid: commentRow.parentCid,
            postCid: commentRow.postCid,
            depth: commentRow.depth,
            subplebbitAddress: commentRow.subplebbitAddress,
            timestamp: commentRow.timestamp,
            shortCid: commentRow.cid.slice(0, 8),
            shortSubplebbitAddress: commentRow.subplebbitAddress.slice(0, 8),
            author: buildAuthor(commentRow.authorAddress),
            original: { content: commentRow.content },
            commentUpdate,
            replyCount: commentUpdate.replyCount,
            childCount: commentUpdate.childCount,
            upvoteCount: commentUpdate.upvoteCount,
            downvoteCount: commentUpdate.downvoteCount,
            raw: {
                comment: buildCommentIpfsFromRow(commentRow),
                commentUpdate
            }
        };
    }
}

function buildAuthor(address) {
    return {
        address,
        displayName: `Author-${address.slice(-4)}`,
        shortAddress: `${address.slice(0, 4)}…${address.slice(-4)}`
    };
}

function buildAuthorForIpfs(address) {
    return {
        address,
        displayName: `Author-${address.slice(-4)}`
    };
}

function buildCommentIpfsFromRow(row) {
    return {
        cid: row.cid,
        parentCid: row.parentCid ?? undefined,
        postCid: row.postCid,
        depth: row.depth,
        subplebbitAddress: row.subplebbitAddress,
        timestamp: row.timestamp,
        content: row.content,
        title: row.title,
        previousCid: null,
        link: undefined,
        linkWidth: undefined,
        linkHeight: undefined,
        thumbnailUrl: undefined,
        thumbnailUrlWidth: undefined,
        thumbnailUrlHeight: undefined,
        author: buildAuthorForIpfs(row.authorAddress),
        signature: DEFAULT_SIGNATURE,
        protocolVersion: PROTOCOL_VERSION,
        flair: undefined,
        spoiler: false,
        nsfw: false,
        pendingApproval: undefined
    };
}

async function createMockCid(seed) {
    return calculateIpfsCidV0Lib(`${seed}-${Date.now()}-${Math.random()}`);
}

async function seedCommentTree({ replyDepth }) {
    const db = new MockCommentDb(SUBPLEBBIT_ADDRESS);
    const baseTimestamp = Math.floor(Date.now() / 1000);
    let rootCid;
    let previousCid = null;

    for (let depth = 0; depth <= replyDepth; depth++) {
        const cid = await createMockCid(`comment-depth-${replyDepth}-${depth}`);
        if (!rootCid) rootCid = cid;
        const commentRow = db.insertComment({
            cid,
            depth,
            parentCid: depth === 0 ? null : previousCid,
            postCid: rootCid,
            subplebbitAddress: SUBPLEBBIT_ADDRESS,
            timestamp: baseTimestamp + depth * 10,
            authorAddress: signers[depth % signers.length].address,
            content: `content-depth-${depth}`,
            title: depth === 0 ? `Title depth ${depth}` : undefined,
            protocolVersion: PROTOCOL_VERSION
        });

        db.insertCommentUpdate({
            cid,
            updatedAt: commentRow.timestamp + 50,
            replyCount: depth === replyDepth ? 0 : 1,
            childCount: depth === replyDepth ? 0 : 1,
            upvoteCount: 0,
            downvoteCount: 0,
            author: {
                subplebbit: {
                    postScore: 0,
                    replyScore: 0,
                    firstCommentTimestamp: commentRow.timestamp,
                    lastCommentCid: cid
                }
            },
            signature: DEFAULT_SIGNATURE,
            protocolVersion: PROTOCOL_VERSION,
            lastChildCid: null,
            lastReplyTimestamp: commentRow.timestamp + 20
        });

        previousCid = cid;
    }

    const rows = [...db.comments.values()].sort((a, b) => a.depth - b.depth);
    const parentRow = rows.find((row) => row.depth === Math.max(replyDepth - 1, 0));
    const replyRow = rows.find((row) => row.depth === replyDepth);
    if (!parentRow || !replyRow) throw new Error("Failed to seed comment tree");

    return { db, parentRow, replyRow };
}

async function createMockedDepthContext({ replyDepth, parentState }) {
    const plebbit = new MockPlebbit();
    const { db, parentRow, replyRow } = await seedCommentTree({ replyDepth });

    const parentComment = new Comment(plebbit);
    parentComment.setCid(parentRow.cid);
    parentComment._initIpfsProps(buildCommentIpfsFromRow(parentRow));
    parentComment.raw.commentUpdate = clone(db.getCommentUpdate(parentRow.cid));
    parentComment.updatedAt = parentComment.raw.commentUpdate.updatedAt;

    const { pageCid, page } = await db.createRepliesPage(parentRow.cid);
    const repliesStore = new Map([[pageCid, page]]);
    parentComment.replies.pageCids = { new: pageCid, old: pageCid };
    parentComment.replies.pages = {};
    parentComment.replies._subplebbit = { address: SUBPLEBBIT_ADDRESS, signature: DEFAULT_SIGNATURE };
    parentComment.replies.getPage = async (cid) => {
        const stored = repliesStore.get(cid);
        if (!stored) throw new Error(`Missing page for ${cid}`);
        return stored;
    };
    let updateCalls = 0;
    parentComment.update = async () => {
        updateCalls++;
        parentComment._setStateWithEmission("updating");
        parentComment.updatedAt = parentComment.raw.commentUpdate.updatedAt;
    };
    parentComment.stop = async () => parentComment._setStateWithEmission("stopped");
    parentComment._setStateWithEmission(parentState);
    plebbit._updatingComments[parentComment.cid] = parentComment;

    const replyComment = new Comment(plebbit);
    replyComment.setCid(replyRow.cid);
    replyComment._initIpfsProps(buildCommentIpfsFromRow(replyRow));
    replyComment._setStateWithEmission("updating");
    const freshUpdate = clone(db.getCommentUpdate(replyRow.cid));
    const staleUpdate = clone(freshUpdate);
    staleUpdate.updatedAt -= 25;
    replyComment.raw.commentUpdate = staleUpdate;
    replyComment.updatedAt = staleUpdate.updatedAt;
    plebbit._updatingComments[replyComment.cid] = replyComment;

    return {
        plebbit,
        parentComment,
        replyComment,
        expectedUpdatedAt: freshUpdate.updatedAt,
        parentUpdateCalls: () => updateCalls,
        cleanup: () => {
            delete plebbit._updatingComments[parentComment.cid];
            delete plebbit._updatingComments[replyComment.cid];
        }
    };
}

describeSkipIfRpc("comment.update loading depth coverage", function () {
    const depthsToTest = [1, 2, 3, 15, 30, 45, 70];

    depthsToTest.forEach((replyDepth) => {
        it(`Reply depth ${replyDepth} pulls updates when parent was stopped`, async () => {
            const context = await createMockedDepthContext({ replyDepth, parentState: "stopped" });
            try {
                await context.replyComment._clientsManager.usePageCidsOfParentToFetchCommentUpdateForReply(context.parentComment);
                await resolveWhenConditionIsTrue({
                    toUpdate: context.replyComment,
                    predicate: () =>
                        typeof context.replyComment.updatedAt === "number" && context.replyComment.updatedAt >= context.expectedUpdatedAt
                });
                expect(context.replyComment.updatedAt).to.equal(context.expectedUpdatedAt);
                expect(context.parentUpdateCalls()).to.equal(1);
                expect(context.replyComment._commentUpdateIpfsPath).to.be.undefined;
                const updatingReply = context.plebbit._updatingComments[context.replyComment.cid];
                expect(updatingReply._clientsManager._parentFirstPageCidsAlreadyLoaded.size).to.be.greaterThan(0);
            } finally {
                context.cleanup();
            }
        });

        it(`Reply depth ${replyDepth} pulls updates while parent keeps updating`, async () => {
            const context = await createMockedDepthContext({ replyDepth, parentState: "updating" });
            try {
                await context.replyComment._clientsManager.usePageCidsOfParentToFetchCommentUpdateForReply(context.parentComment);
                await resolveWhenConditionIsTrue({
                    toUpdate: context.replyComment,
                    predicate: () => context.replyComment.updatedAt === context.expectedUpdatedAt
                });
                expect(context.parentUpdateCalls()).to.equal(0);
                expect(context.replyComment.updatedAt).to.equal(context.expectedUpdatedAt);
                expect(context.parentComment.state).to.equal("updating");
                const updatingReply = context.plebbit._updatingComments[context.replyComment.cid];
                expect(updatingReply._clientsManager._parentFirstPageCidsAlreadyLoaded.size).to.be.greaterThan(0);
            } finally {
                context.cleanup();
            }
        });
    });
});
