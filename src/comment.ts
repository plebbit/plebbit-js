import { loadIpnsAsJson, parseRawPages, removeNullAndUndefinedValuesRecursively, shortifyCid, throwWithErrorCode } from "./util";
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

const DEFAULT_UPDATE_INTERVAL_MS = 60000; // One minute

export class Comment extends Publication implements Omit<CommentType, "replies"> {
    // public
    title?: string;
    link?: string;
    thumbnailUrl?: string;
    protocolVersion: ProtocolVersion;
    cid?: string;
    shortCid?: string;
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

    // private
    private _updateInterval?: any;
    private _updateIntervalMs: number;
    private _rawCommentUpdate?: CommentUpdate;

    constructor(props: CommentType, plebbit: Plebbit) {
        super(props, plebbit);
        this._updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS;

        // these functions might get separated from their `this` when used
        this.publish = this.publish.bind(this);
        this.update = this.update.bind(this);
        this.stop = this.stop.bind(this);
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
                      author: this.author.toJSONIpfsWithCommentUpdate(),
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

    toJSONPagesIpfs(commentUpdate: CommentUpdate): { comment: CommentIpfsWithCid; commentUpdate: CommentUpdate } {
        assert(this.cid && this.postCid);
        return {
            comment: {
                ...this.toJSONIpfs(),
                author: this.author.toJSONIpfs(),
                cid: this.cid,
                postCid: this.postCid
            },
            commentUpdate
        };
    }

    toJSONIpfs(): CommentIpfsType {
        if (typeof this.ipnsName !== "string") throw Error("comment.ipnsName should be defined before calling toJSONIpfs");
        if (typeof this.depth !== "number") throw Error("comment.depth should be defined before calling toJSONIpfs");
        return {
            ...this.toJSONPubsubMessagePublication(),
            previousCid: this.previousCid,
            ipnsName: this.ipnsName,
            postCid: this.postCid,
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
        assert(this.ipnsName && typeof this.updatedAt === "number" && this.original);
        return {
            ...this.toJSONAfterChallengeVerification(),
            author: this.author.toJSONIpfsWithCommentUpdate(),
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

    async updateOnce() {
        const log = Logger("plebbit-js:comment:update");
        let res: CommentUpdate | undefined;
        try {
            res = await loadIpnsAsJson(this.ipnsName, this.plebbit);
        } catch (e) {
            const errMsg = `Failed to load comment (${this.cid}) IPNS (${this.ipnsName}) due to error: ${e}`;
            log.error(errMsg);
            this.emit("error", errMsg);
            return;
        }

        if (res && this.updatedAt !== res.updatedAt) {
            log(`Comment (${this.cid}) IPNS (${this.ipnsName}) received a new update. Will verify signature`);
            //@ts-expect-error
            const commentInstance: Pick<CommentWithCommentUpdate, "cid" | "signature"> = lodash.pick(this, ["cid", "signature"]);
            const signatureValidity = await verifyCommentUpdate(res, { address: this.subplebbitAddress }, commentInstance, this.plebbit);
            if (!signatureValidity.valid) {
                const errMsg = `Comment (${this.cid}) IPNS (${this.ipnsName}) signature is invalid due to '${signatureValidity.reason}'`;
                log.error(errMsg);
                this.emit("error", errMsg);
                return;
            }
            await this._initCommentUpdate(res);
            this.emit("update", this);
        } else if (res) {
            log.trace(`Comment (${this.cid}) IPNS (${this.ipnsName}) has no new update`);
            await this._initCommentUpdate(res);
        }
    }

    async update() {
        if (typeof this.ipnsName !== "string") throwWithErrorCode("ERR_COMMENT_UPDATE_MISSING_IPNS_NAME");

        if (this._updateInterval) return; // Do nothing if it's already updating
        this._updateState("updating");
        this.updateOnce();
        this._updateInterval = setInterval(this.updateOnce.bind(this), this._updateIntervalMs);
    }

    stop() {
        this._updateInterval = clearInterval(this._updateInterval);
    }

    private async _validateSignature() {
        const commentObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication())); // Stringify so it resembles messages from pubsub and IPNS
        const signatureValidity = await verifyComment(commentObj, this.plebbit, true); // If author domain is not resolving to signer, then don't throw an error
        if (!signatureValidity.valid)
            throwWithErrorCode(
                "ERR_SIGNATURE_IS_INVALID",
                `comment.publish: Failed to publish due to invalid signature. Reason=${signatureValidity.reason}`
            );
    }

    async publish(): Promise<void> {
        await this._validateSignature();
        return super.publish();
    }
}
