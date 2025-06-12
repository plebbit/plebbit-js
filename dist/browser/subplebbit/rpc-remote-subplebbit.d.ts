import { RemoteSubplebbit } from "./remote-subplebbit.js";
export declare class RpcRemoteSubplebbit extends RemoteSubplebbit {
    private _updateRpcSubscriptionId?;
    private _updatingRpcSubInstanceWithListeners?;
    protected _setRpcClientStateWithoutEmission(newState: RemoteSubplebbit["clients"]["plebbitRpcClients"][""]["state"]): void;
    protected _setRpcClientStateWithEmission(newState: RemoteSubplebbit["clients"]["plebbitRpcClients"][""]["state"]): void;
    get updatingState(): RemoteSubplebbit["updatingState"];
    protected _updateRpcClientStateFromUpdatingState(updatingState: RpcRemoteSubplebbit["updatingState"]): void;
    protected _processUpdateEventFromRpcUpdate(args: any): void;
    private _handleUpdatingStateChangeFromRpcUpdate;
    private _initMirroringUpdatingSubplebbit;
    protected _handleRpcErrorEvent(args: any): void;
    _initRpcUpdateSubscription(): Promise<void>;
    _createAndSubscribeToNewUpdatingSubplebbit(updatingSubplebbit?: RpcRemoteSubplebbit): Promise<void>;
    update(): Promise<void>;
    private _cleanupMirroringUpdatingSubplebbit;
    stop(): Promise<void>;
}
