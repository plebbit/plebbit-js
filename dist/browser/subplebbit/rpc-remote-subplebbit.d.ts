import { RemoteSubplebbit } from "./remote-subplebbit.js";
import type { SubplebbitIpfsType } from "./types.js";
export declare class RpcRemoteSubplebbit extends RemoteSubplebbit {
    private _updateRpcSubscriptionId?;
    protected _setRpcClientState(newState: RemoteSubplebbit["clients"]["plebbitRpcClients"][""]["state"]): void;
    protected _updateRpcClientStateFromUpdatingState(updatingState: RemoteSubplebbit["updatingState"]): void;
    protected _handleRpcUpdateProps(rpcProps: SubplebbitIpfsType): Promise<void>;
    update(): Promise<void>;
    stop(): Promise<void>;
}
