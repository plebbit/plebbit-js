import Publication from "../publication.js";
import type { PublicationTypeName } from "../../types.js";
import { Plebbit } from "../../plebbit.js";
import type { LocalVoteOptions, VoteChallengeRequestToEncryptType, VotePubsubMessage } from "./types.js";
declare class Vote extends Publication {
    commentCid: VotePubsubMessage["commentCid"];
    vote: VotePubsubMessage["vote"];
    private _pubsubMsgToPublish?;
    constructor(plebbit: Plebbit);
    _initLocalProps(props: LocalVoteOptions): void;
    _initRemoteProps(props: VotePubsubMessage): void;
    _initChallengeRequestProps(props: VoteChallengeRequestToEncryptType): void;
    toJSONPubsubMessagePublication(): VotePubsubMessage;
    getType(): PublicationTypeName;
    private _validateSignature;
    publish(): Promise<void>;
}
export default Vote;
