import { expect } from "chai";
import { describeSkipIfRpc, mockPlebbit } from "../../../../dist/node/test/test-util.js";
import { afterEach, it, vi } from "vitest";
import { PageGenerator } from "../../../../dist/node/runtime/node/subplebbit/page-generator.js";
import { DbHandler } from "../../../../dist/node/runtime/node/subplebbit/db-handler.js";
import { Buffer } from "buffer";
import { of as calculateIpfsCidV0Lib } from "typestub-ipfs-only-hash";
import { randomUUID } from "node:crypto";

const MB = 1024 * 1024;
const MAX_COMMENT_SIZE_BYTES = 40 * 1024;
const HEAVY_COMMENT_BYTES = 10 * 1024;
const PROTOCOL_VERSION = "1.0.0";
const AUTHOR_ADDRESS = "12D3KooWLjZGiL8t2FyNZc21EMKw1SLR7U6khv4RW9sEFKD4aFXJ";
const DEFAULT_COMMENT_SIGNATURE = {
    type: "ed25519",
    signature: "sig",
    publicKey: "pk",
    signedPropertyNames: []
};
const DEFAULT_CHAIN_DEPTH = 20;

describeSkipIfRpc("page-generator disables oversized preloaded pages", function () {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("A subplebbit.posts preloaded page higher than 1mib should not be published a preload, instead it send preloaded sort into pageCids", async () => {
        const context = await createInMemorySubplebbit();
        try {
            const { labelToCid, labels, rows } = await seedHeavyDiscussion(context.subplebbit, {
                chainDepth: 25,
                extraChildrenPerDepth: { 0: 400 }
            });
            const updates = await context.subplebbit._updateCommentsThatNeedToBeUpdated();
            expect(updates.length).to.be.greaterThan(0);
            expectCommentUpdatesUnderLimit(updates);

            const rootLabel = labels.depthLabels[0];
            expect(rootLabel).to.be.a("string");
            assertParentAndPostCid(rows, labelToCid, rootLabel, null, rootLabel);
            const rootCid = labelToCid.get(rootLabel);
            const rootUpdate = updates.find(({ newCommentUpdate }) => newCommentUpdate.cid === rootCid);
            expect(rootUpdate, "post update missing from _updateCommentsThatNeedToBeUpdated result").to.exist;
            expectCommentUpdateUnderLimit(rootUpdate.newCommentUpdate, "root update should stay under 1mib");

            const replies = rootUpdate.newCommentUpdate.replies;
            console.log("root replies keys", Object.keys(replies || {}));
            console.log("root pageCids", replies?.pageCids);
            expect(replies, "expected replies to exist on top-level post").to.exist;
            expect(replies?.pageCids?.best).to.be.a("string");
            expect(replies?.pages?.best?.nextCid).to.equal(replies?.pageCids?.best);
            expect(replies?.pages?.best?.comments.length).to.be.greaterThan(0);
        } finally {
            await context.cleanup();
        }
    });

    it("A post.replies preloaded page page higher than 1mib should not be published a preload, instead it send preloaded sort into pageCids", async () => {
        const context = await createInMemorySubplebbit();
        try {
            const { labelToCid, labels, rows } = await seedHeavyDiscussion(context.subplebbit, {
                chainDepth: DEFAULT_CHAIN_DEPTH,
                extraChildrenPerDepth: { 1: 220 }
            });
            const updates = await context.subplebbit._updateCommentsThatNeedToBeUpdated();
            expect(updates.length).to.be.greaterThan(0);
            expectCommentUpdatesUnderLimit(updates);

            const depthLabels = labels.depthLabels;
            const rootLabel = depthLabels[0];
            const rootCid = labelToCid.get(rootLabel);
            expect(rootCid).to.be.a("string");
            const depthOneLabel = depthLabels[1];
            assertParentAndPostCid(rows, labelToCid, depthOneLabel, depthLabels[0], rootLabel);

            const depthOneCid = labelToCid.get(depthOneLabel);
            const depthOneUpdate = updates.find(({ newCommentUpdate }) => newCommentUpdate.cid === depthOneCid);
            expect(depthOneUpdate, "expected first reply comment to have update").to.exist;
            const replies = depthOneUpdate.newCommentUpdate.replies;
            expect(replies, "expected replies on depth 1 comment").to.exist;
            expect(replies?.pageCids?.best).to.be.a("string");
            expect(replies?.pages?.best?.nextCid).to.equal(replies?.pageCids?.best);
        } finally {
            await context.cleanup();
        }
    });

    it("A reply.replies preloaded page page higher than 1mib should not be published a preload, instead it send preloaded sort into pageCids", async () => {
        const context = await createInMemorySubplebbit();
        try {
            const { labelToCid, labels, rows } = await seedHeavyDiscussion(context.subplebbit, {
                chainDepth: DEFAULT_CHAIN_DEPTH,
                extraChildrenPerDepth: { 2: 220 }
            });
            const updates = await context.subplebbit._updateCommentsThatNeedToBeUpdated();
            expect(updates.length).to.be.greaterThan(0);
            expectCommentUpdatesUnderLimit(updates);

            const depthLabels = labels.depthLabels;
            const rootLabel = depthLabels[0];
            const replyCid = labelToCid.get(depthLabels[1]);
            const nestedReplyCid = labelToCid.get(depthLabels[2]);
            expect(replyCid).to.be.a("string");
            expect(nestedReplyCid).to.be.a("string");
            assertParentAndPostCid(rows, labelToCid, depthLabels[2], depthLabels[1], rootLabel);

            const nestedReplyUpdate = updates.find(({ newCommentUpdate }) => newCommentUpdate.cid === nestedReplyCid);
            expect(nestedReplyUpdate, "nested reply update missing from _updateCommentsThatNeedToBeUpdated results").to.exist;

            const replies = nestedReplyUpdate.newCommentUpdate.replies;
            expect(replies, "expected replies for depth 2 comment").to.exist;
            expect(replies?.pageCids?.best).to.be.a("string");
            expect(replies?.pages?.best?.nextCid).to.equal(replies?.pageCids?.best);
        } finally {
            await context.cleanup();
        }
    });
});

