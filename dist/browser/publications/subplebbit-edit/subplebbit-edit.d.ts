import Publication from "../publication.js";
import type { PublicationTypeName } from "../../types.js";
import { Plebbit } from "../../plebbit/plebbit.js";
import type { CreateSubplebbitEditPublicationOptions, SubplebbitEditPubsubMessagePublication } from "./types.js";
import type { SignerType } from "../../signer/types.js";
declare class SubplebbitEdit extends Publication implements SubplebbitEditPubsubMessagePublication {
    subplebbitEdit: SubplebbitEditPubsubMessagePublication["subplebbitEdit"];
    signature: SubplebbitEditPubsubMessagePublication["signature"];
    raw: {
        pubsubMessageToPublish?: SubplebbitEditPubsubMessagePublication;
    };
    challengeRequest?: CreateSubplebbitEditPublicationOptions["challengeRequest"];
    constructor(plebbit: Plebbit);
    _initLocalProps(props: {
        subplebbitEdit: SubplebbitEditPubsubMessagePublication;
        signer?: SignerType;
        challengeRequest?: CreateSubplebbitEditPublicationOptions["challengeRequest"];
    }): void;
    _initRemoteProps(props: SubplebbitEditPubsubMessagePublication): void;
    toJSONPubsubMessagePublication(): SubplebbitEditPubsubMessagePublication;
    getType(): PublicationTypeName;
    private _validateSignature;
    publish(): Promise<void>;
}
export default SubplebbitEdit;
