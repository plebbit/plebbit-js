import retry, { RetryOperation } from "retry";
import { parseRawPages, removeNullAndUndefinedValuesRecursively, shortifyCid, throwWithErrorCode } from "./util";
import Publication from "./publication";
import { Pages } from "./pages";
import {
    AuthorCommentEdit,
    CommentIpfsType,
    CommentIpfsWithCid,
    CommentPubsubMessage,
    CommentsTableRowInsert,
    CommentType,
    CommentUpdate,
    CommentWithCommentUpdate,
    Flair,
    ProtocolVersion,
    PublicationTypeName
} from "./types";

import Logger from "@plebbit/plebbit-logger";
import { Plebbit } from "./plebbit";
import lodash from "lodash";
import { verifyComment, verifyCommentUpdate } from "./signer/signatures";
import assert from "assert";
import { PlebbitError } from "./plebbit-error";
import { CommentClientsManager } from "./client";

const DEFAULT_UPDATE_INTERVAL_MS = 60000; // One minute

export class Comment extends Publication implements Omit<CommentType, "replies"> {
    // Only Comment props
    shortCid?: string;

    clients: Omit<Publication["clients"], "ipfsClients"> & {
        ipfsClients: {
            [ipfsClientUrl: string]: {
                state:
                    | "fetching-subplebbit-ipns"
                    | "fetching-subplebbit-ipfs"
                    | "fetching-ipfs"
                    | "fetching-update-ipns"
                    | "fetching-update-ipfs"
                    | "stopped";
            };
        };
    };

    // public (CommentType)
    title?: string;
    link?: string;
    thumbnailUrl?: string;
    protocolVersion: ProtocolVersion;
    cid?: string;
    parentCid?: string;
    content?: string;
    // Props that get defined after challengeverification
    ipnsKeyName?: string;
    previousCid?: string;
    ipnsName?: string;
    depth?: number;
    postCid?: string;

    // CommentEdit and CommentUpdate props
    original?: Pick<Partial<CommentType>, "author" | "content" | "flair" | "protocolVersion">;
    upvoteCount?: number;
    downvoteCount?: number;
    replyCount?: number;
    updatedAt?: number;
    replies: Pages;
    edit?: AuthorCommentEdit;
    flair?: Flair;
    deleted?: CommentType["edit"]["deleted"];
    spoiler?: boolean;
    pinned?: boolean;
    locked?: boolean;
    removed?: boolean;
    reason?: string;

    // updating states
    updatingState:
        | "stopped"
        | "resolving-author-address"
        | "fetching-ipfs"
        | "fetching-update-ipns"
        | "fetching-update-ipfs"
        | "failed"
        | "succeeded";

    // private
    private _updateInterval?: any;
    private _isUpdating: boolean;
    private _updateIntervalMs: number;
    private _rawCommentUpdate?: CommentUpdate;
    private _loadingOperation: RetryOperation;
    _clientsManager: CommentClientsManager;

    constructor(props: CommentType, plebbit: Plebbit) {
        super(props, plebbit);
        this._updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS;
        this._isUpdating = false;
        this._setUpdatingState("stopped");
        // these functions might get separated from their `this` when used
        this.publish = this.publish.bind(this);
        this.update = this.update.bind(this);
        this.stop = this.stop.bind(this);

        this._clientsManager = new CommentClientsManager(this);
    }

    _initProps(props: CommentType) {
        // This function is called once at in the constructor
        super._initProps(props);
        this.postCid = props.postCid;
        this.setCid(props.cid);
        this.parentCid = props.parentCid;
        this.ipnsName = props.ipnsName; // each post needs its own IPNS record for its mutable data like edits, vote counts, comments
        this.ipnsKeyName = props.ipnsKeyName;
        this.depth = props.depth;
        this.link = props.link;
        this.title = props.title;
        this.thumbnailUrl = props.thumbnailUrl;
        this.content = props.content;
        this.original = props.original;
        this.spoiler = props.spoiler;
        this.protocolVersion = props.protocolVersion;
        this.flair = props.flair;
        this.setPreviousCid(props.previousCid);
        this.replies = new Pages({
            pages: undefined,
            pageCids: undefined,
            subplebbit: { address: this.subplebbitAddress, plebbit: this.plebbit },
            pagesIpfs: undefined,
            parentCid: this.cid
        });
    }