async function seedHeavyDiscussion(subplebbit, overrides = {}) {
    const { trees, labels } = buildHeavyTreeStructure(overrides);
    const seeded = await seedSubplebbitComments(subplebbit, trees);
    return { ...seeded, labels };
}

function buildHeavyTreeStructure({
    chainDepth = DEFAULT_CHAIN_DEPTH,
    extraChildrenPerDepth,
    extraRootPosts = 0,
    contentBytesPerDepth
} = {}) {
    const normalizedExtraChildren = normalizeExtraChildrenPlan(extraChildrenPerDepth, chainDepth);
    const rootLabel = `edgecase-root-${randomUUID()}`;
    const depthLabels = [];
    depthLabels[0] = rootLabel;

    const trees = [
        buildTree({
            rootLabel,
            chainDepth,
            normalizedExtraChildren,
            contentBytesPerDepth,
            captureDepthLabels: true,
            depthLabels
        })
    ];

    for (let index = 0; index < extraRootPosts; index++) {
        trees.push(
            buildTree({
                rootLabel: `${rootLabel}-extra-${index + 1}`,
                chainDepth,
                normalizedExtraChildren,
                contentBytesPerDepth
            })
        );
    }

    return { trees, labels: { depthLabels } };
}

function buildTree({ rootLabel, chainDepth, normalizedExtraChildren, contentBytesPerDepth, captureDepthLabels, depthLabels }) {
    function bytesForDepth(depth) {
        const override = Array.isArray(contentBytesPerDepth) ? contentBytesPerDepth[depth] : undefined;
        return typeof override === "number" && override > 0 ? override : HEAVY_COMMENT_BYTES;
    }

    function buildNode(depth, label) {
        if (captureDepthLabels && depthLabels && !depthLabels[depth]) depthLabels[depth] = label;
        const node = {
            label,
            contentTargetBytes: bytesForDepth(depth)
        };
        if (depth >= chainDepth) return node;

        const children = [];
        const primaryChildLabel = captureDepthLabels ? `${depthLabels[0]}-depth-${depth + 1}` : `${label}-depth-${depth + 1}`;
        children.push(buildNode(depth + 1, primaryChildLabel));

        const extraChildrenCount = normalizedExtraChildren[depth] ?? 0;
        for (let i = 0; i < extraChildrenCount; i++) {
            children.push({
                label: `${label}-extra-depth-${depth + 1}-${i}`,
                contentTargetBytes: bytesForDepth(depth + 1)
            });
        }

        if (children.length > 0) node.children = children;
        return node;
    }

    return buildNode(0, rootLabel);
}

