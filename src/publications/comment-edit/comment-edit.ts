import { Plebbit } from "../../plebbit/plebbit.js";
import Publication from "../publication.js";
import { verifyCommentEdit } from "../../signer/signatures.js";
import { hideClassPrivateProps, isIpfsCid, throwWithErrorCode } from "../../util.js";
import type { CommentEditPubsubMessagePublication, CreateCommentEditOptions } from "./types.js";
import type { PublicationTypeName } from "../../types.js";
import * as remeda from "remeda";
import { SignerType } from "../../signer/types.js";

export class CommentEdit extends Publication implements CommentEditPubsubMessagePublication {
    commentCid!: CommentEditPubsubMessagePublication["commentCid"];
    content?: CommentEditPubsubMessagePublication["content"];
    reason?: CommentEditPubsubMessagePublication["reason"];
    deleted?: CommentEditPubsubMessagePublication["deleted"];
    flair?: CommentEditPubsubMessagePublication["flair"];
    spoiler?: CommentEditPubsubMessagePublication["spoiler"];

    override signature!: CommentEditPubsubMessagePublication["signature"];

    _pubsubMsgToPublish?: CommentEditPubsubMessagePublication = undefined;
    override challengeRequest?: CreateCommentEditOptions["challengeRequest"];

    constructor(plebbit: Plebbit) {
        super(plebbit);

        // public method should be bound
        this.publish = this.publish.bind(this);

        hideClassPrivateProps(this);
    }

    _initLocalProps(props: {
        commentEdit: CommentEditPubsubMessagePublication;
        signer?: SignerType;
        challengeRequest?: CreateCommentEditOptions["challengeRequest"];
    }) {
        this._initPubsubPublicationProps(props.commentEdit);
        this.challengeRequest = props.challengeRequest;
        this.signer = props.signer;
    }

    _initPubsubPublicationProps(props: CommentEditPubsubMessagePublication): void {
        this._pubsubMsgToPublish = props;
        super._initBaseRemoteProps(props);
        this.commentCid = props.commentCid;
        this.content = props.content;
        this.reason = props.reason;
        this.deleted = props.deleted;
        this.flair = props.flair;
        this.spoiler = props.spoiler;
    }

    override toJSONPubsubMessagePublication(): CommentEditPubsubMessagePublication {
        if (!this._pubsubMsgToPublish) throw Error("Need to define local CommentEditPubsubMessage first");
        return this._pubsubMsgToPublish;
    }

    override getType(): PublicationTypeName {
        return "commentEdit";
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
