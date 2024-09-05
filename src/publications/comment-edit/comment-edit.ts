import { Plebbit } from "../../plebbit.js";
import Publication from "../publication.js";
import { verifyCommentEdit } from "../../signer/signatures.js";
import { hideClassPrivateProps, isIpfsCid, throwWithErrorCode } from "../../util.js";
import type { CommentEditChallengeRequestToEncryptType, CommentEditPubsubMessagePublication, LocalCommentEditOptions } from "./types.js";
import type { PublicationTypeName } from "../../types.js";
import * as remeda from "remeda";

export class CommentEdit extends Publication {
    commentCid!: CommentEditPubsubMessagePublication["commentCid"];
    content?: CommentEditPubsubMessagePublication["content"];
    reason?: CommentEditPubsubMessagePublication["reason"];
    deleted?: CommentEditPubsubMessagePublication["deleted"];
    flair?: CommentEditPubsubMessagePublication["flair"];
    spoiler?: CommentEditPubsubMessagePublication["spoiler"];
    pinned?: CommentEditPubsubMessagePublication["pinned"];
    locked?: CommentEditPubsubMessagePublication["locked"];
    removed?: CommentEditPubsubMessagePublication["removed"];
    commentAuthor?: CommentEditPubsubMessagePublication["commentAuthor"];

    _pubsubMsgToPublish?: CommentEditPubsubMessagePublication = undefined;

    constructor(plebbit: Plebbit) {
        super(plebbit);

        // public method should be bound
        this.publish = this.publish.bind(this);

        hideClassPrivateProps(this);
    }

    _initEditProps(props: LocalCommentEditOptions | CommentEditPubsubMessagePublication) {
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
        const keysCasted = <(keyof CommentEditPubsubMessagePublication)[]>props.signature.signedPropertyNames;
        this._pubsubMsgToPublish = remeda.pick(props, ["signature", ...keysCasted]);
    }

    _initRemoteProps(props: CommentEditPubsubMessagePublication): void {
        super._initBaseRemoteProps(props);
        this._initEditProps(props);
    }

    _initChallengeRequestProps(props: CommentEditChallengeRequestToEncryptType) {
        super._initChallengeRequestChallengeProps(props);
        this._initRemoteProps(props.publication);
        this._pubsubMsgToPublish = props.publication;
    }

    override toJSONPubsubMessagePublication(): CommentEditPubsubMessagePublication {
        if (!this._pubsubMsgToPublish) throw Error("Need to define local CommentEditPubsubMessage first");
        return this._pubsubMsgToPublish;
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