function normalizeExtraChildrenPlan(extraChildrenPerDepth, chainDepth) {
    const normalized = Array.from({ length: Math.max(0, chainDepth) }, () => 0);
    if (!extraChildrenPerDepth) return normalized;

    const assignValue = (depth, count) => {
        if (!Number.isFinite(depth) || depth < 0 || depth >= chainDepth) return;
        normalized[depth] = Math.max(0, Number(count) || 0);
    };

    if (Array.isArray(extraChildrenPerDepth)) {
        extraChildrenPerDepth.forEach((count, depth) => assignValue(depth, count));
    } else if (typeof extraChildrenPerDepth === "object") {
        Object.entries(extraChildrenPerDepth).forEach(([depthKey, count]) => assignValue(Number(depthKey), count));
    }

    return normalized;
}

async function createInMemorySubplebbit() {
    const plebbit = await mockPlebbit();
    disablePubsubNetworking(plebbit);
    const subplebbit = await plebbit.createSubplebbit();
    await replaceDbHandlerWithInMemory(subplebbit);
    const fakeIpfsClient = createFakeIpfsClient();
    vi.spyOn(subplebbit._clientsManager, "getDefaultKuboRpcClient").mockReturnValue({ _client: fakeIpfsClient });
    return {
        plebbit,
        subplebbit,
        cleanup: async () => {
            await subplebbit._dbHandler.destoryConnection();
            await subplebbit.delete();
            await plebbit.destroy();
        }
    };
}

function createFakeIpfsClient() {
    const noopAsync = async (..._args) => {};
    return {
        add: async (content) => {
            const size = Buffer.byteLength(content, "utf8");
            const cid = await calculateIpfsCidV0Lib(`${content.length}-${Math.random()}`);
            return { cid, path: cid, size };
        },
        pin: {
            rm: noopAsync
        },
        files: {
            rm: noopAsync
        },
        key: {
            rm: noopAsync
        },
        routing: {
            async *provide() {
                return;
            }
        }
    };
}

function disablePubsubNetworking(plebbit) {
    const stubPubsub = {
        publish: async () => {},
        subscribe: async () => {},
        unsubscribe: async () => {},
        ls: async () => [],
        peers: async () => []
    };
    Object.values(plebbit.clients?.pubsubKuboRpcClients ?? {}).forEach((client) => {
        client._client.pubsub = stubPubsub;
        client.destroy = async () => {};
    });
}

async function replaceDbHandlerWithInMemory(subplebbit) {
    const dbHandler = new DbHandler(subplebbit);
    await dbHandler.initDbIfNeeded({ filename: ":memory:", fileMustExist: false });
    await dbHandler.createOrMigrateTablesIfNeeded();
    if (subplebbit._dbHandler) await subplebbit._dbHandler.destoryConnection();
    subplebbit._dbHandler = dbHandler;
    subplebbit._pageGenerator = new PageGenerator(subplebbit);
}

async function seedSubplebbitComments(subplebbit, commentTrees) {
    if (!Array.isArray(commentTrees) || commentTrees.length === 0) throw new Error("commentTrees array is required");
    const { rows, labelToCid } = await buildCommentRowsFromTrees({
        subplebbitAddress: subplebbit.address,
        trees: commentTrees
    });
    subplebbit._dbHandler.insertComments(rows);
    return { rows, labelToCid };
}

