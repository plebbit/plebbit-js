import { expect } from "chai";
import { describeSkipIfRpc } from "../../../../dist/node/test/test-util.js";
import { afterEach, beforeEach, it, vi } from "vitest";
import { PageGenerator } from "../../../../dist/node/runtime/node/subplebbit/page-generator.js";
import { PlebbitError } from "../../../../dist/node/plebbit-error.js";
import { Buffer } from "buffer";

const MB = 1024 * 1024;
const TARGET_OVERSIZED_SIZE = MB + 10 * 1024;
const MAX_COMMENT_SIZE_BYTES = 40 * 1024;

function createCommentContent(prefix, targetBytes = MAX_COMMENT_SIZE_BYTES - 512) {
    const unit = `${prefix}-chunk-`;
    const unitBytes = Buffer.byteLength(unit, "utf8");
    const repeat = Math.max(1, Math.floor(targetBytes / unitBytes));
    return unit.repeat(repeat);
}

function repeatWithinCommentLimit(base, desiredRepeat) {
    const baseBytes = Buffer.byteLength(base, "utf8");
    const maxRepeat = Math.max(1, Math.floor(MAX_COMMENT_SIZE_BYTES / baseBytes));
    const repeat = Math.max(1, Math.min(desiredRepeat, maxRepeat));
    return base.repeat(repeat);
}
describeSkipIfRpc("page-generator enforces expected size limits", function () {
    let pageGenerator;

    beforeEach(() => {
        const fakeRpcClient = {
            add: async (content) => {
                const size = Buffer.byteLength(content, "utf8");
                const cid = "QmbKFFGL9EMwdMVrkJUqz2yQAorzUBExchK1qogsU8BJ7e"; // random CID
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

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("throws when generateSubplebbitPosts attempts to publish an oversized active page", async () => {
        const { oversizedPost, secondaryPost } = createPostsWithDeepReplies();
        const fakeDbHandler = {
            queryPostsWithActiveScore: () => [oversizedPost, secondaryPost]
        };

        pageGenerator = new PageGenerator({
            address: oversizedPost.comment.subplebbitAddress,
            _dbHandler: fakeDbHandler,
            _clientsManager: {
                getDefaultKuboRpcClient: () => ({ _client: createFakeIpfsClient() })
            }
        });

        let caughtError;
        try {
            await pageGenerator.generateSubplebbitPosts("hot", MB);
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).to.be.instanceOf(PlebbitError);
        expect(caughtError.code).to.equal("ERR_PAGE_GENERATED_IS_OVER_EXPECTED_SIZE");
        expect(["active", "new"]).to.include(caughtError.details.sortName);
        expect(caughtError.details.pageNum).to.equal(0);
        expect(caughtError.details.addRes.size).to.be.greaterThan(caughtError.details.expectedSize);
    });

    it("chunks preloaded active comments into first page larger than 1MiB and a smaller follow-up chunk", async () => {
        const subplebbitAddress = "test-subplebbit-preloaded";
        const { oversizedPost, secondaryPost } = createPostsWithDeepReplies();
        const thirdPost = createBasicPostEntry({
            cid: "cid2",
            timestamp: oversizedPost.comment.timestamp - 5,
            subplebbitAddress,
            activeScore: oversizedPost.activeScore - 5
        });
        const rawPosts = [oversizedPost, secondaryPost, thirdPost];
        const singleOversizedChunk = Buffer.byteLength(JSON.stringify({ comments: [oversizedPost] }), "utf8");
        const firstTwoChunk = Buffer.byteLength(JSON.stringify({ comments: [oversizedPost, secondaryPost] }), "utf8");
        const firstPageSizeBytes = Math.max(MB + 1, Math.min(singleOversizedChunk + 64 * 1024, firstTwoChunk - 1024));

        const fakeDbHandler = {
            queryPostsWithActiveScore: () => rawPosts
        };

        pageGenerator = new PageGenerator({
            address: subplebbitAddress,
            _dbHandler: fakeDbHandler,
            _clientsManager: {
                getDefaultKuboRpcClient: () => ({ _client: createFakeIpfsClient() })
            }
        });

        const originalAddPreloaded = pageGenerator.addPreloadedCommentChunksToIpfs.bind(pageGenerator);
        let capturedChunks;
        vi.spyOn(pageGenerator, "addPreloadedCommentChunksToIpfs").mockImplementation(async (chunks, sortName) => {
            capturedChunks = chunks;
            return originalAddPreloaded(chunks, sortName);
        });
        vi.spyOn(pageGenerator, "sortChunkAddIpfsNonPreloaded").mockResolvedValue(undefined);

        await pageGenerator.generateSubplebbitPosts("hot", firstPageSizeBytes);

        expect(capturedChunks).to.exist;
        expect(capturedChunks).to.have.length(2);
        expect(capturedChunks[0]).to.have.length(1);
        expect(capturedChunks[1]).to.have.length(2);

        const firstChunkSize = Buffer.byteLength(JSON.stringify({ comments: capturedChunks[0] }), "utf8");
        const secondChunkSize = Buffer.byteLength(JSON.stringify({ comments: capturedChunks[1] }), "utf8");

        expect(firstChunkSize).to.be.greaterThan(MB);
        expect(secondChunkSize).to.be.lessThan(MB);
    });

    it("allows a single oversized comment to fill the first chunk when firstPageSizeBytes exceeds 1MiB", async () => {
        const { oversizedPost } = createPostsWithDeepReplies();
        const subplebbitAddress = oversizedPost.comment.subplebbitAddress;
        const rawPosts = [oversizedPost];

        const fakeDbHandler = {
            queryPostsWithActiveScore: () => rawPosts
        };

        pageGenerator = new PageGenerator({
            address: subplebbitAddress,
            _dbHandler: fakeDbHandler,
            _clientsManager: {
                getDefaultKuboRpcClient: () => ({ _client: createFakeIpfsClient() })
            }
        });

        const result = await pageGenerator.generateSubplebbitPosts("hot", 1.5 * MB);

        expect(result).to.have.property("singlePreloadedPage");
        const firstPage = result.singlePreloadedPage.hot;
        expect(firstPage.comments).to.have.length(1);
        const serializedSize = Buffer.byteLength(JSON.stringify({ comments: firstPage.comments }), "utf8");
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

    it("throws when generatePostPages handles depth-limited replies that exceed the page size", async () => {
        const subplebbitAddress = "test-subplebbit-post-depth-limited";
        const parentCid = "post-depth-parent";
        const { hierarchical, flattened, depthLimitedEntrySize, depthLimitedChunkSize } = createDepthLimitedRepliesDataForParent({
            parentCid,
            parentDepth: 0,
            postCid: parentCid,
            subplebbitAddress
        });

        expect(depthLimitedEntrySize).to.be.greaterThan(MB);
        expect(depthLimitedChunkSize).to.be.greaterThan(MB);

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

        const firstPageSizeBytes = Math.max(depthLimitedChunkSize - 32 * 1024, MB + 1);
        const previewChunk = generator._chunkComments({ comments: hierarchical, firstPageSizeBytes });
        const previewChunkSize = Buffer.byteLength(JSON.stringify({ comments: previewChunk[0] }), "utf8");
        expect(previewChunkSize).to.be.greaterThan(MB);

        let caughtError;
        try {
            await generator.generatePostPages({ cid: parentCid }, "best", firstPageSizeBytes);
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

    it("throws when generateReplyPages handles depth-limited replies that exceed the page size", async () => {
        const subplebbitAddress = "test-subplebbit-reply-depth-limited";
        const postCid = "post-depth-root";
        const parentComment = { cid: "reply-depth-parent", depth: 1 };
        const { hierarchical, flattened, depthLimitedEntrySize, depthLimitedChunkSize } = createDepthLimitedRepliesDataForParent({
            parentCid: parentComment.cid,
            parentDepth: parentComment.depth,
            postCid,
            subplebbitAddress
        });

        expect(depthLimitedEntrySize).to.be.greaterThan(MB);
        expect(depthLimitedChunkSize).to.be.greaterThan(MB);

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

        const firstPageSizeBytes = Math.max(depthLimitedChunkSize - 32 * 1024, MB + 1);
        const previewChunk = generator._chunkComments({ comments: hierarchical, firstPageSizeBytes });
        const previewChunkSize = Buffer.byteLength(JSON.stringify({ comments: previewChunk[0] }), "utf8");
        expect(previewChunkSize).to.be.greaterThan(MB);

        let caughtError;
        try {
            await generator.generateReplyPages(parentComment, "best", firstPageSizeBytes);
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).to.be.instanceOf(PlebbitError);
        expect(caughtError.code).to.equal("ERR_PAGE_GENERATED_IS_OVER_EXPECTED_SIZE");
        expect(["new", "old"]).to.include(caughtError.details.sortName);
    });

    it("still throws when reply depth is capped at 5 levels but the preview exceeds the page size", async () => {
        const subplebbitAddress = "test-subplebbit-reply-depth-5";
        const postCid = "post-depth-five-root";
        const parentComment = { cid: "reply-depth-five-parent", depth: 1 };
        const { hierarchical, flattened, depthLimitedEntrySize, depthLimitedChunkSize, maxDepthReached } =
            createDepthLimitedRepliesDataForParent({
                parentCid: parentComment.cid,
                parentDepth: parentComment.depth,
                postCid,
                subplebbitAddress,
                maxDepth: 5
            });

        expect(maxDepthReached).to.equal(parentComment.depth + 5);
        expect(depthLimitedEntrySize).to.be.greaterThan(MB);
        expect(depthLimitedChunkSize).to.be.greaterThan(MB);

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

        const firstPageSizeBytes = Math.max(depthLimitedChunkSize - 32 * 1024, MB + 1);
        const previewChunk = generator._chunkComments({ comments: hierarchical, firstPageSizeBytes });
        const previewChunkSize = Buffer.byteLength(JSON.stringify({ comments: previewChunk[0] }), "utf8");
        expect(previewChunkSize).to.be.greaterThan(MB);

        let caughtError;
        try {
            await generator.generateReplyPages(parentComment, "best", firstPageSizeBytes);
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).to.be.instanceOf(PlebbitError);
        expect(caughtError.code).to.equal("ERR_PAGE_GENERATED_IS_OVER_EXPECTED_SIZE");
        expect(["new", "old"]).to.include(caughtError.details.sortName);
    });
});

function createBasicPostEntry({ cid, content, timestamp, subplebbitAddress, activeScore, contentSizeBytes }) {
    const safeContent = content ?? createCommentContent(`post-${cid}`, contentSizeBytes);
    if (Buffer.byteLength(safeContent, "utf8") > MAX_COMMENT_SIZE_BYTES) {
        throw Error(`Test fixture comment ${cid} exceeds ${MAX_COMMENT_SIZE_BYTES} bytes`);
    }
    return {
        comment: {
            cid,
            depth: 0,
            timestamp,
            postCid: cid,
            parentCid: null,
            subplebbitAddress,
            content: safeContent
        },
        commentUpdate: {
            upvoteCount: 0,
            downvoteCount: 0,
            replyCount: 0,
            childCount: 0,
            protocolVersion: "1.0.0",
            signature: "signature",
            author: { address: `author-${cid}` }
        },
        activeScore
    };
}

function createFakeIpfsClient() {
    return {
        add: async (content) => {
            // are we sure this call is equivalent to what ipfs client does
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

function createDepthLimitedRepliesDataForParent({ parentCid, parentDepth, postCid, subplebbitAddress, maxDepth = 10 }) {
    const baseTimestamp = Math.floor(Date.now() / 1000);
    const depthLimited = buildDepthLimitedChainEntry({
        parentCid,
        parentDepth,
        postCid,
        subplebbitAddress,
        baseTimestamp,
        maxDepth
    });
    const secondary = buildHeavyReplyEntry({
        parentCid,
        parentDepth,
        postCid,
        subplebbitAddress,
        baseTimestamp: baseTimestamp + 5,
        nestedCount: 5,
        nestedContentRepeat: 200,
        replySuffix: "depth-light"
    }).topLevelReply;

    const hierarchical = [depthLimited.entry, secondary];
    const flattened = flattenHierarchicalComments(hierarchical);

    return {
        hierarchical,
        flattened,
        depthLimitedEntrySize: depthLimited.entrySize,
        depthLimitedChunkSize: depthLimited.chunkSize,
        maxDepthReached: depthLimited.maxDepthReached
    };
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
    let leafCount = 25;
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
                content: repeatWithinCommentLimit("chain-depth-content-", contentRepeat)
            };

            const commentUpdate = {
                upvoteCount: 0,
                downvoteCount: 0,
                replyCount: leafCount,
                childCount: leafCount,
                protocolVersion: "1.0.0",
                signature: "signature",
                author: { address: `author-${cid}` }
            };

            timestampCursor += 1;

            const leafReplies = Array.from({ length: leafCount }, (_, leafIndex) => {
                const leafCid = `${cid}-leaf-${leafIndex}`;
                return {
                    comment: {
                        cid: leafCid,
                        depth: comment.depth + 1,
                        timestamp: timestampCursor + leafIndex + 1,
                        parentCid: cid,
                        postCid,
                        subplebbitAddress,
                        content: createCommentContent(`${leafCid}`)
                    },
                    commentUpdate: {
                        upvoteCount: 0,
                        downvoteCount: 0,
                        replyCount: 0,
                        childCount: 0,
                        protocolVersion: "1.0.0",
                        signature: "signature",
                        author: { address: `author-${leafCid}` }
                    }
                };
            });

            if (currentDepth < maxDepth) {
                const child = buildLevel(currentDepth + 1);
                commentUpdate.replyCount = leafReplies.length + 1;
                commentUpdate.childCount = leafReplies.length + 1;
                commentUpdate.replies = {
                    pages: { best: { comments: [child.entry, ...leafReplies] } },
                    pageCids: {}
                };
                return {
                    entry: { comment, commentUpdate },
                    maxDepthReached: child.maxDepthReached
                };
            }

            if (leafReplies.length > 0) {
                commentUpdate.replies = {
                    pages: { best: { comments: leafReplies } },
                    pageCids: {}
                };
            }

            return { entry: { comment, commentUpdate }, maxDepthReached: comment.depth };
        }

        const built = buildLevel(1);
        const entrySize = Buffer.byteLength(JSON.stringify(built.entry), "utf8");
        const chunkSize = Buffer.byteLength(JSON.stringify({ comments: [built.entry] }), "utf8");

        if (chunkSize >= minSizeBytes) return { entry: built.entry, entrySize, chunkSize, maxDepthReached: built.maxDepthReached };

        contentRepeat += 500;
        leafCount += 10;
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
                content: repeatWithinCommentLimit("nested-reply-", nestedContentRepeat)
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
