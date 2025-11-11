import { expect } from "chai";
import assert from "assert";
import { DbHandler } from "../../../dist/node/runtime/node/subplebbit/db-handler.js";
import { TIMEFRAMES_TO_SECONDS } from "../../../dist/node/pages/util.js";

const PROTOCOL_VERSION = "1.0.0";
const BUFFER_SECONDS = 60;

const activeUserCountKeys = [
    "allActiveUserCount",
    "yearActiveUserCount",
    "monthActiveUserCount",
    "weekActiveUserCount",
    "dayActiveUserCount",
    "hourActiveUserCount"
];

const replyCountKeys = ["allReplyCount", "yearReplyCount", "monthReplyCount", "weekReplyCount", "dayReplyCount", "hourReplyCount"];

const postCountKeys = ["allPostCount", "yearPostCount", "monthPostCount", "weekPostCount", "dayPostCount", "hourPostCount"];

describe(`subplebbit.statsCid`, function () {
    let dbHandler;
    let subplebbitAddress;
    let cidCounter = 0;

    beforeEach(async () => {
        const context = await createTestDbHandler();
        dbHandler = context.dbHandler;
        subplebbitAddress = context.subplebbitAddress;
        cidCounter = 0;
    });

    afterEach(async () => {
        if (dbHandler) {
            await dbHandler.destoryConnection();
            dbHandler = undefined;
        }
    });

    it(`stats of subplebbit is all zeros by default`, () => {
        const stats = queryStats();
        const expectedKeys = activeUserCountKeys.concat(...replyCountKeys).concat(...postCountKeys);
        expect(Object.keys(stats).sort()).to.deep.equal(expectedKeys.sort());
        expectedKeys.forEach((key) => expect(stats[key]).to.equal(0));
    });

    describe(`subplebbit.stats.ActiveUserCount`, () => {
        it(`ActiveUserCount should increase by 1 for new post author`, () => {
            const statsBefore = queryStats();
            insertPost({ authorSignerAddress: "author-new-post" });
            const statsAfter = queryStats();
            expectDelta(activeUserCountKeys, statsBefore, statsAfter, 1);
        });

        it(`ActiveUserCount does not increase when an existing user is publishing a new post`, () => {
            const author = "repeat-post-author";
            insertPost({ authorSignerAddress: author });
            const statsBefore = queryStats();
            insertPost({ authorSignerAddress: author });
            const statsAfter = queryStats();
            expectDelta(activeUserCountKeys, statsBefore, statsAfter, 0);
        });

        it(`ActiveUserCount should increase by 1 for author of new reply`, () => {
            const post = insertPost({ authorSignerAddress: "post-owner" });
            const statsBefore = queryStats();
            insertReply({ parent: post, authorSignerAddress: "new-reply-author" });
            const statsAfter = queryStats();
            expectDelta(activeUserCountKeys, statsBefore, statsAfter, 1);
        });

        it(`ActiveUserCount does not increase when an existing user is publishing a new reply`, () => {
            const post = insertPost({ authorSignerAddress: "post-owner" });
            const author = "repeat-replier";
            insertReply({ parent: post, authorSignerAddress: author });
            const statsBefore = queryStats();
            insertReply({ parent: post, authorSignerAddress: author });
            const statsAfter = queryStats();
            expectDelta(activeUserCountKeys, statsBefore, statsAfter, 0);
        });

        it(`ActiveUserCount should increase by 1 for new vote author`, () => {
            const post = insertPost({ authorSignerAddress: "post-owner" });
            const statsBefore = queryStats();
            insertVote(post, { authorSignerAddress: "vote-author-new" });
            const statsAfter = queryStats();
            expectDelta(activeUserCountKeys, statsBefore, statsAfter, 1);
        });

        it(`ActiveUserCount does not increase when an existing user is publishing a new vote`, () => {
            const post = insertPost({ authorSignerAddress: "post-owner" });
            const anotherPost = insertPost({ authorSignerAddress: "second-post-owner" });
            const author = "repeat-voter";
            insertVote(post, { authorSignerAddress: author });
            const statsBefore = queryStats();
            insertVote(anotherPost, { authorSignerAddress: author });
            const statsAfter = queryStats();
            expectDelta(activeUserCountKeys, statsBefore, statsAfter, 0);
        });
    });

    describe(`subplebbit.stats.postCount`, () => {
        it(`PostCount should increase by 1 for new post`, () => {
            const statsBefore = queryStats();
            insertPost({ authorSignerAddress: "post-author-1" });
            const statsAfter = queryStats();
            expectDelta(postCountKeys, statsBefore, statsAfter, 1);
        });

        it(`PostCount should increase by 1 for new post with existing user`, () => {
            const author = "post-author-existing";
            insertPost({ authorSignerAddress: author });
            const statsBefore = queryStats();
            insertPost({ authorSignerAddress: author });
            const statsAfter = queryStats();
            expectDelta(postCountKeys, statsBefore, statsAfter, 1);
        });

        it(`PostCount does not increase by 1 for new reply`, () => {
            const post = insertPost({ authorSignerAddress: "post-author" });
            const statsBefore = queryStats();
            insertReply({ parent: post, authorSignerAddress: "reply-author" });
            const statsAfter = queryStats();
            expectDelta(postCountKeys, statsBefore, statsAfter, 0);
        });
    });

    describe(`subplebbit.stats.replyCount`, () => {
        it(`replyCount should increase by 1 for new reply`, () => {
            const post = insertPost({ authorSignerAddress: "post-author" });
            const statsBefore = queryStats();
            insertReply({ parent: post, authorSignerAddress: "new-reply-author" });
            const statsAfter = queryStats();
            expectDelta(replyCountKeys, statsBefore, statsAfter, 1);
        });

        it(`ReplyCount should increase by 1 for new reply with existing author`, () => {
            const post = insertPost({ authorSignerAddress: "post-author" });
            const author = "repeat-reply-author";
            insertReply({ parent: post, authorSignerAddress: author });
            const statsBefore = queryStats();
            insertReply({ parent: post, authorSignerAddress: author });
            const statsAfter = queryStats();
            expectDelta(replyCountKeys, statsBefore, statsAfter, 1);
        });

        it(`ReplyCount does not increase by 1 for new post`, () => {
            const statsBefore = queryStats();
            insertPost({ authorSignerAddress: "post-author" });
            const statsAfter = queryStats();
            expectDelta(replyCountKeys, statsBefore, statsAfter, 0);
        });
    });

    describe(`subplebbit.stats filters ineligible comments`, () => {
        it(`ignores comments stored under different subplebbit address`, () => {
            const statsBefore = queryStats();
            insertPost({
                authorSignerAddress: "foreign-author",
                overrides: { subplebbitAddress: "other-subplebbit" }
            });
            const statsAfter = queryStats();
            expectDelta(activeUserCountKeys, statsBefore, statsAfter, 0);
            expectDelta(postCountKeys, statsBefore, statsAfter, 0);
            expectDelta(replyCountKeys, statsBefore, statsAfter, 0);
        });

        it(`ignores removed comments`, () => {
            const post = insertPost({ authorSignerAddress: "active-post-author" });
            const statsBefore = queryStats();
            const reply = insertReply({ parent: post, authorSignerAddress: "removed-reply-author" });
            insertCommentUpdate(reply, { removed: true });
            const statsAfter = queryStats();
            expectDelta(activeUserCountKeys, statsBefore, statsAfter, 0);
            expectDelta(replyCountKeys, statsBefore, statsAfter, 0);
        });

        it(`ignores deleted comments`, () => {
            const statsBefore = queryStats();
            const post = insertPost({ authorSignerAddress: "deleted-author" });
            insertCommentUpdate(post, { edit: { deleted: true } });
            const statsAfter = queryStats();
            expectDelta(activeUserCountKeys, statsBefore, statsAfter, 0);
            expectDelta(postCountKeys, statsBefore, statsAfter, 0);
        });

        it(`ignores comments pending approval`, () => {
            const statsBefore = queryStats();
            insertPost({ authorSignerAddress: "pending-post-author", overrides: { pendingApproval: 1 } });
            const statsAfter = queryStats();
            expectDelta(activeUserCountKeys, statsBefore, statsAfter, 0);
            expectDelta(postCountKeys, statsBefore, statsAfter, 0);
        });

        it(`ignores replies pending approval`, () => {
            const post = insertPost({ authorSignerAddress: "post-for-pending-reply" });
            const statsBefore = queryStats();
            insertReply({
                parent: post,
                authorSignerAddress: "pending-reply-author",
                overrides: { pendingApproval: 1 }
            });
            const statsAfter = queryStats();
            expectDelta(replyCountKeys, statsBefore, statsAfter, 0);
            expectDelta(activeUserCountKeys, statsBefore, statsAfter, 0);
        });

        it(`ignores votes tied to comments under different subplebbit address`, () => {
            const statsBefore = queryStats();
            const foreignPost = insertPost({
                authorSignerAddress: "foreign-post-vote",
                overrides: { subplebbitAddress: "another-sub" }
            });
            insertVote(foreignPost, { authorSignerAddress: "vote-on-foreign" });
            const statsAfter = queryStats();
            expectDelta(activeUserCountKeys, statsBefore, statsAfter, 0);
        });

        it(`ignores votes on removed comments`, () => {
            const post = insertPost({ authorSignerAddress: "removed-post-for-vote" });
            insertCommentUpdate(post, { removed: true });
            const statsBefore = queryStats();
            insertVote(post, { authorSignerAddress: "vote-on-removed" });
            const statsAfter = queryStats();
            expectDelta(activeUserCountKeys, statsBefore, statsAfter, 0);
        });

        it(`respects timeframe boundaries for post counts`, () => {
            const statsBefore = queryStats();
            const timestamp = currentTimestamp() - TIMEFRAMES_TO_SECONDS.HOUR - BUFFER_SECONDS;
            insertPost({ authorSignerAddress: "older-post", timestamp });
            const statsAfter = queryStats();
            expect(statsAfter.hourPostCount).to.equal(statsBefore.hourPostCount);
            expect(statsAfter.dayPostCount).to.equal(statsBefore.dayPostCount + 1);
            expect(statsAfter.weekPostCount).to.equal(statsBefore.weekPostCount + 1);
            expect(statsAfter.monthPostCount).to.equal(statsBefore.monthPostCount + 1);
            expect(statsAfter.yearPostCount).to.equal(statsBefore.yearPostCount + 1);
            expect(statsAfter.allPostCount).to.equal(statsBefore.allPostCount + 1);
        });

        it(`recounts comments when deleted flag is cleared`, () => {
            const statsBefore = queryStats();
            const post = insertPost({ authorSignerAddress: "toggle-deleted-author" });
            const afterInsert = queryStats();
            expectDelta(postCountKeys, statsBefore, afterInsert, 1);

            insertCommentUpdate(post, { edit: { deleted: true } });
            const afterDelete = queryStats();
            expectDelta(postCountKeys, afterInsert, afterDelete, -1);

            insertCommentUpdate(post, { edit: { deleted: false } });
            const afterRestore = queryStats();
            expectDelta(postCountKeys, afterDelete, afterRestore, 1);
        });
    });

    function queryStats() {
        assert(dbHandler, "DbHandler not initialised");
        return dbHandler.querySubplebbitStats();
    }

    function insertPost(options = {}) {
        return insertComment({ ...options, parent: null, depth: 0 });
    }

    function insertReply({ parent, ...options }) {
        assert(parent, "parent comment is required for replies");
        return insertComment({ parent, ...options });
    }

    function insertComment({
        parent,
        depth,
        parentCid,
        postCid,
        authorSignerAddress,
        timestamp = currentTimestamp(),
        overrides = {}
    } = {}) {
        assert(dbHandler, "DbHandler not initialised");
        const cid = nextCid();
        const resolvedDepth = typeof depth === "number" ? depth : parent ? (parent.depth ?? 0) + 1 : 0;
        const resolvedParentCid = resolvedDepth === 0 ? null : parentCid ?? parent?.cid ?? null;
        const resolvedPostCid =
            resolvedDepth === 0 ? postCid ?? cid : postCid ?? parent?.postCid ?? resolvedParentCid ?? cid;
        const resolvedAuthorSignerAddress = authorSignerAddress ?? `12D3KooAuthor${cid}`;
        const resolvedAuthor = overrides.author ?? { address: resolvedAuthorSignerAddress };

        dbHandler.insertComments([
            {
                cid,
                authorSignerAddress: resolvedAuthorSignerAddress,
                author: resolvedAuthor,
                link: null,
                linkWidth: null,
                linkHeight: null,
                thumbnailUrl: null,
                thumbnailUrlWidth: null,
                thumbnailUrlHeight: null,
                parentCid: resolvedParentCid,
                postCid: resolvedPostCid,
                previousCid: null,
                subplebbitAddress: overrides.subplebbitAddress ?? subplebbitAddress,
                content: overrides.content ?? `content-${cid}`,
                timestamp,
                signature: overrides.signature ?? {
                    type: "ed25519",
                    signature: "sig",
                    publicKey: "pk",
                    signedPropertyNames: []
                },
                title: resolvedDepth === 0 ? overrides.title ?? `title-${cid}` : null,
                depth: resolvedDepth,
                linkHtmlTagName: null,
                flair: overrides.flair ?? null,
                spoiler: overrides.spoiler ?? null,
                pendingApproval: overrides.pendingApproval ?? null,
                nsfw: overrides.nsfw ?? null,
                extraProps: overrides.extraProps ?? null,
                protocolVersion: PROTOCOL_VERSION,
                insertedAt: overrides.insertedAt ?? timestamp
            }
        ]);

        return {
            cid,
            depth: resolvedDepth,
            parentCid: resolvedParentCid,
            postCid: resolvedPostCid,
            timestamp,
            authorSignerAddress: resolvedAuthorSignerAddress
        };
    }

    function insertCommentUpdate(comment, options = {}) {
        assert(comment, "comment is required for comment updates");
        assert(dbHandler, "DbHandler not initialised");
        const {
            replyCount = 0,
            childCount = 0,
            upvoteCount = 0,
            downvoteCount = 0,
            removed = null,
            approved = null,
            edit = null,
            lastChildCid = null,
            lastReplyTimestamp = null,
            postUpdatesBucket = 0,
            publishedToPostUpdatesMFS = 0,
            updatedAt = currentTimestamp(),
            insertedAt
        } = options;
        const resolvedInsertedAt = insertedAt ?? updatedAt;
        dbHandler.upsertCommentUpdates([
            {
                cid: comment.cid,
                replyCount,
                childCount,
                upvoteCount,
                downvoteCount,
                removed,
                approved,
                edit,
                lastChildCid,
                lastReplyTimestamp,
                postUpdatesBucket,
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
                replies: null,
                publishedToPostUpdatesMFS,
                insertedAt: resolvedInsertedAt
            }
        ]);
    }

    function insertVote(comment, { authorSignerAddress, timestamp = currentTimestamp(), vote = 1 } = {}) {
        assert(comment, "comment is required for votes");
        assert(dbHandler, "DbHandler not initialised");
        const resolvedAuthorSignerAddress = authorSignerAddress ?? `12D3KooVote${comment.cid}`;
        dbHandler.insertVotes([
            {
                commentCid: comment.cid,
                authorSignerAddress: resolvedAuthorSignerAddress,
                timestamp,
                vote,
                protocolVersion: PROTOCOL_VERSION,
                insertedAt: timestamp,
                extraProps: null
            }
        ]);
    }


    function nextCid(prefix = "QmTest") {
        return `${prefix}${(cidCounter++).toString().padStart(4, "0")}`;
    }

    function currentTimestamp() {
        return Math.floor(Date.now() / 1000);
    }

    function expectDelta(keys, before, after, delta) {
        keys.forEach((key) => expect(after[key]).to.equal(before[key] + delta));
    }
});

async function createTestDbHandler() {
    const subplebbitAddress = `test-sub-${Date.now()}-${Math.random()}`;
    const fakePlebbit = { noData: true };
    const fakeSubplebbit = { address: subplebbitAddress, _plebbit: fakePlebbit };
    const handler = new DbHandler(fakeSubplebbit);
    await handler.initDbIfNeeded({ filename: ":memory:", fileMustExist: false });
    await handler.createOrMigrateTablesIfNeeded();
    return { dbHandler: handler, subplebbitAddress };
}
