import retry, { RetryOperation } from "retry";
import { removeUndefinedValuesRecursively, shortifyCid, throwWithErrorCode } from "../../util.js";
import Publication from "../publication.js";
import type {
    CommentsTableRowInsert,
    DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor,
    PublicationTypeName
} from "../../types.js";

import { PageTypeJson, RepliesPagesTypeIpfs } from "../../pages/types.js";
import Logger from "@plebbit/plebbit-logger";
import { Plebbit } from "../../plebbit.js";
import { verifyComment } from "../../signer/signatures.js";
import assert from "assert";
import { FailedToFetchCommentIpfsFromGatewaysError, PlebbitError } from "../../plebbit-error.js";
import { CommentClientsManager } from "../../clients/client-manager.js";
import { messages } from "../../errors.js";
import * as remeda from "remeda";
import type {
    CommentChallengeRequestToEncryptType,
    CommentIpfsType,
    CommentIpfsWithCidPostCidDefined,
    CommentPubsubMessage,
    CommentTypeJson,
    CommentUpdate,
    CommentWithCommentUpdateJson,
    LocalCommentOptions
} from "./types.js";
import { RepliesPages } from "../../pages/pages.js";
import { parseRawPages } from "../../pages/util.js";

export class Comment extends Publication {
    // Only Comment props
    shortCid?: CommentWithCommentUpdateJson["shortCid"];

    override clients!: CommentClientsManager["clients"];

    // public (CommentType)
    title?: CommentPubsubMessage["title"];
    link?: CommentPubsubMessage["link"];
    linkWidth?: CommentPubsubMessage["linkWidth"];
    linkHeight?: CommentPubsubMessage["linkHeight"];
    thumbnailUrl?: CommentIpfsType["thumbnailUrl"];
    thumbnailUrlWidth?: CommentIpfsType["thumbnailUrlWidth"];
    thumbnailUrlHeight?: CommentIpfsType["thumbnailUrlHeight"];
    cid?: CommentIpfsWithCidPostCidDefined["cid"];
    parentCid?: CommentIpfsType["parentCid"];
    content?: CommentPubsubMessage["content"];
    // Props that get defined after challengeverification
    previousCid?: CommentIpfsType["previousCid"];
    depth?: CommentIpfsType["depth"];
    postCid?: CommentIpfsType["postCid"];
    linkHtmlTagName?: CommentPubsubMessage["linkHtmlTagName"];

    // CommentEdit and CommentUpdate props
    original?: CommentWithCommentUpdateJson["original"];
    upvoteCount?: CommentUpdate["upvoteCount"];
    downvoteCount?: CommentUpdate["downvoteCount"];
    replyCount?: CommentUpdate["replyCount"];
    updatedAt?: CommentUpdate["updatedAt"];
    replies!: RepliesPages;
    edit?: CommentUpdate["edit"];
    flair?: CommentPubsubMessage["flair"];
    deleted?: CommentWithCommentUpdateJson["deleted"];
    spoiler?: CommentIpfsType["spoiler"];
    pinned?: CommentUpdate["pinned"];
    locked?: CommentUpdate["locked"];
    removed?: CommentUpdate["removed"];
    reason?: CommentUpdate["reason"];
    lastChildCid?: CommentUpdate["lastChildCid"];
    lastReplyTimestamp?: CommentUpdate["lastReplyTimestamp"];

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
    _rawCommentUpdate?: CommentUpdate;
    _rawCommentIpfs?: CommentIpfsType;
    private _loadingOperation?: RetryOperation;
    override _clientsManager!: CommentClientsManager;
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

    override _initClients() {
        this._clientsManager = new CommentClientsManager(this);
        this.clients = this._clientsManager.clients;
    }

    private _setOriginalFieldBeforeModifying() {
        // Need to make sure we have the props first
        if (!this.original && this.protocolVersion)
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
        this.linkHtmlTagName = props.linkHtmlTagName;
    }

