import { expect } from "chai";
import { describeSkipIfRpc } from "../../../../dist/node/test/test-util.js";
import { beforeEach, it } from "vitest";
import { PageGenerator } from "../../../../dist/node/runtime/node/subplebbit/page-generator.js";
import { PlebbitError } from "../../../../dist/node/plebbit-error.js";
import { Buffer } from "buffer";

const MB = 1024 * 1024;
const TARGET_OVERSIZED_SIZE = MB + 10 * 1024;
describeSkipIfRpc("page-generator enforces expected size limits", function () {
    let pageGenerator;

    beforeEach(() => {
        const fakeRpcClient = {
            add: async (content) => {
                const size = Buffer.byteLength(content, "utf8");
                const cid = `CID${size}`;
                return { cid, path: cid, size };
            },
            routing: {
                async *provide() {
                    return;
                }
            }
        };

        const fakeSubplebbit = {
            _clientsManager: {
                getDefaultKuboRpcClient: () => ({ _client: fakeRpcClient })
            }
        };

        pageGenerator = new PageGenerator(fakeSubplebbit);
    });

    it("throws when an active sort page exceeds the expected size threshold", async () => {
        const oversizeComment = {
            comment: {
                cid: "cid0",
                content: "x".repeat(1_048_800)
            },
            commentUpdate: {}
        };
        const nextPageComment = {
            comment: {
                cid: "cid1",
                content: "next"
            },
            commentUpdate: {}
        };

        let caughtError;
        try {
            await pageGenerator.addCommentChunksToIpfs([[oversizeComment], [nextPageComment]], "active");
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).to.be.instanceOf(PlebbitError);
        expect(caughtError.code).to.equal("ERR_PAGE_GENERATED_IS_OVER_EXPECTED_SIZE");
        expect(caughtError.details).to.include({
            sortName: "active",
            pageNum: 0
        });
        expect(caughtError.details.addRes.size).to.be.greaterThan(caughtError.details.expectedSize);
    });

    it("chunks preloaded active comments into first page larger than 1MiB and a smaller follow-up chunk", () => {
        const firstPageSizeBytes = 1.5 * MB; // mimic preloaded page allowance
        const comments = [
            {
                comment: { cid: "cid0", content: "x".repeat(1_200_000) },
                commentUpdate: {}
            },
            {
                comment: { cid: "cid1", content: "y".repeat(420_000) },
                commentUpdate: {}
            },
            {
                comment: { cid: "cid2", content: "z" },
                commentUpdate: {}
            }
        ];

        const chunks = pageGenerator._chunkComments({ comments, firstPageSizeBytes });

        expect(chunks).to.have.length(2);
        expect(chunks[0]).to.have.length(1);
        expect(chunks[1]).to.have.length(2);

        const firstChunkSize = Buffer.byteLength(JSON.stringify({ comments: chunks[0] }), "utf8");
        const secondChunkSize = Buffer.byteLength(JSON.stringify({ comments: chunks[1] }), "utf8");

        expect(firstChunkSize).to.be.greaterThan(MB);
        expect(secondChunkSize).to.be.lessThan(MB);
    });

    it("allows a single oversized comment to fill the first chunk when firstPageSizeBytes exceeds 1MiB", () => {
        const comments = [
            {
                comment: { cid: "cid0", content: "x".repeat(1_100_000) },
                commentUpdate: { replies: Array.from({ length: 48 }, (_, index) => ({ cid: `child-${index}` })) }
            }
        ];

        const chunks = pageGenerator._chunkComments({ comments, firstPageSizeBytes: 1.5 * MB });

        expect(chunks).to.have.length(1);
        const serializedSize = Buffer.byteLength(JSON.stringify({ comments: chunks[0] }), "utf8");
        expect(serializedSize).to.be.greaterThan(MB);
    });

    it("throws when generateSubplebbitPosts encounters a post with deeply nested replies that exceed the active page size limit", async () => {
        const preloadedSort = "hot";
        const { oversizedPost, secondaryPost, oversizedReplySize, oversizedReplyChunkSize } = createPostsWithDeepReplies();
        expect(oversizedReplySize).to.be.greaterThan(MB);
        expect(oversizedReplyChunkSize).to.be.greaterThan(MB);

        const fakeDbHandler = {
            queryPostsWithActiveScore: () => [oversizedPost, secondaryPost]
        };

        const fakeIpfsClient = {
            add: async (content) => {
                const size = Buffer.byteLength(content, "utf8");
                return { cid: `cid-${size}`, path: `cid-${size}`, size };
            },
            routing: {
                async *provide() {
                    return;
                }
            }
        };

        pageGenerator = new PageGenerator({
            address: "test-subplebbit",
            _dbHandler: fakeDbHandler,
            _clientsManager: {
                getDefaultKuboRpcClient: () => ({ _client: fakeIpfsClient })
            }
        });

        const preloadedPageSizeBytes = Math.max(oversizedReplyChunkSize - 32 * 1024, MB + 1);
        expect(preloadedPageSizeBytes).to.be.lessThan(oversizedReplyChunkSize);

        const previewChunk = pageGenerator._chunkComments({
            comments: [oversizedPost, secondaryPost].map(({ comment, commentUpdate }) => ({ comment, commentUpdate })),
            firstPageSizeBytes: preloadedPageSizeBytes
        });
        const previewChunkSize = Buffer.byteLength(JSON.stringify({ comments: previewChunk[0] }), "utf8");
        expect(previewChunkSize).to.be.greaterThan(MB);

        let caughtError;
        try {
            await pageGenerator.generateSubplebbitPosts(preloadedSort, preloadedPageSizeBytes);
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).to.be.instanceOf(PlebbitError);
        expect(caughtError.code).to.equal("ERR_PAGE_GENERATED_IS_OVER_EXPECTED_SIZE");
        // expect(caughtError.details).to.include({ sortName: "active" });
    });

    it("throws when generateSubplebbitPosts handles a depth-limited reply chain that still exceeds the page size", async () => {
        const subplebbitAddress = "test-subplebbit-depth-limited";
        const baseTimestamp = Math.floor(Date.now() / 1000);
        const depthLimitedReply = buildDepthLimitedChainEntry({
            parentCid: "cid-root-depth",
            parentDepth: 0,
            postCid: "cid-root-depth",
            subplebbitAddress,
            baseTimestamp,
            maxDepth: 10,
            contentRepeat: 4000
        });

        expect(depthLimitedReply.maxDepthReached).to.equal(10);
        expect(depthLimitedReply.entrySize).to.be.greaterThan(MB);
        expect(depthLimitedReply.chunkSize).to.be.greaterThan(MB);

        const oversizedPost = {
            comment: {
                cid: "cid-root-depth",
                depth: 0,
                timestamp: baseTimestamp,
                postCid: "cid-root-depth",
                parentCid: null,
                subplebbitAddress,
                content: "root-depth-content"
            },
            commentUpdate: {
                upvoteCount: 5,
                downvoteCount: 0,
                replyCount: 1,
                childCount: 1,
                protocolVersion: "1.0.0",
                signature: "signature",
                author: { address: "author-depth" },
                replies: {
                    pages: { best: { comments: [depthLimitedReply.entry] } },
                    pageCids: {}
                }
            },
            activeScore: baseTimestamp + 1000
        };

        const secondaryPost = {
            comment: {
                cid: "cid-root-depth-secondary",
                depth: 0,
                timestamp: baseTimestamp - 5,
                postCid: "cid-root-depth-secondary",
                parentCid: null,
                subplebbitAddress,
                content: "root-depth-secondary"
            },
            commentUpdate: {
                upvoteCount: 1,
                downvoteCount: 0,
                replyCount: 0,
                childCount: 0,
                protocolVersion: "1.0.0",
                signature: "signature",
                author: { address: "author-depth-secondary" }
            },
            activeScore: baseTimestamp - 5
        };

        const fakeDbHandler = {
            queryPostsWithActiveScore: () => [oversizedPost, secondaryPost]
        };

        const fakeIpfsClient = createFakeIpfsClient();
        const generator = new PageGenerator({
            address: subplebbitAddress,
            _dbHandler: fakeDbHandler,
            _clientsManager: {
                getDefaultKuboRpcClient: () => ({ _client: fakeIpfsClient })
            }
        });

        const previewChunk = generator._chunkComments({
            comments: [oversizedPost, secondaryPost].map(({ comment, commentUpdate }) => ({ comment, commentUpdate })),
            firstPageSizeBytes: depthLimitedReply.chunkSize
        });
        const previewChunkSize = Buffer.byteLength(JSON.stringify({ comments: previewChunk[0] }), "utf8");
        expect(previewChunkSize).to.be.greaterThan(MB);

        const preloadedPageSizeBytes = Math.max(depthLimitedReply.chunkSize - 32 * 1024, MB + 1);
        expect(preloadedPageSizeBytes).to.be.lessThan(depthLimitedReply.chunkSize);

        let caughtError;
        try {
            await generator.generateSubplebbitPosts("hot", preloadedPageSizeBytes);
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).to.be.instanceOf(PlebbitError);
        expect(caughtError.code).to.equal("ERR_PAGE_GENERATED_IS_OVER_EXPECTED_SIZE");
        expect(["active", "new"]).to.include(caughtError.details.sortName);
    });

    it("throws when generatePostPages processes deeply nested replies exceeding the page limit", async () => {
        const subplebbitAddress = "test-subplebbit-post";
        const parentCid = "post-root";
        const { hierarchical, flattened, oversizedReplySize, oversizedReplyChunkSize } = createRepliesDataForParent({
            parentCid,
            parentDepth: 0,
            postCid: parentCid,
            subplebbitAddress
        });
        expect(oversizedReplySize).to.be.greaterThan(MB);
        expect(oversizedReplyChunkSize).to.be.greaterThan(MB);

        const fakeDbHandler = {
            queryPageComments: () => hierarchical,
            queryFlattenedPageReplies: () => flattened
        };

        const fakeIpfsClient = createFakeIpfsClient();
        const generator = new PageGenerator({
            address: subplebbitAddress,
            _dbHandler: fakeDbHandler,
            _clientsManager: {
                getDefaultKuboRpcClient: () => ({ _client: fakeIpfsClient })
            }
        });

        const previewChunk = generator._chunkComments({ comments: hierarchical, firstPageSizeBytes: oversizedReplyChunkSize - 32 * 1024 });
        const previewChunkSize = Buffer.byteLength(JSON.stringify({ comments: previewChunk[0] }), "utf8");
        expect(previewChunkSize).to.be.greaterThan(MB);

        let caughtError;
        try {
            await generator.generatePostPages({ cid: parentCid }, "best", oversizedReplyChunkSize - 32 * 1024);
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).to.be.instanceOf(PlebbitError);
        expect(caughtError.code).to.equal("ERR_PAGE_GENERATED_IS_OVER_EXPECTED_SIZE");
        expect(["new", "old", "newFlat", "oldFlat"]).to.include(caughtError.details.sortName);
    });

    it("throws when generateReplyPages processes deeply nested replies exceeding the page limit", async () => {
        const subplebbitAddress = "test-subplebbit-reply";
        const postCid = "post-root";
        const parentComment = { cid: "reply-parent", depth: 1 };
        const { hierarchical, flattened, oversizedReplySize, oversizedReplyChunkSize } = createRepliesDataForParent({
            parentCid: parentComment.cid,
            parentDepth: parentComment.depth,
            postCid,
            subplebbitAddress
        });
        expect(oversizedReplySize).to.be.greaterThan(MB);
        expect(oversizedReplyChunkSize).to.be.greaterThan(MB);

        const fakeDbHandler = {
            queryPageComments: () => hierarchical,
            queryFlattenedPageReplies: () => flattened
        };

        const fakeIpfsClient = createFakeIpfsClient();
        const generator = new PageGenerator({
            address: subplebbitAddress,
            _dbHandler: fakeDbHandler,
            _clientsManager: {
                getDefaultKuboRpcClient: () => ({ _client: fakeIpfsClient })
            }
        });

        const previewChunk = generator._chunkComments({ comments: hierarchical, firstPageSizeBytes: oversizedReplyChunkSize - 32 * 1024 });
        const previewChunkSize = Buffer.byteLength(JSON.stringify({ comments: previewChunk[0] }), "utf8");
        expect(previewChunkSize).to.be.greaterThan(MB);

        let caughtError;
        try {
            await generator.generateReplyPages(parentComment, "best", oversizedReplyChunkSize - 32 * 1024);
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).to.be.instanceOf(PlebbitError);
        expect(caughtError.code).to.equal("ERR_PAGE_GENERATED_IS_OVER_EXPECTED_SIZE");
        expect(["new", "old"]).to.include(caughtError.details.sortName);
    });

    it("throws when generateModQueuePages encounters an oversized pending comment", async () => {
        const fakeDbHandler = {
            queryCommentsPendingApproval: () => [{ cid: "pending-cid" }]
        };
        const fakeIpfsClient = createFakeIpfsClient();
        const generator = new PageGenerator({
            address: "test-subplebbit-modqueue",
            _dbHandler: fakeDbHandler,
            _clientsManager: {
                getDefaultKuboRpcClient: () => ({ _client: fakeIpfsClient })
            }
        });

        const { entry: oversizedPending, chunkSize: modQueueChunkSize, entrySize: modQueueEntrySize } = createOversizedModQueueEntry();
        expect(modQueueEntrySize).to.be.greaterThan(MB);
        expect(modQueueChunkSize).to.be.greaterThan(MB);
        generator._bundleLatestCommentUpdateWithQueuedComments = async () => oversizedPending;

        let caughtError;
        try {
            await generator.generateModQueuePages();
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).to.be.instanceOf(PlebbitError);
        expect(caughtError.code).to.equal("ERR_PAGE_GENERATED_IS_OVER_EXPECTED_SIZE");
        expect(caughtError.details).to.include({ sortName: "pendingApproval" });
    });
});

