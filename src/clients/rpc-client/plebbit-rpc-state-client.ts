import { TypedEmitter } from "tiny-typed-emitter";
import type { GenericClientEvents } from "../../types.js";
import Publication from "../../publications/publication.js";
import { Comment } from "../../publications/comment/comment.js";
import { BasePages } from "../../pages/pages.js";
import { RpcRemoteSubplebbit } from "../../subplebbit/rpc-remote-subplebbit.js";
import { hideClassPrivateProps } from "../../util.js";
import { PlebbitTypedEmitter } from "../plebbit-typed-emitter.js";

// Types
type PublicationRpcState =
    | Publication["clients"]["chainProviders"]["eth"][0]["state"]
    | Publication["clients"]["kuboRpcClients"][0]["state"]
    | Publication["clients"]["pubsubKuboRpcClients"][0]["state"]
    | Publication["clients"]["ipfsGateways"][0]["state"];
type CommentRpcState =
    | Comment["clients"]["chainProviders"]["eth"][0]["state"]
    | Comment["clients"]["kuboRpcClients"][0]["state"]
    | Comment["clients"]["pubsubKuboRpcClients"][0]["state"]
    | Comment["clients"]["ipfsGateways"][0]["state"];
type SubplebbitRpcState =
    | RpcRemoteSubplebbit["clients"]["chainProviders"]["eth"][0]["state"]
    | RpcRemoteSubplebbit["clients"]["kuboRpcClients"][0]["state"]
    | RpcRemoteSubplebbit["clients"]["pubsubKuboRpcClients"][0]["state"]
    | RpcRemoteSubplebbit["clients"]["ipfsGateways"][0]["state"];

type PagesRpcState = BasePages["clients"]["kuboRpcClients"][""][""]["state"] | BasePages["clients"]["ipfsGateways"][""][""]["state"];

type GenericRpcState = PublicationRpcState | CommentRpcState | SubplebbitRpcState | PagesRpcState;

// Client classes
class BasePlebbitRpcStateClient<T extends GenericRpcState> extends PlebbitTypedEmitter<GenericClientEvents<T>> {
    override state: T;

    constructor(state: T) {
        super();
        this.state = state;
        hideClassPrivateProps(this);
    }
}

export class GenericPlebbitRpcStateClient extends BasePlebbitRpcStateClient<GenericRpcState> {}

export class PublicationPlebbitRpcStateClient extends BasePlebbitRpcStateClient<PublicationRpcState> {}

export class CommentPlebbitRpcStateClient extends BasePlebbitRpcStateClient<CommentRpcState> {}

export class SubplebbitPlebbitRpcStateClient extends BasePlebbitRpcStateClient<SubplebbitRpcState> {}

export class PagesPlebbitRpcStateClient extends BasePlebbitRpcStateClient<PagesRpcState> {}
