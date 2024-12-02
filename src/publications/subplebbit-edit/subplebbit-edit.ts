import Publication from "../publication.js";
import type { PublicationTypeName } from "../../types.js";
import { Plebbit } from "../../plebbit/plebbit.js";
import { hideClassPrivateProps, throwWithErrorCode } from "../../util.js";
import type { CreateSubplebbitEditPublicationOptions, SubplebbitEditPubsubMessagePublication } from "./types.js";
import type { SignerType } from "../../signer/types.js";
import { verifySubplebbitEdit } from "../../signer/signatures.js";

// subplebbitEdit.signer is inherited from Publication
class SubplebbitEdit extends Publication implements SubplebbitEditPubsubMessagePublication {
    subplebbitEdit!: SubplebbitEditPubsubMessagePublication["subplebbitEdit"];
    override signature!: SubplebbitEditPubsubMessagePublication["signature"];

    _pubsubMsgToPublish?: SubplebbitEditPubsubMessagePublication = undefined;
    override challengeRequest?: CreateSubplebbitEditPublicationOptions["challengeRequest"];

    constructor(plebbit: Plebbit) {
        super(plebbit);

        // public method should be bound
        this.publish = this.publish.bind(this);

        hideClassPrivateProps(this);
    }

    _initLocalProps(props: {
        subplebbitEdit: SubplebbitEditPubsubMessagePublication;
        signer?: SignerType;
        challengeRequest?: CreateSubplebbitEditPublicationOptions["challengeRequest"];
    }): void {
        this._initRemoteProps(props.subplebbitEdit);
        this.challengeRequest = props.challengeRequest;
        this.signer = props.signer;
    }

    _initRemoteProps(props: SubplebbitEditPubsubMessagePublication): void {
        super._initBaseRemoteProps(props);
        this.subplebbitEdit = props.subplebbitEdit;
        this._pubsubMsgToPublish = props;
    }

    override toJSONPubsubMessagePublication(): SubplebbitEditPubsubMessagePublication {
        if (!this._pubsubMsgToPublish) throw Error("Should define local props before calling toJSONPubsubMessagePublication");
        return this._pubsubMsgToPublish;
    }

    override getType(): PublicationTypeName {
        return "subplebbitEdit";
    }

    private async _validateSignature() {
        const subplebbitEditObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication())); // Stringified here to simulate a message sent through IPNS/PUBSUB
        const signatureValidity = await verifySubplebbitEdit(
            subplebbitEditObj,
            this._plebbit.resolveAuthorAddresses,
            this._clientsManager,
            true
        ); // If author domain is not resolving to signer, then don't throw an error
        if (!signatureValidity.valid) throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity });
    }

    override async publish(): Promise<void> {
        await this._validateSignature();
        return super.publish();
    }
}

export default SubplebbitEdit;
