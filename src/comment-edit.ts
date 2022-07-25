import assert from "assert";
import Publication from "./publication";
import {
    AuthorCommentEdit,
    CommentAuthorEditOptions,
    CommentEditType,
    Flair,
    ModeratorCommentEdit,
    PublicationType,
    PublicationTypeName
} from "./types";
import { removeKeysWithUndefinedValues } from "./util";

const PUBLICATION_FIELDS: (keyof Required<PublicationType>)[] = [
    "author",
    "protocolVersion",
    "signature",
    "subplebbitAddress",
    "timestamp"
];
// Storing fields here to check before publishing if CommentEdit has proper field for either author or mod.
export const MOD_EDIT_FIELDS: (keyof ModeratorCommentEdit)[] = [
    ...PUBLICATION_FIELDS,
    "commentCid",
    "flair",
    "spoiler",
    "pinned",
    "locked",
    "removed",
    "moderatorReason",
    "commentAuthor"
];

export const AUTHOR_EDIT_FIELDS: (keyof AuthorCommentEdit)[] = [
    ...PUBLICATION_FIELDS,
    "commentCid",
    "content",
    "flair",
    "spoiler",
    "reason",
    "deleted"
];

export class CommentEdit extends Publication implements CommentEditType {
    commentCid: string;
    content?: string;
    reason?: string;
    deleted?: boolean;
    flair?: Flair;
    spoiler?: boolean;
    pinned?: boolean;
    locked?: boolean;
    removed?: boolean;
    moderatorReason?: string;
    commentAuthor?: CommentAuthorEditOptions;

    _initProps(props: CommentEditType) {
        super._initProps(props);
        this.commentCid = props.commentCid;
        this.content = props.content;
        this.reason = props.reason;
        this.deleted = props.deleted;
        this.flair = props.flair;
        this.spoiler = props.spoiler;
        this.pinned = props.pinned;
        this.locked = props.pinned;
        this.removed = props.removed;
        this.moderatorReason = props.moderatorReason;
        this.commentAuthor = props.commentAuthor;
    }

    toJSON(): CommentEditType {
        return {
            ...super.toJSON(),
            commentCid: this.commentCid,
            content: this.content,
            reason: this.reason,
            deleted: this.deleted,
            flair: this.flair,
            spoiler: this.spoiler,
            pinned: this.pinned,
            locked: this.locked,
            removed: this.removed,
            moderatorReason: this.moderatorReason,
            commentAuthor: this.commentAuthor
        };
    }

    toJSONForDb(challengeRequestId: string) {
        const json = this.toJSON();
        json["authorAddress"] = this.author.address;
        json["challengeRequestId"] = challengeRequestId;
        return removeKeysWithUndefinedValues(json);
    }

    getType(): PublicationTypeName {
        return "commentedit";
    }

    async publish(userOptions): Promise<void> {
        // TODO if publishing with content,reason, deleted, verify that publisher is original author
        assert(this.commentCid, "Need commentCid to be defined to publish CommentEdit");
        return super.publish(userOptions);
    }
}