    async _initCommentUpdate(props: CommentUpdate) {
        if (!this.original)
            this.original = removeNullAndUndefinedValuesRecursively(
                lodash.pick(this.toJSONPubsubMessagePublication(), ["author", "flair", "content", "protocolVersion"])
            );
        this._rawCommentUpdate = props;

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
        this.spoiler = props.edit?.spoiler ?? this.spoiler;
        this.author.subplebbit = props.author?.subplebbit;
        if (props.edit?.content) this.content = props.edit.content;
        this.flair = props.flair || props.edit?.flair || this.flair;
        this.author.flair = props.author?.subplebbit?.flair || props.edit?.author?.flair || this.author?.flair;

        assert(this.cid);
        this.replies = await parseRawPages(props.replies, this.cid, { address: this.subplebbitAddress, plebbit: this.plebbit });
    }

    getType(): PublicationTypeName {
        return "comment";
    }

    toJSON(): CommentType {
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
                      replies: this.replies?.toJSON()
                  }
                : {})
        };
    }

    toJSONPagesIpfs(commentUpdate: CommentUpdate): { comment: CommentIpfsWithCid; update: CommentUpdate } {
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

    toJSONIpfs(): CommentIpfsType {
        if (typeof this.ipnsName !== "string") throw Error("comment.ipnsName should be defined before calling toJSONIpfs");
        if (typeof this.depth !== "number") throw Error("comment.depth should be defined before calling toJSONIpfs");
        return {
            ...this.toJSONPubsubMessagePublication(),
            previousCid: this.previousCid,
            ipnsName: this.ipnsName,
            postCid: this.depth === 0 ? undefined : this.postCid,
            depth: this.depth,
            thumbnailUrl: this.thumbnailUrl
        };
    }

    toJSONPubsubMessagePublication(): CommentPubsubMessage {
        return {
            ...super.toJSONPubsubMessagePublication(),
            content: this.content,
            parentCid: this.parentCid,
            flair: this.flair,
            spoiler: this.spoiler,
            link: this.link,
            title: this.title
        };
    }

    toJSONAfterChallengeVerification(): CommentIpfsWithCid {
        assert(this.cid && this.postCid);
        return { ...this.toJSONIpfs(), postCid: this.postCid, cid: this.cid };
    }

    toJSONCommentsTableRowInsert(challengeRequestId: string): CommentsTableRowInsert {
        assert(this.ipnsKeyName && this.cid && this.postCid);
        return {
            ...this.toJSONIpfs(),
            postCid: this.postCid,
            cid: this.cid,
            authorAddress: this.author.address,
            challengeRequestId: challengeRequestId,
            ipnsKeyName: this.ipnsKeyName
        };
    }

    toJSONMerged(): CommentWithCommentUpdate {
        assert(this.ipnsName && typeof this.updatedAt === "number" && this.original && this.shortCid);
        return {
            ...this.toJSONAfterChallengeVerification(),
            shortCid: this.shortCid,
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
            replies: this.replies?.toJSON()
        };
    }

    setCommentIpnsKey(ipnsKey: { Id: string; Name: string }) {
        // Contains name and id
        this.ipnsName = ipnsKey.Id;
        this.ipnsKeyName = ipnsKey.Name;
    }

    setPostCid(newPostCid: string) {
        this.postCid = newPostCid;
    }

    setCid(newCid: string) {
        this.cid = newCid;
        if (this.cid) this.shortCid = shortifyCid(this.cid);
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

    private async _retryLoadingCommentIpfs(log: Logger): Promise<CommentIpfsType> {
        return new Promise((resolve) => {
            this._loadingOperation.attempt(async (curAttempt) => {
                log.trace(`Retrying to load comment ipfs (${this.cid}) for the ${curAttempt}th time`);
                try {
                    // TODO should inject this.clients here so gateway or ipfsClients states can be modified
                    resolve(await this._clientsManager.fetchCommentCid(this.cid));
                } catch (e) {
                    this._setUpdatingState("failed");
                    log.error(String(e));
                    this.emit("error", e);
                    this._loadingOperation.retry(e);
                }
            });
        });
    }

    private async _retryLoadingCommentUpdate(log: Logger): Promise<CommentUpdate> {
        return new Promise((resolve) => {
            this._loadingOperation.attempt(async (curAttempt) => {
                log.trace(`Retrying to load comment ipns (${this.ipnsName}) for the ${curAttempt}th time`);
                try {
                    const update: CommentUpdate = await this._clientsManager.fetchCommentUpdate(this.ipnsName);
                    resolve(update);
                } catch (e) {
                    this._setUpdatingState("failed");
                    log.error(String(e));
                    this._loadingOperation.retry(e);
                    this.emit("error", e);
                }
            });
        });
    }

    async updateOnce() {
        const log = Logger("plebbit-js:comment:update");
        this._loadingOperation = retry.operation({ forever: true, factor: 2 });
        if (this.cid && !this.ipnsName) {
            // User may have attempted to call plebbit.createComment({cid}).update
            // plebbit-js should be able to retrieve ipnsName from the IPFS file
            const commentIpfs: CommentIpfsType = await this._retryLoadingCommentIpfs(log); // Will keep retrying to load until comment.stop() is called
            assert(commentIpfs.ipnsName);
            this._initProps({ ...commentIpfs, cid: this.cid });
            this.emit("update", this);
        }

        const res = await this._retryLoadingCommentUpdate(log); // Will keep retrying to load until comment.stop() is called

        if (res && this.updatedAt !== res.updatedAt) {
            log(`Comment (${this.cid}) IPNS (${this.ipnsName}) received a new update. Will verify signature`);
            //@ts-expect-error
            const commentInstance: Pick<CommentWithCommentUpdate, "cid" | "signature"> = lodash.pick(this, ["cid", "signature"]);
            const signatureValidity = await verifyCommentUpdate(res, { address: this.subplebbitAddress }, commentInstance, this.plebbit);
            if (!signatureValidity.valid) {
                this._setUpdatingState("failed");
                const err = new PlebbitError("ERR_SIGNATURE_IS_INVALID", { signatureValidity, commentUpdate: res });
                log.error(err.toString());
                this.emit("error", err);
                return;
            }
            this._setUpdatingState("succeeded");
            await this._initCommentUpdate(res);
            this.emit("update", this);
        } else if (res) {
            log.trace(`Comment (${this.cid}) IPNS (${this.ipnsName}) has no new update`);
            this._setUpdatingState("succeeded");
            await this._initCommentUpdate(res);
        }
    }

    private _setUpdatingState(newState: Comment["updatingState"]) {
        this.updatingState = newState;
        this.emit("updatingstatechange", this.updatingState);
    }

    async update() {
        if (this._updateInterval) return; // Do nothing if it's already updating
        this._isUpdating = true;
        this._updateState("updating");
        const updateLoop = (async () => {
            if (this._isUpdating) this.updateOnce().finally(() => (this._updateInterval = setTimeout(updateLoop, this._updateIntervalMs)));
        }).bind(this);
        updateLoop();
    }

    async stop() {
        this._loadingOperation?.stop();
        this._updateInterval = clearTimeout(this._updateInterval);
        this._setUpdatingState("stopped");
        this._updateState("stopped");
        this._isUpdating = false;
    }

    private async _validateSignature() {
        const commentObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication())); // Stringify so it resembles messages from pubsub and IPNS
        const signatureValidity = await verifyComment(commentObj, this.plebbit, true); // If author domain is not resolving to signer, then don't throw an error
        if (!signatureValidity.valid) throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity });
    }

    async publish(): Promise<void> {
        await this._validateSignature();
        return super.publish();
    }
}
