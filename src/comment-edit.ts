import { ChallengeRequestMessage } from "./challenge";
import { Plebbit } from "./plebbit";
import Publication from "./publication";
import { verifyCommentEdit } from "./signer/signatures";
import {
    AuthorCommentEdit,
    CommentAuthorEditOptions,
    CommentEditPubsubMessage,
    CommentEditsTableRowInsert,
    CommentEditType,
    Flair,
    ModeratorCommentEdit,
    PublicationType,
    PublicationTypeName
} from "./types";
import { throwWithErrorCode } from "./util";
import isIPFS from "is-ipfs";

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
    "reason",
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
    commentAuthor?: CommentAuthorEditOptions;

    constructor(props: CommentEditType, plebbit: Plebbit) {
        super(props, plebbit);

        // public method should be bound
        this.publish = this.publish.bind(this);
    }

    _initProps(props: CommentEditType) {
        super._initProps(props);
        this.commentCid = props.commentCid;
        this.content = props.content;
        this.reason = props.reason;
        this.deleted = props.deleted;
        this.flair = props.flair;
        this.spoiler = props.spoiler;
        this.pinned = props.pinned;
        this.locked = props.locked;
        this.removed = props.removed;
        this.commentAuthor = props.commentAuthor;
    }

    toJSONPubsubMessagePublication(): CommentEditPubsubMessage {
        return {
            ...super.toJSONPubsubMessagePublication(),
            commentCid: this.commentCid,
            content: this.content,
            reason: this.reason,
            deleted: this.deleted,
            flair: this.flair,
            spoiler: this.spoiler,
            pinned: this.pinned,
            locked: this.locked,
            removed: this.removed,
            commentAuthor: this.commentAuthor
        };
    }

    toJSON() {
        return this.toJSONPubsubMessagePublication();
    }

    toJSONForDb(challengeRequestId: ChallengeRequestMessage["challengeRequestId"]): CommentEditsTableRowInsert {
        return {
            ...this.toJSON(),
            author: this.author.toJSONIpfs(),
            authorAddress: this.author.address,
            challengeRequestId: challengeRequestId
        };
    }

    getType(): PublicationTypeName {
        return "commentedit";
    }

    private async _validateSignature() {
        const editObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication()));
        const signatureValidity = await verifyCommentEdit(editObj, this._plebbit.resolveAuthorAddresses, this._clientsManager, true); // If author domain is not resolving to signer, then don't throw an error
        if (!signatureValidity.valid) throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity });
    }

    async publish(): Promise<void> {
        // TODO if publishing with content,reason, deleted, verify that publisher is original author
        if (!isIPFS.cid(this.commentCid)) throwWithErrorCode("ERR_CID_IS_INVALID", { commentCid: this.commentCid });

        await this._validateSignature();

        return super.publish();
    }
}
