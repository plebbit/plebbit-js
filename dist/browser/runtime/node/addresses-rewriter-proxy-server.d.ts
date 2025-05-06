import http from "node:http";
import { Plebbit } from "../../plebbit/plebbit.js";
type AddressesRewriterOptions = {
    kuboClients: Plebbit["clients"]["kuboRpcClients"][string]["_client"][];
    port: number;
    hostname: string | undefined;
    proxyTargetUrl: string;
    plebbit: Pick<Plebbit, "_storage">;
};
export declare class AddressesRewriterProxyServer {
    addresses: Record<string, string[]>;
    kuboClients: AddressesRewriterOptions["kuboClients"];
    port: number;
    hostname: string;
    proxyTarget: URL;
    server: ReturnType<(typeof http)["createServer"]>;
    _storageKeyName: string;
    _plebbit: Pick<Plebbit, "_storage">;
    private _updateAddressesInterval;
    constructor({ kuboClients: kuboClient, port, hostname, proxyTargetUrl, plebbit }: AddressesRewriterOptions);
    listen(callback?: () => void): Promise<void>;
    destroy(): Promise<void>;
    _proxyRequestRewrite(req: Parameters<http.RequestListener>[0], res: Parameters<http.RequestListener>[1]): void;
    _startUpdateAddressesLoop(): Promise<void>;
}
export {};
