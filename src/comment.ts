import { loadIpnsAsJson, removeKeysWithUndefinedValues } from "./util";
import Publication from "./publication";
import { Pages } from "./pages";
import {
    AuthorCommentEdit,
    CommentForDbType,
    CommentIpfsType,
    CommentType,
    CommentUpdate,
    Flair,
    PagesType,
    ProtocolVersion,
    PublicationTypeName
} from "./types";
import Author from "./author";
import errcode from "err-code";
import { codes, messages } from "./errors";

import Logger from "@plebbit/plebbit-logger";
import { Plebbit } from "./plebbit";
import lodash from "lodash";
import { verifyComment, verifyCommentUpdate } from "./signer/signatures";

const DEFAULT_UPDATE_INTERVAL_MS = 60000; // One minute

export class Comment extends Publication implements CommentType {
    // public
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
    original?: Pick<Partial<CommentType>, "author" | "content" | "flair">;
    upvoteCount?: number;
    downvoteCount?: number;
    replyCount?: number;
    updatedAt?: number;
    replies: Pages;
    authorEdit?: AuthorCommentEdit;
    flair?: Flair;
    deleted?: boolean;
    spoiler?: boolean;
    pinned?: boolean;
    locked?: boolean;
    removed?: boolean;
    moderatorReason?: string;

    // private
    private _updateInterval?: any;
    private _updateIntervalMs: number;

    constructor(props: CommentType, plebbit: Plebbit) {
        super(props, plebbit);
        this._updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS;
    }

    _initProps(props: CommentType) {
        super._initProps(props);
        this.postCid = props.postCid;
        this.cid = props.cid;
        this.parentCid = props.parentCid;
        this.ipnsName = props.ipnsName; // each post needs its own IPNS record for its mutable data like edits, vote counts, comments
        this.ipnsKeyName = props.ipnsKeyName;
        this.depth = props.depth;
        this.link = props.link;
        this.thumbnailUrl = props.thumbnailUrl;
        this.setPreviousCid(props.previousCid);
        // CommentUpdate props
        this._initCommentUpdate(props);

        this._mergeFields(props);

        // these functions might get separated from their `this` when used
        this.publish = this.publish.bind(this);
        this.update = this.update.bind(this);
        this.stop = this.stop.bind(this);
    }

    _initCommentUpdate(props: CommentType | CommentUpdate) {
        this.upvoteCount = props.upvoteCount;
        this.downvoteCount = props.downvoteCount;
        this.replyCount = props.replyCount;
        this.updatedAt = props.updatedAt;
        this.setReplies(props.replies);
        this.deleted = props.authorEdit?.deleted;
        this.spoiler = props.spoiler;
        this.pinned = props.pinned;
        this.locked = props.locked;
        this.removed = props.removed;
        this.moderatorReason = props.moderatorReason;
        this.authorEdit = props.authorEdit;
        this.protocolVersion = props.protocolVersion;
        if (props.author?.banExpiresAt || props.author?.flair || props.author?.subplebbit) {
            this.original = { ...this.original, author: this.author };
        }
        this.author.banExpiresAt = props.author?.banExpiresAt || this.author.banExpiresAt;
        this.author.flair = props.author?.flair || this.author.flair;
        this.author.subplebbit = props.author?.subplebbit || this.author.subplebbit;
    }

    _mergeFields(props: CommentType) {
        const original = {};
        original["content"] =
            props.original?.content || this.original?.content || (props.content && props.authorEdit?.content ? this.content : undefined);
        original["author"] =
            props.original?.author || this.original?.author || (props.author && props.authorEdit ? props.author : undefined);
        original["flair"] =
            props.original?.flair || this.original?.flair || (props.flair && props.authorEdit?.flair ? props.flair : undefined);

        this.content = props.authorEdit?.content || props.content || this.content;
        this.author = new Author({ ...props.author, ...this.author });

        if (JSON.stringify(original) !== "{}") this.original = original;
    }

    getType(): PublicationTypeName {
        return "comment";
    }

    toJSON(): CommentType {
        return {
            ...this.toJSONSkeleton(),
            ...(typeof this.updatedAt === "number" ? this.toJSONCommentUpdate() : undefined),
            cid: this.cid,
            original: this.original,
            author: this.author.toJSON(),
            previousCid: this.previousCid,
            ipnsName: this.ipnsName,
            postCid: this.postCid,
            depth: this.depth,
            thumbnailUrl: this.thumbnailUrl,
            ipnsKeyName: this.ipnsKeyName
        };
    }

    toJSONPages(): CommentType {
        return {
            ...this.toJSON(),
            ...this.toJSONCommentUpdate(true),
            author: this.author.toJSON()
        };
    }

