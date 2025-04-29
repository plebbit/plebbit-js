import Publication from "../publication.js";
import type { PublicationTypeName } from "../../types.js";
import { Plebbit } from "../../plebbit/plebbit.js";
import type { CreateVoteOptions, VotePubsubMessagePublication } from "./types.js";
import type { SignerType } from "../../signer/types.js";
declare class Vote extends Publication implements VotePubsubMessagePublication {
    commentCid: VotePubsubMessagePublication["commentCid"];
    vote: VotePubsubMessagePublication["vote"];
    signature: VotePubsubMessagePublication["signature"];
    raw: {
        pubsubMessageToPublish?: VotePubsubMessagePublication;
    };
    challengeRequest?: CreateVoteOptions["challengeRequest"];
    constructor(plebbit: Plebbit);
    _initLocalProps(props: {
        vote: VotePubsubMessagePublication;
        signer?: SignerType;
        challengeRequest?: CreateVoteOptions["challengeRequest"];
    }): void;
    _initRemoteProps(props: VotePubsubMessagePublication): void;
    toJSONPubsubMessagePublication(): VotePubsubMessagePublication;
    getType(): PublicationTypeName;
    private _validateSignature;
    publish(): Promise<void>;
}
export default Vote;
