import retry from "retry";
import { parseRawPages, removeNullAndUndefinedValuesRecursively, shortifyCid, throwWithErrorCode } from "./util.js";
import Publication from "./publication.js";
import { RepliesPages } from "./pages.js";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
import { verifyComment, verifyCommentUpdate } from "./signer/signatures.js";
import assert from "assert";
import { PlebbitError } from "./plebbit-error.js";
import { CommentClientsManager } from "./clients/client-manager.js";
import { messages } from "./errors.js";
export class Comment extends Publication {
    constructor(props, plebbit) {
        super(props, plebbit);
        this._isUpdating = false;
        this._setUpdatingState("stopped");
        // these functions might get separated from their `this` when used
        this.publish = this.publish.bind(this);
        this.update = this.update.bind(this);
        this.stop = this.stop.bind(this);
    }
    _initClients() {
        this._clientsManager = new CommentClientsManager(this);
        this.clients = this._clientsManager.clients;
    }
    _initProps(props) {
        // This function is called once at in the constructor
        super._initProps(props);
        this.setCid(props.cid);
        this.parentCid = props.parentCid;
        this.depth = props.depth;
        this.link = props.link;
        this.title = props.title;
        this.thumbnailUrl = props.thumbnailUrl;
        this.thumbnailUrlWidth = props.thumbnailUrlWidth;
        this.thumbnailUrlHeight = props.thumbnailUrlHeight;
        this.content = props.content;
        this.original = props.original;
        this.spoiler = props.spoiler;
        this.protocolVersion = props.protocolVersion;
        this.flair = props.flair;
        this.linkWidth = props.linkWidth;
        this.linkHeight = props.linkHeight;
        this.postCid = props.postCid ? props.postCid : this.depth === 0 ? this.cid : undefined;
        this.setPreviousCid(props.previousCid);
        if (!this.replies)
            this.replies = new RepliesPages({
                pages: undefined,
                pageCids: undefined,
                plebbit: this._plebbit,
                subplebbitAddress: this.subplebbitAddress,
                pagesIpfs: undefined,
                parentCid: this.cid
            });
    }
    async _initCommentUpdate(props) {
        if (!this.original)
            this.original = removeNullAndUndefinedValuesRecursively(lodash.pick(this.toJSONPubsubMessagePublication(), ["author", "flair", "content", "protocolVersion"]));
        this._rawCommentUpdate = props;
        this.upvoteCount = props.upvoteCount;
        this.downvoteCount = props.downvoteCount;
        this.replyCount = props.replyCount;
        this.updatedAt = props.updatedAt;
        this.deleted = props.edit?.deleted;
        this.pinned = props.pinned;
        this.locked = props.locked;
        this.removed = props.removed;
        this.reason = props.reason || props.edit?.reason;
        this.edit = props.edit;
        this.protocolVersion = props.protocolVersion;
        // Merge props from original comment and CommentUpdate
        this.spoiler =
            typeof props.spoiler === "boolean"
                ? props.spoiler
                : typeof props.edit?.spoiler === "boolean"
                    ? props.edit?.spoiler
                    : this.spoiler;
        this.author.subplebbit = props.author?.subplebbit;
        if (props.edit?.content)
            this.content = props.edit.content;
        this.flair = props.flair || props.edit?.flair || this.flair;
        this.author.flair = props.author?.subplebbit?.flair || props.edit?.author?.flair || this.author?.flair;
        this.lastChildCid = props.lastChildCid;
        this.lastReplyTimestamp = props.lastReplyTimestamp;
        assert(this.cid);
        if (props.replies) {
            const parsedPages = await parseRawPages(props.replies, this._plebbit);
            this.replies.updateProps({
                ...parsedPages,
                plebbit: this._plebbit,
                subplebbitAddress: this.subplebbitAddress,
                pageCids: props.replies.pageCids,
                parentCid: this.cid
            });
        }
    }
    getType() {
        return "comment";
    }
    toJSON() {
        const base = this.cid
            ? { ...this.toJSONAfterChallengeVerification(), shortCid: this.shortCid }
            : this.toJSONPubsubMessagePublication();
        return {
            ...base,
            ...(typeof this.updatedAt === "number"
                ? {
                    author: this.author.toJSON(),
                    original: this.original,
                    upvoteCount: this.upvoteCount,
                    downvoteCount: this.downvoteCount,
                    replyCount: this.replyCount,
                    updatedAt: this.updatedAt,
                    deleted: this.deleted,
                    pinned: this.pinned,
                    locked: this.locked,
                    removed: this.removed,
                    reason: this.reason,
                    edit: this.edit,
                    protocolVersion: this.protocolVersion,
                    spoiler: this.spoiler,
                    flair: this.flair,
                    replies: this.replies?.toJSON(),
                    lastChildCid: this.lastChildCid,
                    lastReplyTimestamp: this.lastReplyTimestamp
                }
                : {}),
            shortSubplebbitAddress: this.shortSubplebbitAddress,
            author: this.author.toJSON()
        };
    }
    toJSONPagesIpfs(commentUpdate) {
        assert(this.cid && this.postCid);
        return {
            comment: {
                ...this.toJSONIpfs(),
                author: this.author.toJSONIpfs(),
                cid: this.cid,
                postCid: this.postCid
            },
            update: commentUpdate
        };
    }
    toJSONIpfs() {
        if (typeof this.depth !== "number")
            throw Error("comment.depth should be defined before calling toJSONIpfs");
        return {
            ...this.toJSONPubsubMessagePublication(),
            previousCid: this.previousCid,
            postCid: this.depth === 0 ? undefined : this.postCid,
            depth: this.depth,
            thumbnailUrl: this.thumbnailUrl,
            thumbnailUrlWidth: this.thumbnailUrlWidth,
            thumbnailUrlHeight: this.thumbnailUrlHeight
        };
    }
    toJSONPubsubMessagePublication() {
        return {
            ...super.toJSONPubsubMessagePublication(),
            content: this.content,
            parentCid: this.parentCid,
            flair: this.flair,
            spoiler: this.spoiler,
            link: this.link,
            linkWidth: this.linkWidth,
            linkHeight: this.linkHeight,
            title: this.title
        };
    }
    toJSONAfterChallengeVerification() {
        assert(this.cid && this.postCid);
        return { ...this.toJSONIpfs(), postCid: this.postCid, cid: this.cid };
    }
    toJSONCommentsTableRowInsert(publicationHash, authorSignerAddress) {
        assert(this.cid && this.postCid);
        return {
            ...this.toJSONIpfs(),
            postCid: this.postCid,
            cid: this.cid,
            authorAddress: this.author.address,
            challengeRequestPublicationSha256: publicationHash,
            authorSignerAddress
        };
    }
    toJSONMerged() {
        assert(typeof this.updatedAt === "number" && this.original && this.shortCid);
        return {
            ...this.toJSONAfterChallengeVerification(),
            shortCid: this.shortCid,
            shortSubplebbitAddress: this.shortSubplebbitAddress,
            author: this.author.toJSON(),
            original: this.original,
            upvoteCount: this.upvoteCount,
            downvoteCount: this.downvoteCount,
            replyCount: this.replyCount,
            updatedAt: this.updatedAt,
            deleted: this.deleted,
            pinned: this.pinned,
            locked: this.locked,
            removed: this.removed,
            reason: this.reason,
            edit: this.edit,
            protocolVersion: this.protocolVersion,
            spoiler: this.spoiler,
            flair: this.flair,
            replies: this.replies?.toJSON(),
            lastChildCid: this.lastChildCid,
            lastReplyTimestamp: this.lastReplyTimestamp
        };
    }
    setPostCid(newPostCid) {
        this.postCid = newPostCid;
    }
    setCid(newCid) {
        this.cid = newCid;
        if (this.cid)
            this.shortCid = shortifyCid(this.cid);
    }
    setPreviousCid(newPreviousCid) {
        this.previousCid = newPreviousCid;
    }
    setDepth(newDepth) {
        this.depth = newDepth;
    }
    setUpdatedAt(newUpdatedAt) {
        this.updatedAt = newUpdatedAt;
    }
    async _retryLoadingCommentIpfs(log) {
        return new Promise((resolve) => {
            this._loadingOperation.attempt(async (curAttempt) => {
                log.trace(`Retrying to load comment ipfs (${this.cid}) for the ${curAttempt}th time`);
                try {
                    this._setUpdatingState("fetching-ipfs");
                    const res = await this._clientsManager.fetchCommentCid(this.cid);
                    this._setUpdatingState("succeeded");
                    resolve(res);
                }
                catch (e) {
                    if (e["details"])
                        e.details.commentCid = this.cid;
                    this._setUpdatingState("failed");
                    log.error(`Error on loading comment ipfs (${this.cid}) for the ${curAttempt}th time`, e.toString());
                    this._loadingOperation.retry(e);
                }
            });
        });
    }
    async _retryLoadingCommentUpdate(log) {
        return new Promise((resolve) => {
            this._loadingOperation.attempt(async (curAttempt) => {
                log.trace(`Retrying to load CommentUpdate (${this.cid}) for the ${curAttempt}th time`);
                try {
                    const update = await this._clientsManager.fetchCommentUpdate();
                    resolve(update);
                }
                catch (e) {
                    if (e["details"])
                        e.details.commentCid = this.cid;
                    this._setUpdatingState("failed");
                    log.error(`Error when loading CommentUpdate (${this.cid}) on the ${curAttempt}th attempt`, e.toString());
                    this._loadingOperation.retry(e);
                }
            });
        });
    }
    async updateOnce() {
        const log = Logger("plebbit-js:comment:update");
        this._loadingOperation = retry.operation({ forever: true, factor: 2 });
        if (this.cid && typeof this.depth !== "number" && !this._rawCommentIpfs) {
            // User may have attempted to call plebbit.createComment({cid}).update
            this._rawCommentIpfs = await this._retryLoadingCommentIpfs(log); // Will keep retrying to load until comment.stop() is called
            // Can potentially throw if resolver if not working
            const commentIpfsValidation = await verifyComment(this._rawCommentIpfs, this._plebbit.resolveAuthorAddresses, this._clientsManager, true);
            if (!commentIpfsValidation.valid) {
                // This is a crticial error, it should stop the comment from updating
                log.error(`The signature of CommentIpfs (${this.cid}) is invalid, this is a critical error and will stop the update loop`);
                this._updateState("stopped");
                await this._stopUpdateLoop();
                this._setUpdatingState("failed");
                this.emit("error", new PlebbitError("ERR_COMMENT_IPFS_SIGNATURE_IS_INVALID", {
                    commentIpfs: this._rawCommentIpfs,
                    commentIpfsValidation,
                    cid: this.cid
                }));
                return;
            }
            log(`Loaded the CommentIpfs props of cid (${this.cid}) correctly, updating the instance props`);
            this._initProps({ ...this._rawCommentIpfs, cid: this.cid });
            this.emit("update", this);
        }
        const commentUpdate = await this._retryLoadingCommentUpdate(log); // Will keep retrying to load until comment.stop() is called
        if (commentUpdate && (this.updatedAt || 0) < commentUpdate.updatedAt) {
            log(`Comment (${this.cid}) received a new CommentUpdate. Will verify signature`);
            //@ts-expect-error
            const commentInstance = lodash.pick(this, ["cid", "signature"]);
            // Can potentially throw if resolver if not working
            const signatureValidity = await verifyCommentUpdate(commentUpdate, this._plebbit.resolveAuthorAddresses, this._clientsManager, this.subplebbitAddress, commentInstance, true);
            if (!signatureValidity.valid) {
                this._setUpdatingState("failed");
                const err = new PlebbitError("ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID", { signatureValidity, commentUpdate });
                log.error(err.toString());
                this.emit("error", err);
                return;
            }
            this._setUpdatingState("succeeded");
            await this._initCommentUpdate(commentUpdate);
            this.emit("update", this);
        }
        else if (commentUpdate) {
            log.trace(`Comment (${this.cid}) has no new update`);
            this._setUpdatingState("succeeded");
            // await this._initCommentUpdate(commentUpdate); // Not sure if needed, will check later
        }
    }
    _setUpdatingState(newState) {
        this.updatingState = newState;
        this.emit("updatingstatechange", this.updatingState);
    }
    _setRpcClientState(newState) {
        const currentRpcUrl = Object.keys(this.clients.plebbitRpcClients)[0];
        if (newState === this.clients.plebbitRpcClients[currentRpcUrl].state)
            return;
        this.clients.plebbitRpcClients[currentRpcUrl].state = newState;
        this.clients.plebbitRpcClients[currentRpcUrl].emit("statechange", newState);
    }
    _updateRpcClientStateFromUpdatingState(updatingState) {
        // We're deriving the the rpc state from publishing state
        const rpcState = updatingState === "failed" || updatingState === "succeeded" ? "stopped" : updatingState;
        this._setRpcClientState(rpcState);
    }
    _isCriticalRpcError(err) {
        // Critical Errors for now are:
        // Invalid signature of CommentIpfs
        return err.message === messages["ERR_COMMENT_IPFS_SIGNATURE_IS_INVALID"];
    }
    async update() {
        const log = Logger("plebbit-js:comment:update");
        if (this._plebbit.plebbitRpcClient) {
            try {
                this._updateRpcSubscriptionId = await this._plebbit.plebbitRpcClient.commentUpdate(this.cid);
                this._updateState("updating");
            }
            catch (e) {
                log.error("Failed to receive commentUpdate from RPC due to error", e);
                this._updateState("stopped");
                this._setUpdatingState("failed");
                throw e;
            }
            this._plebbit.plebbitRpcClient
                .getSubscription(this._updateRpcSubscriptionId)
                .on("update", async (updateProps) => {
                if (updateProps.params.result.subplebbitAddress) {
                    log(`Received new CommentIpfs (${this.cid}) from RPC (${this._plebbit.plebbitRpcClientsOptions[0]})`);
                    //@ts-expect-error
                    this._rawCommentIpfs = lodash.omit(updateProps.params.result, "cid");
                    this._initProps(updateProps.params.result);
                }
                else {
                    log(`Received new CommentUpdate (${this.cid}) from RPC (${this._plebbit.plebbitRpcClientsOptions[0]})`);
                    await this._initCommentUpdate(updateProps.params.result);
                }
                this.emit("update", this);
            })
                .on("updatingstatechange", (args) => {
                const updateState = args.params.result;
                this._setUpdatingState(updateState);
                this._updateRpcClientStateFromUpdatingState(updateState);
            })
                .on("statechange", (args) => this._updateState(args.params.result))
                .on("error", async (args) => {
                if (this._isCriticalRpcError(args.params.result)) {
                    this._setUpdatingState("failed");
                    this._updateState("stopped");
                    await this._stopUpdateLoop();
                }
                this.emit("error", args.params.result);
            });
            this._plebbit.plebbitRpcClient.emitAllPendingMessages(this._updateRpcSubscriptionId);
            this._isUpdating = true;
        }
        if (this._isUpdating)
            return; // Do nothing if it's already updating
        this._isUpdating = true;
        this._updateState("updating");
        const updateLoop = (async () => {
            if (this._isUpdating)
                this.updateOnce()
                    .catch((e) => log.error("Failed to update comment", e))
                    .finally(() => (this._updateInterval = setTimeout(updateLoop, this._plebbit.updateInterval)));
        }).bind(this);
        updateLoop();
    }
    async _stopUpdateLoop() {
        this._loadingOperation?.stop();
        this._updateInterval = clearTimeout(this._updateInterval);
        this._isUpdating = false;
        if (this._updateRpcSubscriptionId) {
            await this._plebbit.plebbitRpcClient.unsubscribe(this._updateRpcSubscriptionId);
            this._updateRpcSubscriptionId = undefined;
            this._setRpcClientState("stopped");
        }
    }
    async stop() {
        await super.stop();
        this._setUpdatingState("stopped");
        await this._stopUpdateLoop();
    }
    async _validateSignature() {
        const commentObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication())); // Stringify so it resembles messages from pubsub
        const signatureValidity = await verifyComment(commentObj, this._plebbit.resolveAuthorAddresses, this._clientsManager, true); // If author domain is not resolving to signer, then don't throw an error
        if (!signatureValidity.valid)
            throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity });
    }
    async publish() {
        await this._validateSignature();
        return super.publish();
    }
}
//# sourceMappingURL=comment.js.map