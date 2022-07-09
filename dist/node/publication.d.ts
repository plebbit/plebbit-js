/// <reference types="node" />
import { ChallengeRequestMessage } from "./challenge";
import EventEmitter from "events";
import Author from "./author";
import { Subplebbit } from "./subplebbit";
import { Signature, Signer } from "./signer";
declare class Publication extends EventEmitter {
    subplebbit: Subplebbit;
    subplebbitAddress: string;
    timestamp: number;
    signer: Signer;
    signature: Signature;
    author: Author;
    challenge: ChallengeRequestMessage;
    constructor(props: any, subplebbit: any);
    _initProps(props: any): void;
    getType(): "comment" | "vote" | "post";
    toJSON(): {
        subplebbitAddress: string;
        timestamp: number;
        signature: Signature;
        author: Author;
    };
    toJSONSkeleton(): {
        subplebbitAddress: string;
        timestamp: number;
        signature: Signature;
        author: Author;
    };
    handleChallengeExchange(pubsubMsg: any): Promise<void>;
    publishChallengeAnswers(challengeAnswers: any): Promise<void>;
    publish(userOptions: any): Promise<void>;
}
export default Publication;
