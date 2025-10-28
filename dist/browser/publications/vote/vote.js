import Publication from "../publication.js";
import { verifyVote } from "../../signer/index.js";
import { hideClassPrivateProps, throwWithErrorCode } from "../../util.js";
// vote.signer is inherited from Publication
class Vote extends Publication {
    constructor(plebbit) {
        super(plebbit);
        this.raw = {};
        // public method should be bound
        this.publish = this.publish.bind(this);
        hideClassPrivateProps(this);
    }
    _initLocalProps(props) {
        this._initRemoteProps(props.vote);
        this.challengeRequest = props.challengeRequest;
        this.signer = props.signer;
    }
    _initRemoteProps(props) {
        super._initBaseRemoteProps(props);
        this.commentCid = props.commentCid;
        this.vote = props.vote;
        this.raw.pubsubMessageToPublish = props;
    }
    toJSONPubsubMessagePublication() {
        if (!this.raw.pubsubMessageToPublish)
            throw Error("Should define local props before calling toJSONPubsubMessagePublication");
        return this.raw.pubsubMessageToPublish;
    }
    getType() {
        return "vote";
    }
    async _validateSignature() {
        const voteObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication())); // Stringified here to simulate a message sent through IPNS/PUBSUB
        const signatureValidity = await verifyVote(voteObj, this._plebbit.resolveAuthorAddresses, this._clientsManager, true); // If author domain is not resolving to signer, then don't throw an error
        if (!signatureValidity.valid)
            throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity });
    }
    async publish() {
        await this._validateSignature();
        return super.publish();
    }
}
export default Vote;
//# sourceMappingURL=vote.js.map