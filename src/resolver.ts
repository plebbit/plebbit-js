import { ethers } from "ethers";
import { Plebbit } from "./plebbit";
import { BlockchainProvider } from "./types";
import { getDebugLevels } from "./util";
const debugs = getDebugLevels("resolver");
import assert from "assert";
import errcode from "err-code";
import { codes, messages } from "./errors";
import isIPFS from "is-ipfs";

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

    // cache the blockchain providers because only 1 should be running at the same time
    _getBlockchainProvider(chainTicker: string) {
        assert(chainTicker && typeof chainTicker === "string", `invalid chainTicker '${chainTicker}'`);
        assert(this.blockchainProviders, `invalid blockchainProviders '${this.blockchainProviders}'`);
        if (this.cachedBlockchainProviders[chainTicker]) {
            return this.cachedBlockchainProviders[chainTicker];
        }
        if (chainTicker === "eth") {
            // if using eth, use ethers' default provider unless another provider is specified
            if (!this.blockchainProviders["eth"] || this.blockchainProviders["eth"]?.url?.match(/DefaultProvider/i)) {
                this.cachedBlockchainProviders["eth"] = ethers.getDefaultProvider();
                return this.cachedBlockchainProviders["eth"];
            }
        }
        if (this.blockchainProviders[chainTicker]) {
            this.cachedBlockchainProviders[chainTicker] = new ethers.providers.JsonRpcProvider(
                { url: this.blockchainProviders[chainTicker].url },
                this.blockchainProviders[chainTicker].chainId
            );
            return this.cachedBlockchainProviders[chainTicker];
        }
        throw Error(`no blockchain provider options set for chain ticker '${chainTicker}'`);
    }

    async _resolveEnsTxtRecord(ensName: string, txtRecordName: string): Promise<string> {
        const cachedResponse = this.plebbit._memCache.get(ensName + txtRecordName);
        debugs.TRACE(`Attempting to resolve ENS (${ensName}) text record (${txtRecordName}), cached response: ${cachedResponse}`);
        if (cachedResponse && typeof cachedResponse === "string") {
            debugs.DEBUG(`ENS (${ensName}) text record (${txtRecordName}) is already cached: ${JSON.stringify(cachedResponse)}`);
            return cachedResponse;
        }
        const blockchainProvider = this._getBlockchainProvider("eth");
        const resolver = await blockchainProvider.getResolver(ensName);
        if (!resolver)
            throw errcode(new Error(messages.ERR_ENS_RESOLVER_NOT_FOUND), codes.ERR_ENS_RESOLVER_NOT_FOUND, {
                details: `ensName: ${ensName}, blockchainProvider: ${JSON.stringify(blockchainProvider)} `
            });
        const txtRecordResult = await resolver.getText(txtRecordName);
        if (!txtRecordResult)
            throw errcode(new Error(messages.ERR_ENS_TXT_RECORD_NOT_FOUND), codes.ERR_ENS_TXT_RECORD_NOT_FOUND, {
                details: `ensName: ${ensName}, txtRecordName: ${txtRecordName}, blockchainProvider: ${JSON.stringify(blockchainProvider)},`
            });

        debugs.DEBUG(`Resolved text record name (${txtRecordName}) of ENS (${ensName}) to ${txtRecordResult}`);

        this.plebbit._memCache.put(ensName + txtRecordName, txtRecordResult, 3.6e6); // Expire memory ENS cache after an hour

        return txtRecordResult;
    }

    async resolveAuthorAddressIfNeeded(authorAddress: string): Promise<string> {
        if (!this.plebbit.resolveAuthorAddresses) return authorAddress;
        if (authorAddress?.endsWith(".eth")) {
            debugs.DEBUG(`Will attempt to resolve plebbit-author-address of ${authorAddress}`);
            const resolvedAuthorAddress = await this._resolveEnsTxtRecord(authorAddress, "plebbit-author-address");
            if (!isIPFS.cid(resolvedAuthorAddress))
                throw errcode(
                    Error(messages.ERR_ENS_SUBPLEBBIT_ADDRESS_POINTS_TO_INVALID_CID),
                    codes.ERR_ENS_SUBPLEBBIT_ADDRESS_POINTS_TO_INVALID_CID,
                    {
                        details: `resolver: Author address (${authorAddress}) resolves to an incorrect CID (${resolvedAuthorAddress})`
                    }
                );
            return resolvedAuthorAddress;
        } else return authorAddress;
    }

    async resolveSubplebbitAddressIfNeeded(subplebbitAddress: string): Promise<string> {
        if (subplebbitAddress?.endsWith(".eth")) {
            debugs.DEBUG(`Will attempt to resolve subplebbit-address of ${subplebbitAddress}`);
            const resolvedSubplebbitAddress = await this._resolveEnsTxtRecord(subplebbitAddress, "subplebbit-address");
            if (!isIPFS.cid(resolvedSubplebbitAddress))
                throw errcode(
                    Error(messages.ERR_ENS_SUBPLEBBIT_ADDRESS_POINTS_TO_INVALID_CID),
                    codes.ERR_ENS_SUBPLEBBIT_ADDRESS_POINTS_TO_INVALID_CID,
                    {
                        details: `resolver: subplebbitAddress (${subplebbitAddress}) resolves to an incorrect CID (${resolvedSubplebbitAddress})`
                    }
                );
            return resolvedSubplebbitAddress;
        } else return subplebbitAddress;
    }

    isDomain(address: string): boolean {
        if (address?.endsWith(".eth")) return true;
        return false;
    }
}
