import Logger from "@plebbit/plebbit-logger";
import { createPublicClient as createViemClient, http as httpViemTransport, webSocket as webSocketViemTransport } from "viem";
import * as chains from "viem/chains";
import { ethers } from "ethers";
import { Connection as SolanaConnection, clusterApiUrl } from "@solana/web3.js";
import { NameRegistryState, getDomainKeySync } from "@bonfida/spl-name-service";
import { normalize as normalizeEnsAddress } from "viem/ens";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { hideClassPrivateProps } from "./util.js";
export class DomainResolver {
    constructor(plebbit) {
        this._viemClients = {};
        this._solanaConnections = {};
        this._ethersClients = {};
        this._plebbit = plebbit;
        hideClassPrivateProps(this);
    }
    async destroy() {
        await Promise.all(Object.values(this._viemClients).map(async (viemClient) => {
            const transport = viemClient.transport;
            if (transport?.type === "webSocket") {
                // it's a websocket
                const rpcClient = await transport.getRpcClient();
                rpcClient.close();
            }
        }));
        Object.values(this._ethersClients).map((etherClient) => etherClient.destroy());
        this._ethersClients = {};
        this._solanaConnections = {};
        this._viemClients = {};
    }
    _createViemClientIfNeeded(chainTicker, chainProviderUrl) {
        const cacheKey = chainTicker + chainProviderUrl;
        if (this._viemClients[cacheKey])
            return this._viemClients[cacheKey];
        const log = Logger("plebbit-js:domain-resolver:_createViemClientIfNeeded");
        if (chainTicker === "eth" && chainProviderUrl === "viem") {
            this._viemClients[cacheKey] = createViemClient({
                chain: chains.mainnet,
                transport: httpViemTransport()
            });
            log(`Created a new viem client at chain ${chainTicker} with chain provider url ${chainProviderUrl}`);
        }
        else {
            // TODO should use viem's extractChain here
            const chainId = this._plebbit.chainProviders[chainTicker]?.chainId;
            const chain = Object.values(chains).find((chain) => chain.id === chainId);
            if (!chain)
                throw Error(`Was not able to create viem client for ${chainTicker} due to not being able to find chain id`);
            const parsedProviderUrl = new URL(chainProviderUrl);
            const transport = parsedProviderUrl.protocol.startsWith("ws")
                ? webSocketViemTransport(chainProviderUrl)
                : parsedProviderUrl.protocol.startsWith("http")
                    ? httpViemTransport(chainProviderUrl)
                    : undefined;
            if (!transport)
                throw Error("Failed to parse chain provider url to its proper viem transport " + chainProviderUrl);
            const chainClient = createViemClient({
                chain,
                transport
            });
            //@ts-expect-error
            this._viemClients[cacheKey] = chainClient;
            log(`Created a new viem client at chain ${chainTicker} with chain provider url ${chainProviderUrl}`);
        }
        return this._viemClients[cacheKey];
    }
    async _resolveViaViem(chainTicker, address, txtRecordName, chainProviderUrl) {
        const viemClient = this._createViemClientIfNeeded(chainTicker, chainProviderUrl);
        const txtRecordResult = await viemClient.getEnsText({ name: normalizeEnsAddress(address), key: txtRecordName });
        return txtRecordResult || null;
    }
    async _resolveViaSolana(address, txtRecordName, chainProviderUrl) {
        const log = Logger("plebbit-js:resolver:_resolveViaSolana");
        if (!this._solanaConnections[chainProviderUrl]) {
            const endPoint = chainProviderUrl === "web3.js" ? clusterApiUrl("mainnet-beta") : chainProviderUrl;
            log("Creating a new connection instance for Solana at", endPoint);
            this._solanaConnections[chainProviderUrl] = new SolanaConnection(endPoint);
        }
        const connection = this._solanaConnections[chainProviderUrl];
        const addressWithSubdomain = `${txtRecordName}.${address}`;
        const res = getDomainKeySync(addressWithSubdomain);
        if (!res?.pubkey)
            return null;
        try {
            const registryState = await NameRegistryState.retrieve(connection, res.pubkey);
            const recordValue = uint8ArrayToString(registryState.registry.data);
            return recordValue;
        }
        catch (e) {
            e.details = { ...e.details, address, txtRecordName, chainProviderUrl, addressWithSubdomain };
            if (e?.type !== "AccountDoesNotExist") {
                log.error(`Failed to resolve solana address (${address}) text-record (${txtRecordName}) with chainProviderUrl (${chainProviderUrl})`, e);
                throw e;
            }
        }
        return null;
    }
    async _resolveViaEthers(chainTicker, address, txtRecordName) {
        const log = Logger("plebbit-js:resolver:_resolveViaEthers");
        const clientKey = "ethers.js";
        if (!this._ethersClients[clientKey]) {
            this._ethersClients[clientKey] = ethers.getDefaultProvider("mainnet");
            log("Created a new connection instance for ethers", clientKey);
        }
        const ethersClient = this._ethersClients[clientKey];
        const resolver = await ethersClient.getResolver(address);
        if (!resolver)
            throw Error("ethersClient.getResolver returned null");
        return resolver.getText(txtRecordName);
    }
    async resolveTxtRecord(address, txtRecordName, chain, chainProviderUrl, chainId) {
        const log = Logger("plebbit-js:domain-resolver:resolveTxtRecord");
        // we only support resolving text records on ETH and Solana for now
        log.trace(`Attempting to resolve text record (${txtRecordName}) of address (${address}) with chain provider (${chainProviderUrl})`);
        let txtRecordResult;
        if (chainProviderUrl === "ethers.js" && chain === "eth")
            txtRecordResult = await this._resolveViaEthers(chain, address, txtRecordName);
        else if (chain === "eth") {
            // Using viem or custom RPC
            if (typeof chainId !== "number")
                throw Error("Can't resolve via viem without chain id");
            txtRecordResult = await this._resolveViaViem(chain, address, txtRecordName, chainProviderUrl);
        }
        else if (chain === "sol") {
            txtRecordResult = await this._resolveViaSolana(address, txtRecordName, chainProviderUrl);
        }
        else
            throw Error(`plebbit-js doesn't support resolving text records on chain ${chain}`);
        // Should add a check if result is IPNS address
        log(`Resolved text record name (${txtRecordName}) of address (${address}) to ${txtRecordResult} with chainProvider (${chainProviderUrl})`);
        return txtRecordResult;
    }
}
//# sourceMappingURL=domain-resolver.js.map