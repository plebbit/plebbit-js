import { Plebbit } from "../../plebbit.js";
import Publication from "../publication.js";
import { verifyCommentEdit } from "../../signer/signatures.js";
import { isIpfsCid, throwWithErrorCode } from "../../util.js";
import type {
    CommentEditChallengeRequestToEncryptType,
    CommentEditPubsubMessage,
    CommentEditTypeJson,
    LocalCommentEditOptions
} from "./types.js";
import { CommentEditsTableRowInsert, PublicationTypeName } from "../../types.js";

export class CommentEdit extends Publication {
    commentCid!: CommentEditPubsubMessage["commentCid"];
    content?: CommentEditPubsubMessage["content"];
    reason?: CommentEditPubsubMessage["reason"];
    deleted?: CommentEditPubsubMessage["deleted"];
    flair?: CommentEditPubsubMessage["flair"];
    spoiler?: CommentEditPubsubMessage["spoiler"];
    pinned?: CommentEditPubsubMessage["pinned"];
    locked?: CommentEditPubsubMessage["locked"];
    removed?: CommentEditPubsubMessage["removed"];
    commentAuthor?: CommentEditPubsubMessage["commentAuthor"];

    constructor(plebbit: Plebbit) {
        super(plebbit);

        // public method should be bound
        this.publish = this.publish.bind(this);
    }

    _initEditProps(props: LocalCommentEditOptions | CommentEditPubsubMessage) {
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

    _initLocalProps(props: LocalCommentEditOptions) {
        super._initBaseLocalProps(props);
        this._initEditProps(props);
    }

    _initRemoteProps(props: CommentEditPubsubMessage): void {
        super._initBaseRemoteProps(props);
        this._initEditProps(props);
    }

    _initChallengeRequestProps(props: CommentEditChallengeRequestToEncryptType) {
        super._initChallengeRequestChallengeProps(props);
        this._initRemoteProps(props.publication);
    }

    override toJSONPubsubMessagePublication(): CommentEditPubsubMessage {
        return {
            subplebbitAddress: this.subplebbitAddress,
            timestamp: this.timestamp,
            signature: this.signature,
            author: this.author.toJSONIpfs(),
            protocolVersion: this.protocolVersion,
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

    override toJSON(): CommentEditTypeJson {
        return {
            ...this.toJSONPubsubMessagePublication(),
            shortSubplebbitAddress: this.shortSubplebbitAddress,
            author: this.author.toJSON()
        };
    }

    toJSONForDb(isAuthorEdit: boolean, authorSignerAddress: string): CommentEditsTableRowInsert {
        return {
            ...this.toJSONPubsubMessagePublication(),
            author: this.author.toJSONIpfs(),
            authorAddress: this.author.address,
            isAuthorEdit,
            authorSignerAddress
        };
    }

    override getType(): PublicationTypeName {
        return "commentedit";
    }

    private async _validateSignature() {
        const editObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication()));
        const signatureValidity = await verifyCommentEdit(editObj, this._plebbit.resolveAuthorAddresses, this._clientsManager, true); // If author domain is not resolving to signer, then don't throw an error
        if (!signatureValidity.valid) throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity });
    }

    override async publish(): Promise<void> {
        // TODO if publishing with content,reason, deleted, verify that publisher is original author
        if (!isIpfsCid(this.commentCid)) throwWithErrorCode("ERR_CID_IS_INVALID", { commentCid: this.commentCid });

        await this._validateSignature();

        return super.publish();
    }
}
