import { expect } from "chai";
import { DbHandler } from "../../../dist/node/runtime/node/subplebbit/db-handler.js";
import assert from "assert";
import { describeSkipIfRpc } from "../../../dist/node/test/test-util.js";

describeSkipIfRpc("db-handler.queryCommentsToBeUpdated", function () {

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
            pendingApproval: overrides.pendingApproval ?? null,
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
            replies = null,
            lastReplyTimestamp = null,
            postUpdatesBucket = 0,
            removed = null,
            approved = null,
            edit = null,
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

    it("enqueues all comments of an author when one of their comments requires an update", async () => {
        const sharedAuthor = "12D3KooAuthorShared";
        const postNeedingUpdate = insertComment({
            overrides: { authorSignerAddress: sharedAuthor, author: { address: sharedAuthor } }
        });
        insertCommentUpdate(postNeedingUpdate, { publishedToPostUpdatesMFS: 0 });

        const upToDatePost = insertComment({
            overrides: { authorSignerAddress: sharedAuthor, author: { address: sharedAuthor } }
        });
        insertCommentUpdate(upToDatePost, { publishedToPostUpdatesMFS: 1, updatedAt: currentTimestamp() + 5 });

        const cids = commentCidsNeedingUpdate();
        expect(cids).to.include(postNeedingUpdate.cid, "author's comment needing update should be present");
        expect(cids).to.include(upToDatePost.cid, "other comments by same author should also be enqueued");
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

    it("requeues parent when replies JSON references a deleted child", async () => {
        const post = insertComment();
        insertCommentUpdate(post, { publishedToPostUpdatesMFS: 1, replyCount: 1, childCount: 1, lastChildCid: post.cid });

        const parent = insertComment({
            depth: 1,
            parentCid: post.cid,
            postCid: post.cid,
            timestamp: currentTimestamp() + 1,
            overrides: { insertedAt: currentTimestamp() + 1 }
        });

        const staleChildCid = nextCid("purged");
        const staleReplies = JSON.stringify({
            pages: {
                best: {
                    comments: [
                        {
                            comment: {
                                cid: staleChildCid,
                                parentCid: parent.cid,
                                postCid: post.cid,
                                depth: parent.depth + 1,
                                subplebbitAddress
                            },
                            commentUpdate: {
                                cid: staleChildCid,
                                replyCount: 0,
                                childCount: 0,
                                updatedAt: currentTimestamp(),
                                protocolVersion,
                                author: { subplebbit: { firstCommentTimestamp: currentTimestamp(), lastCommentCid: staleChildCid } }
                            }
                        }
                    ]
                }
            }
        });

        insertCommentUpdate(parent, {
            publishedToPostUpdatesMFS: 1,
            replyCount: 1,
            childCount: 1,
            lastChildCid: staleChildCid,
            replies: staleReplies
        });

        const cids = commentCidsNeedingUpdate();
        expect(cids).to.include(
            parent.cid,
            "parent comment should be enqueued because replies JSON still references the purged child comment"
        );
    });

    it("requeues parent when replies JSON embeds stale child updatedAt", async () => {
        const post = insertComment();
        insertCommentUpdate(post, { publishedToPostUpdatesMFS: 1, replyCount: 1, childCount: 1, lastChildCid: post.cid });

        const parent = insertComment({
            depth: 1,
            parentCid: post.cid,
            postCid: post.cid,
            timestamp: currentTimestamp() + 1,
            overrides: { insertedAt: currentTimestamp() + 1 }
        });

        const child = insertComment({
            depth: 2,
            parentCid: parent.cid,
            postCid: post.cid,
            timestamp: currentTimestamp() + 2,
            overrides: { insertedAt: currentTimestamp() + 2 }
        });

        const childInitialUpdatedAt = currentTimestamp() + 3;
        insertCommentUpdate(child, {
            publishedToPostUpdatesMFS: 1,
            updatedAt: childInitialUpdatedAt,
            insertedAt: childInitialUpdatedAt
        });

        const repliesSnapshot = JSON.stringify({
            pages: {
                best: {
                    comments: [
                        {
                            comment: {
                                cid: child.cid,
                                parentCid: parent.cid,
                                postCid: post.cid,
                                depth: child.depth,
                                subplebbitAddress
                            },
                            commentUpdate: {
                                cid: child.cid,
                                replyCount: 0,
                                childCount: 0,
                                updatedAt: childInitialUpdatedAt,
                                protocolVersion,
                                author: {
                                    subplebbit: {
                                        firstCommentTimestamp: child.timestamp,
                                        lastCommentCid: child.cid
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        });

        insertCommentUpdate(parent, {
            publishedToPostUpdatesMFS: 1,
            replyCount: 1,
            childCount: 1,
            lastChildCid: child.cid,
            replies: repliesSnapshot
        });

        const childNewUpdatedAt = childInitialUpdatedAt + 10;
        insertCommentUpdate(child, {
            publishedToPostUpdatesMFS: 0,
            updatedAt: childNewUpdatedAt,
            insertedAt: childNewUpdatedAt
        });

        const cids = commentCidsNeedingUpdate();
        expect(cids).to.include(parent.cid, "parent comment should be enqueued because replies JSON embeds outdated child updatedAt");
    });

    it("includes post ancestor when childCount is stale after a child was removed", async () => {
        const baseTimestamp = currentTimestamp();
        const post = insertComment({ timestamp: baseTimestamp, overrides: { insertedAt: baseTimestamp } });

        const reply = insertComment({
            depth: 1,
            parentCid: post.cid,
            postCid: post.cid,
            timestamp: baseTimestamp + 1,
            overrides: { insertedAt: baseTimestamp + 1 }
        });

        const child = insertComment({
            depth: 2,
            parentCid: reply.cid,
            postCid: post.cid,
            timestamp: baseTimestamp + 2,
            overrides: { insertedAt: baseTimestamp + 2 }
        });

        const childInitialUpdatedAt = baseTimestamp + 3;
        insertCommentUpdate(child, {
            publishedToPostUpdatesMFS: 1,
            updatedAt: childInitialUpdatedAt,
            insertedAt: childInitialUpdatedAt
        });

        const postUpdateInsertedAt = baseTimestamp + 5;
        insertCommentUpdate(post, {
            publishedToPostUpdatesMFS: 1,
            updatedAt: postUpdateInsertedAt,
            insertedAt: postUpdateInsertedAt,
            childCount: 1,
            lastChildCid: reply.cid,
            replyCount: 1
        });

        const replyUpdateInsertedAt = baseTimestamp + 6;
        insertCommentUpdate(reply, {
            publishedToPostUpdatesMFS: 1,
            replyCount: 1,
            childCount: 1,
            lastChildCid: child.cid,
            updatedAt: replyUpdateInsertedAt,
            insertedAt: replyUpdateInsertedAt
        });

        // Child gets removed later, but parent/post are not updated afterwards
        const childRemovalUpdatedAt = baseTimestamp + 10;
        insertCommentUpdate(child, {
            publishedToPostUpdatesMFS: 1,
            updatedAt: childRemovalUpdatedAt,
            insertedAt: childRemovalUpdatedAt,
            removed: 1
        });

        const cids = commentCidsNeedingUpdate();
        expect(cids).to.include(reply.cid, "reply should be enqueued because its childCount is stale after removal");
        expect(cids).to.include(post.cid, "post should be enqueued when descendant childCount becomes stale");
    });

    it("includes post ancestor when lastChildCid is stale but childCount is correct", async () => {
        const baseTimestamp = currentTimestamp();
        const post = insertComment({ timestamp: baseTimestamp, overrides: { insertedAt: baseTimestamp } });

        const reply = insertComment({
            depth: 1,
            parentCid: post.cid,
            postCid: post.cid,
            timestamp: baseTimestamp + 1,
            overrides: { insertedAt: baseTimestamp + 1 }
        });

        const olderChild = insertComment({
            depth: 2,
            parentCid: reply.cid,
            postCid: post.cid,
            timestamp: baseTimestamp + 2,
            overrides: { insertedAt: baseTimestamp + 2 }
        });
        insertCommentUpdate(olderChild, {
            publishedToPostUpdatesMFS: 1,
            updatedAt: baseTimestamp + 3,
            insertedAt: baseTimestamp + 3
        });

        const newerChild = insertComment({
            depth: 2,
            parentCid: reply.cid,
            postCid: post.cid,
            timestamp: baseTimestamp + 4,
            overrides: { insertedAt: baseTimestamp + 4 }
        });
        insertCommentUpdate(newerChild, {
            publishedToPostUpdatesMFS: 1,
            updatedAt: baseTimestamp + 5,
            insertedAt: baseTimestamp + 5
        });

        const postUpdateInsertedAt = baseTimestamp + 6;
        insertCommentUpdate(post, {
            publishedToPostUpdatesMFS: 1,
            updatedAt: postUpdateInsertedAt,
            insertedAt: postUpdateInsertedAt,
            childCount: 1,
            lastChildCid: reply.cid,
            replyCount: 1
        });

        const replyUpdateInsertedAt = baseTimestamp + 7;
        insertCommentUpdate(reply, {
            publishedToPostUpdatesMFS: 1,
            replyCount: 2,
            childCount: 2,
            // Intentionally stale lastChildCid (should be newerChild)
            lastChildCid: olderChild.cid,
            updatedAt: replyUpdateInsertedAt,
            insertedAt: replyUpdateInsertedAt
        });

        const cids = commentCidsNeedingUpdate();
        expect(cids).to.include(reply.cid, "reply should be enqueued because its lastChildCid is stale");
        expect(cids).to.include(post.cid, "post should be enqueued when descendant lastChildCid is stale");
    });

    it("requeues parent when replies JSON references a child whose comment update row was purged", async () => {
        const post = insertComment();
        insertCommentUpdate(post, { publishedToPostUpdatesMFS: 1, replyCount: 1, childCount: 1, lastChildCid: post.cid });

        const parent = insertComment({ depth: 1, parentCid: post.cid, postCid: post.cid });
        const child = insertComment({ depth: 2, parentCid: parent.cid, postCid: post.cid });

        const childUpdatedAt = currentTimestamp();
        insertCommentUpdate(child, {
            publishedToPostUpdatesMFS: 1,
            replyCount: 0,
            childCount: 0,
            updatedAt: childUpdatedAt,
            insertedAt: childUpdatedAt
        });

        const repliesSnapshot = JSON.stringify({
            pages: {
                best: {
                    comments: [
                        {
                            comment: {
                                cid: child.cid,
                                parentCid: parent.cid,
                                postCid: post.cid,
                                depth: child.depth,
                                subplebbitAddress
                            },
                            commentUpdate: {
                                cid: child.cid,
                                replyCount: 0,
                                childCount: 0,
                                updatedAt: childUpdatedAt,
                                protocolVersion,
                                author: {
                                    subplebbit: {
                                        firstCommentTimestamp: child.timestamp,
                                        lastCommentCid: child.cid
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        });

        insertCommentUpdate(parent, {
            publishedToPostUpdatesMFS: 1,
            replyCount: 1,
            childCount: 1,
            lastChildCid: child.cid,
            replies: repliesSnapshot
        });

        dbHandler._db.prepare(`DELETE FROM commentUpdates WHERE cid = ?`).run(child.cid);

        const cids = commentCidsNeedingUpdate();
        expect(cids).to.include(
            parent.cid,
            "parent comment should be enqueued because replies JSON references a child without a stored comment update row"
        );
    });

    it("requeues parent when child comment is marked removed but replies still include it", async () => {
        const post = insertComment();
        insertCommentUpdate(post, { publishedToPostUpdatesMFS: 1, replyCount: 1, childCount: 1, lastChildCid: post.cid });

        const parent = insertComment({ depth: 1, parentCid: post.cid, postCid: post.cid });
        const child = insertComment({ depth: 2, parentCid: parent.cid, postCid: post.cid });

        const childUpdatedAt = currentTimestamp();
        insertCommentUpdate(child, {
            publishedToPostUpdatesMFS: 1,
            replyCount: 0,
            childCount: 0,
            updatedAt: childUpdatedAt,
            insertedAt: childUpdatedAt
        });

        const repliesSnapshot = JSON.stringify({
            pages: {
                best: {
                    comments: [
                        {
                            comment: {
                                cid: child.cid,
                                parentCid: parent.cid,
                                postCid: post.cid,
                                depth: child.depth,
                                subplebbitAddress
                            },
                            commentUpdate: {
                                cid: child.cid,
                                replyCount: 0,
                                childCount: 0,
                                updatedAt: childUpdatedAt,
                                protocolVersion,
                                author: {
                                    subplebbit: {
                                        firstCommentTimestamp: child.timestamp,
                                        lastCommentCid: child.cid
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        });

        insertCommentUpdate(parent, {
            publishedToPostUpdatesMFS: 1,
            replyCount: 1,
            childCount: 1,
            lastChildCid: child.cid,
            replies: repliesSnapshot
        });

        const removalUpdatedAt = childUpdatedAt + 5;
        insertCommentUpdate(child, {
            publishedToPostUpdatesMFS: 0,
            replyCount: 0,
            childCount: 0,
            removed: 1,
            updatedAt: removalUpdatedAt,
            insertedAt: removalUpdatedAt
        });

        const cids = commentCidsNeedingUpdate();
        expect(cids).to.include(
            parent.cid,
            "parent comment should be enqueued because a child present in replies has been marked removed"
        );
    });

    it("requeues parent when child comment is deleted via edit but replies still include it", async () => {
        const post = insertComment();
        insertCommentUpdate(post, { publishedToPostUpdatesMFS: 1, replyCount: 1, childCount: 1, lastChildCid: post.cid });

        const parent = insertComment({ depth: 1, parentCid: post.cid, postCid: post.cid });
        const child = insertComment({ depth: 2, parentCid: parent.cid, postCid: post.cid });

        const childUpdatedAt = currentTimestamp();
        insertCommentUpdate(child, {
            publishedToPostUpdatesMFS: 1,
            replyCount: 0,
            childCount: 0,
            updatedAt: childUpdatedAt,
            insertedAt: childUpdatedAt
        });

        const repliesSnapshot = JSON.stringify({
            pages: {
                best: {
                    comments: [
                        {
                            comment: {
                                cid: child.cid,
                                parentCid: parent.cid,
                                postCid: post.cid,
                                depth: child.depth,
                                subplebbitAddress
                            },
                            commentUpdate: {
                                cid: child.cid,
                                replyCount: 0,
                                childCount: 0,
                                updatedAt: childUpdatedAt,
                                protocolVersion,
                                author: {
                                    subplebbit: {
                                        firstCommentTimestamp: child.timestamp,
                                        lastCommentCid: child.cid
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        });

        insertCommentUpdate(parent, {
            publishedToPostUpdatesMFS: 1,
            replyCount: 1,
            childCount: 1,
            lastChildCid: child.cid,
            replies: repliesSnapshot
        });

        const deletionUpdatedAt = childUpdatedAt + 5;
        insertCommentUpdate(child, {
            publishedToPostUpdatesMFS: 0,
            replyCount: 0,
            childCount: 0,
            updatedAt: deletionUpdatedAt,
            insertedAt: deletionUpdatedAt,
            edit: JSON.stringify({ deleted: true })
        });

        const cids = commentCidsNeedingUpdate();
        expect(cids).to.include(
            parent.cid,
            "parent comment should be enqueued because a child present in replies has been deleted"
        );
    });

    it("requeues parent when replies JSON includes a pending-approval child", async () => {
        const post = insertComment();
        insertCommentUpdate(post, { publishedToPostUpdatesMFS: 1, replyCount: 1, childCount: 1, lastChildCid: post.cid });

        const parent = insertComment({ depth: 1, parentCid: post.cid, postCid: post.cid });
        const pendingChild = insertComment({
            depth: 2,
            parentCid: parent.cid,
            postCid: post.cid,
            overrides: { pendingApproval: 1 }
        });

        const childUpdatedAt = currentTimestamp();
        insertCommentUpdate(pendingChild, {
            publishedToPostUpdatesMFS: 1,
            replyCount: 0,
            childCount: 0,
            updatedAt: childUpdatedAt,
            insertedAt: childUpdatedAt
        });

        const repliesSnapshot = JSON.stringify({
            pages: {
                best: {
                    comments: [
                        {
                            comment: {
                                cid: pendingChild.cid,
                                parentCid: parent.cid,
                                postCid: post.cid,
                                depth: pendingChild.depth,
                                subplebbitAddress
                            },
                            commentUpdate: {
                                cid: pendingChild.cid,
                                replyCount: 0,
                                childCount: 0,
                                updatedAt: childUpdatedAt,
                                protocolVersion,
                                author: {
                                    subplebbit: {
                                        firstCommentTimestamp: pendingChild.timestamp,
                                        lastCommentCid: pendingChild.cid
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        });

        insertCommentUpdate(parent, {
            publishedToPostUpdatesMFS: 1,
            replyCount: 1,
            childCount: 1,
            lastChildCid: pendingChild.cid,
            replies: repliesSnapshot
        });

        const cids = commentCidsNeedingUpdate();
        expect(cids).to.include(
            parent.cid,
            "parent comment should be enqueued because replies include a pending approval child that is filtered out of counts"
        );
    });

    it("includes post ancestor when replies JSON is stale even if all updates were already published", async () => {
        const baseTimestamp = currentTimestamp();
        const post = insertComment({ timestamp: baseTimestamp, overrides: { insertedAt: baseTimestamp } });

        const reply = insertComment({
            depth: 1,
            parentCid: post.cid,
            postCid: post.cid,
            timestamp: baseTimestamp + 1,
            overrides: { insertedAt: baseTimestamp + 1 }
        });
        const child = insertComment({
            depth: 2,
            parentCid: reply.cid,
            postCid: post.cid,
            timestamp: baseTimestamp + 2,
            overrides: { insertedAt: baseTimestamp + 2 }
        });

        const childInitialUpdatedAt = baseTimestamp + 3;
        insertCommentUpdate(child, {
            publishedToPostUpdatesMFS: 1,
            updatedAt: childInitialUpdatedAt,
            insertedAt: childInitialUpdatedAt
        });

        const postUpdateInsertedAt = baseTimestamp + 5;
        insertCommentUpdate(post, {
            publishedToPostUpdatesMFS: 1,
            updatedAt: postUpdateInsertedAt,
            insertedAt: postUpdateInsertedAt,
            childCount: 1,
            lastChildCid: reply.cid,
            replyCount: 1
        });

        const repliesSnapshot = JSON.stringify({
            pages: {
                best: {
                    comments: [
                        {
                            comment: {
                                cid: child.cid,
                                parentCid: reply.cid,
                                postCid: post.cid,
                                depth: child.depth,
                                subplebbitAddress
                            },
                            commentUpdate: {
                                cid: child.cid,
                                replyCount: 0,
                                childCount: 0,
                                updatedAt: childInitialUpdatedAt,
                                protocolVersion,
                                author: {
                                    subplebbit: {
                                        firstCommentTimestamp: child.timestamp,
                                        lastCommentCid: child.cid
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        });

        const replyUpdateInsertedAt = baseTimestamp + 6;
        insertCommentUpdate(reply, {
            publishedToPostUpdatesMFS: 1,
            replyCount: 1,
            childCount: 1,
            lastChildCid: child.cid,
            replies: repliesSnapshot,
            updatedAt: replyUpdateInsertedAt,
            insertedAt: replyUpdateInsertedAt
        });

        const childNewUpdatedAt = childInitialUpdatedAt + 10;
        insertCommentUpdate(child, {
            publishedToPostUpdatesMFS: 1,
            updatedAt: childNewUpdatedAt,
            insertedAt: childNewUpdatedAt
        });

        const cids = commentCidsNeedingUpdate();
        expect(cids).to.include(reply.cid, "reply should be enqueued because its replies JSON is stale");
        expect(cids).to.include(post.cid, "post should also be enqueued when descendant replies JSON becomes stale");
    });
});
