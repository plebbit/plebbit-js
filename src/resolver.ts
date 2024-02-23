import { Plebbit } from "./plebbit.js";
import { Chain } from "./types.js";
import assert from "assert";
import Logger from "@plebbit/plebbit-logger";
import { PublicClient as ViemPublicClient, createPublicClient, http } from "viem";
import * as chains from "viem/chains";
import { ethers } from "ethers";
import { Connection as SolanaConnection, clusterApiUrl } from "@solana/web3.js";
import { NameRegistryState, getDomainKeySync } from "@bonfida/spl-name-service";
import * as lib from "@ensdomains/eth-ens-namehash"; // ESM
import { toString as uint8ArrayToString } from "uint8arrays/to-string";


const viemClients: Record<string, ViemPublicClient> = {};

const solanaConnections: Record<string, SolanaConnection> = {};

const ethersClients: Record<string, ReturnType<typeof ethers.getDefaultProvider>> = {};


// TODO Should be rename to domain resolver
export class Resolver {
    private plebbit: Pick<Plebbit, "resolveAuthorAddresses" | "chainProviders">;

    constructor(plebbit: Resolver["plebbit"]) {
        this.plebbit = plebbit;
    }

    toJSON() {
        return undefined;
    }

    toString() {
        return undefined;
    }

    async _resolveViaViem(chainTicker: Chain, address: string, txtRecordName: string, chainProviderUrl: string): Promise<string | null> {
        const log = Logger("plebbit-js:resolver:_resolveViaViem");
        let clientKey: string;
        if (!viemClients[chainProviderUrl]) {
            if (chainProviderUrl === "viem" && chainTicker === "eth") {
                clientKey = "viem";
                viemClients[clientKey] = createPublicClient({
                    chain: chains.mainnet,
                    transport: http()
                });
            } else {
                const chainId = this.plebbit.chainProviders[chainTicker].chainId;
                const chain = Object.values(chains).find((chain) => chain.id === chainId);
                assert(chain, `Was not able to find a chain with id ${chainId}`);
                clientKey = chainProviderUrl + chainId;
                if (!viemClients[clientKey])
                    viemClients[clientKey] = createPublicClient({
                        chain,
                        transport: http(chainProviderUrl)
                    });
            }

            log(`Created a new viem client at`, clientKey);
        }

        const chainProvider = viemClients[clientKey];

        const txtRecordResult = await chainProvider.getEnsText({ name: lib.normalize(address), key: txtRecordName });
        return txtRecordResult || null;
    }

    async _resolveViaSolana(address: string, txtRecordName: string, chainProviderUrl: string) {
        const log = Logger("plebbit-js:resolver:_resolveViaSolana");
        if (!solanaConnections[chainProviderUrl]) {
            const endPoint = chainProviderUrl === "@solana/web3.js" ? clusterApiUrl("mainnet-beta") : chainProviderUrl;
            log("Creating a new connection instance for Solana at", endPoint);
            solanaConnections[chainProviderUrl] = new SolanaConnection(endPoint);
        }

        const connection = solanaConnections[chainProviderUrl];
        const addressWithSubdomain = `${txtRecordName}.${address}`;
        const res = getDomainKeySync(addressWithSubdomain);
        if (!res?.pubkey) return null;
        try {
            const registryState = await NameRegistryState.retrieve(connection, res.pubkey);
            const recordValue = uint8ArrayToString(registryState.registry.data);
            return recordValue;
        }
        catch(e){
            if (e?.type !== "AccountDoesNotExist") throw e;
        }

        return null;
    }

    async _resolveViaEthers(chainTicker: Chain, address: string, txtRecordName: string) {
        assert(chainTicker && typeof chainTicker === "string", `invalid chainTicker '${chainTicker}'`);
        assert(this.plebbit.chainProviders, `invalid chainProviders '${this.plebbit.chainProviders}'`);
        assert(this.plebbit.chainProviders[chainTicker].urls.includes("ethers.js"));
        const log = Logger("plebbit-js:resolver:_resolveViaEthers");

        const clientKey = "ethers.js";
        if (!ethersClients[clientKey]){
            ethersClients[clientKey]= ethers.getDefaultProvider("mainnet");
            log("Created a new connection instance for ethers", clientKey);
        } 

        const ethersClient = ethersClients[clientKey];


        const resolver = await ethersClient.getResolver(address);
        return resolver.getText(txtRecordName);
    }

    async resolveTxtRecord(address: string, txtRecordName: string, chain: Chain, chainProviderUrl: string): Promise<string | null> {
        const log = Logger("plebbit-js:resolver:resolveTxtRecord");

        log.trace(`Attempting to resolve text record (${txtRecordName}) of address (${address}) with chain provider (${chainProviderUrl})`);
        let txtRecordResult: string | null;
        if (chainProviderUrl === "ethers.js" && chain === "eth")
            txtRecordResult = await this._resolveViaEthers(chain, address, txtRecordName);
        else if (chain === "eth") {
            // Using viem or custom RPC
            txtRecordResult = await this._resolveViaViem(chain, address, txtRecordName, chainProviderUrl);
        } else if (chain === "sol") {
            txtRecordResult = await this._resolveViaSolana(address, txtRecordName, chainProviderUrl);
        } else throw Error(`Failed to resolve address (${address}) text record (${txtRecordName}) on chain ${chain}`);

        // Should add a check if result is IPNS address
        log(
            `Resolved text record name (${txtRecordName}) of address (${address}) to ${txtRecordResult} with chainProvider (${chainProviderUrl})`
        );

        return txtRecordResult;
    }

    isDomain(address: string): boolean {
        return /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(address);
    }
}
