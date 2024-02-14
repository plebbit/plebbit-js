import { RemoteSubplebbit } from "./remote-subplebbit.js";
export declare class RpcRemoteSubplebbit extends RemoteSubplebbit {
    private _updateRpcSubscriptionId?;
    protected _setRpcClientState(newState: RemoteSubplebbit["clients"]["plebbitRpcClients"][""]["state"]): void;
    protected _updateRpcClientStateFromStartedState(startedState: RemoteSubplebbit["startedState"]): void;
    protected _updateRpcClientStateFromUpdatingState(updatingState: RemoteSubplebbit["updatingState"]): void;
    update(): Promise<void>;
    stop(): Promise<void>;
}
