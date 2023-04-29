import { ethers } from "ethers";
import { Plebbit } from "./plebbit";
import { ChainProvider } from "./types";
import assert from "assert";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
import { throwWithErrorCode, timestamp } from "./util";

export class Resolver {
    private cachedChainProviders: { [chainTicker: string]: ethers.providers.BaseProvider };
    private plebbit: Pick<Plebbit, "resolveAuthorAddresses" | "chainProviders" | "_cache">;

    constructor(plebbit: Resolver["plebbit"]) {
        this.cachedChainProviders = {};
        this.plebbit = plebbit;
    }

    toJSON() {
        return undefined;
    }

    toString() {
        return undefined;
    }

    // cache the chain providers because only 1 should be running at the same time
    _getChainProvider(chainTicker: string) {
        assert(chainTicker && typeof chainTicker === "string", `invalid chainTicker '${chainTicker}'`);
        assert(this.plebbit.chainProviders, `invalid chainProviders '${this.plebbit.chainProviders}'`);
        if (this.cachedChainProviders[chainTicker]) {
            return this.cachedChainProviders[chainTicker];
        }
        if (chainTicker === "eth") {
            // if using eth, use ethers' default provider unless another provider is specified

            if (!this.plebbit.chainProviders["eth"] || this.plebbit.chainProviders["eth"]?.urls?.[0]?.match(/DefaultProvider/i)) {
                this.cachedChainProviders["eth"] = ethers.getDefaultProvider();
                return this.cachedChainProviders["eth"];
            }
        }
        if (this.plebbit.chainProviders[chainTicker]) {
            this.cachedChainProviders[chainTicker] = new ethers.providers.JsonRpcProvider(
                { url: this.plebbit.chainProviders[chainTicker].urls[0] },
                this.plebbit.chainProviders[chainTicker].chainId
            );
            return this.cachedChainProviders[chainTicker];
        }
        throwWithErrorCode("ERR_NO_CHAIN_PROVIDER_FOR_CHAIN_TICKER", { chainTicker, chainProviders: this.plebbit.chainProviders });
    }

    async _resolveEnsTxtRecord(ensName: string, txtRecordName: string): Promise<string> {
        const log = Logger("plebbit-js:resolver:_resolveEnsTxtRecord");

        const chainProvider = this._getChainProvider("eth");
        const resolver = await chainProvider.getResolver(ensName);
        if (!resolver) throwWithErrorCode("ERR_ENS_RESOLVER_NOT_FOUND", { ensName, chainProvider });
        const txtRecordResult = await resolver.getText(txtRecordName);
        if (!txtRecordResult) throwWithErrorCode("ERR_ENS_TXT_RECORD_NOT_FOUND", { ensName, txtRecordName, chainProvider });

        log.trace(`Resolved text record name (${txtRecordName}) of ENS (${ensName}) to ${txtRecordResult}`);

        this.plebbit._cache.setItem(`${ensName}_${txtRecordName}`, txtRecordResult);
        this.plebbit._cache.setItem(`${ensName}_${txtRecordName}_timestamp`, timestamp());

        return txtRecordResult;
    }

    isDomain(address: string): boolean {
        return /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(address);
    }
}
