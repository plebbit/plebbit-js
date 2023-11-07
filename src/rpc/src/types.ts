import { Plebbit } from "../../plebbit";
import { PlebbitOptions } from "../../types";

export type PlebbitWsServerClassOptions = {
    port: number;
    plebbit: Plebbit;
    plebbitOptions?: PlebbitOptions;
};

export type PlebbitWsServerOptions = {
    port: number;
    plebbitOptions?: PlebbitOptions;
};

export type JsonRpcSendNotificationOptions = {
    method: string;
    result: any;
    subscription: number;
    event: string;
    connectionId: string;
};
