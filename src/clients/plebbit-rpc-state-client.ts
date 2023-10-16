import { TypedEmitter } from "tiny-typed-emitter";
import { GenericClientEvents } from "../types";
import Publication from "../publication";
import { Comment } from "../comment";
import { Subplebbit } from "../subplebbit/subplebbit";
import { BasePages } from "../pages";

// Types
type PublicationRpcState =
    | Publication["clients"]["chainProviders"]["eth"][0]["state"]
    | Publication["clients"]["ipfsClients"][0]["state"]
    | Publication["clients"]["pubsubClients"][0]["state"]
    | Publication["clients"]["ipfsGateways"][0]["state"];
type CommentRpcState =
    | Comment["clients"]["chainProviders"]["eth"][0]["state"]
    | Comment["clients"]["ipfsClients"][0]["state"]
    | Comment["clients"]["pubsubClients"][0]["state"]
    | Comment["clients"]["ipfsGateways"][0]["state"];
type SubplebbitRpcState =
    | Subplebbit["clients"]["chainProviders"]["eth"][0]["state"]
    | Subplebbit["clients"]["ipfsClients"][0]["state"]
    | Subplebbit["clients"]["pubsubClients"][0]["state"]
    | Subplebbit["clients"]["ipfsGateways"][0]["state"];

type PagesRpcState = BasePages["clients"]["ipfsClients"][""][""]["state"] | BasePages["clients"]["ipfsGateways"][""][""]["state"];

type GenericRpcState = PublicationRpcState | CommentRpcState | SubplebbitRpcState | PagesRpcState;

// Client classes
class BasePlebbitRpcStateClient<T extends GenericRpcState> extends TypedEmitter<GenericClientEvents<T>> {
    state: T;

    constructor(state: T) {
        super();
        this.state = state;
    }
}

export class GenericPlebbitRpcStateClient extends BasePlebbitRpcStateClient<GenericRpcState> {}

export class PublicationPlebbitRpcStateClient extends BasePlebbitRpcStateClient<PublicationRpcState> {}

export class CommentPlebbitRpcStateClient extends BasePlebbitRpcStateClient<CommentRpcState> {}

export class SubplebbitPlebbitRpcStateClient extends BasePlebbitRpcStateClient<SubplebbitRpcState> {}

export class PagesPlebbitRpcStateClient extends BasePlebbitRpcStateClient<PagesRpcState> {}
