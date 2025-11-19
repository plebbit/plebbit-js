import { expect } from "chai";
import { DbHandler } from "../../../dist/node/runtime/node/subplebbit/db-handler.js";
import { describeSkipIfRpc } from "../../../dist/node/test/test-util.js";

describeSkipIfRpc("db-handler duplicate signature purge during migration", function () {
    let dbHandler;
    let subplebbitAddress;
    let cidCounter = 0;
    const protocolVersion = "1.0.0";

    const nextCid = (prefix = "QmTest") => `${prefix}${(cidCounter++).toString().padStart(4, "0")}`;
    const currentTimestamp = () => Math.floor(Date.now() / 1000);
    const makeSignature = (signatureValue) => ({
        type: "ed25519",
        signature: signatureValue,
        publicKey: `pk-${signatureValue}`,
        signedPropertyNames: []
    });

    async function createTestDbHandler() {
        const fakePlebbit = { noData: true };
        const fakeSubplebbit = {
            address: subplebbitAddress,
            _plebbit: fakePlebbit,
            _cidsToUnPin: new Set(),
            _blocksToRm: [],
            _mfsPathsToRemove: new Set(),
            _clientsManager: {},
            _calculateLocalMfsPathForCommentUpdate: () => "",
            async _addOldPageCidsToCidsToUnpin() {},
            _addAllCidsUnderPurgedCommentToBeRemoved(purgedCommentAndCommentUpdate) {
                this._cidsToUnPin.add(purgedCommentAndCommentUpdate.commentTableRow.cid);
                this._blocksToRm.push(purgedCommentAndCommentUpdate.commentTableRow.cid);
                if (typeof purgedCommentAndCommentUpdate.commentUpdateTableRow?.postUpdatesBucket === "number") {
                    const localCommentUpdatePath = this._calculateLocalMfsPathForCommentUpdate(
                        purgedCommentAndCommentUpdate.commentTableRow,
                        purgedCommentAndCommentUpdate.commentUpdateTableRow.postUpdatesBucket
                    );
                    this._mfsPathsToRemove.add(localCommentUpdatePath);
                }
                if (purgedCommentAndCommentUpdate.commentUpdateTableRow?.replies) {
                    this._addOldPageCidsToCidsToUnpin(purgedCommentAndCommentUpdate.commentUpdateTableRow.replies, undefined, true).catch(
                        () => {}
                    );
                }
            }
        };
        const handler = new DbHandler(fakeSubplebbit);
        await handler.initDbIfNeeded({ filename: ":memory:", fileMustExist: false });
        await handler.createOrMigrateTablesIfNeeded();
        return handler;
    }

    const insertComment = ({ cid = nextCid(), signatureValue, depth = 0, parentCid = null, postCid, timestamp, insertedAt } = {}) => {
        const resolvedTimestamp = timestamp ?? currentTimestamp();
        const resolvedPostCid = postCid ?? (depth === 0 ? cid : parentCid ?? nextCid("post"));
        const authorSignerAddress = `12D3KooAuthor${cid}`;

        dbHandler.insertComments([
            {
                cid,
                authorSignerAddress,
                author: { address: authorSignerAddress },
                link: null,
                linkWidth: null,
                linkHeight: null,
                thumbnailUrl: null,
                thumbnailUrlWidth: null,
                thumbnailUrlHeight: null,
                parentCid: depth === 0 ? null : parentCid,
                postCid: resolvedPostCid,
                previousCid: null,
                subplebbitAddress,
                content: `content-${cid}`,
                timestamp: resolvedTimestamp,
                signature: makeSignature(signatureValue ?? `comment-${cid}`),
                title: depth === 0 ? `title-${cid}` : null,
                depth,
                linkHtmlTagName: null,
                flair: null,
                spoiler: 0,
                pendingApproval: 0,
                nsfw: 0,
                extraProps: null,
                protocolVersion,
                insertedAt: insertedAt ?? resolvedTimestamp
            }
        ]);

        return { cid };
    };

    const insertCommentEdit = (commentCid, signatureValue, { timestamp, insertedAt } = {}) => {
        const resolvedTimestamp = timestamp ?? currentTimestamp();
        const resolvedInsertedAt = insertedAt ?? resolvedTimestamp;
        const authorSignerAddress = `12D3KooEdit${commentCid}${signatureValue}`;

        dbHandler.insertCommentEdits([
            {
                commentCid,
                authorSignerAddress,
                author: { address: authorSignerAddress },
                signature: makeSignature(signatureValue),
                protocolVersion,
                subplebbitAddress,
                timestamp: resolvedTimestamp,
                content: `edit-${commentCid}`,
                reason: null,
                deleted: 0,
                flair: null,
                spoiler: 0,
                nsfw: 0,
                isAuthorEdit: 1,
                insertedAt: resolvedInsertedAt,
                extraProps: null
            }
        ]);
    };

    const insertCommentModeration = (commentCid, signatureValue, { timestamp, insertedAt } = {}) => {
        const resolvedTimestamp = timestamp ?? currentTimestamp();
        const resolvedInsertedAt = insertedAt ?? resolvedTimestamp;

        dbHandler.insertCommentModerations([
            {
                commentCid,
                author: { address: `12D3KooModAuthor${commentCid}` },
                signature: makeSignature(signatureValue),
                modSignerAddress: `12D3KooMod${commentCid}${signatureValue}`,
                protocolVersion,
                subplebbitAddress,
                timestamp: resolvedTimestamp,
                commentModeration: { approved: true },
                insertedAt: resolvedInsertedAt,
                extraProps: null
            }
        ]);
    };

    function extractSignature(serialized, pathSegments) {
        if (serialized === null || serialized === undefined) return undefined;
        let parsed = serialized;
        try {
            parsed = typeof serialized === "string" ? JSON.parse(serialized) : serialized;
        } catch (error) {
            return undefined;
        }
        return pathSegments.reduce((acc, segment) => (acc && typeof acc === "object" && segment in acc ? acc[segment] : undefined), parsed);
    }

    function rowsWithSignature(tableName, column, pathSegments, targetSignature) {
        const rows = dbHandler._db.prepare(`SELECT rowid, * FROM ${tableName}`).all();
        return rows.filter((row) => extractSignature(row[column], pathSegments) === targetSignature);
    }

    beforeEach(async () => {
        subplebbitAddress = `test-sub-${Date.now()}-${Math.random()}`;
        dbHandler = await createTestDbHandler();
        cidCounter = 0;
    });

    afterEach(async () => {
        if (dbHandler) {
            await dbHandler.destoryConnection();
            dbHandler = undefined;
        }
    });

    it("purges duplicate comment signatures during migrations", async () => {
        const commentToKeep = insertComment({ signatureValue: "comment-keep" });
        const commentOriginal = insertComment({ signatureValue: "comment-duplicate" });
        const commentDuplicate = insertComment({ signatureValue: "comment-duplicate" });

        const commentDuplicatesBefore = rowsWithSignature("comments", "signature", ["signature"], "comment-duplicate");
        expect(commentDuplicatesBefore.map((row) => row.cid)).to.have.members([commentOriginal.cid, commentDuplicate.cid]);
        expect(commentDuplicatesBefore).to.have.lengthOf(2);

        const commentKeeps = rowsWithSignature("comments", "signature", ["signature"], "comment-keep");
        expect(commentKeeps.map((row) => row.cid)).to.deep.equal([commentToKeep.cid]);

        dbHandler._purgePublicationTablesWithDuplicateSignatures();

        const commentDuplicatesAfter = rowsWithSignature("comments", "signature", ["signature"], "comment-duplicate");
        expect(commentDuplicatesAfter.map((row) => row.cid)).to.deep.equal([commentOriginal.cid]);

        const unpinnedCids = Array.from(dbHandler._subplebbit._cidsToUnPin);
        expect(unpinnedCids).to.include(commentDuplicate.cid);
    });

    it("purges duplicate comment edit signatures during migrations", async () => {
        const baseComment = insertComment({ signatureValue: "comment-base" });

        insertCommentEdit(baseComment.cid, "edit-keep");
        insertCommentEdit(baseComment.cid, "edit-duplicate");
        insertCommentEdit(baseComment.cid, "edit-duplicate");

        const editDuplicatesBefore = rowsWithSignature("commentEdits", "signature", ["signature"], "edit-duplicate");
        expect(editDuplicatesBefore).to.have.lengthOf(2);

        const editKeepsBefore = rowsWithSignature("commentEdits", "signature", ["signature"], "edit-keep");
        expect(editKeepsBefore).to.have.lengthOf(1);

        dbHandler._purgePublicationTablesWithDuplicateSignatures();

        const editDuplicates = rowsWithSignature("commentEdits", "signature", ["signature"], "edit-duplicate");
        expect(editDuplicates).to.have.lengthOf(1);

        const editKeeps = rowsWithSignature("commentEdits", "signature", ["signature"], "edit-keep");
        expect(editKeeps).to.have.lengthOf(1);
    });

    it("purges duplicate comment moderation signatures during migrations", async () => {
        const baseComment = insertComment({ signatureValue: "comment-base" });

        insertCommentModeration(baseComment.cid, "mod-keep");
        insertCommentModeration(baseComment.cid, "mod-duplicate");
        insertCommentModeration(baseComment.cid, "mod-duplicate");

        const moderationDuplicatesBefore = rowsWithSignature("commentModerations", "signature", ["signature"], "mod-duplicate");
        expect(moderationDuplicatesBefore).to.have.lengthOf(2);

        const moderationKeepsBefore = rowsWithSignature("commentModerations", "signature", ["signature"], "mod-keep");
        expect(moderationKeepsBefore).to.have.lengthOf(1);

        dbHandler._purgePublicationTablesWithDuplicateSignatures();

        const moderationDuplicates = rowsWithSignature("commentModerations", "signature", ["signature"], "mod-duplicate");
        expect(moderationDuplicates).to.have.lengthOf(1);

        const moderationKeeps = rowsWithSignature("commentModerations", "signature", ["signature"], "mod-keep");
        expect(moderationKeeps).to.have.lengthOf(1);
    });
});
