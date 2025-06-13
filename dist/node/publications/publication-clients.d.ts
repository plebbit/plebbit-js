import { GenericStateClient } from "../generic-state-client.js";
import { CommentIpfsState } from "./comment/comment-clients.js";
import Publication from "./publication.js";
type PublicationGatewayState = "stopped" | "fetching-subplebbit-ipns";
type PublicationIpfsState = "stopped" | "fetching-subplebbit-ipns" | "fetching-subplebbit-ipfs";
type PublicationPubsubState = "stopped" | "publishing-challenge-request" | "subscribing-pubsub" | "waiting-challenge" | "waiting-challenge-answers" | "publishing-challenge-answer" | "waiting-challenge-verification";
type PublicationLibp2pJsState = PublicationIpfsState | PublicationPubsubState | CommentIpfsState;
type PublicationRpcState = Publication["clients"]["chainProviders"]["eth"][0]["state"] | PublicationLibp2pJsState;
export declare class PublicationLibp2pJsClient extends GenericStateClient<PublicationLibp2pJsState> {
}
export declare class PublicationKuboRpcClient extends GenericStateClient<PublicationIpfsState> {
}
export declare class PublicationKuboPubsubClient extends GenericStateClient<PublicationPubsubState> {
}
export declare class PublicationIpfsGatewayClient extends GenericStateClient<PublicationGatewayState> {
}
export declare class PublicationPlebbitRpcStateClient extends GenericStateClient<PublicationRpcState> {
}
export {};