function createFakeIpfsClient() {
    return {
        add: async (content) => {
            const size = Buffer.byteLength(content, "utf8");
            return { cid: `cid-${size}`, path: `cid-${size}`, size };
        },
        routing: {
            async *provide() {
                return;
            }
        }
    };
}

function createPostsWithDeepReplies() {
    const subplebbitAddress = "test-subplebbit";
    const baseTimestamp = Math.floor(Date.now() / 1000);

    const oversizedReply = buildReplyEntryMeetingSize({
        parentCid: "cid-root-primary",
        parentDepth: 0,
        postCid: "cid-root-primary",
        subplebbitAddress,
        baseTimestamp
    });

    const secondaryReply = buildHeavyReplyEntry({
        parentCid: "cid-root-secondary",
        parentDepth: 0,
        postCid: "cid-root-secondary",
        subplebbitAddress,
        baseTimestamp: baseTimestamp + 10,
        nestedCount: 5,
        nestedContentRepeat: 200,
        replySuffix: "light"
    }).topLevelReply;

    const oversizedPost = {
        comment: {
            cid: "cid-root-primary",
            depth: 0,
            timestamp: baseTimestamp,
            postCid: "cid-root-primary",
            parentCid: null,
            subplebbitAddress,
            content: "root-content-primary"
        },
        commentUpdate: {
            upvoteCount: 10,
            downvoteCount: 0,
            replyCount: 1,
            childCount: 1,
            protocolVersion: "1.0.0",
            signature: "signature",
            author: { address: "author-primary" },
            replies: {
                pages: { best: { comments: [oversizedReply.entry] } },
                pageCids: {}
            }
        },
        activeScore: baseTimestamp + 1000
    };

    const secondaryPost = {
        comment: {
            cid: "cid-root-secondary",
            depth: 0,
            timestamp: baseTimestamp + 10,
            postCid: "cid-root-secondary",
            parentCid: null,
            subplebbitAddress,
            content: "root-content-secondary"
        },
        commentUpdate: {
            upvoteCount: 8,
            downvoteCount: 0,
            replyCount: 1,
            childCount: 1,
            protocolVersion: "1.0.0",
            signature: "signature",
            author: { address: "author-secondary" },
            replies: {
                pages: { best: { comments: [secondaryReply] } },
                pageCids: {}
            }
        },
        activeScore: baseTimestamp + 900
    };

    return {
        oversizedPost,
        secondaryPost,
        oversizedReplySize: oversizedReply.entrySize,
        oversizedReplyChunkSize: oversizedReply.chunkSize
    };
}