    toJSONIpfs(): CommentIpfsType {
        if (typeof this.ipnsName !== "string") throw Error("comment.ipnsName should be defined before calling toJSONIpfs");
        if (typeof this.depth !== "number") throw Error("comment.depth should be defined before calling toJSONIpfs");
        return {
            ...this.toJSONSkeleton(),
            previousCid: this.previousCid,
            ipnsName: this.ipnsName,
            postCid: this.postCid,
            depth: this.depth,
            thumbnailUrl: this.thumbnailUrl
        };
    }

    toJSONSkeleton() {
        return {
            ...super.toJSONSkeleton(),
            content: this.content,
            parentCid: this.parentCid,
            flair: this.flair,
            spoiler: this.spoiler,
            link: this.link
        };
    }

    toJSONForDb(challengeRequestId?: string): CommentForDbType {
        if (typeof this.ipnsKeyName !== "string") throw Error("comment.ipnsKeyName needs to be defined before inserting comment in DB");
        return removeKeysWithUndefinedValues({
            ...lodash.omit(this.toJSON(), ["replyCount", "upvoteCount", "downvoteCount", "replies"]),
            author: JSON.stringify(this.author),
            authorEdit: JSON.stringify(this.authorEdit),
            original: JSON.stringify(this.original),
            authorAddress: this.author.address,
            challengeRequestId: challengeRequestId,
            ipnsKeyName: this.ipnsKeyName,
            signature: JSON.stringify(this.signature)
        });
    }

    toJSONCommentUpdate(skipValidation = false): Omit<CommentUpdate, "signature"> {
        if (!skipValidation) {
            if (
                typeof this.upvoteCount !== "number" ||
                typeof this.downvoteCount !== "number" ||
                typeof this.replyCount !== "number" ||
                typeof this.updatedAt !== "number"
            )
                throw Error(`upvoteCount, downvoteCount, replyCount, and updatedAt need to be properly defined as numbers`);
        }
        const author: CommentUpdate["author"] = {
            banExpiresAt: this.author.banExpiresAt,
            flair: this.flair,
            subplebbit: this.author.subplebbit
        };
        return {
            upvoteCount: this.upvoteCount,
            downvoteCount: this.downvoteCount,
            replyCount: this.replyCount,
            authorEdit: this.authorEdit,
            replies: this.replies.toJSON(),
            flair: this.flair, // Not sure this fits here
            spoiler: this.spoiler,
            pinned: this.pinned,
            locked: this.locked,
            removed: this.removed,
            moderatorReason: this.moderatorReason,
            updatedAt: this.updatedAt,
            protocolVersion: this.protocolVersion,
            author
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

    setReplies(replies?: Pages | PagesType) {
        this.replies = new Pages({
            pages: { topAll: replies?.pages?.topAll },
            pageCids: replies?.pageCids,
            subplebbit: { plebbit: this.plebbit, address: this.subplebbitAddress }
        });
    }

    async updateOnce() {
        const log = Logger("plebbit-js:comment:update");
        let res: CommentUpdate | undefined;
        try {
            res = await loadIpnsAsJson(<string>this.ipnsName, this.plebbit);
        } catch (e) {
            log.error(`Failed to load comment (${this.cid}) IPNS (${this.ipnsName}) due to error: `, e);
            return;
        }
        if (
            res &&
            (!this.updatedAt ||
                !lodash.isEqual(
                    removeKeysWithUndefinedValues(lodash.omit(this.toJSONCommentUpdate(), ["signature"])),
                    lodash.omit(res, ["signature"])
                ))
        ) {
            log(`Comment (${this.cid}) IPNS (${this.ipnsName}) received a new update. Will verify signature`);
            const signatureValidity = await verifyCommentUpdate(res);
            if (!signatureValidity.valid) {
                log.error(`Comment (${this.cid}) IPNS (${this.ipnsName}) signature is invalid due to '${signatureValidity.reason}'`);
                return;
            }
            this._initCommentUpdate(res);
            this._mergeFields(this.toJSON());
            this.emit("update", this);
        } else if (res) {
            log.trace(`Comment (${this.cid}) IPNS (${this.ipnsName}) has no new update`);
            this._initCommentUpdate(res);
        }
    }

    async update() {
        if (typeof this.ipnsName !== "string")
            throw errcode(Error(messages.ERR_COMMENT_UPDATE_MISSING_IPNS_NAME), codes.ERR_COMMENT_UPDATE_MISSING_IPNS_NAME);

        if (this._updateInterval) return; // Do nothing if it's already updating
        this.updateOnce();
        this._updateInterval = setInterval(this.updateOnce.bind(this), this._updateIntervalMs);
    }

    stop() {
        clearInterval(this._updateInterval);
    }

    async publish(): Promise<void> {
        const signatureValidity = await verifyComment(this, this.plebbit, false);
        if (!signatureValidity.valid)
            throw Error(`Failed to validate signature before publishing due to reason '${signatureValidity.reason}'`);

        return super.publish();
    }
}
