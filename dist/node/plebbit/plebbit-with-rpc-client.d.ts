import { Plebbit } from "./plebbit.js";
import { InputPlebbitOptions } from "../types";
import { CreateRpcSubplebbitFunctionArgumentSchema } from "../subplebbit/schema.js";
import { RpcLocalSubplebbit } from "../subplebbit/rpc-local-subplebbit.js";
import { RpcRemoteSubplebbit } from "../subplebbit/rpc-remote-subplebbit.js";
import type { RpcLocalSubplebbitJson, RpcRemoteSubplebbitJson } from "../subplebbit/types";
import { z } from "zod";
export declare class PlebbitWithRpcClient extends Plebbit {
    _plebbitRpcClient: NonNullable<Plebbit["_plebbitRpcClient"]>;
    plebbitRpcClientsOptions: NonNullable<Plebbit["plebbitRpcClientsOptions"]>;
    constructor(options: InputPlebbitOptions);
    _init(): Promise<void>;
    fetchCid(cid: string): Promise<string>;
    resolveAuthorAddress(authorAddress: string): Promise<string | null>;
    destroy(): Promise<void>;
    getComment(commentCid: string): Promise<import("../publications/comment/comment.js").Comment>;
    createSubplebbit(options?: z.infer<typeof CreateRpcSubplebbitFunctionArgumentSchema> | RpcRemoteSubplebbitJson | RpcLocalSubplebbitJson): Promise<RpcLocalSubplebbit | RpcRemoteSubplebbit>;
}