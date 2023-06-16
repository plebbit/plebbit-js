import { TypedEmitter } from "tiny-typed-emitter";
import { GenericClientEvents } from "../types";
type PublicationPubsubState = "stopped" | "publishing-challenge-request" | "subscribing-pubsub" | "waiting-challenge" | "waiting-challenge-answers" | "publishing-challenge-answer" | "waiting-challenge-verification";
type SubplebbitPubsubState = "stopped" | "waiting-challenge-requests" | "publishing-challenge" | "waiting-challenge-answers" | "publishing-challenge-verification";
type GenericPubsubState = PublicationPubsubClient["state"] | SubplebbitPubsubClient["state"];
export declare class GenericPubsubClient extends TypedEmitter<GenericClientEvents<GenericPubsubState>> {
    state: GenericPubsubState;
    constructor(state: GenericPubsubClient["state"]);
}
export declare class PublicationPubsubClient extends TypedEmitter<GenericClientEvents<PublicationPubsubState>> {
    state: PublicationPubsubState;
    constructor(state: PublicationPubsubClient["state"]);
}
export declare class SubplebbitPubsubClient extends TypedEmitter<GenericClientEvents<SubplebbitPubsubState>> {
    state: SubplebbitPubsubState;
    constructor(state: SubplebbitPubsubClient["state"]);
}
export {};
