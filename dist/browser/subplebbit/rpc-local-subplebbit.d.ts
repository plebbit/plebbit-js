import { InternalSubplebbitRpcType, SubplebbitEditOptions, SubplebbitSettings } from "./types.js";
import { RpcRemoteSubplebbit } from "./rpc-remote-subplebbit.js";
export declare class RpcLocalSubplebbit extends RpcRemoteSubplebbit {
    private _startRpcSubscriptionId?;
    protected _usingDefaultChallenge: InternalSubplebbitRpcType["_usingDefaultChallenge"];
    settings?: SubplebbitSettings;
    toJSONInternalRpc(): InternalSubplebbitRpcType;
    initRpcInternalSubplebbit(newProps: Partial<InternalSubplebbitRpcType>): Promise<void>;
    protected _handleRpcUpdateProps(rpcProps: InternalSubplebbitRpcType): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    edit(newSubplebbitOptions: SubplebbitEditOptions): Promise<this>;
    update(): Promise<void>;
    delete(): Promise<void>;
}
