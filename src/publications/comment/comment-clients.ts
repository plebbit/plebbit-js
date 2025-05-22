import { GenericStateClient } from "../../generic-state-client.js";
import {
    PublicationIpfsGatewayClient,
    PublicationKuboPubsubClient,
    PublicationKuboRpcClient,
    PublicationLibp2pJsClient
} from "../publication-clients.js";

import { Comment } from "./comment.js";

type CommentGatewayState = PublicationIpfsGatewayClient["state"] | "fetching-update-ipfs" | "fetching-ipfs";

export type CommentIpfsState = PublicationKuboRpcClient["state"] | "fetching-ipfs" | "fetching-update-ipfs";

type CommentPubsubState = PublicationKuboPubsubClient["state"];

type CommentLibp2pJsState = CommentIpfsState | CommentPubsubState | PublicationLibp2pJsClient["state"];

type CommentRpcState = Comment["clients"]["chainProviders"]["eth"][0]["state"] | CommentLibp2pJsState;

export class CommentLibp2pJsClient extends GenericStateClient<CommentLibp2pJsState> {}

export class CommentKuboRpcClient extends GenericStateClient<CommentIpfsState> {}

export class CommentKuboPubsubClient extends GenericStateClient<CommentPubsubState> {}

export class CommentIpfsGatewayClient extends GenericStateClient<CommentGatewayState> {}

export class CommentPlebbitRpcStateClient extends GenericStateClient<CommentRpcState> {}
