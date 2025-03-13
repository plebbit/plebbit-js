import { RemoteSubplebbit } from "./remote-subplebbit.js";
export declare class RpcRemoteSubplebbit extends RemoteSubplebbit {
    private _updateRpcSubscriptionId?;
    protected _setRpcClientState(newState: RemoteSubplebbit["clients"]["plebbitRpcClients"][""]["state"]): void;
    protected _updateRpcClientStateFromUpdatingState(updatingState: RpcRemoteSubplebbit["updatingState"]): void;
    protected _processUpdateEventFromRpcUpdate(args: any): Promise<void>;
    private _handleUpdatingStateChangeFromRpcUpdate;
    private _handleWaitingRetryEventFromRpcUpdate;
    update(): Promise<void>;
    stop(): Promise<void>;
}
