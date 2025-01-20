import { TypedEmitter } from "tiny-typed-emitter";
import { GenericClientEvents } from "../types.js";
import { hideClassPrivateProps } from "../util.js";

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
export class GenericKuboPubsubClient extends TypedEmitter<GenericClientEvents<GenericPubsubState>> {
    state: GenericPubsubState;

    constructor(state: GenericKuboPubsubClient["state"]) {
        super();
        this.state = state;
        hideClassPrivateProps(this);
    }
}

export class PublicationKuboPubsubClient extends TypedEmitter<GenericClientEvents<PublicationPubsubState>> {
    state: PublicationPubsubState;

    constructor(state: PublicationKuboPubsubClient["state"]) {
        super();
        this.state = state;
    }
}

export class SubplebbitKuboPubsubClient extends TypedEmitter<GenericClientEvents<SubplebbitPubsubState>> {
    state: SubplebbitPubsubState;

    constructor(state: SubplebbitKuboPubsubClient["state"]) {
        super();
        this.state = state;
    }
}
