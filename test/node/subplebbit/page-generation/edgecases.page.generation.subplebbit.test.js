import { expect } from "chai";
import { describeSkipIfRpc, mockPlebbit } from "../../../../dist/node/test/test-util.js";
import { afterEach, it, vi } from "vitest";
import { Buffer } from "buffer";
import { of as calculateIpfsCidV0Lib } from "typestub-ipfs-only-hash";
import { randomUUID } from "node:crypto";
import Logger from "@plebbit/plebbit-logger";
import * as remeda from "remeda";
import { cleanUpBeforePublishing } from "../../../../dist/node/signer/signatures.js";
import { SubplebbitIpfsSchema } from "../../../../dist/node/subplebbit/schema.js";
import { MAX_FILE_SIZE_BYTES_FOR_SUBPLEBBIT_IPFS } from "../../../../dist/node/subplebbit/subplebbit-client-manager.js";
import { calculateExpectedSignatureSize } from "../../../../dist/node/runtime/node/util.js";
import { retryKuboIpfsAddAndProvide, timestamp } from "../../../../dist/node/util.js";
import env from "../../../../dist/node/version.js";
import { stringify as deterministicStringify } from "safe-stable-stringify";

const MB = 1024 * 1024;
const MAX_COMMENT_SIZE_BYTES = 40 * 1024;
const HEAVY_COMMENT_BYTES = 10 * 1024;
const PROTOCOL_VERSION = env.PROTOCOL_VERSION;
const AUTHOR_ADDRESS = "12D3KooWLjZGiL8t2FyNZc21EMKw1SLR7U6khv4RW9sEFKD4aFXJ";
const DEFAULT_COMMENT_SIGNATURE = {
    type: "ed25519",
    signature: "sig",
    publicKey: "pk",
    signedPropertyNames: []
};
const DEFAULT_PRIMARY_CHAIN_DEPTH = 20;

