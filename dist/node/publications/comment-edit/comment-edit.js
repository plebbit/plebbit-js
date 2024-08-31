import Publication from "../publication.js";
import { verifyCommentEdit } from "../../signer/signatures.js";
import { hideClassPrivateProps, isIpfsCid, throwWithErrorCode } from "../../util.js";
import * as remeda from "remeda";
export class CommentEdit extends Publication {
    constructor(plebbit) {
        super(plebbit);
        this._pubsubMsgToPublish = undefined;
        // public method should be bound
        this.publish = this.publish.bind(this);
        hideClassPrivateProps(this);
    }
    _initEditProps(props) {
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
    _initLocalProps(props) {
        super._initBaseLocalProps(props);
        this._initEditProps(props);
        const keysCasted = props.signature.signedPropertyNames;
        this._pubsubMsgToPublish = remeda.pick(props, ["signature", ...keysCasted]);
    }
    _initRemoteProps(props) {
        super._initBaseRemoteProps(props);
        this._initEditProps(props);
    }
    _initChallengeRequestProps(props) {
        super._initChallengeRequestChallengeProps(props);
        this._initRemoteProps(props.publication);
        this._pubsubMsgToPublish = props.publication;
    }
    toJSONPubsubMessagePublication() {
        if (!this._pubsubMsgToPublish)
            throw Error("Need to define local CommentEditPubsubMessage first");
        return this._pubsubMsgToPublish;
    }
    getType() {
        return "commentedit";
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