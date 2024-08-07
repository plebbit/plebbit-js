import retry from "retry";
import { parseRawPages, removeUndefinedValuesRecursively, shortifyCid, throwWithErrorCode } from "../../util.js";
import Publication from "../publication.js";
import { RepliesPages } from "../../pages.js";
import Logger from "@plebbit/plebbit-logger";
import { verifyComment, verifyCommentUpdate } from "../../signer/signatures.js";
import assert from "assert";
import { PlebbitError } from "../../plebbit-error.js";
import { CommentClientsManager } from "../../clients/client-manager.js";
import { messages } from "../../errors.js";
import * as remeda from "remeda";
export class Comment extends Publication {
    constructor(plebbit) {
        super(plebbit);
        this._isUpdating = false;
        this._setUpdatingState("stopped");
        // these functions might get separated from their `this` when used
        this.publish = this.publish.bind(this);
        this.update = this.update.bind(this);
        this.stop = this.stop.bind(this);
        this.replies = new RepliesPages({
            pages: {},
            pageCids: {},
            plebbit: this._plebbit,
            subplebbitAddress: this.subplebbitAddress,
            pagesIpfs: undefined,
            parentCid: this.cid
        });
    }
    _initClients() {
        this._clientsManager = new CommentClientsManager(this);
        this.clients = this._clientsManager.clients;
    }
    _setOriginalFieldBeforeModifying() {
        // Need to make sure we have the props first
        if (!this.original && this.protocolVersion)
            this.original = removeUndefinedValuesRecursively(remeda.pick(this.toJSONPubsubMessagePublication(), ["author", "flair", "content", "protocolVersion"]));
    }
    _initLocalProps(props) {
        super._initBaseLocalProps(props);
        this.content = props.content;
        this.flair = props.flair;
        this.link = props.link;
        this.linkHeight = props.linkHeight;
        this.linkWidth = props.linkWidth;
        this.parentCid = props.parentCid;
        this.spoiler = props.spoiler;
        this.timestamp = props.timestamp;
        this.title = props.title;
        this.linkHtmlTagName = props.linkHtmlTagName;
    }
    _initPubsubMessageProps(props) {
        super._initBaseRemoteProps(props);
        this.content = props.content;
        this.flair = props.flair;
        this.link = props.link;
        this.linkHeight = props.linkHeight;
        this.linkWidth = props.linkWidth;
        this.parentCid = props.parentCid;
        this.spoiler = props.spoiler;
        this.title = props.title;
        this.linkHtmlTagName = props.linkHtmlTagName;
    }
    _initIpfsProps(props) {
        // we're loading remote CommentIpfs
        this._setOriginalFieldBeforeModifying();
        this._initPubsubMessageProps(props);
        this.depth = props.depth;
        const postCid = props.postCid ? props.postCid : this.cid && this.depth === 0 ? this.cid : undefined;
        if (!postCid)
            throw Error("There is no way to set comment.postCid");
        this.setPostCid(postCid);
        this.setPreviousCid(props.previousCid);
        this.thumbnailUrl = props.thumbnailUrl;
        this.thumbnailUrlHeight = props.thumbnailUrlHeight;
        this.thumbnailUrlWidth = props.thumbnailUrlWidth;
    }
    _initChallengeRequestProps(props) {
        super._initChallengeRequestChallengeProps(props);
        this._initPubsubMessageProps(props.publication);
    }
    async _initCommentUpdate(props) {
        if ("depth" in props)
            // CommentWithCommentUpdateJson
            this.original = props.original;
        else {
            // CommentUpdate
            this._setOriginalFieldBeforeModifying();
            this._rawCommentUpdate = props;
        }
        this.upvoteCount = props.upvoteCount;
        this.downvoteCount = props.downvoteCount;
        this.replyCount = props.replyCount;
        this.updatedAt = props.updatedAt;
        this.deleted = props.edit?.deleted;
        this.pinned = props.pinned;
        this.locked = props.locked;
        this.removed = props.removed;
        this.reason = props.reason;
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
        await this._updateRepliesPostsInstance(props.replies);
    }
    async _updateRepliesPostsInstance(newReplies) {
        assert(this.cid, "Can't update comment.replies without comment.cid being defined");
        const log = Logger("plebbit-js:comment:_updateRepliesPostsInstanceIfNeeded");
        if (!newReplies) {
            this.replies.resetPages();
        }
        else if (!("pages" in newReplies)) {
            // only pageCids is provided
            this.replies.pageCids = newReplies.pageCids;
        }
        else {
            const shouldUpdateReplies = !remeda.isDeepEqual(this.replies.pageCids, newReplies.pageCids);
            if (shouldUpdateReplies) {
                log.trace(`Updating the props of commennt instance (${this.cid}) replies`);
                const parsedPages = (await parseRawPages(newReplies, this._plebbit));
                this.replies.updateProps({
                    ...parsedPages,
                    plebbit: this._plebbit,
                    subplebbitAddress: this.subplebbitAddress,
                    pageCids: newReplies.pageCids,
                    parentCid: this.cid
                });
            }
        }
    }
    _updateLocalCommentPropsWithVerification(props) {
        if (!props)
            throw Error("Should not try to update comment instance with empty props");
        this.setCid(props.cid);
        this._initIpfsProps(props);
    }
    getType() {
        return "comment";
    }
    toJSON() {
        const base = this.cid && this.author.subplebbit
            ? this.toJSONAfterChallengeVerification()
            : this.cid
                ? this.toJSONCommentIpfsWithCid()
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
            shortCid: this.shortCid,
            author: this.author.toJSON()
        };
    }
    toJSONCommentIpfsWithCid() {
        assert(this.cid && this.postCid, "Need to defined cid and postCid before calling toJSONCommentIpfsWithCid");
        return {
            ...this.toJSONIpfs(),
            author: this.author.toJSONIpfs(),
            cid: this.cid,
            postCid: this.postCid
        };
    }
    toJSONPagesIpfs(commentUpdate) {
        return {
            comment: this.toJSONCommentIpfsWithCid(),
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
            subplebbitAddress: this.subplebbitAddress,
            timestamp: this.timestamp,
            signature: this.signature,
            author: this.author.toJSONIpfs(),
            protocolVersion: this.protocolVersion,
            content: this.content,
            parentCid: this.parentCid,
            flair: this.flair, // TODO should make sure it's initialized by author, not by mod
            spoiler: this.spoiler, // TODO should make sure it's initalized by author, not by mod
            link: this.link,
            linkWidth: this.linkWidth,
            linkHeight: this.linkHeight,
            title: this.title,
            linkHtmlTagName: this.linkHtmlTagName
        };
    }
    toJSONAfterChallengeVerification() {
        assert(this.cid && this.postCid, "cid and postCid should be defined before calling toJSONAfterChallengeVerification");
        return { ...this.toJSONCommentIpfsWithCid(), author: this.author.toJSONAfterChallengeVerification() };
    }
    toJSONCommentsTableRowInsert(publicationHash, authorSignerAddress) {
        assert(this.cid && this.postCid, "cid and postCid should be defined before calling toJSONCommentsTableRowInsert");
        return {
            ...this.toJSONIpfs(),
            postCid: this.postCid,
            cid: this.cid,
            authorAddress: this.author.address,
            challengeRequestPublicationSha256: publicationHash,
            authorSignerAddress
        };
    }
    toJSONCommentWithinPage() {
        assert(typeof this.updatedAt === "number" &&
            this.original &&
            this.shortCid &&
            typeof this.upvoteCount === "number" &&
            typeof this.downvoteCount === "number" &&
            typeof this.replyCount === "number", "updatedAt, original, shortCid, upvoteCount, downvoteCount, replyCount should be defined before calling toJSONMerged");
        return {
            ...this.toJSONCommentIpfsWithCid(),
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
            lastReplyTimestamp: this.lastReplyTimestamp,
            shortSubplebbitAddress: this.shortSubplebbitAddress,
            shortCid: this.shortCid
        };
    }
    setPostCid(newPostCid) {
        this.postCid = newPostCid;
    }
    setCid(newCid) {
        this.cid = newCid;
        this.shortCid = shortifyCid(this.cid);
        this.replies._parentCid = this.cid;
    }
    setSubplebbitAddress(newSubplebbitAddress) {
        super.setSubplebbitAddress(newSubplebbitAddress);
        this.replies._subplebbitAddress = newSubplebbitAddress;
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
    async _retryLoadingCommentIpfs(cid, log) {
        return new Promise((resolve) => {
            this._loadingOperation.attempt(async (curAttempt) => {
                log.trace(`Retrying to load comment ipfs (${this.cid}) for the ${curAttempt}th time`);
                try {
                    this._setUpdatingState("fetching-ipfs");
                    const res = await this._clientsManager.fetchCommentCid(cid);
                    this._setUpdatingState("succeeded");
                    resolve(res);
                }
                catch (e) {
                    if (e instanceof PlebbitError && e.details)
                        e.details.commentCid = this.cid;
                    this._setUpdatingState("failed");
                    log.error(`Error on loading comment ipfs (${this.cid}) for the ${curAttempt}th time`, e);
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
                    if (e instanceof PlebbitError && e.details)
                        e.details.commentCid = this.cid;
                    this._setUpdatingState("failed");
                    log.error(`Error when loading CommentUpdate (${this.cid}) on the ${curAttempt}th attempt`, e);
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
            const newCommentIpfs = await this._retryLoadingCommentIpfs(this.cid, log); // Will keep retrying to load until comment.stop() is called
            // Can potentially throw if resolver if not working
            const commentIpfsValidation = await verifyComment(newCommentIpfs, this._plebbit.resolveAuthorAddresses, this._clientsManager, true);
            if (!commentIpfsValidation.valid) {
                // This is a crticial error, it should stop the comment from updating
                log.error(`The signature of CommentIpfs (${this.cid}) is invalid, this is a critical error and will stop the update loop`);
                this._updateState("stopped");
                await this._stopUpdateLoop();
                this._setUpdatingState("failed");
                this._rawCommentIpfs = undefined;
                this.emit("error", new PlebbitError("ERR_COMMENT_IPFS_SIGNATURE_IS_INVALID", {
                    invalidCommentIpfs: newCommentIpfs,
                    commentIpfsValidation,
                    cid: this.cid
                }));
                return;
            }
            log(`Loaded the CommentIpfs props of cid (${this.cid}) correctly, updating the instance props`);
            this._rawCommentIpfs = newCommentIpfs;
            this._initIpfsProps(this._rawCommentIpfs);
            this.emit("update", this);
        }
        const commentUpdate = await this._retryLoadingCommentUpdate(log); // Will keep retrying to load until comment.stop() is called
        if (commentUpdate && (this.updatedAt || 0) < commentUpdate.updatedAt) {
            log(`Comment (${this.cid}) received a new CommentUpdate. Will verify signature`);
            const commentInstance = remeda.pick(this.toJSONCommentIpfsWithCid(), ["cid", "signature"]);
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
            this._rawCommentUpdate = commentUpdate;
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
        if (newState === this.updatingState)
            return;
        this.updatingState = newState;
        this.emit("updatingstatechange", this.updatingState);
    }
    _setRpcClientState(newState) {
        const currentRpcUrl = remeda.keys.strict(this.clients.plebbitRpcClients)[0];
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
            const rpcUrl = this._plebbit.plebbitRpcClientsOptions[0];
            if (!rpcUrl)
                throw Error("Failed to get rpc url");
            if (!this.cid)
                throw Error("Can't start updating comment without defining this.cid");
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
                const newUpdate = updateProps.params.result;
                if ("subplebbitAddress" in newUpdate) {
                    log(`Received new CommentIpfs (${this.cid}) from RPC (${rpcUrl})`);
                    this._rawCommentIpfs = remeda.omit(newUpdate, ["cid"]);
                    this._initIpfsProps(this._rawCommentIpfs);
                }
                else {
                    log(`Received new CommentUpdate (${this.cid}) from RPC (${rpcUrl})`);
                    await this._initCommentUpdate(newUpdate);
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
                const err = args.params.result;
                if (this._isCriticalRpcError(err)) {
                    this._setUpdatingState("failed");
                    this._updateState("stopped");
                    await this._stopUpdateLoop();
                }
                this.emit("error", err);
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
        if (this.state === "publishing")
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