    _initPubsubMessageProps(props: CommentPubsubMessage) {
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

    _initIpfsProps(props: CommentIpfsType) {
        // we're loading remote CommentIpfs
        this._setOriginalFieldBeforeModifying();
        this._initPubsubMessageProps(props);
        this.depth = props.depth;
        const postCid = props.postCid ? props.postCid : this.cid && this.depth === 0 ? this.cid : undefined;
        if (!postCid) throw Error("There is no way to set comment.postCid");
        this.setPostCid(postCid);
        this.setPreviousCid(props.previousCid);
        this.thumbnailUrl = props.thumbnailUrl;
        this.thumbnailUrlHeight = props.thumbnailUrlHeight;
        this.thumbnailUrlWidth = props.thumbnailUrlWidth;
    }

    _initChallengeRequestProps(props: CommentChallengeRequestToEncryptType) {
        super._initChallengeRequestChallengeProps(props);
        this._initPubsubMessageProps(props.publication);
    }

    async _initCommentUpdate(props: CommentUpdate | CommentWithCommentUpdateJson) {
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

        await this._updateRepliesPostsInstance(props.replies);
    }

    async _updateRepliesPostsInstance(
        newReplies: CommentUpdate["replies"] | CommentWithCommentUpdateJson["replies"] | Pick<RepliesPagesTypeIpfs, "pageCids">
    ) {
        assert(this.cid, "Can't update comment.replies without comment.cid being defined");
        const log = Logger("plebbit-js:comment:_updateRepliesPostsInstanceIfNeeded");

        if (!newReplies) {
            this.replies.resetPages();
        } else if (!("pages" in newReplies)) {
            // only pageCids is provided
            this.replies.pageCids = newReplies.pageCids;
        } else {
            const shouldUpdateReplies = !remeda.isDeepEqual(this.replies.pageCids, newReplies.pageCids);

            if (shouldUpdateReplies) {
                log.trace(`Updating the props of commennt instance (${this.cid}) replies`);
                const parsedPages = <Pick<RepliesPages, "pages"> & { pagesIpfs: RepliesPagesTypeIpfs | undefined }>(
                    await parseRawPages(newReplies, this._plebbit)
                );
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

    protected override _updateLocalCommentPropsWithVerification(
        props: DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor["publication"]
    ) {
        if (!props) throw Error("Should not try to update comment instance with empty props");
        this.setCid(props.cid);
        this._initIpfsProps(props);
    }

    override getType(): PublicationTypeName {
        return "comment";
    }

    override toJSON(): CommentTypeJson {
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

    toJSONPagesIpfs(commentUpdate: CommentUpdate): { comment: CommentIpfsWithCidPostCidDefined; update: CommentUpdate } {
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

    override toJSONPubsubMessagePublication(): CommentPubsubMessage {
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
            title: this.title,
            linkHtmlTagName: this.linkHtmlTagName
        };
    }

    toJSONAfterChallengeVerification(): CommentIpfsWithCidPostCidDefined {
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
        this.replies._parentCid = this.cid;
    }

    override setSubplebbitAddress(newSubplebbitAddress: string) {
        super.setSubplebbitAddress(newSubplebbitAddress);
        this.replies._subplebbitAddress = newSubplebbitAddress;
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

    private _isCommentIpfsErrorRetriable(err: PlebbitError) {
        if (!(err instanceof PlebbitError)) return false; // If it's not a recognizable error, then we throw to notify the user
        if (
            err.code === "ERR_COMMENT_IPFS_SIGNATURE_IS_INVALID" ||
            err.code === "ERR_INVALID_COMMENT_IPFS_SCHEMA" ||
            err.code === "ERR_CALCULATED_CID_DOES_NOT_MATCH" ||
            err.code === "ERR_INVALID_JSON"
        )
            return false; // These errors means there's a problem with the record itself, not the loading

        if (err instanceof FailedToFetchCommentIpfsFromGatewaysError) {
            // If all gateway errors are due to the ipfs record itself, then it's a non-retriable error
            for (const gatewayError of Object.values(err.details.gatewayToError))
                if (this._isCommentIpfsErrorRetriable(gatewayError)) return true; // if there's at least one gateway whose error is not due to the record
            return false; // if all gateways have issues with the record validity itself, then we stop fetching
        }

        return true;
    }

    private async _retryLoadingCommentIpfs(cid: string, log: Logger): Promise<CommentIpfsType | PlebbitError> {
        return new Promise((resolve) => {
            this._loadingOperation!.attempt(async (curAttempt) => {
                log.trace(`Retrying to load comment ipfs (${this.cid}) for the ${curAttempt}th time`);
                try {
                    this._setUpdatingState("fetching-ipfs");
                    const res = await this._clientsManager.fetchAndVerifyCommentCid(cid);
                    this._setUpdatingState("succeeded");
                    resolve(res);
                } catch (e) {
                    if (e instanceof PlebbitError && e.details) e.details.commentCid = this.cid;
                    this._setUpdatingState("failed");
                    log.error(`Error on loading comment ipfs (${this.cid}) for the ${curAttempt}th time`);
                    if (this._isCommentIpfsErrorRetriable(<PlebbitError>e)) this._loadingOperation!.retry(<Error>e);
                    else return resolve(<PlebbitError>e);
                }
            });
        });
    }

    private async _retryLoadingCommentUpdate(log: Logger): Promise<CommentUpdate | PlebbitError> {
        return new Promise((resolve) => {
            this._loadingOperation!.attempt(async (curAttempt) => {
                log.trace(`Retrying to load CommentUpdate (${this.cid}) for the ${curAttempt}th time`);
                try {
                    const update: CommentUpdate = await this._clientsManager.fetchCommentUpdate();
                    this._setUpdatingState("succeeded");
                    resolve(update);
                } catch (e) {
                    // fetchCommentUpdate could throw a non-retriable error
                    if (e instanceof PlebbitError && e.details) e.details.commentCid = this.cid;
                    this._setUpdatingState("failed");
                    log.trace(`Error when loading CommentUpdate (${this.cid}) on the ${curAttempt}th attempt`);
                    if (this._clientsManager._shouldWeFetchCommentUpdateFromNextTimestamp(<PlebbitError>e))
                        // Should we emit an error event or keep retrying?
                        this._loadingOperation!.retry(<Error>e);
                    else resolve(<PlebbitError>e);
                }
            });
        });
    }

    async updateOnce() {
        const log = Logger("plebbit-js:comment:update");
        this._loadingOperation = retry.operation({ forever: true, factor: 2 });
        if (this.cid && typeof this.depth !== "number" && !this._rawCommentIpfs) {
            // User may have attempted to call plebbit.createComment({cid}).update
            const newCommentIpfsOrError = await this._retryLoadingCommentIpfs(this.cid, log); // Will keep retrying to load until comment.stop() is called

            if (newCommentIpfsOrError instanceof PlebbitError) {
                // This is a non-retriable error, it should stop the comment from updating
                log.error(
                    `Encountered a non retriable error while loading CommentIpfs (${this.cid}), will stop the update loop`,
                    newCommentIpfsOrError.toString()
                );
                // We can't proceed with an invalid CommentIpfs, so we're stopping the update loop and emitting an error event for the user
                await this._stopUpdateLoop();
                this._setUpdatingState("failed");
                this._updateState("stopped");
                this.emit("error", newCommentIpfsOrError);
                return;
            } else {
                log(`Loaded the CommentIpfs props of cid (${this.cid}) correctly, updating the instance props`);
                this._rawCommentIpfs = newCommentIpfsOrError;
                this._initIpfsProps(newCommentIpfsOrError);
                this.emit("update", this);
            }
        }

        const commentUpdateOrError = await this._retryLoadingCommentUpdate(log); // Will keep retrying to load until comment.stop() is called

        if (commentUpdateOrError instanceof PlebbitError) {
            // An error, either a signature or a schema problem
            // We should emit an error, and keep retrying to load a different record
            log.error(`Encountered an error while trying to load CommentUpdate of (${this.cid})`, commentUpdateOrError.toString());
            this.emit("error", commentUpdateOrError);
            return;
        } else if (commentUpdateOrError && (this.updatedAt || 0) < commentUpdateOrError.updatedAt) {
            log(`Comment (${this.cid}) received a new CommentUpdate`);
            this._rawCommentUpdate = commentUpdateOrError;
            await this._initCommentUpdate(commentUpdateOrError);
            this.emit("update", this);
        } else log.trace(`Comment (${this.cid}) has no new CommentUpdate`);
    }

    _setUpdatingState(newState: Comment["updatingState"]) {
        if (newState === this.updatingState) return;
        this.updatingState = newState;
        this.emit("updatingstatechange", this.updatingState);
    }
    protected override _setRpcClientState(newState: Comment["clients"]["plebbitRpcClients"][""]["state"]) {
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
                    const newUpdate = <CommentIpfsType | CommentUpdate>updateProps.params.result;
                    if ("subplebbitAddress" in newUpdate) {
                        log(`Received new CommentIpfs (${this.cid}) from RPC (${rpcUrl})`);
                        this._rawCommentIpfs = newUpdate;
                        this._initIpfsProps(this._rawCommentIpfs);
                    } else {
                        log(`Received new CommentUpdate (${this.cid}) from RPC (${rpcUrl})`);
                        await this._initCommentUpdate(newUpdate);
                    }

                    this.emit("update", this);
                })
                .on("updatingstatechange", (args) => {
                    const updateState = <Comment["updatingState"]>args.params.result;
                    this._setUpdatingState(updateState);
                    this._updateRpcClientStateFromUpdatingState(updateState);
                })
                .on("statechange", (args) => this._updateState(<Comment["state"]>args.params.result))
                .on("error", async (args) => {
                    const err = <PlebbitError>args.params.result;
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

    override async stop() {
        if (this.state === "publishing") await super.stop();
        this._setUpdatingState("stopped");
        this._updateState("stopped");
        await this._stopUpdateLoop();
    }

    private async _validateSignature() {
        const commentObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication())); // Stringify so it resembles messages from pubsub
        const signatureValidity = await verifyComment(commentObj, this._plebbit.resolveAuthorAddresses, this._clientsManager, true); // If author domain is not resolving to signer, then don't throw an error
        if (!signatureValidity.valid) throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity });
    }

    override async publish(): Promise<void> {
        await this._validateSignature();
        return super.publish();
    }
}
