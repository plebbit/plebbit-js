import { ethers } from "ethers";
import { Plebbit } from "./plebbit";
import { BlockchainProvider } from "./types";
import { getDebugLevels } from "./util";
const debugs = getDebugLevels("resolver");

export class Resolver {
    blockchainProviders: { [chainTicker: string]: BlockchainProvider };
    private cachedBlockchainProviders: { [chainTicker: string]: ethers.providers.BaseProvider };
    private plebbit: Plebbit;

    constructor(options: { plebbit: Plebbit; blockchainProviders: { [chainTicker: string]: BlockchainProvider } }) {
        this.blockchainProviders = options.blockchainProviders;
        this.cachedBlockchainProviders = {};
        this.plebbit = options.plebbit;
    }

    toJSON() {
        return { blockchainProviders: this.blockchainProviders };
    }

    _getBlockchainProvider(chainTicker: string): ethers.providers.BaseProvider {
        if (this.cachedBlockchainProviders[chainTicker]) return this.cachedBlockchainProviders[chainTicker];

        if (this.blockchainProviders[chainTicker]) {
            this.cachedBlockchainProviders[chainTicker] = new ethers.providers.JsonRpcProvider(
                { url: this.blockchainProviders[chainTicker].url },
                this.blockchainProviders[chainTicker].chainId
            );
            return this.cachedBlockchainProviders[chainTicker];
        }
        if (chainTicker === "eth") {
            this.cachedBlockchainProviders["eth"] = ethers.getDefaultProvider();
            return this.cachedBlockchainProviders["eth"];
        }
        throw Error(`no blockchain provider settings for chain ticker '${chainTicker}'`);
    }

    async _resolveEnsTxtRecord(ensName: string, txtRecordName: string): Promise<string> {
        const cachedResponse = this.plebbit._memCache.get(ensName + txtRecordName);
        debugs.TRACE(`Attempting to resolve ENS (${ensName}) text record (${txtRecordName}), cached response: ${cachedResponse}`);
        if (cachedResponse) {
            debugs.DEBUG(`ENS (${ensName}) text record (${txtRecordName}) is already cached: ${JSON.stringify(cachedResponse)}`);
            return cachedResponse;
        }
        const blockchainProvider = this._getBlockchainProvider("eth");
        const resolver = await blockchainProvider.getResolver(ensName);
        const txtRecordResult = await resolver.getText(txtRecordName);
        debugs.DEBUG(`Resolved text record name (${txtRecordName}) of ENS (${ensName}) to ${txtRecordResult}`);
        if (!txtRecordResult) throw new Error(`ENS (${ensName}) has no field for ${txtRecordName}`);

        this.plebbit._memCache.put(ensName + txtRecordName, txtRecordResult, 3.6e6); // Expire ENS cache after an hour

        return txtRecordResult;
    }

    async resolveAuthorAddressIfNeeded(authorAddress: string): Promise<string> {
        if (!this.plebbit.resolveAuthorAddresses) return authorAddress;
        if (authorAddress?.endsWith(".eth")) {
            debugs.DEBUG(`Will attempt to resolve plebbit-author-address of ${authorAddress}`);
            return this._resolveEnsTxtRecord(authorAddress, "plebbit-author-address");
        }
        return authorAddress;
    }

    async resolveSubplebbitAddressIfNeeded(subplebbitAddress: string): Promise<string> {
        if (subplebbitAddress?.endsWith(".eth")) {
            debugs.DEBUG(`Will attempt to resolve subplebbit-address of ${subplebbitAddress}`);
            return this._resolveEnsTxtRecord(subplebbitAddress, "subplebbit-address");
        }
        return subplebbitAddress;
    }

    isDomain(address: string): boolean {
        if (address?.endsWith(".eth")) return true;
        return false;
    }
}
