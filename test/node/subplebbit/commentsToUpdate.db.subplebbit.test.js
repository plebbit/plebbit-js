import { expect } from "chai";
import { DbHandler } from "../../../dist/node/runtime/node/subplebbit/db-handler.js";
import assert from "assert";
import { describeSkipIfRpc } from "../../../dist/node/test/test-util.js";

describeSkipIfRpc("db-handler.queryCommentsToBeUpdated", function () {
    this.timeout(120_000);

    let dbHandler;
    let subplebbitAddress;
    let cidCounter = 0;
    const protocolVersion = "1.0.0";

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

    const insertComment = ({ cid = nextCid(), depth = 0, parentCid = null, postCid, timestamp, overrides = {} } = {}) => {
        const resolvedTimestamp = timestamp ?? currentTimestamp();
        const resolvedPostCid = postCid ?? (depth === 0 ? cid : parentCid ?? nextCid("post"));
        const authorSignerAddress = overrides.authorSignerAddress ?? `12D3KooAuthor${cid}`;

        const baseComment = {
            cid,
            authorSignerAddress,
            author: overrides.author ?? { address: authorSignerAddress },
            content: overrides.content ?? `content-${cid}`,
            title: depth === 0 ? overrides.title ?? `title-${cid}` : undefined,
            subplebbitAddress,
            timestamp: resolvedTimestamp,
            depth,
            postCid: resolvedPostCid,
            parentCid: depth === 0 ? null : parentCid,
            signature: overrides.signature ?? { type: "ed25519", signature: "sig", publicKey: "pk", signedPropertyNames: [] },
            protocolVersion,
            insertedAt: overrides.insertedAt ?? resolvedTimestamp
        };

        dbHandler.insertComments([baseComment]);
        return { cid, timestamp: resolvedTimestamp, depth, parentCid, postCid: resolvedPostCid };
    };

    const insertCommentUpdate = (
        comment,
        {
            updatedAt = currentTimestamp(),
            publishedToPostUpdatesMFS = 0,
            replyCount = 0,
            childCount = 0,
            upvoteCount = 0,
            downvoteCount = 0,
            lastChildCid = null,
            insertedAt
        } = {}
    ) => {
        const resolvedInsertedAt = insertedAt ?? currentTimestamp();
        dbHandler.upsertCommentUpdates([
            {
                cid: comment.cid,
                upvoteCount,
                downvoteCount,
                replyCount,
                childCount,
                updatedAt,
                protocolVersion,
                signature: "sig",
                author: { subplebbit: { firstCommentTimestamp: comment.timestamp, lastCommentCid: comment.cid } },
                replies: null,
                lastChildCid,
                lastReplyTimestamp: null,
                postUpdatesBucket: 0,
                publishedToPostUpdatesMFS,
                insertedAt: resolvedInsertedAt
            }
        ]);
        return { updatedAt };
    };

    const insertVote = (comment, { authorSignerAddress = `12D3KooVote${comment.cid}`, vote = 1, insertedAt, timestamp } = {}) => {
        const resolvedTimestamp = timestamp ?? currentTimestamp();
        const resolvedInsertedAt = insertedAt ?? resolvedTimestamp;
        dbHandler.insertVotes([
            {
                commentCid: comment.cid,
                authorSignerAddress,
                vote,
                timestamp: resolvedTimestamp,
                protocolVersion,
                insertedAt: resolvedInsertedAt
            }
        ]);
        return { insertedAt: resolvedInsertedAt };
    };

    const insertCommentEdit = (comment, { insertedAt, timestamp, authorSignerAddress = `12D3KooEdit${comment.cid}` } = {}) => {
        const resolvedTimestamp = timestamp ?? currentTimestamp();
        const resolvedInsertedAt = insertedAt ?? resolvedTimestamp;
        dbHandler.insertCommentEdits([
            {
                commentCid: comment.cid,
                authorSignerAddress,
                author: { address: authorSignerAddress },
                signature: "sig",
                protocolVersion,
                subplebbitAddress,
                timestamp: resolvedTimestamp,
                content: `edit-${comment.cid}`,
                reason: null,
                deleted: 0,
                flair: null,
                spoiler: 0,
                nsfw: 0,
                isAuthorEdit: 1,
                insertedAt: resolvedInsertedAt
            }
        ]);
        return { insertedAt: resolvedInsertedAt };
    };

    const insertCommentModeration = (
        comment,
        { insertedAt, timestamp, modSignerAddress = `12D3KooMod${comment.cid}`, moderation = { approved: true } } = {}
    ) => {
        const resolvedTimestamp = timestamp ?? currentTimestamp();
        const resolvedInsertedAt = insertedAt ?? resolvedTimestamp;
        dbHandler.insertCommentModerations([
            {
                commentCid: comment.cid,
                author: { address: `12D3KooModAuthor${comment.cid}` },
                signature: "sig",
                modSignerAddress,
                protocolVersion,
                subplebbitAddress,
                timestamp: resolvedTimestamp,
                commentModeration: moderation,
                insertedAt: resolvedInsertedAt
            }
        ]);
        return { insertedAt: resolvedInsertedAt };
    };

    beforeEach(async () => {
        dbHandler = await createTestDbHandler();
        assert(dbHandler, "DbHandler failed to initialize");
    });

    afterEach(async () => {
        if (dbHandler) {
            await dbHandler.destoryConnection();
            dbHandler = undefined;
        }
        cidCounter = 0;
    });

    const commentCidsNeedingUpdate = () => dbHandler.queryCommentsToBeUpdated().map((comment) => comment.cid);

    it("includes comments that do not yet have a stored comment update row", async () => {
        const post = insertComment();

        const cids = commentCidsNeedingUpdate();
        expect(cids).to.include(post.cid);
    });

    it("fails to include a post with a newer vote when commentUpdates.updatedAt is ahead by more than one second (captures regression)", async () => {
        const post = insertComment();
        const futureTime = currentTimestamp() + 10;
        insertCommentUpdate(post, { publishedToPostUpdatesMFS: 1, updatedAt: futureTime });
        insertVote(post, { insertedAt: futureTime - 5 });

        const cids = commentCidsNeedingUpdate();

        expect(cids).to.include(
            post.cid,
            "queryCommentsToBeUpdated should include the post because a newer vote exists even when updatedAt is ahead"
        );
    });

    it("includes parents of replies that require an update", async () => {
        const post = insertComment();
        insertCommentUpdate(post, { publishedToPostUpdatesMFS: 1, updatedAt: currentTimestamp() });

        const reply = insertComment({ depth: 1, parentCid: post.cid, postCid: post.cid, timestamp: currentTimestamp() + 5 });
        insertCommentUpdate(reply, { publishedToPostUpdatesMFS: 0, updatedAt: reply.timestamp });

        const cids = commentCidsNeedingUpdate();

        expect(cids).to.include(reply.cid);
        expect(cids).to.include(post.cid, "parent comment should be enqueued when a child reply needs an update");
    });

    it("includes comments when a new comment edit is inserted after the stored update", async () => {
        const post = insertComment();
        const { updatedAt } = insertCommentUpdate(post, { publishedToPostUpdatesMFS: 1, updatedAt: currentTimestamp() });

        insertCommentEdit(post, { insertedAt: updatedAt + 5 });

        const cids = commentCidsNeedingUpdate();
        expect(cids).to.include(post.cid);
    });

    it("includes comments when a new moderation is recorded after the stored update", async () => {
        const post = insertComment();
        const { updatedAt } = insertCommentUpdate(post, { publishedToPostUpdatesMFS: 1, updatedAt: currentTimestamp() });

        insertCommentModeration(post, { insertedAt: updatedAt + 5, moderation: { approved: false } });

        const cids = commentCidsNeedingUpdate();
        expect(cids).to.include(post.cid);
    });

    it("includes comments when new child comments arrive after the stored update", async () => {
        const post = insertComment();
        const { updatedAt } = insertCommentUpdate(post, { publishedToPostUpdatesMFS: 1, updatedAt: currentTimestamp() });

        const newTimestamp = updatedAt + 10;
        insertComment({
            depth: 1,
            parentCid: post.cid,
            postCid: post.cid,
            timestamp: newTimestamp,
            overrides: { insertedAt: newTimestamp }
        });

        const cids = commentCidsNeedingUpdate();
        expect(cids).to.include(post.cid);
    });

    it("propagates updates through ancestor chain for deep replies", async () => {
        const baseTimestamp = currentTimestamp();
        const post = insertComment({ timestamp: baseTimestamp });
        insertCommentUpdate(post, { publishedToPostUpdatesMFS: 1, updatedAt: baseTimestamp, insertedAt: baseTimestamp });

        const depth1 = insertComment({
            depth: 1,
            parentCid: post.cid,
            postCid: post.cid,
            timestamp: baseTimestamp + 1,
            overrides: { insertedAt: baseTimestamp + 1 }
        });
        insertCommentUpdate(depth1, {
            publishedToPostUpdatesMFS: 1,
            updatedAt: baseTimestamp + 1,
            insertedAt: baseTimestamp + 1
        });

        const depth2 = insertComment({
            depth: 2,
            parentCid: depth1.cid,
            postCid: post.cid,
            timestamp: baseTimestamp + 2,
            overrides: { insertedAt: baseTimestamp + 2 }
        });
        insertCommentUpdate(depth2, {
            publishedToPostUpdatesMFS: 1,
            updatedAt: baseTimestamp + 2,
            insertedAt: baseTimestamp + 2
        });

        const depth3Timestamp = baseTimestamp + 5;
        insertComment({
            depth: 3,
            parentCid: depth2.cid,
            postCid: post.cid,
            timestamp: depth3Timestamp,
            overrides: { insertedAt: depth3Timestamp }
        });

        const cids = commentCidsNeedingUpdate();
        expect(cids).to.include(depth2.cid, "direct parent of the deep reply should be scheduled for update");
        expect(cids).to.include(depth1.cid, "grandparent comment should be scheduled via parent chain");
        expect(cids).to.include(post.cid, "post should be scheduled via parent chain");
    });
});
