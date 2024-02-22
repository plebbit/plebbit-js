import { Plebbit } from "./plebbit.js";
import { Chain } from "./types.js";
import assert from "assert";
import Logger from "@plebbit/plebbit-logger";
import { PublicClient, createPublicClient, http } from "viem";
import * as chains from "viem/chains";
import { ethers } from "ethers";
import { Connection as SolanaConnection, clusterApiUrl } from "@solana/web3.js";
import { getRecord,  } from "@bonfida/spl-name-service";
import * as lib from "@ensdomains/eth-ens-namehash"; // ESM

const viemCache: Record<string, PublicClient> = {
    viem: createPublicClient({
        chain: chains.mainnet,
        transport: http()
    })
};

const ethersPublicClient = ethers.getDefaultProvider("mainnet");

// Should be rename to domain resolver
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

    // cache the chain providers because only 1 should be running at the same time
    _getChainProvider(chainTicker: Chain, chainProviderUrl: string): PublicClient {
        assert(chainTicker && typeof chainTicker === "string", `invalid chainTicker '${chainTicker}'`);
        assert(this.plebbit.chainProviders, `invalid chainProviders '${this.plebbit.chainProviders}'`);
        assert(this.plebbit.chainProviders[chainTicker].urls.includes(chainProviderUrl));

        if (chainTicker === "eth" && chainProviderUrl === "viem") {
            // if using eth, use viem' default provider unless another provider is specified
            return viemCache["viem"];
        } else if (chainTicker === "sol") {
            const connection = new SolanaConnection(clusterApiUrl("mainnet-beta"));
            // const res = await resolve(connection, "bonfida");
        } else {
            // Cache viem public client here
            const chainId = this.plebbit.chainProviders[chainTicker].chainId;
            const chain = Object.values(chains).find((chain) => chain.id === chainId);
            assert(chain, `Was not able to find a chain with id ${chainId}`);
            const key = chainProviderUrl + chainId;
            if (!viemCache[key])
                viemCache[key] = createPublicClient({
                    chain,
                    transport: http(chainProviderUrl)
                });
            return viemCache[key];
        }
    }

    async _resolveViaSolana(address:string, txtRecordName: string, chainProviderUrl: string){
        const connection = new SolanaConnection(clusterApiUrl("mainnet-beta"));
        // connection.rpcEndpoint
        // const res = await getRecord(connection, address, txtRecordName);
        

    }

    async _resolveViaEthers(chainTicker: Chain, address: string, txtRecordName: string) {
        assert(chainTicker && typeof chainTicker === "string", `invalid chainTicker '${chainTicker}'`);
        assert(this.plebbit.chainProviders, `invalid chainProviders '${this.plebbit.chainProviders}'`);
        assert(this.plebbit.chainProviders[chainTicker].urls.includes("ethers.js"));

        const resolver = await ethersPublicClient.getResolver(address);
        return resolver.getText(txtRecordName);
    }

    async resolveTxtRecord(address: string, txtRecordName: string, chain: Chain, chainProviderUrl: string): Promise<string | null> {
        const log = Logger("plebbit-js:resolver:_resolveEnsTxtRecord");

        log.trace(`Attempting to resolve text record (${txtRecordName}) of address (${address}) with chain provider (${chainProviderUrl})`);
        let txtRecordResult: string | null;
        if (chainProviderUrl === "ethers.js" && chain === "eth")
            txtRecordResult = await this._resolveViaEthers(chain, address, txtRecordName);
        else if (chain === "eth") {
            // Using viem or custom RPC
            const chainProvider = this._getChainProvider(chain, chainProviderUrl);
            txtRecordResult = await chainProvider.getEnsText({ name: lib.normalize(address), key: txtRecordName });
        } else throw Error(`Failed to resolve address (${address}) text record (${txtRecordName}) on chain ${chain}`);

        log(
            `Resolved text record name (${txtRecordName}) of address (${address}) to ${txtRecordResult} with chainProvider (${chainProviderUrl})`
        );

        return txtRecordResult;
    }

    isDomain(address: string): boolean {
        return /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(address);
    }
}
