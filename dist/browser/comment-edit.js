import Publication from "./publication.js";
import { verifyCommentEdit } from "./signer/signatures.js";
import { throwWithErrorCode } from "./util.js";
import { cid as isIpfsCid } from "is-ipfs";
export class CommentEdit extends Publication {
    constructor(props, plebbit) {
        super(props, plebbit);
        // public method should be bound
        this.publish = this.publish.bind(this);
    }
    _initProps(props) {
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
    toJSONPubsubMessagePublication() {
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
        return {
            ...this.toJSONPubsubMessagePublication(),
            shortSubplebbitAddress: this.shortSubplebbitAddress,
            author: this.author.toJSON()
        };
    }
    toJSONForDb(isAuthorEdit, authorSignerAddress) {
        return {
            ...this.toJSONPubsubMessagePublication(),
            author: this.author.toJSONIpfs(),
            authorAddress: this.author.address,
            isAuthorEdit,
            authorSignerAddress
        };
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