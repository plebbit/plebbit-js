import { ethers } from "ethers";
import { getDebugLevels } from "./util";
const debugs = getDebugLevels("subplebbit");

export class Resolver {
    blockchainProviders: Object;
    cachedBlockchainProviders: Object;

    constructor(blockchainProviders: Object) {
        this.blockchainProviders = {
            ...blockchainProviders,
            avax: {
                url: "https://api.avax.network/ext/bc/C/rpc",
                chainId: 43114
            },
            matic: {
                url: "https://polygon-rpc.com",
                chainId: 137
            }
        };
        this.cachedBlockchainProviders = {};
    }

    _getBlockchainProvider(chainTicker: string) {
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

    async _resolveEnsTxtRecord(ensName: string, txtRecordName: string) {
        const blockchainProvider = this._getBlockchainProvider("eth");
        const resolver = await blockchainProvider.getResolver(ensName);
        const txtRecordResult = await resolver.getText(txtRecordName);
        debugs.DEBUG(`Resolved text record name (${txtRecordName}) of ENS (${ensName}) to ${txtRecordResult}`);
        if (!txtRecordResult) throw new Error(`ENS (${ensName}) has no field for ${txtRecordName}`);
        return txtRecordResult;
    }

    async resolveAuthorAddressIfNeeded(authorAddress: string): Promise<String> {
        if (authorAddress.endsWith(".eth")) {
            return this._resolveEnsTxtRecord(authorAddress, "plebbit-author-address");
        }
        return authorAddress;
    }

    async resolveSubplebbitAddressIfNeeded(subplebbitAddress: string): Promise<String> {
        if (subplebbitAddress.endsWith(".eth")) {
            return this._resolveEnsTxtRecord(subplebbitAddress, "subplebbit-address");
        }
        return subplebbitAddress;
    }
}
