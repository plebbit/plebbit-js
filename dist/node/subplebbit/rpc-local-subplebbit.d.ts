import { InternalSubplebbitRpcType, LocalSubplebbitJsonType, LocalSubplebbitRpcJsonType, SubplebbitEditOptions, SubplebbitSettings } from "./types.js";
import { RpcRemoteSubplebbit } from "./rpc-remote-subplebbit.js";
import { Plebbit } from "../plebbit.js";
export declare class RpcLocalSubplebbit extends RpcRemoteSubplebbit {
    started: boolean;
    private _startRpcSubscriptionId?;
    protected _usingDefaultChallenge: boolean;
    startedState: "stopped" | "publishing-ipns" | "failed" | "succeeded";
    signer: InternalSubplebbitRpcType["signer"];
    settings?: SubplebbitSettings;
    constructor(plebbit: Plebbit);
    toJSON(): LocalSubplebbitRpcJsonType | LocalSubplebbitJsonType;
    toJSONInternalRpc(): InternalSubplebbitRpcType;
    initRpcInternalSubplebbitNoMerge(newProps: InternalSubplebbitRpcType): Promise<void>;
    protected _handleRpcUpdateProps(rpcProps: InternalSubplebbitRpcType): Promise<void>;
    protected _setStartedState(newState: RpcLocalSubplebbit["startedState"]): void;
    protected _updateRpcClientStateFromStartedState(startedState: RpcLocalSubplebbit["startedState"]): void;
    start(): Promise<void>;
    private _cleanUpRpcConnection;
    stop(): Promise<void>;
    edit(newSubplebbitOptions: SubplebbitEditOptions): Promise<this>;
    update(): Promise<void>;
    delete(): Promise<void>;
}
