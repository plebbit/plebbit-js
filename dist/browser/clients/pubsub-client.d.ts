import type { GenericClientEvents } from "../types.js";
import { PlebbitTypedEmitter } from "./plebbit-typed-emitter.js";
type PublicationPubsubState = "stopped" | "publishing-challenge-request" | "subscribing-pubsub" | "waiting-challenge" | "waiting-challenge-answers" | "publishing-challenge-answer" | "waiting-challenge-verification";
type SubplebbitPubsubState = "stopped" | "waiting-challenge-requests" | "publishing-challenge" | "waiting-challenge-answers" | "publishing-challenge-verification";
type GenericPubsubState = PublicationKuboPubsubClient["state"] | SubplebbitKuboPubsubClient["state"];
export declare class GenericKuboPubsubClient extends PlebbitTypedEmitter<GenericClientEvents<GenericPubsubState>> {
    state: GenericPubsubState;
    constructor(state: GenericKuboPubsubClient["state"]);
}
export declare class PublicationKuboPubsubClient extends PlebbitTypedEmitter<GenericClientEvents<PublicationPubsubState>> {
    state: PublicationPubsubState;
    constructor(state: PublicationKuboPubsubClient["state"]);
}
export declare class SubplebbitKuboPubsubClient extends PlebbitTypedEmitter<GenericClientEvents<SubplebbitPubsubState>> {
    state: SubplebbitPubsubState;
    constructor(state: SubplebbitKuboPubsubClient["state"]);
}
export {};