async function buildCommentRowsFromTrees({ subplebbitAddress, trees }) {
    const rows = [];
    const labelToCid = new Map();
    let timestampCursor = Math.floor(Date.now() / 1000);

    async function traverse(node, depth, parentCid, rootCid) {
        const label = node.label ?? `node-${depth}-${rows.length}`;
        const cid = node.cid ?? (await generateRandomCid(label));
        labelToCid.set(label, cid);
        const postCid = depth === 0 ? cid : rootCid ?? parentCid ?? cid;
        const timestamp = node.timestamp ?? timestampCursor++;
        const authorSignerAddress = node.authorSignerAddress ?? `${AUTHOR_ADDRESS}-${cid}`;
        const commentRow = {
            cid,
            authorSignerAddress,
            author: node.author ?? { address: authorSignerAddress, displayName: `Author ${label}` },
            link: null,
            linkWidth: null,
            linkHeight: null,
            thumbnailUrl: null,
            thumbnailUrlWidth: null,
            thumbnailUrlHeight: null,
            parentCid: depth === 0 ? null : parentCid,
            postCid,
            previousCid: null,
            subplebbitAddress,
            content: node.content ?? createCommentContent(label, node.contentTargetBytes ?? HEAVY_COMMENT_BYTES),
            timestamp,
            signature: cloneDefaultSignature(),
            title: depth === 0 ? node.title ?? `title-${label}` : null,
            depth,
            linkHtmlTagName: null,
            flair: null,
            spoiler: null,
            pendingApproval: null,
            nsfw: null,
            extraProps: null,
            protocolVersion: PROTOCOL_VERSION,
            insertedAt: node.insertedAt ?? timestamp
        };
        rows.push(commentRow);
        const children = node.children ?? [];
        for (const child of children) {
            await traverse(child, depth + 1, cid, rootCid ?? cid);
        }
    }

    for (const tree of trees) {
        await traverse(tree, 0, null, null);
    }

    return { rows, labelToCid };
}

function createCommentContent(prefix, targetBytes = MAX_COMMENT_SIZE_BYTES - 512) {
    const unit = `${prefix}-chunk-`;
    const unitBytes = Buffer.byteLength(unit, "utf8");
    const repeat = Math.max(1, Math.floor(targetBytes / unitBytes));
    return unit.repeat(repeat);
}

async function generateRandomCid(label = "comment") {
    const seed = `${label}-${randomUUID()}-${Date.now()}`;
    return calculateIpfsCidV0Lib(seed);
}

function cloneDefaultSignature() {
    return JSON.parse(JSON.stringify(DEFAULT_COMMENT_SIGNATURE));
}

function assertParentAndPostCid(rows, labelToCid, label, parentLabel, rootLabel) {
    const cid = labelToCid.get(label);
    expect(cid, `missing cid for label ${label}`).to.be.a("string");
    const row = rows.find((entry) => entry.cid === cid);
    expect(row, `missing comment row for ${label}`).to.exist;
    const rootCid = labelToCid.get(rootLabel);
    expect(rootCid, "missing root cid").to.be.a("string");
    if (parentLabel) {
        const parentCid = labelToCid.get(parentLabel);
        expect(row.parentCid).to.equal(parentCid);
    } else {
        expect(row.parentCid).to.equal(null);
    }
    expect(row.postCid).to.equal(rootCid);
}

function expectCommentUpdatesUnderLimit(updates, limitBytes = MB) {
    updates.forEach(({ newCommentUpdate }) => {
        expectCommentUpdateUnderLimit(newCommentUpdate, `comment update ${newCommentUpdate?.cid ?? "unknown"} should stay under 1mib`, limitBytes);
    });
}

function expectCommentUpdateUnderLimit(commentUpdate, contextMessage, limitBytes = MB) {
    expect(commentUpdate, `${contextMessage} (comment update missing)`).to.exist;
    const serialized = JSON.stringify(commentUpdate);
    const sizeBytes = Buffer.byteLength(serialized, "utf8");
    expect(sizeBytes, contextMessage).to.be.lessThan(limitBytes);
    return sizeBytes;
}
