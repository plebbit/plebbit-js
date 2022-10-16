/// <reference types="node" />
import EventEmitter from "events";
import Author from "./author";
import { Signature, Signer } from "./signer";
import { ProtocolVersion, PublicationType, PublicationTypeName } from "./types";
import { Plebbit } from "./plebbit";
import { Subplebbit } from "./subplebbit";
declare class Publication extends EventEmitter implements PublicationType {
    subplebbitAddress: string;
    timestamp: number;
    signature: Signature;
    signer: Signer;
    author: Author;
    protocolVersion: ProtocolVersion;
    protected plebbit: Plebbit;
    protected subplebbit?: Subplebbit;
    private challenge;
    constructor(props: PublicationType, plebbit: Plebbit);
    _initProps(props: PublicationType): void;
    getType(): PublicationTypeName;
    toJSON(): PublicationType;
    toJSONSkeleton(): PublicationType;
    private handleChallengeExchange;
    publishChallengeAnswers(challengeAnswers: string[]): Promise<void>;
    publish(userOptions: any): Promise<void>;
}
export default Publication;
