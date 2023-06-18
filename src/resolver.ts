import { Plebbit } from "./plebbit";
import { Chain } from "./types";
import assert from "assert";
import Logger from "@plebbit/plebbit-logger";
import { createPublicClient, http } from "viem";
import * as chains from "viem/chains";
import { ethers } from "ethers";

export const viemPublicClient = createPublicClient({
    chain: chains.mainnet,
    transport: http()
});
//@ts-expect-error
export const ethersPublicClient = ethers.getDefaultProvider();

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
    _getChainProvider(chainTicker: Chain, chainProviderUrl: string) {
        assert(chainTicker && typeof chainTicker === "string", `invalid chainTicker '${chainTicker}'`);
        assert(this.plebbit.chainProviders, `invalid chainProviders '${this.plebbit.chainProviders}'`);
        assert(this.plebbit.chainProviders[chainTicker].urls.includes(chainProviderUrl));

        if (chainTicker === "eth" && chainProviderUrl === "viem") {
            // if using eth, use viem' default provider unless another provider is specified
            return viemPublicClient;
        } else {
            const chainId = this.plebbit.chainProviders[chainTicker].chainId;
            const chain = Object.values(chains).find((chain) => chain.id === chainId);
            return createPublicClient({
                chain: chain,
                transport: http(chainProviderUrl)
            });
        }
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

        let txtRecordResult: string | null;
        if (chainProviderUrl === "ethers.js" && chain === "eth")
            txtRecordResult = await this._resolveViaEthers(chain, address, txtRecordName);
        else {
            // Using viem or custom RPC
            const chainProvider = this._getChainProvider(chain, chainProviderUrl);
            txtRecordResult = await chainProvider.getEnsText({ name: ethers.ensNormalize(address), key: txtRecordName });
        }

        log(
            `Resolved text record name (${txtRecordName}) of address (${address}) to ${txtRecordResult} with chainProvider (${chainProviderUrl})`
        );

        return txtRecordResult;
    }

    isDomain(address: string): boolean {
        return /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(address);
    }
}
