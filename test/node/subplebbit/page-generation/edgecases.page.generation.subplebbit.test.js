import { expect } from "chai";
import { describeSkipIfRpc, mockPlebbit } from "../../../../dist/node/test/test-util.js";
import { afterEach, it, vi } from "vitest";
import { of as calculateIpfsCidV0Lib } from "typestub-ipfs-only-hash";
import { randomUUID } from "node:crypto";
import * as remeda from "remeda";
import { cleanUpBeforePublishing } from "../../../../dist/node/signer/signatures.js";
import { MAX_FILE_SIZE_BYTES_FOR_SUBPLEBBIT_IPFS } from "../../../../dist/node/subplebbit/subplebbit-client-manager.js";
import { calculateExpectedSignatureSize } from "../../../../dist/node/runtime/node/util.js";
import { calculateStringSizeSameAsIpfsAddCidV0, timestamp } from "../../../../dist/node/util.js";
import env from "../../../../dist/node/version.js";

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
                primaryChainDepth: 110
            });
            const updates = await context.subplebbit._updateCommentsThatNeedToBeUpdated();
            expect(updates.length).to.equal(111); // if args to seedHeavyDiscussion changes you need to update this value
            await expectCommentUpdatesUnderLimit(updates);

            const rootLabel = labels.depthLabels[0];
            expect(rootLabel).to.be.a("string");
            assertParentAndPostCid(rows, labelToCid, rootLabel, null, rootLabel);
            const rootCid = labelToCid.get(rootLabel);
            const rootUpdate = updates.find(({ newCommentUpdate }) => newCommentUpdate.cid === rootCid);
            expect(rootUpdate, "post update missing from _updateCommentsThatNeedToBeUpdated result").to.exist;
            await expectCommentUpdateUnderLimit(rootUpdate.newCommentUpdate, "root update should stay under 1mib");

            const replies = rootUpdate.newCommentUpdate.replies;
            expect(replies, "expected replies to exist on top-level post").to.exist;
            expect(replies?.pages?.best?.comments.length).to.be.greaterThan(0);
            expect(replies?.pageCids?.best).to.be.undefined;
            expectExclusiveBestPreloadLocation(replies, "subplebbit.posts root");

            const movedDepths = logCommentsThatMovedBestPreloadToPageCids(updates, rows, "subplebbit.posts");
            expect(movedDepths, "expected two comments to move best sort to pageCids").to.deep.equal([13]);

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

    it("returns undefined when attempting to paginate an empty subplebbit", async () => {
        const context = await createSubplebbitWithDefaultDb();
        try {
            const availablePostsSize = await calculateAvailablePostsSizeForSubplebbit(context.subplebbit);
            expect(availablePostsSize, "expected available posts budget to remain positive").to.be.greaterThan(0);
            const generatedPosts = await context.subplebbit._pageGenerator.generateSubplebbitPosts("hot", availablePostsSize);
            expect(generatedPosts, "expected no pagination output when there are no posts").to.be.undefined;
        } finally {
            await context.cleanup();
        }
    });

    it("collapses subplebbit.posts hot into pageCids when the production budget is exhausted", async () => {
        const context = await createSubplebbitWithDefaultDb();
        try {
            context.subplebbit.description = "x".repeat(600 * 1024); // large metadata shrinks available posts budget
            const oversizedPostsConfig = {
                primaryChainDepth: 60,
                extraChildrenPerDepth: { 0: 320 },
                contentBytesPerDepth: Array.from({ length: 5 }, (_, depth) =>
                    depth === 1 ? MAX_COMMENT_SIZE_BYTES - 10 * 1024 : HEAVY_COMMENT_BYTES
                )
            };
            const { labelToCid, labels, rows } = await seedHeavyDiscussion(context.subplebbit, oversizedPostsConfig);
            const updates = await context.subplebbit._updateCommentsThatNeedToBeUpdated();
            expect(updates.length).to.equal(381);
            await expectCommentUpdatesUnderLimit(updates);

            const rootLabel = labels.depthLabels[0];
            expect(rootLabel).to.be.a("string");
            assertParentAndPostCid(rows, labelToCid, rootLabel, null, rootLabel);
            const rootCid = labelToCid.get(rootLabel);
            const rootUpdate = updates.find(({ newCommentUpdate }) => newCommentUpdate.cid === rootCid);
            expect(rootUpdate, "post update missing from _updateCommentsThatNeedToBeUpdated result").to.exist;
            await expectCommentUpdateUnderLimit(rootUpdate.newCommentUpdate, "root update should stay under 1mib");

            const preloadedSortName = "hot";
            const availablePostsSize = await calculateAvailablePostsSizeForSubplebbit(context.subplebbit);
            expect(availablePostsSize, "expected production budget to drop below 700kb due to oversized metadata").to.be.lessThan(0.7 * MB);
            const originalSortAndChunk = context.subplebbit._pageGenerator.sortAndChunkComments.bind(context.subplebbit._pageGenerator);
            let capturedFirstChunk;
            let chunks;
            vi.spyOn(context.subplebbit._pageGenerator, "sortAndChunkComments").mockImplementation(async (...args) => {
                chunks = await originalSortAndChunk(...args);
                if (!capturedFirstChunk) capturedFirstChunk = chunks[0];
                return chunks;
            });

            const generatedPosts = await context.subplebbit._pageGenerator.generateSubplebbitPosts(preloadedSortName, availablePostsSize);

            expect(capturedFirstChunk, "expected to capture first chunk from sortAndChunkComments").to.exist;
            const firstChunkSerializedSize = await calculateStringSizeSameAsIpfsAddCidV0(JSON.stringify({ comments: capturedFirstChunk }));
            expect(firstChunkSerializedSize, "first chunk should exceed production preloaded budget").to.be.greaterThan(availablePostsSize);

            expect(capturedFirstChunk[0].commentUpdate.replyCount).to.equal(updates.length - 1);

            expect(chunks.length).to.equal(1);

            expect(generatedPosts, "expected generateSubplebbitPosts to return posts data").to.exist;
            expect(generatedPosts).to.not.have.property("singlePreloadedPage");

            expect(generatedPosts.pageCids?.[preloadedSortName], "expected subplebbit.posts hot sort to move into pageCids").to.be.a(
                "string"
            );
            expect(generatedPosts.pages?.[preloadedSortName], "expected preloaded hot page to be omitted when oversized").to.be.undefined;
            expect(Object.keys(generatedPosts.pages || {}), "expected no preloaded posts pages to remain").to.have.length(0);
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
                primaryChainDepth: 95,
                extraPrimaryPosts: 3 // 6 posts in total with primaryChainDepth reply chain
            });
            const updates = await context.subplebbit._updateCommentsThatNeedToBeUpdated();
            expect(updates.length).to.equal(384); // if you change args above you need to change expectation
            await expectCommentUpdatesUnderLimit(updates);

            const depthLabels = labels.depthLabels;
            const rootLabel = depthLabels[0];
            const rootCid = labelToCid.get(rootLabel);
            expect(rootCid).to.be.a("string");

            const cidToLabel = new Map(Array.from(labelToCid.entries()).map(([label, cid]) => [cid, label]));
            const postRows = rows.filter((row) => row.depth === 0);
            expect(postRows.length, "expected at least one post").to.equal(4);

            for (const { cid } of postRows) {
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
            }

            const movedDepths = logCommentsThatMovedBestPreloadToPageCids(updates, rows, "post.replies");
            expect(movedDepths, "expected at least one comment to move best sort to pageCids").to.deep.equal([5, 5, 5]);
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
                primaryChainDepth: 150
            });
            const updates = await context.subplebbit._updateCommentsThatNeedToBeUpdated();
            expect(updates.length).to.equal(151);
            await expectCommentUpdatesUnderLimit(updates);

            const replyRowsWithReplies = rows.filter((row) => row.depth >= 1);
            expect(replyRowsWithReplies.length, "expected at least one reply comment with replies").to.equal(150);

            for (const { cid, depth } of replyRowsWithReplies) {
                const nestedReplyUpdate = updates.find(({ newCommentUpdate }) => newCommentUpdate.cid === cid);
                expect(nestedReplyUpdate, `reply update missing for cid ${cid}`).to.exist;
                await expectCommentUpdateUnderLimit(
                    nestedReplyUpdate.newCommentUpdate,
                    `comment update ${cid} (depth ${depth}) should stay under 1mib`
                );

                const replies = nestedReplyUpdate.newCommentUpdate.replies;
                if (nestedReplyUpdate.newCommentUpdate.replyCount > 0) {
                    expect(replies, `expected replies for depth ${depth} comment ${cid}`).to.exist;
                    // we can't run expect here because we don't know for sure if preloaded moved to pageCids or stayed as a preloaded page
                    expectExclusiveBestPreloadLocation(replies, `reply.replies depth ${depth} cid ${cid}`);
                }
            }

            const movedDepths = logCommentsThatMovedBestPreloadToPageCids(updates, rows, "reply.replies");
            expect(movedDepths, "expected at least one comment to move best sort to pageCids").to.deep.equal([62]);
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
    extraPrimaryPosts = 0,
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

    for (let index = 0; index < extraPrimaryPosts; index++) {
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

    const baseSize = await calculateStringSizeSameAsIpfsAddCidV0(JSON.stringify(baseSubplebbit));
    const expectedSignatureSize = calculateExpectedSignatureSize(baseSubplebbit);
    return 1024 * 1024 - baseSize - expectedSignatureSize - 1000;
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
            const size = await calculateStringSizeSameAsIpfsAddCidV0(content);
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
        const content = node.content ?? (await createCommentContent(label, node.contentTargetBytes ?? HEAVY_COMMENT_BYTES));
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
            content,
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

async function createCommentContent(prefix, targetBytes = MAX_COMMENT_SIZE_BYTES / 2 - 512) {
    const unit = `${prefix}-chunk-`;
    const unitBytes = await calculateStringSizeSameAsIpfsAddCidV0(unit);
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

async function expectCommentUpdatesUnderLimit(updates, limitBytes = MB) {
    for (const { newCommentUpdate } of updates) {
        await expectCommentUpdateUnderLimit(
            newCommentUpdate,
            `comment update ${newCommentUpdate?.cid ?? "unknown"} should stay under 1mib`,
            limitBytes
        );
    }
}

async function expectCommentUpdateUnderLimit(commentUpdate, contextMessage, limitBytes = MB) {
    expect(commentUpdate, `${contextMessage} (comment update missing)`).to.exist;
    const serialized = JSON.stringify(commentUpdate);
    const sizeBytes = await calculateStringSizeSameAsIpfsAddCidV0(serialized);
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
