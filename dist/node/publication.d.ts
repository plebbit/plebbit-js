/// <reference types="node" />
import EventEmitter from "events";
import Author from "./author";
import { Subplebbit } from "./subplebbit";
import { Signature, Signer } from "./signer";
import { ProtocolVersion, PublicationType, PublicationTypeName } from "./types";
declare class Publication extends EventEmitter implements PublicationType {
    subplebbitAddress: string;
    timestamp: number;
    signature: Signature;
    signer: Signer;
    author: Author;
    protocolVersion: ProtocolVersion;
    protected subplebbit: Subplebbit;
    private challenge;
    constructor(props: PublicationType, subplebbit: any);
    _initProps(props: PublicationType): void;
    getType(): PublicationTypeName;
    toJSON(): PublicationType;
    toJSONSkeleton(): PublicationType;
    handleChallengeExchange(pubsubMsg: any): Promise<void>;
    publishChallengeAnswers(challengeAnswers: any): Promise<void>;
    publish(userOptions: any): Promise<void>;
}
export default Publication;
