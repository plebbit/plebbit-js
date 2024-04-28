import { Plebbit } from "../../plebbit.js";
import { PlebbitOptions } from "../../types.js";
import { Server as RpcWebsocketsServer } from "rpc-websockets";
export type PlebbitWsServerClassOptions = Pick<ConstructorParameters<typeof RpcWebsocketsServer>[0], "port" | "server"> & {
    plebbit: Plebbit;
    authKey?: string;
};
export interface PlebbitWsServerOptions extends Omit<PlebbitWsServerClassOptions, "plebbit"> {
    plebbitOptions?: PlebbitOptions;
}
export type JsonRpcSendNotificationOptions = {
    method: string;
    result: any;
    subscription: number;
    event: string;
    connectionId: string;
};
