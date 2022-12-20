import { ethers } from "ethers";
import { Plebbit } from "./plebbit";
import { BlockchainProvider } from "./types";
import assert from "assert";
import isIPFS from "is-ipfs";
import Logger from "@plebbit/plebbit-logger";
import { throwWithErrorCode } from "./util";

export class Resolver {
    blockchainProviders: { [chainTicker: string]: BlockchainProvider };
    private cachedBlockchainProviders: { [chainTicker: string]: ethers.providers.BaseProvider };
    private plebbit: Pick<Plebbit, "_memCache" | "resolveAuthorAddresses">;

    constructor(options: { plebbit: Resolver["plebbit"]; blockchainProviders: { [chainTicker: string]: BlockchainProvider } }) {
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
        const log = Logger("plebbit-js:resolver:_resolveEnsTxtRecord");

        const cachedResponse: string | undefined = this.plebbit._memCache.get(ensName + txtRecordName);
        if (cachedResponse && typeof cachedResponse === "string") return cachedResponse;

        const blockchainProvider = this._getBlockchainProvider("eth");
        const resolver = await blockchainProvider.getResolver(ensName);
        if (!resolver) throwWithErrorCode("ERR_ENS_RESOLVER_NOT_FOUND", `ensName: ${ensName}, blockchainProvider: ${blockchainProvider}`);
        const txtRecordResult = await resolver.getText(txtRecordName);
        if (!txtRecordResult)
            throwWithErrorCode(
                "ERR_ENS_TXT_RECORD_NOT_FOUND",
                `ensName: ${ensName}, txtRecordName: ${txtRecordName}, blockchainProvider: ${blockchainProvider}`
            );

        log.trace(`Resolved text record name (${txtRecordName}) of ENS (${ensName}) to ${txtRecordResult}`);

        this.plebbit._memCache.put(ensName + txtRecordName, txtRecordResult, 3.6e6); // Expire memory ENS cache after an hour

        return txtRecordResult;
    }

    async resolveAuthorAddressIfNeeded(authorAddress: string): Promise<string> {
        assert(typeof authorAddress === "string", "authorAddress needs to be a string to be resolved");
        if (!this.plebbit.resolveAuthorAddresses) return authorAddress;
        if (authorAddress.endsWith(".eth")) {
            const resolvedAuthorAddress = await this._resolveEnsTxtRecord(authorAddress, "plebbit-author-address");
            if (!isIPFS.cid(resolvedAuthorAddress))
                throwWithErrorCode(
                    "ERR_ENS_SUBPLEBBIT_ADDRESS_POINTS_TO_INVALID_CID",
                    `resolver: Author address (${authorAddress}) resolves to an incorrect CID (${resolvedAuthorAddress})`
                );
            return resolvedAuthorAddress;
        } else return authorAddress;
    }

    async resolveSubplebbitAddressIfNeeded(subplebbitAddress: string): Promise<string> {
        assert(typeof subplebbitAddress === "string", "subplebbitAddress needs to be a string to be resolved");
        if (subplebbitAddress.endsWith(".eth")) {
            const resolvedSubplebbitAddress = await this._resolveEnsTxtRecord(subplebbitAddress, "subplebbit-address");
            if (!isIPFS.cid(resolvedSubplebbitAddress))
                throwWithErrorCode(
                    "ERR_ENS_SUBPLEBBIT_ADDRESS_POINTS_TO_INVALID_CID",
                    `resolver: subplebbitAddress (${subplebbitAddress}) resolves to an incorrect CID (${resolvedSubplebbitAddress})`
                );
            return resolvedSubplebbitAddress;
        } else return subplebbitAddress;
    }

    isDomain(address: string): boolean {
        return /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(address);
    }
}
