import { InternalSubplebbitRpcType, SubplebbitEditOptions, SubplebbitSettings } from "./types.js";
import { RpcRemoteSubplebbit } from "./rpc-remote-subplebbit.js";
import { Plebbit } from "../plebbit.js";
export declare class RpcLocalSubplebbit extends RpcRemoteSubplebbit {
    started: boolean;
    private _startRpcSubscriptionId?;
    protected _usingDefaultChallenge: InternalSubplebbitRpcType["_usingDefaultChallenge"];
    settings?: SubplebbitSettings;
    constructor(plebbit: Plebbit);
    toJSONInternalRpc(): InternalSubplebbitRpcType;
    initRpcInternalSubplebbit(newProps: Partial<InternalSubplebbitRpcType>): Promise<void>;
    protected _handleRpcUpdateProps(rpcProps: InternalSubplebbitRpcType): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    edit(newSubplebbitOptions: SubplebbitEditOptions): Promise<this>;
    update(): Promise<void>;
    delete(): Promise<void>;
}
