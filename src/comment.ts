import assert from "assert";
import { getDebugLevels, loadIpnsAsJson, parseJsonIfString, removeKeysWithUndefinedValues, shallowEqual } from "./util";
import Publication from "./publication";
import { Pages } from "./pages";
import { verifyPublication } from "./signer";
import { AuthorCommentEdit, CommentType, CommentUpdate, Flair, ProtocolVersion, PublicationTypeName } from "./types";
import Author from "./author";

const debugs = getDebugLevels("comment");

const DEFAULT_UPDATE_INTERVAL_MS = 60000; // One minute

export class Comment extends Publication implements CommentType {
    // public
    title?: string;
    link?: string;
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
    replies?: Pages;
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

    _initProps(props: CommentType) {
        super._initProps(props);
        this.postCid = props.postCid;
        this.cid = props.cid;
        this.parentCid = props.parentCid;
        this.ipnsName = props.ipnsName; // each post needs its own IPNS record for its mutable data like edits, vote counts, comments
        this.ipnsKeyName = props.ipnsKeyName;
        this.depth = props.depth;
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
        // TODO merge flairs, deleted, content, author here
        // TODO move original author and content to comment.original if needed

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
            this[key] &&
                original[key] &&
                assert.notEqual(this[key], original[key], `${key} and original ${key} can't be equal to each other`);

        if (JSON.stringify(original) !== "{}") this.original = original;
    }

    getType(): PublicationTypeName {
        return "comment";
    }

    toJSON(): CommentType {
        return {
            ...this.toJSONIpfs(),
            ...(this.updatedAt ? this.toJSONCommentUpdate() : undefined),
            cid: this.cid,
            original: this.original,
            author: this.author.toJSON()
        };
    }

    toJSONIpfs() {
        return {
            ...this.toJSONSkeleton(),
            previousCid: this.previousCid,
            ipnsName: this.ipnsName,
            postCid: this.postCid,
            depth: this.depth
        };
    }

    toJSONSkeleton() {
        return {
            ...super.toJSONSkeleton(),
            content: this.content,
            parentCid: this.parentCid,
            flair: this.flair,
            spoiler: this.spoiler
        };
    }

    toJSONForDb(challengeRequestId: string) {
        const json = this.toJSON();
        ["replyCount", "upvoteCount", "downvoteCount", "replies"].forEach((key) => delete json[key]);
        json["authorAddress"] = this?.author?.address;
        json["challengeRequestId"] = challengeRequestId;
        json["ipnsKeyName"] = this.ipnsKeyName;
        // @ts-ignore
        json["signature"] = JSON.stringify(this.signature);
        return removeKeysWithUndefinedValues(json);
    }

    toJSONCommentUpdate(): Omit<CommentUpdate, "signature"> {
        assert(
            typeof this.upvoteCount === "number" &&
                typeof this.downvoteCount === "number" &&
                typeof this.replyCount === "number" &&
                typeof this.updatedAt === "number",
            "Fields are needed to export a CommentUpdate JSON"
        );
        return {
            upvoteCount: this.upvoteCount,
            downvoteCount: this.downvoteCount,
            replyCount: this.replyCount,
            authorEdit: this.authorEdit,
            replies: this.replies,
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

    setReplies(replies?: Pages) {
        if (replies)
            this.replies = new Pages({
                pages: { topAll: replies.pages.topAll },
                pageCids: replies.pageCids,
                subplebbit: this.subplebbit
            });
    }

    async updateOnce() {
        assert(this.ipnsName, "Comment needs to have ipnsName before updating");
        let res;

        try {
            res = await loadIpnsAsJson(this.ipnsName, this.subplebbit.plebbit);
        } catch (e) {
            debugs.WARN(`Failed to load comment (${this.cid}) IPNS (${this.ipnsName}) due to error = ${e.message}`);
            return;
        }
        if (res && (!this.updatedAt || !shallowEqual(this.toJSONCommentUpdate(), res, ["signature"]))) {
            debugs.DEBUG(`Comment (${this.cid}) IPNS (${this.ipnsName}) received a new update. Will verify signature`);
            const [verified, failedVerificationReason] = await verifyPublication(res, this.subplebbit.plebbit, "commentupdate");
            if (!verified) {
                debugs.ERROR(
                    `Comment (${this.cid}) IPNS (${this.ipnsName}) signature is invalid. Will not update: ${failedVerificationReason}`
                );
                return;
            }
            this._initCommentUpdate(res);
            this._mergeFields(this.toJSON());
            this.emit("update", this);
        } else {
            debugs.TRACE(`Comment (${this.cid}) IPNS (${this.ipnsName}) has no new update`);
            this._initCommentUpdate(res);
        }
        return this;
    }

    update(updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS) {
        assert(this.ipnsName, "Comment need to have ipnsName field to poll updates");
        debugs.DEBUG(`Starting to poll updates for comment (${this.cid}) IPNS (${this.ipnsName}) every ${updateIntervalMs} milliseconds`);
        if (this._updateInterval) clearInterval(this._updateInterval);
        this._updateInterval = setInterval(this.updateOnce.bind(this), updateIntervalMs);
        return this.updateOnce();
    }

    stop() {
        clearInterval(this._updateInterval);
    }

    async edit(options: CommentUpdate) {
        assert(this.ipnsKeyName && this.subplebbit.plebbit.ipfsClient, "You need to have commentUpdate and ipfs client defined");
        const [validSignature, failedVerificationReason] = await verifyPublication(options, this.subplebbit.plebbit, "commentupdate");
        assert(validSignature, `Failed to verify CommentUpdate (${JSON.stringify(options)}) due to: ${failedVerificationReason}`);
        this._initCommentUpdate(options);
        this._mergeFields(this.toJSON());
        const file = await this.subplebbit.plebbit.ipfsClient.add(
            JSON.stringify({ ...this.toJSONCommentUpdate(), signature: options.signature })
        );
        await this.subplebbit.plebbit.ipfsClient.name.publish(file["cid"], {
            lifetime: "72h",
            key: this.ipnsKeyName,
            allowOffline: true
        });
        debugs.TRACE(`Linked comment (${this.cid}) ipns name(${this.ipnsName}) to ipfs file (${file.path})`);
    }

    async publish(userOptions): Promise<void> {
        assert(this.content, "Need content field to publish comment");

        return super.publish(userOptions);
    }
}