function createRepliesDataForParent({ parentCid, parentDepth, postCid, subplebbitAddress }) {
    const baseTimestamp = Math.floor(Date.now() / 1000);
    const oversized = buildReplyEntryMeetingSize({
        parentCid,
        parentDepth,
        postCid,
        subplebbitAddress,
        baseTimestamp
    });
    const secondary = buildHeavyReplyEntry({
        parentCid,
        parentDepth,
        postCid,
        subplebbitAddress,
        baseTimestamp: baseTimestamp + 5,
        nestedCount: 5,
        nestedContentRepeat: 200,
        replySuffix: "light"
    }).topLevelReply;

    const hierarchical = [oversized.entry, secondary];
    const flattened = flattenHierarchicalComments(hierarchical);

    return {
        hierarchical,
        flattened,
        oversizedReplySize: oversized.entrySize,
        oversizedReplyChunkSize: oversized.chunkSize
    };
}

function createOversizedModQueueEntry(minSizeBytes = TARGET_OVERSIZED_SIZE) {
    const cid = "pending-cid";
    const timestamp = Math.floor(Date.now() / 1000);
    let repeat = 20000;
    let entry;
    let entrySize = 0;
    let chunkSize = 0;
    let attempts = 0;

    while (chunkSize < minSizeBytes) {
        entry = {
            comment: {
                cid,
                postCid: cid,
                parentCid: null,
                subplebbitAddress: "test-subplebbit-modqueue",
                timestamp,
                depth: 0,
                content: "modqueue-entry-".repeat(repeat)
            },
            commentUpdate: {
                cid,
                protocolVersion: "1.0.0",
                signature: { type: "ed25519", signature: "sig", publicKey: "pk", signedPropertyNames: [] },
                pendingApproval: true
            }
        };
        entrySize = Buffer.byteLength(JSON.stringify(entry), "utf8");
        chunkSize = Buffer.byteLength(JSON.stringify({ comments: [entry] }), "utf8");
        repeat += 5000;
        attempts += 1;
        if (attempts > 20) throw Error("Failed to build oversized mod queue entry");
    }

    return { entry, chunkSize, entrySize };
}

