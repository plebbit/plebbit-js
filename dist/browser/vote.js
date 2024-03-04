import Publication from "./publication.js";
import { cid as isIpfsCid } from "is-ipfs";
import { verifyVote } from "./signer/index.js";
import { throwWithErrorCode } from "./util.js";
class Vote extends Publication {
    constructor(props, plebbit) {
        super(props, plebbit);
        this.commentCid = props.commentCid;
        this.vote = props.vote; // Either 1, 0, -1 (upvote, cancel vote, downvote)
        // public method should be bound
        this.publish = this.publish.bind(this);
    }
    toJSONPubsubMessagePublication() {
        return {
            ...super.toJSONPubsubMessagePublication(),
            commentCid: this.commentCid,
            vote: this.vote
        };
    }
    toJSON() {
        return {
            ...this.toJSONPubsubMessagePublication(),
            shortSubplebbitAddress: this.shortSubplebbitAddress,
            author: this.author.toJSON()
        };
    }
    getType() {
        return "vote";
    }
    toJSONForDb(authorSignerAddress) {
        return {
            ...this.toJSONPubsubMessagePublication(),
            authorAddress: this.author.address,
            authorSignerAddress
        };
    }
    async _validateSignature() {
        const voteObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication())); // Stringified here to simulate a message sent through IPNS/PUBSUB
        const signatureValidity = await verifyVote(voteObj, this._plebbit.resolveAuthorAddresses, this._clientsManager, true); // If author domain is not resolving to signer, then don't throw an error
        if (!signatureValidity.valid)
            throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity });
    }
    async publish() {
        if (![-1, 0, 1].includes(this.vote))
            throwWithErrorCode("ERR_PUBLICATION_MISSING_FIELD", { vote: this.vote });
        if (!isIpfsCid(this.commentCid))
            throwWithErrorCode("ERR_CID_IS_INVALID", { commentCid: this.commentCid });
        await this._validateSignature();
        return super.publish();
    }
}
export default Vote;
//# sourceMappingURL=vote.js.map