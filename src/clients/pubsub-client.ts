import type { GenericClientEvents } from "../types.js";
import { hideClassPrivateProps } from "../util.js";
import { PlebbitTypedEmitter } from "./plebbit-typed-emitter.js";

// Types
type PublicationPubsubState =
    | "stopped"
    | "publishing-challenge-request"
    | "subscribing-pubsub"
    | "waiting-challenge"
    | "waiting-challenge-answers"
    | "publishing-challenge-answer"
    | "waiting-challenge-verification";
type SubplebbitPubsubState =
    | "stopped"
    | "waiting-challenge-requests"
    | "publishing-challenge"
    | "waiting-challenge-answers"
    | "publishing-challenge-verification";
type GenericPubsubState = PublicationKuboPubsubClient["state"] | SubplebbitKuboPubsubClient["state"];

// Client classes
export class GenericKuboPubsubClient extends PlebbitTypedEmitter<GenericClientEvents<GenericPubsubState>> {
    override state: GenericPubsubState;

    constructor(state: GenericKuboPubsubClient["state"]) {
        super();
        this.state = state;
        hideClassPrivateProps(this);
    }
}

export class PublicationKuboPubsubClient extends PlebbitTypedEmitter<GenericClientEvents<PublicationPubsubState>> {
    override state: PublicationPubsubState;

    constructor(state: PublicationKuboPubsubClient["state"]) {
        super();
        this.state = state;
    }
}

export class SubplebbitKuboPubsubClient extends PlebbitTypedEmitter<GenericClientEvents<SubplebbitPubsubState>> {
    override state: SubplebbitPubsubState;

    constructor(state: SubplebbitKuboPubsubClient["state"]) {
        super();
        this.state = state;
    }
}
