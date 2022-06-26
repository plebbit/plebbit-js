"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resolver = void 0;
const ethers_1 = require("ethers");
const util_1 = require("./util");
const debugs = (0, util_1.getDebugLevels)("resolver");
class Resolver {
    constructor(options) {
        this.blockchainProviders = Object.assign(Object.assign({}, options["blockchainProviders"]), { avax: {
                url: "https://api.avax.network/ext/bc/C/rpc",
                chainId: 43114
            }, matic: {
                url: "https://polygon-rpc.com",
                chainId: 137
            } });
        this.cachedBlockchainProviders = {};
        this.plebbit = options.plebbit;
    }
    _getBlockchainProvider(chainTicker) {
        if (this.cachedBlockchainProviders[chainTicker])
            return this.cachedBlockchainProviders[chainTicker];
        if (this.blockchainProviders[chainTicker]) {
            this.cachedBlockchainProviders[chainTicker] = new ethers_1.ethers.providers.JsonRpcProvider({ url: this.blockchainProviders[chainTicker].url }, this.blockchainProviders[chainTicker].chainId);
            return this.cachedBlockchainProviders[chainTicker];
        }
        if (chainTicker === "eth") {
            this.cachedBlockchainProviders["eth"] = ethers_1.ethers.getDefaultProvider();
            return this.cachedBlockchainProviders["eth"];
        }
        throw Error(`no blockchain provider settings for chain ticker '${chainTicker}'`);
    }
    _resolveEnsTxtRecord(ensName, txtRecordName) {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedResponse = this.plebbit._memCache.get(ensName + txtRecordName);
            debugs.TRACE(`Attempting to resolve ENS (${ensName}) text record (${txtRecordName}), cached response: ${cachedResponse}`);
            if (cachedResponse) {
                debugs.DEBUG(`ENS (${ensName}) text record (${txtRecordName}) is already cached: ${JSON.stringify(cachedResponse)}`);
                return cachedResponse;
            }
            const blockchainProvider = this._getBlockchainProvider("eth");
            const resolver = yield blockchainProvider.getResolver(ensName);
            const txtRecordResult = yield resolver.getText(txtRecordName);
            debugs.DEBUG(`Resolved text record name (${txtRecordName}) of ENS (${ensName}) to ${txtRecordResult}`);
            if (!txtRecordResult)
                throw new Error(`ENS (${ensName}) has no field for ${txtRecordName}`);
            this.plebbit._memCache.put(ensName + txtRecordName, txtRecordResult, 3.6e6); // Expire ENS cache after an hour
            return txtRecordResult;
        });
    }
    resolveAuthorAddressIfNeeded(authorAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (authorAddress === null || authorAddress === void 0 ? void 0 : authorAddress.endsWith(".eth")) {
                debugs.DEBUG(`Will attempt to resolve plebbit-author-address of ${authorAddress}`);
                return this._resolveEnsTxtRecord(authorAddress, "plebbit-author-address");
            }
            return authorAddress;
        });
    }
    resolveSubplebbitAddressIfNeeded(subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (subplebbitAddress === null || subplebbitAddress === void 0 ? void 0 : subplebbitAddress.endsWith(".eth")) {
                debugs.DEBUG(`Will attempt to resolve subplebbit-address of ${subplebbitAddress}`);
                return this._resolveEnsTxtRecord(subplebbitAddress, "subplebbit-address");
            }
            return subplebbitAddress;
        });
    }
    isDomain(address) {
        if (address === null || address === void 0 ? void 0 : address.endsWith(".eth"))
            return true;
        return false;
    }
}
exports.Resolver = Resolver;