function buildReplyEntryMeetingSize({
    parentCid,
    parentDepth,
    postCid,
    subplebbitAddress,
    baseTimestamp,
    minSizeBytes = TARGET_OVERSIZED_SIZE,
    replySuffix = "oversized"
}) {
    let nestedCount = 20;
    let nestedContentRepeat = 1500;
    let attempts = 0;

    while (attempts < 50) {
        const { topLevelReply } = buildHeavyReplyEntry({
            parentCid,
            parentDepth,
            postCid,
            subplebbitAddress,
            baseTimestamp,
            nestedCount,
            nestedContentRepeat,
            replySuffix
        });

        const entrySize = Buffer.byteLength(JSON.stringify(topLevelReply), "utf8");
        const chunkSize = Buffer.byteLength(JSON.stringify({ comments: [topLevelReply] }), "utf8");
        if (chunkSize >= minSizeBytes) return { entry: topLevelReply, entrySize, chunkSize };

        nestedCount += 10;
        if (nestedCount > 120) {
            nestedCount = 40;
            nestedContentRepeat += 300;
        }
        attempts += 1;
    }

    throw Error(`Failed to build reply entry meeting size ${minSizeBytes}`);
}

function buildDepthLimitedChainEntry({
    parentCid,
    parentDepth,
    postCid,
    subplebbitAddress,
    baseTimestamp,
    maxDepth = 10,
    minSizeBytes = TARGET_OVERSIZED_SIZE
}) {
    let contentRepeat = 4000;
    let attempts = 0;

    while (attempts < 50) {
        let timestampCursor = baseTimestamp;

        function buildLevel(currentDepth) {
            const cid = `${parentCid}-chain-depth-${currentDepth}`;
            const comment = {
                cid,
                depth: parentDepth + currentDepth,
                timestamp: timestampCursor,
                parentCid: currentDepth === 1 ? parentCid : `${parentCid}-chain-depth-${currentDepth - 1}`,
                postCid,
                subplebbitAddress,
                content: "chain-depth-content-".repeat(contentRepeat)
            };

            const commentUpdate = {
                upvoteCount: 0,
                downvoteCount: 0,
                replyCount: 0,
                childCount: 0,
                protocolVersion: "1.0.0",
                signature: "signature",
                author: { address: `author-${cid}` }
            };

            timestampCursor += 1;

            if (currentDepth < maxDepth) {
                const child = buildLevel(currentDepth + 1);
                commentUpdate.replyCount = 1;
                commentUpdate.childCount = 1;
                commentUpdate.replies = {
                    pages: { best: { comments: [child.entry] } },
                    pageCids: {}
                };
                return {
                    entry: { comment, commentUpdate },
                    maxDepthReached: child.maxDepthReached
                };
            }

            return { entry: { comment, commentUpdate }, maxDepthReached: comment.depth };
        }

        const built = buildLevel(1);
        const entrySize = Buffer.byteLength(JSON.stringify(built.entry), "utf8");
        const chunkSize = Buffer.byteLength(JSON.stringify({ comments: [built.entry] }), "utf8");

        if (chunkSize >= minSizeBytes) return { entry: built.entry, entrySize, chunkSize, maxDepthReached: built.maxDepthReached };

        contentRepeat += 500;
        attempts += 1;
    }

    throw Error(`Failed to build depth-limited reply entry meeting size ${minSizeBytes}`);
}

