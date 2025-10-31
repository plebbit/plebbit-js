import { expect } from "chai";
import { describeSkipIfRpc, generateMockPost, mockPlebbit } from "../../../dist/node/test/test-util.js";
import { messages } from "../../../dist/node/errors.js";

class InMemoryDbHandlerMock {
    constructor() {
        this.comments = [];
        this.commentEdits = [];
        this.commentModerations = [];
        this.votes = [];
        this.subplebbitAuthors = new Map();
    }

    // transaction helpers used by LocalSubplebbit
    createTransaction() {}
    commitTransaction() {}
    removeOldestPendingCommentIfWeHitMaxPendingCount() {}
    destoryConnection() {}
    markCommentsAsPublishedToPostUpdates() {}
    purgeComment() {}
    removeCommentFromPendingApproval() {}

    // comment helpers
    queryLatestPostCid() {
        const posts = this.comments.filter((comment) => comment.depth === 0);
        if (posts.length === 0) return undefined;
        return posts[posts.length - 1];
    }

    queryCommentsUnderComment(parentCid) {
        return this.comments.filter((comment) => comment.parentCid === parentCid);
    }

    queryComment(cid) {
        return this.comments.find((comment) => comment.cid === cid);
    }

    queryCommentFlagsSetByMod() {
        return { removed: false, locked: false };
    }

    queryAuthorEditDeleted() {
        return { deleted: false };
    }

    _queryIsCommentApproved() {
        return { approved: true };
    }

    hasCommentWithSignatureEncoded(signatureEncoded) {
        return this.comments.some((comment) => comment.signature?.signature === signatureEncoded);
    }

    insertComments(comments) {
        comments.forEach((comment) => {
            this.comments.push(comment);
            if (comment.authorSignerAddress)
                this.subplebbitAuthors.set(comment.authorSignerAddress, {
                    firstCommentTimestamp: comment.timestamp,
                    lastCommentCid: comment.cid
                });
        });
    }

    // comment edit helpers
    hasCommentEditWithSignatureEncoded(signatureEncoded) {
        return this.commentEdits.some((edit) => edit.signature?.signature === signatureEncoded);
    }

    insertCommentEdits(edits) {
        edits.forEach((edit) => this.commentEdits.push(edit));
    }

    // comment moderation helpers
    hasCommentModerationWithSignatureEncoded(signatureEncoded) {
        return this.commentModerations.some((mod) => mod.signature?.signature === signatureEncoded);
    }

    insertCommentModerations(moderations) {
        moderations.forEach((mod) => this.commentModerations.push(mod));
    }

    // vote helpers
    deleteVote(authorSignerAddress, commentCid) {
        this.votes = this.votes.filter((vote) => !(vote.authorSignerAddress === authorSignerAddress && vote.commentCid === commentCid));
    }

    insertVotes(votes) {
        votes.forEach((vote) => this.votes.push(vote));
    }

    queryVote(commentCid, authorSignerAddress) {
        return this.votes.find((vote) => vote.commentCid === commentCid && vote.authorSignerAddress === authorSignerAddress);
    }

    queryStoredCommentUpdate() {
        return undefined;
    }

    querySubplebbitAuthor(address) {
        return this.subplebbitAuthors.get(address);
    }
}

