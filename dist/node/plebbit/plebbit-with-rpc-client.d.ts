import { Plebbit } from "./plebbit.js";
import type { InputPlebbitOptions } from "../types.js";
import { CreateRpcSubplebbitFunctionArgumentSchema } from "../subplebbit/schema.js";
import { RpcLocalSubplebbit } from "../subplebbit/rpc-local-subplebbit.js";
import { RpcRemoteSubplebbit } from "../subplebbit/rpc-remote-subplebbit.js";
import type { RpcLocalSubplebbitJson, RpcRemoteSubplebbitJson, SubplebbitIpfsType } from "../subplebbit/types.js";
import { z } from "zod";
import type { AuthorAddressRpcParam, CidRpcParam } from "../clients/rpc-client/types.js";
export declare class PlebbitWithRpcClient extends Plebbit {
    _plebbitRpcClient: NonNullable<Plebbit["_plebbitRpcClient"]>;
    plebbitRpcClientsOptions: NonNullable<Plebbit["plebbitRpcClientsOptions"]>;
    _startedSubplebbits: Record<SubplebbitIpfsType["address"], RpcLocalSubplebbit>;
    _updatingSubplebbits: Record<string, RpcLocalSubplebbit | RpcRemoteSubplebbit>;
    constructor(options: InputPlebbitOptions);
    _init(): Promise<void>;
    fetchCid(cid: CidRpcParam): Promise<string>;
    resolveAuthorAddress(args: AuthorAddressRpcParam): Promise<string | null>;
    destroy(): Promise<void>;
    getComment(commentCid: CidRpcParam): Promise<import("../publications/comment/comment.js").Comment>;
    createSubplebbit(options?: z.infer<typeof CreateRpcSubplebbitFunctionArgumentSchema> | RpcRemoteSubplebbitJson | RpcLocalSubplebbitJson): Promise<RpcLocalSubplebbit | RpcRemoteSubplebbit>;
}
