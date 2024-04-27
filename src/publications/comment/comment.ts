import retry, { RetryOperation } from "retry";
import { parseRawPages, removeUndefinedValuesRecursively, shortifyCid, throwWithErrorCode } from "../../util.js";
import Publication from "../publication.js";
import { RepliesPages } from "../../pages.js";
import {
    AuthorCommentEdit,
    CommentIpfsType,
    CommentIpfsWithCid,
    CommentPubsubMessage,
    CommentsTableRowInsert,
    CommentTypeJson,
    CommentUpdate,
    CommentWithCommentUpdateJson,
    DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor,
    LocalCommentOptions,
    PageTypeJson,
    ProtocolVersion,
    PublicationTypeName,
    RepliesPagesTypeIpfs
} from "../../types.js";

import Logger from "@plebbit/plebbit-logger";
import { Plebbit } from "../../plebbit.js";
import { verifyComment, verifyCommentUpdate } from "../../signer/signatures.js";
import assert from "assert";
import { PlebbitError } from "../../plebbit-error.js";
import { CommentClientsManager } from "../../clients/client-manager.js";
import { messages } from "../../errors.js";
import { Flair } from "../../subplebbit/types.js";
import * as remeda from "remeda";
import Author from "../author.js";

export class Comment extends Publication {
    // Only Comment props
    shortCid?: string;

    clients!: CommentClientsManager["clients"];

    // public (CommentType)
    title?: string;
    link?: string;
    linkWidth?: number;
    linkHeight?: number;
    thumbnailUrl?: string;
    thumbnailUrlWidth?: number;
    thumbnailUrlHeight?: number;
    protocolVersion!: ProtocolVersion;
    cid?: string;
    parentCid?: string;
    content?: string;
    // Props that get defined after challengeverification
    previousCid?: string;
    depth?: number;
    postCid?: string;

    // CommentEdit and CommentUpdate props
    original?: CommentWithCommentUpdateJson["original"];
    upvoteCount?: number;
    downvoteCount?: number;
    replyCount?: number;
    updatedAt?: number;
    replies!: RepliesPages;
    edit?: AuthorCommentEdit;
    flair?: Flair;
    deleted?: boolean;
    spoiler?: boolean;
    pinned?: boolean;
    locked?: boolean;
    removed?: boolean;
    reason?: string;
    lastChildCid?: string;
    lastReplyTimestamp?: number;

    // updating states
    updatingState!:
        | "stopped"
        | "resolving-author-address"
        | "fetching-ipfs"
        | "fetching-update-ipfs"
        | "resolving-subplebbit-address"
        | "fetching-subplebbit-ipns"
        | "fetching-subplebbit-ipfs"
        | "failed"
        | "succeeded";

    // private
    private _updateInterval?: any;
    private _isUpdating: boolean;
    private _rawCommentUpdate?: CommentUpdate;
    private _rawCommentIpfs?: CommentIpfsType;
    private _loadingOperation?: RetryOperation;
    _clientsManager!: CommentClientsManager;
    private _updateRpcSubscriptionId?: number;

