import Publication from "../publication.js";
import { hideClassPrivateProps, throwWithErrorCode } from "../../util.js";
import { verifySubplebbitEdit } from "../../signer/signatures.js";
// subplebbitEdit.signer is inherited from Publication
class SubplebbitEdit extends Publication {
    constructor(plebbit) {
        super(plebbit);
        this.raw = {};
        // public method should be bound
        this.publish = this.publish.bind(this);
        hideClassPrivateProps(this);
    }
    _initLocalProps(props) {
        this._initRemoteProps(props.subplebbitEdit);
        this.challengeRequest = props.challengeRequest;
        this.signer = props.signer;
    }
    _initRemoteProps(props) {
        super._initBaseRemoteProps(props);
        this.subplebbitEdit = props.subplebbitEdit;
        this.raw.pubsubMessageToPublish = props;
    }
    toJSONPubsubMessagePublication() {
        if (!this.raw.pubsubMessageToPublish)
            throw Error("Should define local props before calling toJSONPubsubMessagePublication");
        return this.raw.pubsubMessageToPublish;
    }
    getType() {
        return "subplebbitEdit";
    }
    async _validateSignature() {
        const subplebbitEditObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication())); // Stringified here to simulate a message sent through IPNS/PUBSUB
        const signatureValidity = await verifySubplebbitEdit({
            subplebbitEdit: subplebbitEditObj,
            resolveAuthorAddresses: this._plebbit.resolveAuthorAddresses,
            clientsManager: this._clientsManager,
            overrideAuthorAddressIfInvalid: true
        }); // If author domain is not resolving to signer, then don't throw an error
        if (!signatureValidity.valid)
            throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity });
    }
    async publish() {
        await this._validateSignature();
        return super.publish();
    }
}
export default SubplebbitEdit;
//# sourceMappingURL=subplebbit-edit.js.map