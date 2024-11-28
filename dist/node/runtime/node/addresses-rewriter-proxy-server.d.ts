import http from "node:http";
import { parse as parseUrl } from "url";
import { Plebbit } from "../../plebbit/plebbit";
type AddressesRewriterOptions = {
    plebbitOptions: Required<Pick<Plebbit, "ipfsHttpClientsOptions">>;
    port: number;
    hostname: string | undefined;
    proxyTargetUrl: string;
};
export declare class AddressesRewriterProxyServer {
    addresses: Record<string, string>;
    plebbitOptions: AddressesRewriterOptions["plebbitOptions"];
    port: number;
    hostname: string;
    proxyTarget: ReturnType<typeof parseUrl>;
    server: ReturnType<(typeof http)["createServer"]>;
    constructor({ plebbitOptions, port, hostname, proxyTargetUrl }: AddressesRewriterOptions);
    listen(callback?: () => void): void;
    _proxyRequestRewrite(req: Parameters<http.RequestListener>[0], res: Parameters<http.RequestListener>[1]): void;
    _startUpdateAddressesLoop(): void;
}
export {};
