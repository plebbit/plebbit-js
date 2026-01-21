import Publication from "../publication.js";
import { hideClassPrivateProps, isIpfsCid, throwWithErrorCode } from "../../util.js";
import { verifyCommentModeration } from "../../signer/signatures.js";
export class CommentModeration extends Publication {
    constructor(plebbit) {
        super(plebbit);
        this.raw = {};
        // public method should be bound
        this.publish = this.publish.bind(this);
        hideClassPrivateProps(this);
    }
    _initLocalProps(props) {
        this._initPubsubPublication(props.commentModeration);
        this.challengeRequest = props.challengeRequest;
        this.signer = props.signer;
    }
    _initPubsubPublication(pubsubMsgPub) {
        super._initBaseRemoteProps(pubsubMsgPub);
        this.commentCid = pubsubMsgPub.commentCid;
        this.commentModeration = pubsubMsgPub.commentModeration;
        this.raw.pubsubMessageToPublish = pubsubMsgPub;
    }
    toJSONPubsubMessagePublication() {
        if (!this.raw.pubsubMessageToPublish)
            throw Error("Need to define local CommentModerationPubsubMessage first");
        return this.raw.pubsubMessageToPublish;
    }
    getType() {
        return "commentModeration";
    }
    async _validateSignature() {
        const editObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication()));
        const signatureValidity = await verifyCommentModeration({ moderation: editObj, resolveAuthorAddresses: this._plebbit.resolveAuthorAddresses, clientsManager: this._clientsManager, overrideAuthorAddressIfInvalid: true }); // If author domain is not resolving to signer, then don't throw an error
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
//# sourceMappingURL=comment-moderation.js.map