    constructor(plebbit: Plebbit) {
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

    private _setOriginalFieldBeforeModifying() {
        if (!this.original)
            this.original = removeUndefinedValuesRecursively(
                remeda.pick(this.toJSONPubsubMessagePublication(), ["author", "flair", "content", "protocolVersion"])
            );
    }

    _initLocalProps(props: LocalCommentOptions) {
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
    }

    _initPubsubMessageProps(props: CommentPubsubMessage){
        super._initBaseRemoteProps(props);
        this.content = props.content;
        this.flair = props.flair;
        this.link = props.link;
        this.linkHeight = props.linkHeight;
        this.linkWidth = props.linkWidth;
        this.parentCid = props.parentCid;
        this.spoiler = props.spoiler;
        this.title = props.title;

    }

    _initIpfsProps(props: CommentIpfsType) {
        // we're loading remote CommentIpfs
        this._initPubsubMessageProps(props);
        this.depth = props.depth;
        this.postCid = props.postCid;
        this.previousCid = props.previousCid;
        this.thumbnailUrl = props.thumbnailUrl;
        this.thumbnailUrlHeight = props.thumbnailUrlHeight;
        this.thumbnailUrlWidth = props.thumbnailUrlWidth;
    }

    async _initCommentUpdate(props: CommentUpdate | CommentWithCommentUpdateJson) {
        this._setOriginalFieldBeforeModifying();
        this._rawCommentUpdate = "depth" in props ? undefined : props;

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
        if (props.edit?.content) this.content = props.edit.content;
        this.flair = props.flair || props.edit?.flair || this.flair;
        this.author.flair = props.author?.subplebbit?.flair || props.edit?.author?.flair || this.author?.flair;
        this.lastChildCid = props.lastChildCid;
        this.lastReplyTimestamp = props.lastReplyTimestamp;

        assert(this.cid, "Can't update comment.replies without comment.cid being defined");
        // reasons to update this.replies

        // this.cid !== this.replies.parentCid
        // this.replies.pageCids !== props.replies.pageCids

        const shouldUpdateReplies =
            this.cid !== this.replies._parentCid ||
            (remeda.isPlainObject(props.replies?.pageCids) && !remeda.isDeepEqual(this.replies.pageCids, props.replies.pageCids));
        if (shouldUpdateReplies) {
            const parsedPages = <Pick<RepliesPages, "pages"> & { pagesIpfs: RepliesPagesTypeIpfs | undefined }>(
                await parseRawPages(props.replies, this._plebbit)
            );
            this.replies.updateProps({
                ...parsedPages,
                plebbit: this._plebbit,
                subplebbitAddress: this.subplebbitAddress,
                pageCids: props.replies?.pageCids || {},
                parentCid: this.cid
            });
        }
    }

    protected _updateLocalCommentPropsWithVerification(
        props: DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor["publication"]
    ) {
        if (!props) return;
        // comment.author will change after challenge verification so we need to make sure the original comment.author is stored somewhere
        this._setOriginalFieldBeforeModifying();

        this.setCid(props.cid);
        this.thumbnailUrl = props.thumbnailUrl;
        this.thumbnailUrlWidth = props.thumbnailUrlWidth;
        this.thumbnailUrlHeight = props.thumbnailUrlHeight;
        this.author = new Author(props.author);
        this.depth = props.depth;

        this.linkWidth = props.linkWidth;
        this.linkHeight = props.linkHeight;
        this.postCid = props.postCid;
        this.setPreviousCid(props.previousCid);
    }

    getType(): PublicationTypeName {
        return "comment";
    }

    toJSON(): CommentTypeJson {
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

    toJSONPagesIpfs(commentUpdate: CommentUpdate): { comment: CommentIpfsWithCid; update: CommentUpdate } {
        assert(this.cid && this.postCid, "Need to defined cid and postCid before calling toJSONPagesIpfs");
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

    toJSONIpfs(): CommentIpfsType {
        if (typeof this.depth !== "number") throw Error("comment.depth should be defined before calling toJSONIpfs");
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

    toJSONPubsubMessagePublication(): CommentPubsubMessage {
        return {
            subplebbitAddress: this.subplebbitAddress,
            timestamp: this.timestamp,
            signature: this.signature,
            author: this.author.toJSONIpfs(),
            protocolVersion: this.protocolVersion,
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

    toJSONAfterChallengeVerification(): CommentIpfsWithCid {
        assert(this.cid && this.postCid, "cid and postCid should be defined before calling toJSONAfterChallengeVerification");
        return { ...this.toJSONIpfs(), postCid: this.postCid, cid: this.cid };
    }

    toJSONCommentsTableRowInsert(
        publicationHash: CommentsTableRowInsert["challengeRequestPublicationSha256"],
        authorSignerAddress: string
    ): CommentsTableRowInsert {
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

    toJSONCommentWithinPage(): PageTypeJson["comments"][0] {
        assert(
            typeof this.updatedAt === "number" &&
                this.original &&
                this.shortCid &&
                typeof this.upvoteCount === "number" &&
                typeof this.downvoteCount === "number" &&
                typeof this.replyCount === "number",
            "updatedAt, original, shortCid, upvoteCount, downvoteCount, replyCount should be defined before calling toJSONMerged"
        );
        return {
            ...this.toJSONAfterChallengeVerification(),
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

    setPostCid(newPostCid: string) {
        this.postCid = newPostCid;
    }

    setCid(newCid: string) {
        this.cid = newCid;
        this.shortCid = shortifyCid(this.cid);
    }

    setPreviousCid(newPreviousCid?: string) {
        this.previousCid = newPreviousCid;
    }

    setDepth(newDepth: number) {
        this.depth = newDepth;
    }

    setUpdatedAt(newUpdatedAt: number) {
        this.updatedAt = newUpdatedAt;
    }

    private async _retryLoadingCommentIpfs(cid: string, log: Logger): Promise<CommentIpfsType> {
        return new Promise((resolve) => {
            this._loadingOperation!.attempt(async (curAttempt) => {
                log.trace(`Retrying to load comment ipfs (${this.cid}) for the ${curAttempt}th time`);
                try {
                    this._setUpdatingState("fetching-ipfs");
                    const res = await this._clientsManager.fetchCommentCid(cid);
                    this._setUpdatingState("succeeded");
                    resolve(res);
                } catch (e) {
                    if (e instanceof PlebbitError && e.details) e.details.commentCid = this.cid;
                    this._setUpdatingState("failed");
                    log.error(`Error on loading comment ipfs (${this.cid}) for the ${curAttempt}th time`, e);
                    this._loadingOperation!.retry(<Error>e);
                }
            });
        });
    }

    private async _retryLoadingCommentUpdate(log: Logger): Promise<CommentUpdate> {
        return new Promise((resolve) => {
            this._loadingOperation!.attempt(async (curAttempt) => {
                log.trace(`Retrying to load CommentUpdate (${this.cid}) for the ${curAttempt}th time`);
                try {
                    const update: CommentUpdate = await this._clientsManager.fetchCommentUpdate();
                    resolve(update);
                } catch (e) {
                    if (e instanceof PlebbitError && e.details) e.details.commentCid = this.cid;
                    this._setUpdatingState("failed");
                    log.error(`Error when loading CommentUpdate (${this.cid}) on the ${curAttempt}th attempt`, e);
                    this._loadingOperation!.retry(<Error>e);
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
            const commentIpfsValidation = await verifyComment(
                newCommentIpfs,
                this._plebbit.resolveAuthorAddresses,
                this._clientsManager,
                true
            );
            if (!commentIpfsValidation.valid) {
                // This is a crticial error, it should stop the comment from updating
                log.error(`The signature of CommentIpfs (${this.cid}) is invalid, this is a critical error and will stop the update loop`);
                this._updateState("stopped");
                await this._stopUpdateLoop();
                this._setUpdatingState("failed");
                this._rawCommentIpfs = undefined;
                this.emit(
                    "error",
                    new PlebbitError("ERR_COMMENT_IPFS_SIGNATURE_IS_INVALID", {
                        commentIpfs: this._rawCommentIpfs,
                        commentIpfsValidation,
                        cid: this.cid
                    })
                );
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
            //@ts-expect-error
            const commentInstance: Pick<CommentIpfsWithCid, "cid" | "signature"> = lodash.pick(this, ["cid", "signature"]);
            // Can potentially throw if resolver if not working
            const signatureValidity = await verifyCommentUpdate(
                commentUpdate,
                this._plebbit.resolveAuthorAddresses,
                this._clientsManager,
                this.subplebbitAddress,
                commentInstance,
                true
            );
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
        } else if (commentUpdate) {
            log.trace(`Comment (${this.cid}) has no new update`);
            this._setUpdatingState("succeeded");
            // await this._initCommentUpdate(commentUpdate); // Not sure if needed, will check later
        }
    }

    _setUpdatingState(newState: Comment["updatingState"]) {
        this.updatingState = newState;
        this.emit("updatingstatechange", this.updatingState);
    }
    protected _setRpcClientState(newState: Comment["clients"]["plebbitRpcClients"][""]["state"]) {
        const currentRpcUrl = remeda.keys.strict(this.clients.plebbitRpcClients)[0];
        if (newState === this.clients.plebbitRpcClients[currentRpcUrl].state) return;
        this.clients.plebbitRpcClients[currentRpcUrl].state = newState;
        this.clients.plebbitRpcClients[currentRpcUrl].emit("statechange", newState);
    }

    protected _updateRpcClientStateFromUpdatingState(updatingState: Comment["updatingState"]) {
        // We're deriving the the rpc state from publishing state

        const rpcState: Comment["clients"]["plebbitRpcClients"][0]["state"] =
            updatingState === "failed" || updatingState === "succeeded" ? "stopped" : updatingState;
        this._setRpcClientState(rpcState);
    }

    private _isCriticalRpcError(err: Error | PlebbitError) {
        // Critical Errors for now are:
        // Invalid signature of CommentIpfs
        return err.message === messages["ERR_COMMENT_IPFS_SIGNATURE_IS_INVALID"];
    }

    async update() {
        const log = Logger("plebbit-js:comment:update");

        if (this._plebbit.plebbitRpcClient) {
            const rpcUrl = this._plebbit.plebbitRpcClientsOptions![0];
            if (!rpcUrl) throw Error("Failed to get rpc url");
            if (!this.cid) throw Error("Can't start updating comment without defining this.cid");
            try {
                this._updateRpcSubscriptionId = await this._plebbit.plebbitRpcClient.commentUpdate(this.cid);
                this._updateState("updating");
            } catch (e) {
                log.error("Failed to receive commentUpdate from RPC due to error", e);
                this._updateState("stopped");
                this._setUpdatingState("failed");
                throw e;
            }
            this._plebbit.plebbitRpcClient
                .getSubscription(this._updateRpcSubscriptionId)
                .on("update", async (updateProps) => {
                    if (updateProps.params.result.subplebbitAddress) {
                        const commentIpfsFromRpc = <CommentIpfsWithCid>updateProps.params.result;
                        log(`Received new CommentIpfs (${this.cid}) from RPC (${rpcUrl})`);
                        this._rawCommentIpfs = remeda.omit(commentIpfsFromRpc, ["cid"]);
                        this._initIpfsProps(this._rawCommentIpfs);
                    } else {
                        log(`Received new CommentUpdate (${this.cid}) from RPC (${rpcUrl})`);
                        const commentUpdateFromRpc = <CommentUpdate>updateProps.params.result;
                        await this._initCommentUpdate(commentUpdateFromRpc);
                    }

                    this.emit("update", this);
                })
                .on("updatingstatechange", (args) => {
                    const updateState: Comment["updatingState"] = args.params.result;
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
        if (this._isUpdating) return; // Do nothing if it's already updating
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

    private async _stopUpdateLoop() {
        this._loadingOperation?.stop();
        this._updateInterval = clearTimeout(this._updateInterval);
        this._isUpdating = false;
        if (this._updateRpcSubscriptionId) {
            await this._plebbit.plebbitRpcClient!.unsubscribe(this._updateRpcSubscriptionId);
            this._updateRpcSubscriptionId = undefined;
            this._setRpcClientState("stopped");
        }
    }

    async stop() {
        await super.stop();
        this._setUpdatingState("stopped");
        await this._stopUpdateLoop();
    }

    private async _validateSignature() {
        const commentObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication())); // Stringify so it resembles messages from pubsub
        const signatureValidity = await verifyComment(commentObj, this._plebbit.resolveAuthorAddresses, this._clientsManager, true); // If author domain is not resolving to signer, then don't throw an error
        if (!signatureValidity.valid) throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity });
    }

    async publish(): Promise<void> {
        await this._validateSignature();
        return super.publish();
    }
}