// TODO we need to test loading pageCids and make sure they're all 1mib or under
// TODO need to make this test faster
describeSkipIfRpc("page-generator disables oversized preloaded pages", function () {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("A subplebbit.posts preloaded page higher than 1mib should not be published a preload, instead it send preloaded sort into pageCids", async () => {
        const context = await createSubplebbitWithDefaultDb();
        try {
            const { labelToCid, labels, rows } = await seedHeavyDiscussion(context.subplebbit, {
                primaryChainDepth: 100
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
            expect(replies, "expected replies to exist on top-level post").to.exist;
            expect(replies?.pages?.best?.comments.length).to.be.greaterThan(0);
            expect(replies?.pageCids?.best).to.be.undefined;
            expectExclusiveBestPreloadLocation(replies, "subplebbit.posts root");

            const movedDepths = logCommentsThatMovedBestPreloadToPageCids(updates, rows, "subplebbit.posts");
            expect(movedDepths, "expected two comments to move best sort to pageCids").to.deep.equal([12]);

            const preloadedSortName = "hot";
            const availablePostsSize = await calculateAvailablePostsSizeForSubplebbit(context.subplebbit);
            const generatedPosts = await context.subplebbit._pageGenerator.generateSubplebbitPosts(preloadedSortName, availablePostsSize);

            expect(generatedPosts, "expected generateSubplebbitPosts to return posts data").to.exist;
            expect(generatedPosts).to.have.property("singlePreloadedPage"); // deeper comments should've gotten folded

            const postsPages = generatedPosts;
            expect(postsPages.pageCids?.[preloadedSortName], "expected subplebbit.posts to be only a single preloaded page").to.be
                .undefined;
            expect(postsPages.pages?.[preloadedSortName], "expected subplebbit.posts to be only a single preloaded page").to.be.undefined;
        } catch (e) {
            throw e;
        } finally {
            await context.cleanup();
        }
    });

    it("A post.replies preloaded page page higher than 1mib should not be published a preload, instead it send preloaded sort into pageCids", async () => {
        const context = await createSubplebbitWithDefaultDb();
        try {
            const { labelToCid, labels, rows } = await seedHeavyDiscussion(context.subplebbit, {
                primaryChainDepth: 500,
                extraChildrenPerDepth: { 0: 1 }
            });
            const updates = await context.subplebbit._updateCommentsThatNeedToBeUpdated();
            expect(updates.length).to.be.greaterThan(0);
            expectCommentUpdatesUnderLimit(updates);

            const depthLabels = labels.depthLabels;
            const rootLabel = depthLabels[0];
            const rootCid = labelToCid.get(rootLabel);
            expect(rootCid).to.be.a("string");

            const cidToLabel = new Map(Array.from(labelToCid.entries()).map(([label, cid]) => [cid, label]));
            const postRows = rows.filter((row) => row.depth === 0);
            expect(postRows.length, "expected at least one post").to.be.greaterThan(0);

            postRows.forEach(({ cid }) => {
                const label = cidToLabel.get(cid) ?? cid;
                const postUpdate = updates.find(({ newCommentUpdate }) => newCommentUpdate.cid === cid);
                expect(postUpdate, `expected post update for ${label}`).to.exist;
                const replies = postUpdate.newCommentUpdate.replies;
                expect(replies, `expected replies on post ${label}`).to.exist;
                expect(replies?.pageCids?.best, `expected replies.pageCids.best to be undefined for post ${label}`).to.be.undefined;
                expect(replies?.pages?.best?.comments.length, `expected replies.pages.best.comments for post ${label}`).to.be.greaterThan(
                    0
                );
                expectExclusiveBestPreloadLocation(replies, `post.replies post ${label}`);
            });

            const movedDepths = logCommentsThatMovedBestPreloadToPageCids(updates, rows, "post.replies");
            expect(movedDepths, "expected at least one comment to move best sort to pageCids").to.deep.equal([
                477, 454, 431, 408, 385, 358, 325, 285, 236, 177, 105, 18
            ]);
        } catch (e) {
            throw e;
        } finally {
            await context.cleanup();
        }
    });

    it("A reply.replies preloaded page page higher than 1mib should not be published a preload, instead it send preloaded sort into pageCids", async () => {
        const context = await createSubplebbitWithDefaultDb();
        try {
            const { rows } = await seedHeavyDiscussion(context.subplebbit, {
                primaryChainDepth: 500,
                extraChildrenPerDepth: { 2: 1 }
            });
            const updates = await context.subplebbit._updateCommentsThatNeedToBeUpdated();
            expect(updates.length).to.be.greaterThan(0);
            expectCommentUpdatesUnderLimit(updates);

            const parentCidsWithChildren = new Set(rows.filter((row) => row.parentCid).map((row) => row.parentCid));
            const replyRowsWithReplies = rows.filter((row) => row.depth >= 1 && parentCidsWithChildren.has(row.cid));
            expect(replyRowsWithReplies.length, "expected at least one reply comment with replies").to.be.greaterThan(0);

            replyRowsWithReplies.forEach(({ cid, depth }) => {
                const nestedReplyUpdate = updates.find(({ newCommentUpdate }) => newCommentUpdate.cid === cid);
                expect(nestedReplyUpdate, `reply update missing for cid ${cid}`).to.exist;
                expectCommentUpdateUnderLimit(
                    nestedReplyUpdate.newCommentUpdate,
                    `comment update ${cid} (depth ${depth}) should stay under 1mib`
                );

                const replies = nestedReplyUpdate.newCommentUpdate.replies;
                expect(replies, `expected replies for depth ${depth} comment ${cid}`).to.exist;
                // we can't run expect here because we don't know for sure if preloaded moved to pageCids or stayed as a preloaded page
                expectExclusiveBestPreloadLocation(replies, `reply.replies depth ${depth} cid ${cid}`);
            });

            const movedDepths = logCommentsThatMovedBestPreloadToPageCids(updates, rows, "reply.replies");
            expect(movedDepths, "expected at least one comment to move best sort to pageCids").to.deep.equal([
                477, 454, 431, 408, 385, 358, 325, 285, 236, 177, 105, 18
            ]);
        } catch (e) {
            throw e;
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
    primaryChainDepth = DEFAULT_PRIMARY_CHAIN_DEPTH,
    extraChildrenPerDepth,
    extraRootPosts = 0,
    contentBytesPerDepth
} = {}) {
    const normalizedExtraChildren = normalizeExtraChildrenPlan(extraChildrenPerDepth, primaryChainDepth);
    const rootLabel = `edgecase-root-${randomUUID()}`;
    const depthLabels = [];
    depthLabels[0] = rootLabel;

    const trees = [
        buildTree({
            rootLabel,
            primaryChainDepth,
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
                primaryChainDepth,
                normalizedExtraChildren,
                contentBytesPerDepth
            })
        );
    }

    return { trees, labels: { depthLabels } };
}

function buildTree({ rootLabel, primaryChainDepth, normalizedExtraChildren, contentBytesPerDepth, captureDepthLabels, depthLabels }) {
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
        if (depth >= primaryChainDepth) return node;

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

function normalizeExtraChildrenPlan(extraChildrenPerDepth, primaryChainDepth) {
    const normalized = Array.from({ length: Math.max(0, primaryChainDepth) }, () => 0);
    if (!extraChildrenPerDepth) return normalized;

    const assignValue = (depth, count) => {
        if (!Number.isFinite(depth) || depth < 0 || depth >= primaryChainDepth) return;
        normalized[depth] = Math.max(0, Number(count) || 0);
    };

    if (Array.isArray(extraChildrenPerDepth)) {
        extraChildrenPerDepth.forEach((count, depth) => assignValue(depth, count));
    } else if (typeof extraChildrenPerDepth === "object") {
        Object.entries(extraChildrenPerDepth).forEach(([depthKey, count]) => assignValue(Number(depthKey), count));
    }

    return normalized;
}

async function calculateAvailablePostsSizeForSubplebbit(subplebbit) {
    const latestPost = subplebbit._dbHandler.queryLatestPostCid();
    const latestComment = subplebbit._dbHandler.queryLatestCommentCid();
    const stats = subplebbit._dbHandler.querySubplebbitStats();
    const statsCid = await calculateIpfsCidV0Lib(JSON.stringify(stats));

    const postUpdates = { postUpdates: { 86400: "QmX4Yd14J12ckSfsBjBarbMndo37oDFPNF3apF1reUhcHK" } };

    const updatedAt = timestamp();

    const baseSubplebbit = cleanUpBeforePublishing({
        ...remeda.omit(subplebbit._toJSONIpfsBaseNoPosts(), ["signature"]),
        lastPostCid: latestPost?.cid,
        lastCommentCid: latestComment?.cid,
        statsCid,
        updatedAt,
        postUpdates,
        protocolVersion: PROTOCOL_VERSION
    });

    const baseSize = Buffer.byteLength(JSON.stringify(baseSubplebbit), "utf8");
    const expectedSignatureSize = calculateExpectedSignatureSize(baseSubplebbit);
    return MAX_FILE_SIZE_BYTES_FOR_SUBPLEBBIT_IPFS - baseSize - expectedSignatureSize - 1000;
}

async function createSubplebbitWithDefaultDb() {
    // Keep the disk-backed database configuration to avoid storing large fixtures in memory.
    const plebbit = await mockPlebbit();
    const subplebbit = await plebbit.createSubplebbit();
    await subplebbit._dbHandler.initDbIfNeeded();
    await subplebbit._dbHandler.createOrMigrateTablesIfNeeded();
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

function createCommentContent(prefix, targetBytes = MAX_COMMENT_SIZE_BYTES / 2 - 512) {
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
        expectCommentUpdateUnderLimit(
            newCommentUpdate,
            `comment update ${newCommentUpdate?.cid ?? "unknown"} should stay under 1mib`,
            limitBytes
        );
    });
}

function expectCommentUpdateUnderLimit(commentUpdate, contextMessage, limitBytes = MB) {
    expect(commentUpdate, `${contextMessage} (comment update missing)`).to.exist;
    const serialized = JSON.stringify(commentUpdate);
    const sizeBytes = Buffer.byteLength(serialized, "utf8");
    expect(sizeBytes, contextMessage).to.be.lessThan(limitBytes);
    return sizeBytes;
}

function expectExclusiveBestPreloadLocation(replies, contextMessage) {
    const hasPages = Boolean(replies?.pages?.best);
    const hasPageCids = Boolean(replies?.pageCids?.best);
    const total = Number(hasPages) + Number(hasPageCids);
    expect(total, `${contextMessage} should define best preload in pages or pageCids, not both`).to.equal(1);
}

function logCommentsThatMovedBestPreloadToPageCids(updates, rows, contextLabel) {
    const cidToDepth = new Map(rows.map((row) => [row.cid, row.depth]));
    const movedComments = updates
        .map(({ newCommentUpdate }) => newCommentUpdate)
        .filter((update) => {
            const replies = update.replies;
            return Boolean(replies?.pageCids?.best) && !replies?.pages?.best;
        });

    const depths = movedComments.map(({ cid }) => cidToDepth.get(cid)).filter((depth) => typeof depth === "number");

    console.log(`${contextLabel} comments that moved best preload into pageCids (depths):`, depths);
    return depths;
}
