import Publication from "../publication.js";
import { verifyCommentEdit } from "../../signer/signatures.js";
import { hideClassPrivateProps, isIpfsCid, throwWithErrorCode } from "../../util.js";
export class CommentEdit extends Publication {
    constructor(plebbit) {
        super(plebbit);
        this.raw = {};
        // public method should be bound
        this.publish = this.publish.bind(this);
        hideClassPrivateProps(this);
    }
    _initLocalProps(props) {
        this._initPubsubPublicationProps(props.commentEdit);
        this.challengeRequest = props.challengeRequest;
        this.signer = props.signer;
    }
    _initPubsubPublicationProps(props) {
        this.raw.pubsubMessageToPublish = props;
        super._initBaseRemoteProps(props);
        this.commentCid = props.commentCid;
        this.content = props.content;
        this.reason = props.reason;
        this.deleted = props.deleted;
        this.flair = props.flair;
        this.spoiler = props.spoiler;
        this.nsfw = props.nsfw;
    }
    toJSONPubsubMessagePublication() {
        if (!this.raw.pubsubMessageToPublish)
            throw Error("Need to define local CommentEditPubsubMessage first");
        return this.raw.pubsubMessageToPublish;
    }
    getType() {
        return "commentEdit";
    }
    async _validateSignature() {
        const editObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication()));
        const signatureValidity = await verifyCommentEdit(editObj, this._plebbit.resolveAuthorAddresses, this._clientsManager, true); // If author domain is not resolving to signer, then don't throw an error
        if (!signatureValidity.valid)
            throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity });
    }
    async publish() {
        // TODO if publishing with content,reason, deleted, verify that publisher is original author
        if (!isIpfsCid(this.commentCid))
            throwWithErrorCode("ERR_CID_IS_INVALID", { commentCid: this.commentCid });
        await this._validateSignature();
        return super.publish();
    }
}
//# sourceMappingURL=comment-edit.js.map