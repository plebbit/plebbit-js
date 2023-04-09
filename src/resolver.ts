import { ethers } from "ethers";
import { Plebbit } from "./plebbit";
import { ChainProvider } from "./types";
import assert from "assert";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
import { throwWithErrorCode } from "./util";

export class Resolver {
    private cachedChainProviders: { [chainTicker: string]: ethers.providers.BaseProvider };
    private plebbit: Pick<Plebbit, "_memCache" | "resolveAuthorAddresses" | "emit" | "chainProviders">;

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
            if (!this.plebbit.chainProviders["eth"] || this.plebbit.chainProviders["eth"]?.[0]?.url?.match(/DefaultProvider/i)) {
                this.cachedChainProviders["eth"] = ethers.getDefaultProvider();
                return this.cachedChainProviders["eth"];
            }
        }
        if (this.plebbit.chainProviders[chainTicker]) {
            this.cachedChainProviders[chainTicker] = new ethers.providers.JsonRpcProvider(
                { url: this.plebbit.chainProviders[chainTicker][0].url },
                this.plebbit.chainProviders[chainTicker].chainId
            );
            return this.cachedChainProviders[chainTicker];
        }
        throwWithErrorCode("ERR_NO_CHAIN_PROVIDER_FOR_CHAIN_TICKER", { chainTicker, chainProviders: this.plebbit.chainProviders });
    }

    async _resolveEnsTxtRecord(ensName: string, txtRecordName: string): Promise<string> {
        const log = Logger("plebbit-js:resolver:_resolveEnsTxtRecord");

        const cachedResponse: string | undefined = this.plebbit._memCache.get(ensName + txtRecordName);
        if (cachedResponse && typeof cachedResponse === "string") return cachedResponse;

        const chainProvider = this._getChainProvider("eth");
        const resolver = await chainProvider.getResolver(ensName);
        if (!resolver) throwWithErrorCode("ERR_ENS_RESOLVER_NOT_FOUND", { ensName, chainProvider });
        const txtRecordResult = await resolver.getText(txtRecordName);
        if (!txtRecordResult) throwWithErrorCode("ERR_ENS_TXT_RECORD_NOT_FOUND", { ensName, txtRecordName, chainProvider });

        log.trace(`Resolved text record name (${txtRecordName}) of ENS (${ensName}) to ${txtRecordResult}`);

        this.plebbit._memCache.put(ensName + txtRecordName, txtRecordResult, 3.6e6); // Expire memory ENS cache after an hour

        return txtRecordResult;
    }

    async resolveAuthorAddressIfNeeded(authorAddress: string): Promise<string> {
        assert(typeof authorAddress === "string", "authorAddress needs to be a string to be resolved");
        if (!this.plebbit.resolveAuthorAddresses) return authorAddress;
        let resolved = lodash.clone(authorAddress);
        if (authorAddress.endsWith(".eth")) resolved = await this._resolveEnsTxtRecord(authorAddress, "plebbit-author-address");

        this.plebbit.emit("resolvedauthoraddress", authorAddress, resolved);
        return resolved;
    }

    async resolveSubplebbitAddressIfNeeded(subplebbitAddress: string): Promise<string> {
        assert(typeof subplebbitAddress === "string", "subplebbitAddress needs to be a string to be resolved");
        let resolvedSubplebbitAddress: string = lodash.clone(subplebbitAddress);
        if (subplebbitAddress.endsWith(".eth"))
            resolvedSubplebbitAddress = await this._resolveEnsTxtRecord(subplebbitAddress, "subplebbit-address");

        this.plebbit.emit("resolvedsubplebbitaddress", subplebbitAddress, resolvedSubplebbitAddress);
        return resolvedSubplebbitAddress;
    }

    isDomain(address: string): boolean {
        return /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(address);
    }
}
