"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subplebbit = void 0;
const it_last_1 = __importDefault(require("it-last"));
const to_string_1 = require("uint8arrays/to-string");
const events_1 = __importDefault(require("events"));
const js_sha256_1 = require("js-sha256");
const from_string_1 = require("uint8arrays/from-string");
const challenge_1 = require("./challenge");
const assert_1 = __importDefault(require("assert"));
const db_handler_1 = require("./runtime/browser/db-handler");
const captcha_1 = require("./runtime/browser/captcha");
const sort_handler_1 = require("./sort-handler");
const util_1 = require("./util");
const signer_1 = require("./signer");
const pages_1 = require("./pages");
const comment_1 = require("./comment");
const vote_1 = __importDefault(require("./vote"));
const post_1 = __importDefault(require("./post"));
const util_2 = require("./signer/util");
const debugs = (0, util_1.getDebugLevels)("subplebbit");
const DEFAULT_UPDATE_INTERVAL_MS = 60000;
const DEFAULT_SYNC_INTERVAL_MS = 100000; // 5 minutes
class Subplebbit extends events_1.default {
    constructor(props, plebbit) {
        super();
        this.plebbit = plebbit;
        this.initSubplebbit(props);
        this._challengeToSolution = {}; // Map challenge ID to its solution
        this._challengeToPublication = {}; // To hold unpublished posts/comments/votes
        this.provideCaptchaCallback = undefined;
        this.validateCaptchaAnswerCallback = undefined;
        // these functions might get separated from their `this` when used
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.stop = this.stop.bind(this);
        this.edit = this.edit.bind(this);
    }
    initSubplebbit(newProps) {
        const oldProps = this.toJSONInternal();
        const mergedProps = Object.assign(Object.assign({}, oldProps), newProps);
        this.title = mergedProps["title"];
        this.description = mergedProps["description"];
        this.moderatorsAddresses = mergedProps["moderatorsAddresses"];
        this.latestPostCid = mergedProps["latestPostCid"];
        this._dbConfig = mergedProps["database"];
        this.posts =
            mergedProps["posts"] instanceof Object
                ? new pages_1.Pages(Object.assign(Object.assign({}, mergedProps["posts"]), { subplebbit: this }))
                : mergedProps["posts"];
        this.address = mergedProps["address"];
        this.ipnsKeyName = mergedProps["ipnsKeyName"];
        this.pubsubTopic = mergedProps["pubsubTopic"] || this.address;
        this.sortHandler = new sort_handler_1.SortHandler(this);
        this.challengeTypes = mergedProps["challengeTypes"];
        this.metricsCid = mergedProps["metricsCid"];
        this.createdAt = mergedProps["createdAt"];
        this.updatedAt = mergedProps["updatedAt"];
        this.signer = mergedProps["signer"];
        this.encryption = mergedProps["encryption"];
    }
    initSignerIfNeeded() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.dbHandler) {
                const dbSigner = yield this.dbHandler.querySubplebbitSigner(undefined);
                if (!dbSigner) {
                    (0, assert_1.default)(this.signer, "Subplebbit needs a signer to start");
                    debugs.INFO(`Subplebbit has no signer in DB, will insert provided signer from createSubplebbitOptions into DB`);
                    yield this.dbHandler.insertSigner(Object.assign(Object.assign({}, this.signer), { ipnsKeyName: this.signer.address, usage: db_handler_1.SIGNER_USAGES.SUBPLEBBIT }), undefined);
                }
                else if (!this.signer) {
                    debugs.DEBUG(`Subplebbit loaded signer from DB`);
                    this.signer = dbSigner;
                }
            }
            this.encryption = {
                type: this.signer.type,
                publicKey: this.signer.publicKey
            };
            if (!this.address && this.signer) {
                // Look for subplebbit address (key.id) in the ipfs node
                const ipnsKeys = yield this.plebbit.ipfsClient.key.list();
                const ipfsKey = ipnsKeys.filter((key) => key.name === this.signer.address)[0];
                debugs.DEBUG(Boolean(ipfsKey)
                    ? `Owner has provided a signer that maps to ${ipfsKey.id} subplebbit address within ipfs node`
                    : `Owner has provided a signer that doesn't map to any subplebbit address within the ipfs node`);
                this.address = ipfsKey === null || ipfsKey === void 0 ? void 0 : ipfsKey.id;
            }
        });
    }
    initDbIfNeeded() {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, db_handler_1.subplebbitInitDbIfNeeded)(this);
        });
    }
    setProvideCaptchaCallback(newCallback) {
        this.provideCaptchaCallback = newCallback;
    }
    setValidateCaptchaAnswerCallback(newCallback) {
        this.validateCaptchaAnswerCallback = newCallback;
    }
    toJSONInternal() {
        return Object.assign(Object.assign({}, this.toJSON()), { ipnsKeyName: this.ipnsKeyName, database: this._dbConfig, signer: this.signer });
    }
    toJSON() {
        return {
            title: this.title,
            description: this.description,
            moderatorsAddresses: this.moderatorsAddresses,
            latestPostCid: this.latestPostCid,
            pubsubTopic: this.pubsubTopic,
            address: this.address,
            posts: this.posts,
            challengeTypes: this.challengeTypes,
            metricsCid: this.metricsCid,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            encryption: this.encryption
        };
    }
    prePublish() {
        return __awaiter(this, void 0, void 0, function* () {
            // Import ipfs key into node (if not imported already)
            // Initialize signer
            // Initialize address (needs signer)
            // Initialize db (needs address)
            if (!this.signer && this.address) {
                // Load signer from DB
                yield this.initDbIfNeeded();
            }
            else if (!this.address && this.signer)
                this.address = this.signer.address;
            yield this.initDbIfNeeded();
            (0, assert_1.default)(this.address && this.signer, "Both address and signer need to be defined at this point");
            if (!this.pubsubTopic)
                this.pubsubTopic = this.address;
            // import ipfs key into ipfs node
            const subplebbitIpfsNodeKey = (yield this.plebbit.ipfsClient.key.list()).filter((key) => key.name === this.signer.address)[0];
            if (!subplebbitIpfsNodeKey) {
                const ipfsKey = yield (0, util_1.ipfsImportKey)(Object.assign(Object.assign({}, this.signer), { ipnsKeyName: this.signer.address }), this.plebbit);
                this.ipnsKeyName = ipfsKey["name"] || ipfsKey["Name"];
                debugs.INFO(`Imported subplebbit keys into ipfs node, ${JSON.stringify(ipfsKey)}`);
            }
            else {
                debugs.TRACE(`Subplebbit key is already in ipfs node, no need to import (${JSON.stringify(subplebbitIpfsNodeKey)})`);
                this.ipnsKeyName = subplebbitIpfsNodeKey["name"] || subplebbitIpfsNodeKey["Name"];
            }
            (0, assert_1.default)(this.ipnsKeyName && this.address && this.signer && this.encryption && this.pubsubTopic, "These fields are needed to run the subplebbit");
        });
    }
    assertDomainResolvesCorrectlyIfNeeded(domain) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.plebbit.resolver.isDomain(domain)) {
                const resolvedAddress = yield this.plebbit.resolver.resolveSubplebbitAddressIfNeeded(domain);
                assert_1.default.strictEqual(resolvedAddress, (_a = this.signer) === null || _a === void 0 ? void 0 : _a.address, `ENS (${this.address}) resolved address (${resolvedAddress}) should be equal to derived address from signer (${(_b = this.signer) === null || _b === void 0 ? void 0 : _b.address})`);
            }
        });
    }
    edit(newSubplebbitOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, assert_1.default)(this.plebbit.ipfsClient && this.dbHandler, "subplebbit.ipfsClient and dbHandler is needed to edit");
            if (newSubplebbitOptions.address)
                yield this.assertDomainResolvesCorrectlyIfNeeded(newSubplebbitOptions.address);
            yield this.prePublish();
            this.initSubplebbit(Object.assign({ updatedAt: (0, util_1.timestamp)() }, newSubplebbitOptions));
            if (newSubplebbitOptions.address) {
                debugs.DEBUG(`Attempting to edit subplebbit.address from ${this.address} to ${newSubplebbitOptions.address}`);
                yield this.dbHandler.changeDbFilename(`${newSubplebbitOptions.address}`);
            }
            const file = yield this.plebbit.ipfsClient.add(JSON.stringify(this));
            yield this.plebbit.ipfsClient.name.publish(file["cid"], {
                lifetime: "72h",
                key: this.ipnsKeyName,
                allowOffline: true
            });
            debugs.INFO(`Subplebbit (${this.address}) props (${Object.keys(newSubplebbitOptions)}) has been edited and its IPNS updated`);
            return this;
        });
    }
    updateOnce() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, assert_1.default)(this.address, "Can't update subplebbit without address");
            try {
                const subplebbitIpns = yield (0, util_1.loadIpnsAsJson)(this.address, this.plebbit);
                if (this.emittedAt !== subplebbitIpns.updatedAt) {
                    this.emittedAt = subplebbitIpns.updatedAt;
                    this.initSubplebbit(subplebbitIpns);
                    debugs.INFO(`Subplebbit received a new update. Will emit an update event`);
                    this.emit("update", this);
                }
                this.initSubplebbit(subplebbitIpns);
                return this;
            }
            catch (e) {
                debugs.ERROR(`Failed to update subplebbit IPNS, error: ${e}`);
            }
        });
    }
    update(updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS) {
        debugs.DEBUG(`Starting to poll updates for subplebbit (${this.address}) every ${updateIntervalMs} milliseconds`);
        if (this._updateInterval)
            clearInterval(this._updateInterval);
        this._updateInterval = setInterval(this.updateOnce.bind(this), updateIntervalMs); // One minute
        return this.updateOnce();
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            clearInterval(this._updateInterval);
        });
    }
    updateSubplebbitIpns() {
        return __awaiter(this, void 0, void 0, function* () {
            const trx = yield this.dbHandler.createTransaction();
            const latestPost = yield this.dbHandler.queryLatestPost(trx);
            yield trx.commit();
            const [metrics, [sortedPosts, sortedPostsCids]] = yield Promise.all([
                this.dbHandler.querySubplebbitMetrics(undefined),
                this.sortHandler.generatePagesUnderComment(undefined, undefined)
            ]);
            let currentIpns;
            try {
                currentIpns = yield (0, util_1.loadIpnsAsJson)(this.address, this.plebbit);
            }
            catch (e) {
                debugs.ERROR(`Subplebbit IPNS (${this.address}) is not defined, will publish a new record`);
            }
            let posts;
            if (sortedPosts)
                posts = new pages_1.Pages({
                    pages: {
                        [sort_handler_1.POSTS_SORT_TYPES.HOT.type]: sortedPosts[sort_handler_1.POSTS_SORT_TYPES.HOT.type]
                    },
                    pageCids: sortedPostsCids,
                    subplebbit: this
                });
            const metricsCid = (yield this.plebbit.ipfsClient.add(JSON.stringify(metrics))).path;
            const newSubplebbitOptions = Object.assign(Object.assign(Object.assign(Object.assign({}, (!currentIpns && !posts && !this.createdAt ? { createdAt: (0, util_1.timestamp)() } : {})), (JSON.stringify(posts) !== JSON.stringify(this.posts) ? { posts: posts } : {})), (metricsCid !== this.metricsCid ? { metricsCid: metricsCid } : {})), ((latestPost === null || latestPost === void 0 ? void 0 : latestPost.postCid) !== this.latestPostCid ? { latestPostCid: latestPost === null || latestPost === void 0 ? void 0 : latestPost.postCid } : {}));
            if (JSON.stringify(newSubplebbitOptions) !== "{}") {
                debugs.DEBUG(`Will attempt to sync subplebbit IPNS fields [${Object.keys(newSubplebbitOptions)}]`);
                return this.edit(newSubplebbitOptions);
            }
            else
                debugs.TRACE(`No need to sync subplebbit IPNS`);
        });
    }
    handleCommentEdit(commentEdit, trx) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            (0, assert_1.default)(this.dbHandler, "Need db handler to handleCommentEdit");
            const commentToBeEdited = yield this.dbHandler.queryComment(commentEdit.commentCid, trx);
            if (!commentToBeEdited) {
                debugs.INFO(`Unable to edit comment (${commentEdit.commentCid}) since it's not in local DB. Rejecting user's request to edit comment`);
                return {
                    reason: `commentCid (${commentEdit.commentCid}) does not exist`
                };
            }
            else if (((_a = commentEdit === null || commentEdit === void 0 ? void 0 : commentEdit.editSignature) === null || _a === void 0 ? void 0 : _a.publicKey) !== commentToBeEdited.signature.publicKey) {
                // Original comment and CommentEdit need to have same signer key
                // TODO make exception for moderators
                debugs.INFO(`User attempted to edit a comment (${commentEdit.commentCid}) without having its signer's keys.`);
                return {
                    reason: `Comment edit of ${commentEdit.commentCid} due to having different author keys than original comment`
                };
            }
            else {
                commentEdit.setOriginalContent(commentToBeEdited.originalContent || commentToBeEdited.content);
                yield this.dbHandler.upsertComment(commentEdit, undefined, trx);
                debugs.INFO(`Updated content for comment ${commentEdit.commentCid}`);
            }
        });
    }
    handleVote(newVote, challengeRequestId, trx) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const [lastVote, parentComment] = yield Promise.all([
                this.dbHandler.getLastVoteOfAuthor(newVote.commentCid, newVote.author.address, trx),
                this.dbHandler.queryComment(newVote.commentCid, trx)
            ]);
            if (!parentComment) {
                const msg = `User is trying to publish a vote under a comment (${newVote.commentCid}) that does not exist`;
                debugs.INFO(msg);
                return { reason: msg };
            }
            if (lastVote && newVote.signature.publicKey !== lastVote.signature.publicKey) {
                // Original comment and CommentEdit need to have same key
                // TODO make exception for moderators
                debugs.INFO(`Author (${newVote.author.address}) attempted to edit a comment vote (${newVote.commentCid}) without having correct credentials`);
                return {
                    reason: `Author (${newVote.author.address}) attempted to change vote on  ${newVote.commentCid} without having correct credentials`
                };
            }
            else if ((0, util_1.shallowEqual)(newVote.signature, lastVote === null || lastVote === void 0 ? void 0 : lastVote.signature)) {
                debugs.INFO(`Signature of Vote is identical to original Vote (${newVote.commentCid})`);
                return {
                    reason: `Signature of Vote is identical to original Vote (${newVote.commentCid}) by author ${(_a = newVote === null || newVote === void 0 ? void 0 : newVote.author) === null || _a === void 0 ? void 0 : _a.address}`
                };
            }
            else if ((lastVote === null || lastVote === void 0 ? void 0 : lastVote.vote) === newVote.vote) {
                debugs.INFO(`Author (${newVote === null || newVote === void 0 ? void 0 : newVote.author.address}) has duplicated their vote for comment ${newVote.commentCid}. Returning an error`);
                return { reason: "User duplicated their vote" };
            }
            else {
                yield this.dbHandler.upsertVote(newVote, challengeRequestId, trx);
                debugs.INFO(`Upserted new vote (${newVote.vote}) for comment ${newVote.commentCid}`);
            }
        });
    }
    publishPostAfterPassingChallenge(publication, challengeRequestId) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            delete this._challengeToSolution[challengeRequestId];
            delete this._challengeToPublication[challengeRequestId];
            const postOrCommentOrVote = publication.hasOwnProperty("vote")
                ? yield this.plebbit.createVote(publication)
                : publication.commentCid
                    ? yield this.plebbit.createCommentEdit(publication)
                    : yield this.plebbit.createComment(publication);
            debugs.TRACE(`Attempting to insert new publication into DB: ${JSON.stringify(postOrCommentOrVote)}`);
            const derivedAddress = yield (0, util_2.getPlebbitAddressFromPublicKeyPem)((postOrCommentOrVote instanceof comment_1.CommentEdit && postOrCommentOrVote.editSignature
                ? postOrCommentOrVote.editSignature
                : postOrCommentOrVote.signature).publicKey);
            const resolvedAddress = yield this.plebbit.resolver.resolveAuthorAddressIfNeeded((_a = publication === null || publication === void 0 ? void 0 : publication.author) === null || _a === void 0 ? void 0 : _a.address);
            if (resolvedAddress !== ((_b = publication === null || publication === void 0 ? void 0 : publication.author) === null || _b === void 0 ? void 0 : _b.address)) {
                // Means author.address is a crypto domain
                if (resolvedAddress !== derivedAddress) {
                    // Means ENS's plebbit-author-address is resolving to another address, which shouldn't happen
                    const msg = `domain (${postOrCommentOrVote.author.address}) plebbit-author-address (${resolvedAddress}) does not have the same signer address (${(_c = this.signer) === null || _c === void 0 ? void 0 : _c.address})`;
                    debugs.INFO(msg);
                    return { reason: msg };
                }
            }
            const [signatureIsVerified, failedVerificationReason] = yield (0, signer_1.verifyPublication)(postOrCommentOrVote, this.plebbit);
            if (!signatureIsVerified) {
                const msg = `Author (${postOrCommentOrVote.author.address}) ${postOrCommentOrVote.getType()}'s signature is invalid: ${failedVerificationReason}`;
                debugs.INFO(msg);
                return { reason: msg };
            }
            if (postOrCommentOrVote instanceof vote_1.default) {
                const res = yield this.handleVote(postOrCommentOrVote, challengeRequestId, undefined);
                if (res)
                    return res;
            }
            else if (postOrCommentOrVote instanceof comment_1.CommentEdit) {
                const res = yield this.handleCommentEdit(postOrCommentOrVote, undefined);
                if (res)
                    return res;
            }
            else if (postOrCommentOrVote instanceof comment_1.Comment) {
                // Comment and Post need to add file to ipfs
                const ipnsKeyName = (0, js_sha256_1.sha256)(JSON.stringify(postOrCommentOrVote.toJSONSkeleton()));
                if (yield this.dbHandler.querySigner(ipnsKeyName, undefined)) {
                    const msg = `Failed to insert ${postOrCommentOrVote.getType()} due to previous ${postOrCommentOrVote.getType()} having same ipns key name (duplicate?)`;
                    debugs.INFO(msg);
                    return { reason: msg };
                }
                else {
                    const ipfsSigner = Object.assign(Object.assign({}, (yield this.plebbit.createSigner())), { ipnsKeyName: ipnsKeyName, usage: db_handler_1.SIGNER_USAGES.COMMENT });
                    const [ipfsKey] = yield Promise.all([
                        (0, util_1.ipfsImportKey)(ipfsSigner, this.plebbit),
                        this.dbHandler.insertSigner(ipfsSigner, undefined)
                    ]);
                    postOrCommentOrVote.setCommentIpnsKey(ipfsKey);
                    if (postOrCommentOrVote instanceof post_1.default) {
                        const trx = yield this.dbHandler.createTransaction();
                        postOrCommentOrVote.setPreviousCid((_d = (yield this.dbHandler.queryLatestPost(trx))) === null || _d === void 0 ? void 0 : _d.cid);
                        yield trx.commit();
                        postOrCommentOrVote.setDepth(0);
                        const file = yield this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()));
                        postOrCommentOrVote.setPostCid(file.path);
                        postOrCommentOrVote.setCid(file.path);
                        yield this.dbHandler.upsertComment(postOrCommentOrVote, challengeRequestId, undefined);
                        debugs.INFO(`New post with cid ${postOrCommentOrVote.cid} has been inserted into DB`);
                    }
                    else if (postOrCommentOrVote instanceof comment_1.Comment) {
                        // Comment
                        const trx = yield this.dbHandler.createTransaction();
                        const [commentsUnderParent, parent] = yield Promise.all([
                            this.dbHandler.queryCommentsUnderComment(postOrCommentOrVote.parentCid, trx),
                            this.dbHandler.queryComment(postOrCommentOrVote.parentCid, trx)
                        ]);
                        yield trx.commit();
                        if (!parent) {
                            const msg = `User is trying to publish a comment with content (${postOrCommentOrVote.content}) with incorrect parentCid`;
                            debugs.INFO(msg);
                            return { reason: msg };
                        }
                        postOrCommentOrVote.setPreviousCid((_e = commentsUnderParent[0]) === null || _e === void 0 ? void 0 : _e.cid);
                        postOrCommentOrVote.setDepth(parent.depth + 1);
                        const file = yield this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()));
                        postOrCommentOrVote.setCid(file.path);
                        yield this.dbHandler.upsertComment(postOrCommentOrVote, challengeRequestId, undefined);
                        debugs.INFO(`New comment with cid ${postOrCommentOrVote.cid} has been inserted into DB`);
                    }
                }
            }
            return { publication: postOrCommentOrVote };
        });
    }
    handleChallengeRequest(msgParsed) {
        return __awaiter(this, void 0, void 0, function* () {
            const [providedChallenges, reasonForSkippingCaptcha] = yield this.provideCaptchaCallback(msgParsed);
            const decryptedPublication = JSON.parse(yield (0, signer_1.decrypt)(msgParsed.encryptedPublication.encrypted, msgParsed.encryptedPublication.encryptedKey, this.signer.privateKey));
            this._challengeToPublication[msgParsed.challengeRequestId] = decryptedPublication;
            debugs.DEBUG(`Received a request to a challenge (${msgParsed.challengeRequestId})`);
            if (!providedChallenges) {
                // Subplebbit owner has chosen to skip challenging this user or post
                debugs.DEBUG(`Skipping challenge for ${msgParsed.challengeRequestId}, add publication to IPFS and respond with challengeVerificationMessage right away`);
                yield this.dbHandler.upsertChallenge(new challenge_1.ChallengeRequestMessage(msgParsed), undefined);
                const publishedPublication = yield this.publishPostAfterPassingChallenge(decryptedPublication, msgParsed.challengeRequestId);
                const restOfMsg = "publication" in publishedPublication
                    ? {
                        encryptedPublication: yield (0, signer_1.encrypt)(JSON.stringify(publishedPublication.publication), (publishedPublication.publication.signature || publishedPublication.publication.editSignature).publicKey)
                    }
                    : publishedPublication;
                const challengeVerification = new challenge_1.ChallengeVerificationMessage(Object.assign({ reason: reasonForSkippingCaptcha, challengeSuccess: Boolean(publishedPublication.publication), challengeAnswerId: msgParsed.challengeAnswerId, challengeErrors: undefined, challengeRequestId: msgParsed.challengeRequestId }, restOfMsg));
                yield Promise.all([
                    this.dbHandler.upsertChallenge(challengeVerification, undefined),
                    this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)(JSON.stringify(challengeVerification)))
                ]);
                debugs.INFO(`Published ${challengeVerification.type} (${challengeVerification.challengeRequestId}) over pubsub`);
                this.emit("challengeverification", challengeVerification);
            }
            else {
                const challengeMessage = new challenge_1.ChallengeMessage({
                    challengeRequestId: msgParsed.challengeRequestId,
                    challenges: providedChallenges
                });
                yield Promise.all([
                    this.dbHandler.upsertChallenge(challengeMessage, undefined),
                    this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)(JSON.stringify(challengeMessage)))
                ]);
                debugs.INFO(`Published ${challengeMessage.type} (${challengeMessage.challengeRequestId}) over pubsub`);
            }
        });
    }
    handleChallengeAnswer(msgParsed) {
        return __awaiter(this, void 0, void 0, function* () {
            const [challengeSuccess, challengeErrors] = yield this.validateCaptchaAnswerCallback(msgParsed);
            if (challengeSuccess) {
                debugs.DEBUG(`Challenge (${msgParsed.challengeRequestId}) has been answered correctly`);
                const storedPublication = this._challengeToPublication[msgParsed.challengeRequestId];
                yield this.dbHandler.upsertChallenge(new challenge_1.ChallengeAnswerMessage(msgParsed), undefined);
                const publishedPublication = yield this.publishPostAfterPassingChallenge(storedPublication, msgParsed.challengeRequestId); // could contain "publication" or "reason"
                const restOfMsg = "publication" in publishedPublication
                    ? {
                        encryptedPublication: yield (0, signer_1.encrypt)(JSON.stringify(publishedPublication.publication), (publishedPublication.publication.editSignature || publishedPublication.publication.signature).publicKey)
                    }
                    : publishedPublication;
                const challengeVerification = new challenge_1.ChallengeVerificationMessage(Object.assign({ challengeRequestId: msgParsed.challengeRequestId, challengeAnswerId: msgParsed.challengeAnswerId, challengeSuccess: challengeSuccess, challengeErrors: challengeErrors }, restOfMsg));
                yield Promise.all([
                    this.dbHandler.upsertChallenge(challengeVerification, undefined),
                    this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)(JSON.stringify(challengeVerification)))
                ]);
                debugs.INFO(`Published successful ${challengeVerification.type} (${challengeVerification.challengeRequestId}) over pubsub`);
            }
            else {
                debugs.INFO(`Challenge (${msgParsed.challengeRequestId}) has answered incorrectly`);
                const challengeVerification = new challenge_1.ChallengeVerificationMessage({
                    challengeRequestId: msgParsed.challengeRequestId,
                    challengeAnswerId: msgParsed.challengeAnswerId,
                    challengeSuccess: challengeSuccess,
                    challengeErrors: challengeErrors
                });
                yield Promise.all([
                    this.dbHandler.upsertChallenge(challengeVerification, undefined),
                    this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)(JSON.stringify(challengeVerification)))
                ]);
                debugs.INFO(`Published failed ${challengeVerification.type} (${challengeVerification.challengeRequestId})`);
                this.emit("challengeverification", challengeVerification);
            }
        });
    }
    processCaptchaPubsub(pubsubMsg) {
        return __awaiter(this, void 0, void 0, function* () {
            const msgParsed = JSON.parse((0, to_string_1.toString)(pubsubMsg["data"]));
            if (msgParsed.type === challenge_1.PUBSUB_MESSAGE_TYPES.CHALLENGEREQUEST)
                yield this.handleChallengeRequest(msgParsed);
            else if (msgParsed.type === challenge_1.PUBSUB_MESSAGE_TYPES.CHALLENGEANSWER && this._challengeToPublication[msgParsed.challengeRequestId])
                // Only reply to peers who started a challenge request earlier
                yield this.handleChallengeAnswer(msgParsed);
        });
    }
    defaultProvideCaptcha(challengeRequestMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            // Return question, type
            // Expected return is:
            // captcha, captcha type, reason for skipping captcha (if it's skipped by nullifying captcha)
            const { image, text } = (0, captcha_1.createCaptcha)(300, 100);
            this._challengeToSolution[challengeRequestMessage.challengeRequestId] = [text];
            const imageBuffer = (yield image).toString("base64");
            return [
                [
                    new challenge_1.Challenge({
                        challenge: imageBuffer,
                        type: challenge_1.CHALLENGE_TYPES.IMAGE
                    })
                ]
            ];
        });
    }
    defaultValidateCaptcha(challengeAnswerMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            const actualSolution = this._challengeToSolution[challengeAnswerMessage.challengeRequestId];
            const answerIsCorrect = JSON.stringify(challengeAnswerMessage.challengeAnswers) === JSON.stringify(actualSolution);
            debugs.DEBUG(`Challenge (${challengeAnswerMessage.challengeRequestId}): Answer's validity: ${answerIsCorrect}, user's answer: ${challengeAnswerMessage.challengeAnswers}, actual solution: ${actualSolution}`);
            const challengeErrors = answerIsCorrect ? undefined : ["User solved captcha incorrectly"];
            return [answerIsCorrect, challengeErrors];
        });
    }
    syncComment(dbComment) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, assert_1.default)(dbComment instanceof comment_1.Comment);
            let commentIpns;
            try {
                commentIpns = yield (0, util_1.loadIpnsAsJson)(dbComment.ipnsName, this.plebbit);
            }
            catch (e) {
                debugs.DEBUG(`Failed to load Comment (${dbComment.cid}) IPNS (${dbComment.ipnsName}) while syncing. Will attempt to publish a new IPNS record`);
            }
            if (!commentIpns || !(0, util_1.shallowEqual)(commentIpns, dbComment.toJSONCommentUpdate(), ["replies"])) {
                debugs.DEBUG(`Attempting to update Comment (${dbComment.cid})`);
                yield this._keyv.delete(dbComment.cid);
                if (dbComment.parentCid)
                    yield this._keyv.delete(dbComment.parentCid);
                debugs.DEBUG(`Comment (${dbComment.cid}) IPNS is outdated`);
                const [sortedReplies, sortedRepliesCids] = yield this.sortHandler.generatePagesUnderComment(dbComment, undefined);
                dbComment.setReplies(sortedReplies, sortedRepliesCids);
                dbComment.setUpdatedAt((0, util_1.timestamp)());
                yield this.dbHandler.upsertComment(dbComment, undefined);
                return dbComment.edit(dbComment.toJSONCommentUpdate());
            }
            debugs.TRACE(`Comment (${dbComment.cid}) is up-to-date and does not need syncing`);
        });
    }
    syncIpnsWithDb(syncIntervalMs) {
        return __awaiter(this, void 0, void 0, function* () {
            debugs.TRACE("Starting to sync IPNS with DB");
            try {
                const dbComments = yield this.dbHandler.queryComments(undefined);
                yield Promise.all([...dbComments.map((comment) => __awaiter(this, void 0, void 0, function* () { return this.syncComment(comment); })), this.updateSubplebbitIpns()]);
            }
            catch (e) {
                debugs.WARN(`Failed to sync due to error: ${e}`);
            }
            setTimeout(this.syncIpnsWithDb.bind(this, syncIntervalMs), syncIntervalMs);
        });
    }
    start(syncIntervalMs = DEFAULT_SYNC_INTERVAL_MS) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prePublish();
            if (!this.provideCaptchaCallback) {
                debugs.INFO("Subplebbit owner has not provided any captcha. Will go with default image captcha");
                this.provideCaptchaCallback = this.defaultProvideCaptcha;
                this.validateCaptchaAnswerCallback = this.defaultValidateCaptcha;
            }
            (0, assert_1.default)(this.dbHandler, "A connection to a database is needed for the hosting a subplebbit");
            (0, assert_1.default)(this.pubsubTopic, "Pubsub topic need to defined before publishing");
            yield this.plebbit.pubsubIpfsClient.pubsub.subscribe(this.pubsubTopic, (pubsubMessage) => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.processCaptchaPubsub(pubsubMessage);
                }
                catch (e) {
                    e.message = `failed process captcha: ${e.message}`;
                    debugs.ERROR(e);
                }
            }));
            debugs.INFO(`Waiting for publications on pubsub topic (${this.pubsubTopic})`);
            yield this.syncIpnsWithDb(syncIntervalMs);
        });
    }
    stopPublishing() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            this.removeAllListeners();
            yield this.stop();
            yield this.plebbit.pubsubIpfsClient.pubsub.unsubscribe(this.pubsubTopic);
            (_b = (_a = this.dbHandler) === null || _a === void 0 ? void 0 : _a.knex) === null || _b === void 0 ? void 0 : _b.destroy();
            this.dbHandler = undefined;
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            // For development purposes ONLY
            // Call this only if you know what you're doing
            // rm ipns and ipfs
            yield this.stopPublishing();
            const ipfsPath = yield (0, it_last_1.default)(this.plebbit.ipfsClient.name.resolve(this.address));
            yield this.plebbit.ipfsClient.pin.rm(ipfsPath);
            yield this.plebbit.ipfsClient.key.rm(this.ipnsKeyName);
        });
    }
}
exports.Subplebbit = Subplebbit;
