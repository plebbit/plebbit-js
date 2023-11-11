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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var optionInputs = [
    {
        option: 'chainTicker',
        label: 'chainTicker',
        default: 'eth',
        description: 'The chain ticker',
        placeholder: 'eth',
        required: true
    },
    {
        option: 'address',
        label: 'Address',
        default: '',
        description: 'The contract address.',
        placeholder: '0x...',
        required: true
    },
    {
        option: 'abi',
        label: 'ABI',
        default: '',
        description: 'The ABI of the contract method.',
        placeholder: '{"constant":true,"inputs":[{"internalType":"address","name":"account...',
        required: true
    },
    {
        option: 'condition',
        label: 'Condition',
        default: '',
        description: 'The condition the contract call response must pass.',
        placeholder: '>1000',
        required: true
    },
    {
        option: 'error',
        label: 'Error',
        default: "Contract call response doesn't pass condition.",
        description: 'The error to display to the author.'
    },
];
var description = 'The response from an EVM contract call passes a condition, e.g. a token balance challenge.';
var verifyAuthorAddress = function (publication, chainTicker) {
    var _a, _b, _c, _d;
    var authorAddress = (_b = (_a = publication.author.wallets) === null || _a === void 0 ? void 0 : _a[chainTicker]) === null || _b === void 0 ? void 0 : _b.address;
    var wallet = (_c = publication.author.wallets) === null || _c === void 0 ? void 0 : _c[chainTicker];
    var nftAvatar = (_d = publication.author) === null || _d === void 0 ? void 0 : _d.avatar;
    if (authorAddress.endsWith('.eth')) {
        // resolve plebbit-author-address and check if it matches publication.signature.publicKey
        // return true
    }
    if (nftAvatar === null || nftAvatar === void 0 ? void 0 : nftAvatar.signature) {
        // validate if nftAvatar.signature matches authorAddress
        // validate if nftAvatar.signature matches author.wallets[chainTicker].address
        // return true
    }
    if (wallet === null || wallet === void 0 ? void 0 : wallet.signature) {
        // validate if wallet.signature matches JSON {domainSeparator:"plebbit-author-wallet",authorAddress:"${authorAddress},{timestamp:${wallet.timestamp}"}
        // cache the timestamp and validate that no one has used a more recently timestamp with the same wallet.address in the cache
        return true;
    }
    return false;
};
var getContractCallResponse = function (_a, authorAddress) {
    var chainTicker = _a.chainTicker, address = _a.address, abi = _a.abi;
    // mock getting the response from the contract call using the contract address and contract method abi, and the author address as argument
    return 10000;
};
var conditionHasUnsafeCharacters = function (condition) {
    // condition should only allow true, false, and characters 0-9, <, >, =
    var unsafeCharacters = condition.replace(/true|false|[0-9<>=]/g, '');
    return unsafeCharacters !== '';
};
var getChallenge = function (subplebbitChallengeSettings, challengeRequestMessage, challengeIndex) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, chainTicker, address, abi, condition, error, publication, authorAddress, verification, contractCallResponse, e_1;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _a = (subplebbitChallengeSettings === null || subplebbitChallengeSettings === void 0 ? void 0 : subplebbitChallengeSettings.options) || {}, chainTicker = _a.chainTicker, address = _a.address, abi = _a.abi, condition = _a.condition, error = _a.error;
                if (!chainTicker) {
                    throw Error('missing option chainTicker');
                }
                if (!address) {
                    throw Error('missing option address');
                }
                if (!abi) {
                    throw Error('missing option abi');
                }
                abi = JSON.parse(abi);
                if (!condition) {
                    throw Error('missing option abi');
                }
                publication = challengeRequestMessage.publication;
                authorAddress = (_c = (_b = publication.author.wallets) === null || _b === void 0 ? void 0 : _b[chainTicker]) === null || _c === void 0 ? void 0 : _c.address;
                if (!authorAddress) {
                    return [2 /*return*/, {
                            success: false,
                            error: "Author doesn't have a wallet set."
                        }];
                }
                return [4 /*yield*/, verifyAuthorAddress(publication, chainTicker)];
            case 1:
                verification = _d.sent();
                if (!verification) {
                    return [2 /*return*/, {
                            success: false,
                            error: "Author doesn't signature proof of his wallet address."
                        }];
                }
                _d.label = 2;
            case 2:
                _d.trys.push([2, 4, , 5]);
                return [4 /*yield*/, getContractCallResponse({ chainTicker: chainTicker, address: address, abi: abi }, authorAddress)];
            case 3:
                contractCallResponse = _d.sent();
                return [3 /*break*/, 5];
            case 4:
                e_1 = _d.sent();
                return [2 /*return*/, {
                        success: false,
                        error: "Failed getting contract call response from blockchain."
                    }];
            case 5:
                if (conditionHasUnsafeCharacters(condition)) {
                    throw Error('condition has unsafe characters');
                }
                contractCallResponse = String(contractCallResponse);
                if (conditionHasUnsafeCharacters(contractCallResponse)) {
                    throw Error('contractCallResponse has unsafe characters');
                }
                if (!eval("".concat(contractCallResponse, " ").concat(condition))) {
                    return [2 /*return*/, {
                            success: false,
                            error: error || "Contract call response doesn't pass condition."
                        }];
                }
                return [2 /*return*/, {
                        success: true
                    }];
        }
    });
}); };
function ChallengeFileFactory(subplebbitChallengeSettings) {
    var chainTicker = ((subplebbitChallengeSettings === null || subplebbitChallengeSettings === void 0 ? void 0 : subplebbitChallengeSettings.options) || {}).chainTicker;
    var type = ('chain/' + (chainTicker || '<chainTicker>'));
    return { getChallenge: getChallenge, optionInputs: optionInputs, type: type, description: description };
}
exports.default = ChallengeFileFactory;
//# sourceMappingURL=index.js.map