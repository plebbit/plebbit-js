import { GenericStateClient } from "../generic-state-client.js";
type PlebbitIpfsGatewayState = "fetching-ipfs" | "stopped";
type PlebbitKuboRpcState = "fetching-ipfs" | "stopped";
type PlebbitLibp2pJsState = "fetching-ipfs" | "stopped";
export declare class PlebbitIpfsGatewayClient extends GenericStateClient<PlebbitIpfsGatewayState | string> {
}
export declare class PlebbitKuboRpcClient extends GenericStateClient<PlebbitKuboRpcState | string> {
}
export declare class PlebbitLibp2pJsClient extends GenericStateClient<PlebbitLibp2pJsState | string> {
}
export {};
