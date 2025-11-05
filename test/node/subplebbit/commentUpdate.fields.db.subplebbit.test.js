import { expect } from "chai";
import assert from "assert";
import { DbHandler } from "../../../dist/node/runtime/node/subplebbit/db-handler.js";
import { describeSkipIfRpc } from "../../../dist/node/test/test-util.js";

const PROTOCOL_VERSION = "1.0.0";

describeSkipIfRpc("db-handler.queryCalculatedCommentUpdate", function () {

    let dbHandler;
    let subplebbitAddress;
    let cidCounter = 0;

    const nextCid = (prefix = "QmTest") => `${prefix}${(cidCounter++).toString().padStart(4, "0")}`;
    const currentTimestamp = () => Math.floor(Date.now() / 1000);

    async function createTestDbHandler() {
        subplebbitAddress = `test-sub-${Date.now()}-${Math.random()}`;
        const fakePlebbit = { noData: true };
        const fakeSubplebbit = { address: subplebbitAddress, _plebbit: fakePlebbit };
        const handler = new DbHandler(fakeSubplebbit);
        await handler.initDbIfNeeded({ filename: ":memory:", fileMustExist: false });
        await handler.createOrMigrateTablesIfNeeded();
        return handler;
    }

    const insertComment = ({
        cid = nextCid(),
        depth = 0,
        parentCid = null,
        postCid,
        timestamp = currentTimestamp(),
        authorSignerAddress = `12D3KooAuthor${cid}`,
        overrides = {}
    } = {}) => {
        assert(dbHandler, "DbHandler not initialised");
        const resolvedPostCid = postCid ?? (depth === 0 ? cid : parentCid ?? nextCid("post"));
        const comment = {
            cid,
            authorSignerAddress,
            author: { address: authorSignerAddress },
            content: overrides["content"] ?? `content-${cid}`,
            title: depth === 0 ? overrides["title"] ?? `title-${cid}` : undefined,
            subplebbitAddress,
            timestamp,
            depth,
            postCid: resolvedPostCid,
            parentCid: depth === 0 ? null : parentCid,
            signature: overrides["signature"] ??
                { type: "ed25519", signature: "sig", publicKey: "pk", signedPropertyNames: [] },
            protocolVersion: PROTOCOL_VERSION,
            pendingApproval: overrides["pendingApproval"] ?? null,
            insertedAt: overrides["insertedAt"] ?? timestamp,
            extraProps: overrides["extraProps"] ?? null,
            flair: overrides["flair"] ?? null,
            deleted: overrides["deleted"] ?? 0,
            spoiler: overrides["spoiler"] ?? 0,
            nsfw: overrides["nsfw"] ?? 0,
            locked: overrides["locked"] ?? 0
        };
        dbHandler.insertComments([comment]);
        return {
            cid,
            depth,
            parentCid: depth === 0 ? null : parentCid ?? null,
            postCid: resolvedPostCid,
            timestamp,
            authorSignerAddress
        };
    };

    const insertCommentUpdate = (comment, options = {}) => {
        const {
            updatedAt = currentTimestamp(),
            replyCount = 0,
            childCount = 0,
            upvoteCount = 0,
            downvoteCount = 0,
            lastChildCid = null,
            lastReplyTimestamp = null,
            postUpdatesBucket = 0,
            removed = null,
            approved = null,
            edit = null,
            replies = null,
            publishedToPostUpdatesMFS = 0,
            insertedAt
        } = options;
        assert(dbHandler, "DbHandler not initialised");
        const resolvedInsertedAt = insertedAt ?? currentTimestamp();
        dbHandler.upsertCommentUpdates([
            {
                cid: comment.cid,
                upvoteCount,
                downvoteCount,
                replyCount,
                childCount,
                updatedAt,
                protocolVersion: PROTOCOL_VERSION,
                signature: "sig",
                author: {
                    subplebbit: {
                        postScore: 0,
                        replyScore: 0,
                        lastCommentCid: comment.cid,
                        firstCommentTimestamp: comment.timestamp
                    }
                },
                replies,
                lastChildCid,
                lastReplyTimestamp,
                postUpdatesBucket,
                removed,
                approved,
                edit,
                publishedToPostUpdatesMFS,
                insertedAt: resolvedInsertedAt
            }
        ]);
    };

    const insertVote = (comment, options = {}) => {
        const { vote = 1, authorSignerAddress = `12D3KooVote${comment.cid}`, timestamp = currentTimestamp(), insertedAt } = options;
        assert(dbHandler, "DbHandler not initialised");
        const resolvedInsertedAt = insertedAt ?? timestamp;
        dbHandler.insertVotes([
            {
                commentCid: comment.cid,
                authorSignerAddress,
                vote,
                timestamp,
                protocolVersion: PROTOCOL_VERSION,
                insertedAt: resolvedInsertedAt
            }
        ]);
    };

    const queryCalculated = (comment) => {
        assert(dbHandler, "DbHandler not initialised");
        return dbHandler.queryCalculatedCommentUpdate({
            cid: comment.cid,
            authorSignerAddress: comment.authorSignerAddress,
            timestamp: comment.timestamp
        });
    };

    const createCommentWithUpdate = (options) => {
        const comment = insertComment(options ?? {});
        insertCommentUpdate(comment);
        return comment;
    };

    beforeEach(async () => {
        dbHandler = await createTestDbHandler();
        assert(dbHandler, "Failed to initialise DbHandler");
    });

    afterEach(async () => {
        if (dbHandler) {
            await dbHandler.destoryConnection();
            dbHandler = undefined;
        }
        cidCounter = 0;
    });

    describe("replyCount", () => {
        it("counts direct replies", () => {
            const post = createCommentWithUpdate({ depth: 0 });
            let postCalculated = queryCalculated(post);
            expect(postCalculated.replyCount).to.equal(0);
            expect(postCalculated.childCount).to.equal(0);

            const reply = createCommentWithUpdate({ depth: 1, parentCid: post.cid, postCid: post.cid });

            postCalculated = queryCalculated(post);
            expect(postCalculated.replyCount).to.equal(1);
            expect(postCalculated.childCount).to.equal(1);

            const replyCalculated = queryCalculated(reply);
            expect(replyCalculated.replyCount).to.equal(0);
            expect(replyCalculated.childCount).to.equal(0);
        });

        it("counts nested replies recursively", () => {
            const post = createCommentWithUpdate({ depth: 0 });
            let postCalculated = queryCalculated(post);
            expect(postCalculated.replyCount).to.equal(0);
            expect(postCalculated.childCount).to.equal(0);

            const reply = createCommentWithUpdate({ depth: 1, parentCid: post.cid, postCid: post.cid });
            postCalculated = queryCalculated(post);
            expect(postCalculated.replyCount).to.equal(1);
            expect(postCalculated.childCount).to.equal(1);

            let replyCalculated = queryCalculated(reply);
            expect(replyCalculated.replyCount).to.equal(0);
            expect(replyCalculated.childCount).to.equal(0);

            const nestedReply = createCommentWithUpdate({
                depth: 2,
                parentCid: reply.cid,
                postCid: post.cid
            });

            postCalculated = queryCalculated(post);
            expect(postCalculated.replyCount).to.equal(2);
            expect(postCalculated.childCount).to.equal(1);

            replyCalculated = queryCalculated(reply);
            expect(replyCalculated.replyCount).to.equal(1);
            expect(replyCalculated.childCount).to.equal(1);

            const nestedCalculated = queryCalculated(nestedReply);
            expect(nestedCalculated.replyCount).to.equal(0);
        });
    });

    describe("lastChildCid", () => {
        it("points to the latest direct child", () => {
            const post = createCommentWithUpdate({ depth: 0 });
            let calculated = queryCalculated(post);
            expect(calculated.lastChildCid).to.be.undefined;

            const firstReply = createCommentWithUpdate({ depth: 1, parentCid: post.cid, postCid: post.cid });
            calculated = queryCalculated(post);
            expect(calculated.lastChildCid).to.equal(firstReply.cid);

            const secondReply = createCommentWithUpdate({ depth: 1, parentCid: post.cid, postCid: post.cid });

            calculated = queryCalculated(post);
            expect(calculated.lastChildCid).to.equal(secondReply.cid);
        });

        it("ignores nested replies when computing lastChildCid", () => {
            const post = createCommentWithUpdate({ depth: 0 });
            let calculated = queryCalculated(post);
            expect(calculated.lastChildCid).to.be.undefined;

            const directReply = createCommentWithUpdate({ depth: 1, parentCid: post.cid, postCid: post.cid });
            calculated = queryCalculated(post);
            expect(calculated.lastChildCid).to.equal(directReply.cid);

            createCommentWithUpdate({ depth: 2, parentCid: directReply.cid, postCid: post.cid });

            calculated = queryCalculated(post);
            expect(calculated.lastChildCid).to.equal(directReply.cid);
        });
    });

    describe("lastReplyTimestamp", () => {
        it("tracks the timestamp of the latest direct reply", () => {
            const post = createCommentWithUpdate({ depth: 0, timestamp: 1_700_000_000 });
            let calculated = queryCalculated(post);
            expect(calculated.lastReplyTimestamp).to.be.undefined;

            const replyTimestamp = 1_700_000_100;
            createCommentWithUpdate({
                depth: 1,
                parentCid: post.cid,
                postCid: post.cid,
                timestamp: replyTimestamp
            });

            calculated = queryCalculated(post);
            expect(calculated.lastReplyTimestamp).to.equal(replyTimestamp);
        });

        it("tracks nested reply timestamps", () => {
            const post = createCommentWithUpdate({ depth: 0, timestamp: 1_700_000_000 });
            const directReply = createCommentWithUpdate({
                depth: 1,
                parentCid: post.cid,
                postCid: post.cid,
                timestamp: 1_700_000_050
            });
            let calculated = queryCalculated(post);
            expect(calculated.lastReplyTimestamp).to.equal(1_700_000_050);

            const nestedTimestamp = 1_700_000_200;
            createCommentWithUpdate({
                depth: 2,
                parentCid: directReply.cid,
                postCid: post.cid,
                timestamp: nestedTimestamp
            });

            calculated = queryCalculated(post);
            expect(calculated.lastReplyTimestamp).to.equal(nestedTimestamp);
        });
    });

    describe("author.subplebbit aggregation", () => {
        it("postScore increases with an upvote to a post", () => {
            const authorSignerAddress = "author-post-upvote";
            const post = createCommentWithUpdate({ depth: 0, authorSignerAddress });

            let calculated = queryCalculated(post);
            expect(calculated.upvoteCount).to.equal(0);
            expect(calculated.author?.subplebbit?.postScore).to.equal(0);
            expect(calculated.author?.subplebbit?.replyScore).to.equal(0);

            insertVote(post, { vote: 1 });

            calculated = queryCalculated(post);

            expect(calculated.upvoteCount).to.equal(1);
            expect(calculated.author?.subplebbit?.postScore).to.equal(1);
            expect(calculated.author?.subplebbit?.replyScore).to.equal(0);
        });

        it("aggregates postScore across multiple posts", () => {
            const authorSignerAddress = "author-two-posts";
            const firstPost = createCommentWithUpdate({ depth: 0, authorSignerAddress, timestamp: 100 });
            let firstCalculated = queryCalculated(firstPost);
            expect(firstCalculated.author?.subplebbit?.postScore).to.equal(0);
            expect(firstCalculated.author?.subplebbit?.replyScore).to.equal(0);

            insertVote(firstPost, { vote: 1 });

            firstCalculated = queryCalculated(firstPost);
            expect(firstCalculated.author?.subplebbit?.postScore).to.equal(1);
            expect(firstCalculated.author?.subplebbit?.replyScore).to.equal(0);

            const secondPost = createCommentWithUpdate({ depth: 0, authorSignerAddress, timestamp: 200 });
            let secondCalculated = queryCalculated(secondPost);
            expect(secondCalculated.author?.subplebbit?.postScore).to.equal(1);
            expect(secondCalculated.author?.subplebbit?.replyScore).to.equal(0);
            insertVote(secondPost, { vote: 1 });

            firstCalculated = queryCalculated(firstPost);
            secondCalculated = queryCalculated(secondPost);

            expect(firstCalculated.author?.subplebbit?.postScore).to.equal(2);
            expect(firstCalculated.author?.subplebbit?.replyScore).to.equal(0);
            expect(secondCalculated.author?.subplebbit?.postScore).to.equal(2);
            expect(secondCalculated.author?.subplebbit?.replyScore).to.equal(0);
            expect(secondCalculated.author?.subplebbit?.firstCommentTimestamp).to.equal(100);
        });

        it("replyScore increases with upvotes to replies", () => {
            const authorSignerAddress = "author-replies";
            const post = createCommentWithUpdate({ depth: 0, authorSignerAddress, timestamp: 1_000 });
            let postCalculated = queryCalculated(post);
            expect(postCalculated.author?.subplebbit?.postScore).to.equal(0);
            expect(postCalculated.author?.subplebbit?.replyScore).to.equal(0);
            insertVote(post, { vote: 1 });
            postCalculated = queryCalculated(post);
            expect(postCalculated.author?.subplebbit?.postScore).to.equal(1);
            expect(postCalculated.author?.subplebbit?.replyScore).to.equal(0);

            const reply = createCommentWithUpdate({
                depth: 1,
                parentCid: post.cid,
                postCid: post.cid,
                authorSignerAddress,
                timestamp: 2_000
            });
            let replyCalculated = queryCalculated(reply);
            expect(replyCalculated.author?.subplebbit?.postScore).to.equal(1);
            expect(replyCalculated.author?.subplebbit?.replyScore).to.equal(0);
            insertVote(reply, { vote: 1 });

            postCalculated = queryCalculated(post);
            replyCalculated = queryCalculated(reply);

            expect(postCalculated.author?.subplebbit?.postScore).to.equal(1);
            expect(postCalculated.author?.subplebbit?.replyScore).to.equal(1);
            expect(replyCalculated.author?.subplebbit?.postScore).to.equal(1);
            expect(replyCalculated.author?.subplebbit?.replyScore).to.equal(1);
            expect(replyCalculated.author?.subplebbit?.firstCommentTimestamp).to.equal(1_000);
        });

        it("lastCommentCid reflects the author's latest comment", () => {
            const authorSignerAddress = "author-last-comment";
            const firstPost = createCommentWithUpdate({ depth: 0, authorSignerAddress, timestamp: 10 });
            let firstCalculated = queryCalculated(firstPost);
            expect(firstCalculated.author?.subplebbit?.lastCommentCid).to.equal(firstPost.cid);

            const secondPost = createCommentWithUpdate({ depth: 0, authorSignerAddress, timestamp: 20 });

            firstCalculated = queryCalculated(firstPost);
            const secondCalculated = queryCalculated(secondPost);

            expect(firstCalculated.author?.subplebbit?.lastCommentCid).to.equal(secondPost.cid);
            expect(secondCalculated.author?.subplebbit?.lastCommentCid).to.equal(secondPost.cid);
        });

        it("lastCommentCid updates when the author publishes a reply", () => {
            const authorSignerAddress = "author-reply-last-comment";
            const post = createCommentWithUpdate({ depth: 0, authorSignerAddress, timestamp: 10 });
            let postCalculated = queryCalculated(post);
            expect(postCalculated.author?.subplebbit?.lastCommentCid).to.equal(post.cid);

            const reply = createCommentWithUpdate({
                depth: 1,
                parentCid: post.cid,
                postCid: post.cid,
                authorSignerAddress,
                timestamp: 20
            });

            postCalculated = queryCalculated(post);
            const replyCalculated = queryCalculated(reply);

            expect(postCalculated.author?.subplebbit?.lastCommentCid).to.equal(reply.cid);
            expect(replyCalculated.author?.subplebbit?.lastCommentCid).to.equal(reply.cid);
        });

        it("firstCommentTimestamp remains the first comment from the author", () => {
            const authorSignerAddress = "author-first-timestamp";
            const firstPost = createCommentWithUpdate({ depth: 0, authorSignerAddress, timestamp: 50 });
            const firstCalculated = queryCalculated(firstPost);
            expect(firstCalculated.author?.subplebbit?.firstCommentTimestamp).to.equal(50);

            const secondPost = createCommentWithUpdate({ depth: 0, authorSignerAddress, timestamp: 100 });

            const secondCalculated = queryCalculated(secondPost);

            expect(secondCalculated.author?.subplebbit?.firstCommentTimestamp).to.equal(50);
        });
    });

    describe("childCount", () => {
        it("increases with direct replies", () => {
            const post = createCommentWithUpdate({ depth: 0 });
            let calculated = queryCalculated(post);
            expect(calculated.childCount).to.equal(0);
            expect(calculated.replyCount).to.equal(0);

            createCommentWithUpdate({ depth: 1, parentCid: post.cid, postCid: post.cid });

            calculated = queryCalculated(post);

            expect(calculated.childCount).to.equal(1);
            expect(calculated.replyCount).to.equal(1);
        });

        it("does not increase with replies of replies", () => {
            const post = createCommentWithUpdate({ depth: 0 });
            let postCalculated = queryCalculated(post);
            expect(postCalculated.childCount).to.equal(0);
            expect(postCalculated.replyCount).to.equal(0);

            const reply = createCommentWithUpdate({ depth: 1, parentCid: post.cid, postCid: post.cid });
            postCalculated = queryCalculated(post);
            expect(postCalculated.childCount).to.equal(1);
            expect(postCalculated.replyCount).to.equal(1);

            let replyCalculated = queryCalculated(reply);
            expect(replyCalculated.childCount).to.equal(0);
            expect(replyCalculated.replyCount).to.equal(0);

            createCommentWithUpdate({ depth: 2, parentCid: reply.cid, postCid: post.cid });

            postCalculated = queryCalculated(post);
            replyCalculated = queryCalculated(reply);

            expect(postCalculated.childCount).to.equal(1);
            expect(postCalculated.replyCount).to.equal(2);
            expect(replyCalculated.childCount).to.equal(1);
            expect(replyCalculated.replyCount).to.equal(1);
        });

        it("counts multiple direct replies separately", () => {
            const post = createCommentWithUpdate({ depth: 0 });
            let calculated = queryCalculated(post);
            expect(calculated.childCount).to.equal(0);
            expect(calculated.replyCount).to.equal(0);

            createCommentWithUpdate({ depth: 1, parentCid: post.cid, postCid: post.cid });
            calculated = queryCalculated(post);
            expect(calculated.childCount).to.equal(1);
            expect(calculated.replyCount).to.equal(1);

            createCommentWithUpdate({ depth: 1, parentCid: post.cid, postCid: post.cid });
            calculated = queryCalculated(post);

            expect(calculated.childCount).to.equal(2);
            expect(calculated.replyCount).to.equal(2);
        });
    });
});
