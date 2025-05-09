import { RemoteSubplebbit } from "./remote-subplebbit.js";
import { RpcLocalSubplebbit } from "./rpc-local-subplebbit.js";
export declare class RpcRemoteSubplebbit extends RemoteSubplebbit {
    private _updateRpcSubscriptionId?;
    private _updatingRpcSubInstanceWithListeners?;
    protected _setRpcClientState(newState: RemoteSubplebbit["clients"]["plebbitRpcClients"][""]["state"]): void;
    protected _setStartedState(newState: RpcLocalSubplebbit["startedState"]): void;
    protected _updateRpcClientStateFromUpdatingState(updatingState: RpcRemoteSubplebbit["updatingState"]): void;
    protected _processUpdateEventFromRpcUpdate(args: any): Promise<void>;
    private _handleUpdatingStateChangeFromRpcUpdate;
    private _initMirroringUpdatingSubplebbit;
    _initRpcUpdateSubscription(): Promise<void>;
    _createAndSubscribeToNewUpdatingSubplebbit(updatingSubplebbit?: RpcRemoteSubplebbit): Promise<void>;
    update(): Promise<void>;
    private _cleanupMirroringUpdatingSubplebbit;
    stop(): Promise<void>;
}
