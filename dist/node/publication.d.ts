/// <reference types="node" />
import { ChallengeRequestMessage } from "./challenge";
import EventEmitter from "events";
import Author from "./author";
import { Subplebbit } from "./types";
import { Signer } from "./signer";
declare class Publication extends EventEmitter {
    subplebbit: Subplebbit;
    subplebbitAddress: string;
    timestamp: number;
    signer: Signer;
    signature: string;
    author: Author;
    challenge: ChallengeRequestMessage;
    constructor(props: any, subplebbit: any);
    _initProps(props: any): void;

    getType(): "vote" | "post" | "comment";

    toJSON(): {
        subplebbitAddress: string;
        timestamp: number;
        signature: string;
        author: Author;
    };
    toJSONSkeleton(): {
        subplebbitAddress: string;
        timestamp: number;
        signature: string;
        author: Author;
    };
    handleChallengeExchange(pubsubMsg: any): Promise<void>;
    publishChallengeAnswers(challengeAnswers: any): Promise<void>;
    publish(userOptions: any): Promise<void>;
}
export default Publication;
