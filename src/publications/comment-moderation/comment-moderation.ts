import { Plebbit } from "../../plebbit/plebbit.js";
import Publication from "../publication.js";
import { hideClassPrivateProps, isIpfsCid, throwWithErrorCode } from "../../util.js";
import type {
    CommentModerationChallengeRequestToEncrypt,
    CommentModerationPubsubMessagePublication,
    LocalCommentModerationAfterSigning
} from "./types.js";
import type { PublicationTypeName } from "../../types.js";
import * as remeda from "remeda";
import { verifyCommentModeration } from "../../signer/signatures.js";

export class CommentModeration extends Publication implements CommentModerationPubsubMessagePublication {
    commentCid!: CommentModerationPubsubMessagePublication["commentCid"];
    commentModeration!: CommentModerationPubsubMessagePublication["commentModeration"];

    _pubsubMsgToPublish?: CommentModerationPubsubMessagePublication = undefined;

    constructor(plebbit: Plebbit) {
        super(plebbit);

        // public method should be bound
        this.publish = this.publish.bind(this);

        hideClassPrivateProps(this);
    }

    _initEditProps(props: LocalCommentModerationAfterSigning | CommentModerationPubsubMessagePublication) {
        this.commentCid = props.commentCid;
        this.commentModeration = props.commentModeration;
    }

    _initLocalProps(props: LocalCommentModerationAfterSigning) {
        super._initBaseLocalProps(props);
        this._initEditProps(props);
        const keysCasted = <(keyof CommentModerationPubsubMessagePublication)[]>props.signature.signedPropertyNames;
        this._pubsubMsgToPublish = remeda.pick(props, ["signature", ...keysCasted]);
    }

    _initRemoteProps(props: CommentModerationPubsubMessagePublication): void {
        super._initBaseRemoteProps(props);
        this._initEditProps(props);
    }

    _initChallengeRequestProps(props: CommentModerationChallengeRequestToEncrypt) {
        super._initChallengeRequestChallengeProps(props);
        this._initRemoteProps(props.commentModeration);
        this._pubsubMsgToPublish = props.commentModeration;
    }

    override toJSONPubsubMessagePublication(): CommentModerationPubsubMessagePublication {
        if (!this._pubsubMsgToPublish) throw Error("Need to define local CommentEditPubsubMessage first");
        return this._pubsubMsgToPublish;
    }

    override getType(): PublicationTypeName {
        return "commentModeration";
    }

    private async _validateSignature() {
        const editObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication()));
        const signatureValidity = await verifyCommentModeration(editObj, this._plebbit.resolveAuthorAddresses, this._clientsManager, true); // If author domain is not resolving to signer, then don't throw an error
        if (!signatureValidity.valid) throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity });
    }

    override async publish(): Promise<void> {
        // TODO if publishing with content,reason, deleted, verify that publisher is original author
        if (!isIpfsCid(this.commentCid)) throwWithErrorCode("ERR_CID_IS_INVALID", { commentCid: this.commentCid });

        await this._validateSignature();

        return super.publish();
    }
}