function buildHeavyReplyEntry({
    parentCid,
    parentDepth,
    postCid,
    subplebbitAddress,
    baseTimestamp,
    nestedCount = 50,
    nestedContentRepeat = 3000,
    replySuffix = "heavy"
}) {
    const topReplyCid = `${parentCid}-reply-${replySuffix}`;
    const nestedComments = Array.from({ length: nestedCount }, (_, index) => {
        const childCid = `${topReplyCid}-child-${index}`;
        return {
            comment: {
                cid: childCid,
                depth: parentDepth + 2,
                timestamp: baseTimestamp + index + 1,
                parentCid: topReplyCid,
                postCid,
                subplebbitAddress,
                content: "nested-reply-".repeat(nestedContentRepeat)
            },
            commentUpdate: {
                upvoteCount: 0,
                downvoteCount: 0,
                replyCount: 0,
                childCount: 0,
                protocolVersion: "1.0.0",
                signature: "signature",
                author: { address: `author-${childCid}` }
            }
        };
    });

    const topLevelReply = {
        comment: {
            cid: topReplyCid,
            depth: parentDepth + 1,
            timestamp: baseTimestamp,
            parentCid,
            postCid,
            subplebbitAddress,
            content: "heavy-reply"
        },
        commentUpdate: {
            upvoteCount: 0,
            downvoteCount: 0,
            replyCount: nestedComments.length,
            childCount: nestedComments.length,
            protocolVersion: "1.0.0",
            signature: "signature",
            author: { address: `author-${topReplyCid}` },
            replies: {
                pages: { best: { comments: nestedComments } },
                pageCids: {}
            }
        }
    };

    return { topLevelReply, nestedComments };
}

function flattenHierarchicalComments(hierarchical) {
    const queue = [...hierarchical];
    const flattened = [];

    while (queue.length > 0) {
        const entry = queue.shift();
        const nextEntry = {
            comment: entry.comment,
            commentUpdate: { ...entry.commentUpdate }
        };

        const nestedReplies = entry.commentUpdate.replies?.pages?.best?.comments ?? [];
        if (nestedReplies.length > 0) {
            queue.push(...nestedReplies);
            delete nextEntry.commentUpdate.replies;
        }

        flattened.push(nextEntry);
    }

    return flattened;
}
