import { loadIpnsAsJson, removeKeys, removeKeysWithUndefinedValues, shallowEqual } from "./util";
import Publication from "./publication";
import { Pages } from "./pages";
import { verifyPublication } from "./signer";
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

    constructor(props: CommentType, plebbit: Plebbit) {
        super(props, plebbit);
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

        for (const key of Object.keys(original))
            if (this[key] && original[key] && this[key] === original[key])
                throw Error(`${key} and original ${key} can't be equal to each other`);

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
            ...removeKeys(this.toJSON(), ["replyCount", "upvoteCount", "downvoteCount", "replies"]),
            author: JSON.stringify(this.author),
            authorEdit: JSON.stringify(this.authorEdit),
            original: JSON.stringify(this.original),
            authorAddress: this.author.address,
            challengeRequestId: challengeRequestId,
            ipnsKeyName: this.ipnsKeyName,
            signature: JSON.stringify(this.signature)
        });
    }

    toJSONCommentUpdate(skipAssert = false): Omit<CommentUpdate, "signature"> {
        // if (!skipAssert)
        //     assert(
        //         typeof this.upvoteCount === "number" &&
        //             typeof this.downvoteCount === "number" &&
        //             typeof this.replyCount === "number" &&
        //             typeof this.updatedAt === "number",
        //         "Fields are needed to export a CommentUpdate JSON"
        //     );
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
            author: { banExpiresAt: this.author.banExpiresAt, flair: this.flair }
        };
    }

    setCommentIpnsKey(ipnsKey) {
        // Contains name and id
        this.ipnsName = ipnsKey["id"] || ipnsKey["Id"];
        this.ipnsKeyName = ipnsKey["name"] || ipnsKey["Name"];
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
            res = await loadIpnsAsJson(this.ipnsName, this.plebbit);
        } catch (e) {
            log.error(`Failed to load comment (${this.cid}) IPNS (${this.ipnsName}) due to error: `, e);
            return;
        }
        if (res && (!this.updatedAt || !shallowEqual(this.toJSONCommentUpdate(), res, ["signature"]))) {
            log(`Comment (${this.cid}) IPNS (${this.ipnsName}) received a new update. Will verify signature`);
            const [verified, failedVerificationReason] = await verifyPublication(res, this.plebbit, "commentupdate");
            if (!verified) {
                log.error(`Comment (${this.cid}) IPNS (${this.ipnsName}) signature is invalid due to '${failedVerificationReason}'`);
                return;
            }
            this._initCommentUpdate(res);
            this._mergeFields(this.toJSON());
            this.emit("update", this);
        } else {
            log.trace(`Comment (${this.cid}) IPNS (${this.ipnsName}) has no new update`);
            this._initCommentUpdate(res);
        }
        return this;
    }

    update(updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS) {
        if (typeof this.ipnsName !== "string")
            throw errcode(Error(messages.ERR_COMMENT_UPDATE_MISSING_IPNS_NAME), codes.ERR_COMMENT_UPDATE_MISSING_IPNS_NAME);

        if (this._updateInterval) clearInterval(this._updateInterval);
        this._updateInterval = setInterval(this.updateOnce.bind(this), updateIntervalMs);
        return this.updateOnce();
    }

    stop() {
        clearInterval(this._updateInterval);
    }

    async edit(options: CommentUpdate) {
        const log = Logger("plebbit-js:comment:edit");
        if (typeof this.ipnsKeyName !== "string")
            throw Error("comment.ipnsKeyName needs to be defined in order to publish a new CommentUpdate");
        const [validSignature, failedVerificationReason] = await verifyPublication(options, this.plebbit, "commentupdate");
        if (!validSignature)
            throw errcode(Error(messages.ERR_FAILED_TO_VERIFY_SIGNATURE), codes.ERR_FAILED_TO_VERIFY_SIGNATURE, {
                details: `comment.edit: Failed verification reason: ${failedVerificationReason}, editOptions: ${JSON.stringify(options)}`
            });
        this._initCommentUpdate(options);
        this._mergeFields(this.toJSON());
        const file = await this.plebbit.ipfsClient.add(JSON.stringify({ ...this.toJSONCommentUpdate(), signature: options.signature }));
        await this.plebbit.ipfsClient.name.publish(file.path, {
            lifetime: "72h",
            key: this.ipnsKeyName,
            allowOffline: true
        });
        log.trace(`Linked comment (${this.cid}) ipns name(${this.ipnsName}) to ipfs file (${file.path})`);
    }

    async publish(userOptions): Promise<void> {
        return super.publish(userOptions);
    }
}