describeSkipIfRpc("LocalSubplebbit duplicate publication regression coverage", function () {
    this.timeout(120_000);

    let plebbit;
    let subplebbit;
    let dbMock;
    let originalEdit;
    const clone = (value) => JSON.parse(JSON.stringify(value));

    const expectNoDuplicateSignatures = () => {
        const unique = (values) => new Set(values).size === values.length;
        const commentSignatures = dbMock.comments.map((c) => c.signature?.signature).filter(Boolean);
        expect(unique(commentSignatures), "Duplicate comment signatures stored in mock DB").to.be.true;

        const commentEditSignatures = dbMock.commentEdits.map((e) => e.signature?.signature).filter(Boolean);
        expect(unique(commentEditSignatures), "Duplicate comment edit signatures stored in mock DB").to.be.true;

        const commentModSignatures = dbMock.commentModerations.map((m) => m.signature?.signature).filter(Boolean);
        expect(unique(commentModSignatures), "Duplicate comment moderation signatures stored in mock DB").to.be.true;
    };

    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await plebbit.createSubplebbit();
        originalEdit = subplebbit.edit;
    });

    beforeEach(() => {
        dbMock = new InMemoryDbHandlerMock();
        subplebbit._dbHandler = dbMock;
        subplebbit.settings = subplebbit.settings || {};
        subplebbit.features = subplebbit.features || {};
        subplebbit.roles = {};
        subplebbit.edit = originalEdit;
        subplebbit._ongoingChallengeExchanges = new Map();
        subplebbit._challengeAnswerPromises = new Map();
        subplebbit._challengeAnswerResolveReject = new Map();
        subplebbit._challengeExchangesFromLocalPublishers = {};
    });

    afterEach(() => {
        expectNoDuplicateSignatures();
    });

    after(async () => {
        if (subplebbit) await subplebbit.delete();
        if (plebbit) await plebbit.destroy();
    });

    const makeCommentRequest = (commentPublication, requestId) => ({
        challengeRequestId: BigInt(requestId),
        signature: { publicKey: commentPublication.signature.publicKey },
        comment: clone(commentPublication)
    });

    const makeCommentEditRequest = (commentEditPublication, requestId) => ({
        challengeRequestId: BigInt(requestId),
        signature: { publicKey: commentEditPublication.signature.publicKey },
        commentEdit: clone(commentEditPublication)
    });

    const makeCommentModerationRequest = (commentModerationPublication, requestId) => ({
        challengeRequestId: BigInt(requestId),
        signature: { publicKey: commentModerationPublication.signature.publicKey },
        commentModeration: clone(commentModerationPublication)
    });

    const makeVoteRequest = (votePublication, requestId) => ({
        challengeRequestId: BigInt(requestId),
        signature: { publicKey: votePublication.signature.publicKey },
        vote: clone(votePublication)
    });

    const makeSubplebbitEditRequest = (subplebbitEditPublication, requestId) => ({
        challengeRequestId: BigInt(requestId),
        signature: { publicKey: subplebbitEditPublication.signature.publicKey },
        subplebbitEdit: clone(subplebbitEditPublication)
    });

    const captureChallengeVerifications = () => {
        const challengeVerifications = [];
        const handler = (msg) => challengeVerifications.push(msg);
        subplebbit.on("challengeverification", handler);
        return {
            challengeVerifications,
            dispose: () => subplebbit.off("challengeverification", handler)
        };
    };

    it("rejects duplicate comment publications", async () => {
        const { signer, publication: commentPub } = await createCommentPublication();
        const { challengeVerifications, dispose } = captureChallengeVerifications();

        const request = makeCommentRequest(commentPub, 1);
        const validity = await subplebbit._checkPublicationValidity(request, request.comment, undefined);
        expect(validity).to.be.undefined;

        await subplebbit._publishChallengeVerification({ challengeSuccess: true, challengeErrors: undefined }, request, false);
        expect(challengeVerifications.length).to.equal(1);
        expect(challengeVerifications[0].challengeSuccess).to.be.true;
        expect(dbMock.comments.length).to.equal(1, "Expected the successful publication to be stored in the comments table mock");
        expect(dbMock.comments[0].signature?.signature).to.equal(
            commentPub.signature.signature,
            "Stored comment signature should match the publication signature"
        );

        const duplicateRequest = makeCommentRequest(clone(commentPub), 2);
        const duplicateReason = await subplebbit._checkPublicationValidity(duplicateRequest, duplicateRequest.comment, undefined);
        expect(duplicateReason).to.equal(messages.ERR_DUPLICATE_COMMENT);

        await subplebbit._publishChallengeVerification({ challengeSuccess: true, challengeErrors: undefined }, duplicateRequest, false);

        expect(challengeVerifications.length).to.equal(2);
        const duplicateEvent = challengeVerifications[1];
        expect(duplicateEvent.challengeSuccess).to.be.false;
        expect(duplicateEvent.reason).to.equal(messages.ERR_DUPLICATE_COMMENT);
        expect(dbMock.comments.length).to.equal(1, "Duplicate comment should not be stored");
        expect(dbMock.hasCommentWithSignatureEncoded(commentPub.signature.signature)).to.be.true;

        dispose();
    });

    it("rejects duplicate comment edits", async () => {
        const { signer: originalCommentSigner, publication: commentPub } = await createCommentPublication();
        const commentRequest = makeCommentRequest(commentPub, 10);
        await subplebbit._publishChallengeVerification({ challengeSuccess: true, challengeErrors: undefined }, commentRequest, false);

        const storedComment = dbMock.comments[0];

        const editInstance = await plebbit.createCommentEdit({
            subplebbitAddress: subplebbit.address,
            commentCid: storedComment.cid,
            content: "Edited content",
            signer: originalCommentSigner
        });
        const editPublication = editInstance.toJSONPubsubMessagePublication();

        const { challengeVerifications, dispose } = captureChallengeVerifications();

        const editRequest = makeCommentEditRequest(editPublication, 11);
        const validity = await subplebbit._checkPublicationValidity(editRequest, editRequest.commentEdit, undefined);
        expect(validity).to.be.undefined;
        await subplebbit._publishChallengeVerification({ challengeSuccess: true, challengeErrors: undefined }, editRequest, false);
        expect(challengeVerifications.length).to.equal(1);
        expect(challengeVerifications[0].challengeSuccess).to.be.true;

        const duplicateEditRequest = makeCommentEditRequest(clone(editPublication), 12);
        const duplicateReason = await subplebbit._checkPublicationValidity(
            duplicateEditRequest,
            duplicateEditRequest.commentEdit,
            undefined
        );
        expect(duplicateReason).to.equal(messages.ERR_DUPLICATE_COMMENT_EDIT);

        await subplebbit._publishChallengeVerification({ challengeSuccess: true, challengeErrors: undefined }, duplicateEditRequest, false);

        expect(challengeVerifications.length).to.equal(2);
        const duplicateEvent = challengeVerifications[1];
        expect(duplicateEvent.challengeSuccess).to.be.false;
        expect(duplicateEvent.reason).to.equal(messages.ERR_DUPLICATE_COMMENT_EDIT);
        dispose();
    });

    it("rejects duplicate comment moderations", async () => {
        const { publication: commentPub } = await createCommentPublication();
        const commentRequest = makeCommentRequest(commentPub, 20);
        await subplebbit._publishChallengeVerification({ challengeSuccess: true, challengeErrors: undefined }, commentRequest, false);

        const storedComment = dbMock.comments[0];
        const modSigner = await plebbit.createSigner();
        subplebbit.roles = { [modSigner.address]: { role: "moderator" } };

        const moderationInstance = await plebbit.createCommentModeration({
            subplebbitAddress: subplebbit.address,
            commentCid: storedComment.cid,
            commentModeration: { removed: true },
            signer: modSigner
        });
        const moderationPublication = moderationInstance.toJSONPubsubMessagePublication();

        const { challengeVerifications, dispose } = captureChallengeVerifications();

        const modRequest = makeCommentModerationRequest(moderationPublication, 21);
        const validity = await subplebbit._checkPublicationValidity(modRequest, modRequest.commentModeration, undefined);
        expect(validity).to.be.undefined;

        await subplebbit._publishChallengeVerification({ challengeSuccess: true, challengeErrors: undefined }, modRequest, false);
        expect(challengeVerifications.length).to.equal(1);
        expect(challengeVerifications[0].challengeSuccess).to.be.true;

        const duplicateModRequest = makeCommentModerationRequest(clone(moderationPublication), 22);
        const duplicateReason = await subplebbit._checkPublicationValidity(
            duplicateModRequest,
            duplicateModRequest.commentModeration,
            undefined
        );
        expect(duplicateReason).to.equal(messages.ERR_DUPLICATE_COMMENT_MODERATION);

        await subplebbit._publishChallengeVerification({ challengeSuccess: true, challengeErrors: undefined }, duplicateModRequest, false);

        expect(challengeVerifications.length).to.equal(2);
        const duplicateEvent = challengeVerifications[1];
        expect(duplicateEvent.challengeSuccess).to.be.false;
        expect(duplicateEvent.reason).to.equal(messages.ERR_DUPLICATE_COMMENT_MODERATION);
        dispose();
    });

    it("rejects duplicate votes", async () => {
        const { publication: commentPub } = await createCommentPublication();
        const commentRequest = makeCommentRequest(commentPub, 30);
        await subplebbit._publishChallengeVerification({ challengeSuccess: true, challengeErrors: undefined }, commentRequest, false);

        const storedComment = dbMock.comments[0];
        const signer = await plebbit.createSigner();

        const voteInstance = await plebbit.createVote({
            subplebbitAddress: subplebbit.address,
            commentCid: storedComment.cid,
            vote: 1,
            signer
        });
        const votePublication = voteInstance.toJSONPubsubMessagePublication();

        const { challengeVerifications, dispose } = captureChallengeVerifications();

        const voteRequest = makeVoteRequest(votePublication, 31);
        const validity = await subplebbit._checkPublicationValidity(voteRequest, voteRequest.vote, undefined);
        expect(validity).to.be.undefined;
        await subplebbit._publishChallengeVerification({ challengeSuccess: true, challengeErrors: undefined }, voteRequest, false);
        expect(challengeVerifications.length).to.equal(1);
        expect(challengeVerifications[0].challengeSuccess).to.be.true;

        const duplicateVoteRequest = makeVoteRequest(clone(votePublication), 32);
        await subplebbit._publishChallengeVerification({ challengeSuccess: true, challengeErrors: undefined }, duplicateVoteRequest, false);
        expect(challengeVerifications.length).to.equal(2);
        const duplicateEvent = challengeVerifications[1];
        expect(duplicateEvent.challengeSuccess).to.be.true;
        dispose();
    });

    it("records duplicate subplebbit edits behaviour", async () => {
        await createCommentPublication();
        const signer = await plebbit.createSigner();
        subplebbit.roles = { [signer.address]: { role: "owner" } };

        const editInstance = await plebbit.createSubplebbitEdit({
            subplebbitAddress: subplebbit.address,
            subplebbitEdit: { description: "Updated description" },
            signer
        });
        const editPublication = editInstance.toJSONPubsubMessagePublication();

        const { challengeVerifications, dispose } = captureChallengeVerifications();

        const editRequest = makeSubplebbitEditRequest(editPublication, 41);
        const validity = await subplebbit._checkPublicationValidity(editRequest, editRequest.subplebbitEdit, undefined);
        expect(validity).to.be.undefined;
        await subplebbit._publishChallengeVerification({ challengeSuccess: true, challengeErrors: undefined }, editRequest, false);
        expect(challengeVerifications.length).to.equal(1);
        expect(challengeVerifications[0].challengeSuccess).to.be.true;

        const duplicateEditRequest = makeSubplebbitEditRequest(clone(editPublication), 42);
        const duplicateReason = await subplebbit._checkPublicationValidity(
            duplicateEditRequest,
            duplicateEditRequest.subplebbitEdit,
            undefined
        );
        expect(duplicateReason).to.be.undefined; // currently no duplicate guard for subplebbit edits

        await subplebbit._publishChallengeVerification({ challengeSuccess: true, challengeErrors: undefined }, duplicateEditRequest, false);
        expect(challengeVerifications.length).to.equal(2);
        const duplicateEvent = challengeVerifications[1];
        expect(duplicateEvent.challengeSuccess).to.be.true;
        dispose();
    });

    async function createCommentPublication() {
        const signer = await plebbit.createSigner();
        const commentInstance = await generateMockPost(subplebbit.address, plebbit, false, { signer });
        const publication = commentInstance.toJSONPubsubMessagePublication();
        return { signer, publication };
    }
});
