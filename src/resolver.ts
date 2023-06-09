import { ethers } from "ethers";
import { Plebbit } from "./plebbit";
import { Chain } from "./types";
import assert from "assert";
import Logger from "@plebbit/plebbit-logger";
import { throwWithErrorCode } from "./util";

export class Resolver {
    private plebbit: Pick<Plebbit, "resolveAuthorAddresses" | "chainProviders" | "_cache">;

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

        if (chainTicker === "eth" && chainProviderUrl === "ethers.js") {
            // if using eth, use ethers' default provider unless another provider is specified

            return ethers.getDefaultProvider();
        } else return new ethers.providers.JsonRpcProvider({ url: chainProviderUrl }, this.plebbit.chainProviders[chainTicker].chainId);
    }

    async resolveTxtRecord(address: string, txtRecordName: string, chain: Chain, chainProviderUrl: string): Promise<string | null> {
        const log = Logger("plebbit-js:resolver:_resolveEnsTxtRecord");

        const chainProvider = this._getChainProvider(chain, chainProviderUrl);
        const resolver = await chainProvider.getResolver(address);
        if (!resolver) throwWithErrorCode("ERR_ENS_RESOLVER_NOT_FOUND", { address, chainProvider, chain });
        const txtRecordResult = await resolver.getText(txtRecordName);
        if (!txtRecordResult) return null;

        log(
            `Resolved text record name (${txtRecordName}) of address (${address}) to ${txtRecordResult} with chainProvider (${chainProviderUrl})`
        );

        return txtRecordResult;
    }

    isDomain(address: string): boolean {
        return /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(address);
    }
}
