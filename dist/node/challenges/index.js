"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
        while (_) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubplebbitChallengeFromSubplebbitChallengeSettings = exports.getChallengeVerification = exports.getChallengeVerificationFromChallengeAnswers = exports.getPendingChallengesOrChallengeVerification = exports.plebbitJsChallenges = void 0;
var exclude_1 = require("./exclude");
// all challenges included with plebbit-js, in Plebbit.challenges
var text_math_1 = __importDefault(require("./plebbit-js-challenges/text-math"));
var captcha_canvas_v3_1 = __importDefault(require("./plebbit-js-challenges/captcha-canvas-v3"));
var fail_1 = __importDefault(require("./plebbit-js-challenges/fail"));
var blacklist_1 = __importDefault(require("./plebbit-js-challenges/blacklist"));
var question_1 = __importDefault(require("./plebbit-js-challenges/question"));
var evm_contract_call_1 = __importDefault(require("./plebbit-js-challenges/evm-contract-call"));
var plebbitJsChallenges = {
    'text-math': text_math_1.default,
    'captcha-canvas-v3': captcha_canvas_v3_1.default,
    'fail': fail_1.default,
    'blacklist': blacklist_1.default,
    'question': question_1.default,
    'evm-contract-call': evm_contract_call_1.default
};
exports.plebbitJsChallenges = plebbitJsChallenges;
var validateChallengeFileFactory = function (challengeFileFactory, challengeIndex, subplebbit) {
    var subplebbitChallengeSettings = subplebbit.settings.challenges[challengeIndex];
    if (typeof challengeFileFactory !== 'function') {
        throw Error("invalid challenge file factory export from subplebbit challenge '".concat(subplebbitChallengeSettings.name || subplebbitChallengeSettings.path, "' (challenge #").concat(challengeIndex + 1, ")"));
    }
};
var validateChallengeFile = function (challengeFile, challengeIndex, subplebbit) {
    var subplebbitChallengeSettings = subplebbit.settings.challenges[challengeIndex];
    if (typeof (challengeFile === null || challengeFile === void 0 ? void 0 : challengeFile.getChallenge) !== 'function') {
        throw Error("invalid challenge file from subplebbit challenge '".concat(subplebbitChallengeSettings.name || subplebbitChallengeSettings.path, "' (challenge #").concat(challengeIndex + 1, ")"));
    }
};
var validateChallengeResult = function (challengeResult, challengeIndex, subplebbit) {
    var subplebbitChallengeSettings = subplebbit.settings.challenges[challengeIndex];
    var error = "invalid challenge result from subplebbit challenge '".concat(subplebbitChallengeSettings.name || subplebbitChallengeSettings.path, "' (challenge #").concat(challengeIndex + 1, ")");
    if (typeof (challengeResult === null || challengeResult === void 0 ? void 0 : challengeResult.success) !== 'boolean') {
        throw Error(error);
    }
};
var validateChallengeOrChallengeResult = function (challengeOrChallengeResult, getChallengeError, challengeIndex, subplebbit) {
    if ((challengeOrChallengeResult === null || challengeOrChallengeResult === void 0 ? void 0 : challengeOrChallengeResult.success) !== undefined) {
        validateChallengeResult(challengeOrChallengeResult, challengeIndex, subplebbit);
    }
    else if (typeof (challengeOrChallengeResult === null || challengeOrChallengeResult === void 0 ? void 0 : challengeOrChallengeResult.challenge) !== 'string' ||
        typeof (challengeOrChallengeResult === null || challengeOrChallengeResult === void 0 ? void 0 : challengeOrChallengeResult.type) !== 'string' ||
        typeof (challengeOrChallengeResult === null || challengeOrChallengeResult === void 0 ? void 0 : challengeOrChallengeResult.verify) !== 'function') {
        var subplebbitChallengeSettings = subplebbit.settings.challenges[challengeIndex];
        var errorMessage = "invalid getChallenge response from subplebbit challenge '".concat(subplebbitChallengeSettings.name || subplebbitChallengeSettings.path, "' (challenge #").concat(challengeIndex + 1, ")");
        if (getChallengeError) {
            getChallengeError.message = "".concat(errorMessage, ": ").concat(getChallengeError.message);
        }
        throw getChallengeError || Error(errorMessage);
    }
};
var getPendingChallengesOrChallengeVerification = function (challengeRequestMessage, subplebbit) { return __awaiter(void 0, void 0, void 0, function () {
    var challengeResults, _a, _b, _i, i, challengeIndex, subplebbitChallengeSettings, challengeFile, ChallengeFileFactory, ChallengeFileFactory, challengeResult, getChallengeError, e_1, challengeFailureCount, pendingChallenges, challengeErrors, _c, _d, _e, i, challengeIndex, challengeResult, subplebbitChallengeSettings, subplebbitChallenge, challengeSuccess;
    var _f, _g;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                challengeResults = [];
                _a = [];
                for (_b in (_f = subplebbit.settings) === null || _f === void 0 ? void 0 : _f.challenges)
                    _a.push(_b);
                _i = 0;
                _h.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 7];
                i = _a[_i];
                challengeIndex = Number(i);
                subplebbitChallengeSettings = (_g = subplebbit.settings) === null || _g === void 0 ? void 0 : _g.challenges[challengeIndex];
                challengeFile = void 0;
                if (subplebbitChallengeSettings.path) {
                    try {
                        ChallengeFileFactory = require(subplebbitChallengeSettings.path);
                        validateChallengeFileFactory(ChallengeFileFactory, challengeIndex, subplebbit);
                        challengeFile = ChallengeFileFactory(subplebbitChallengeSettings);
                        validateChallengeFile(challengeFile, challengeIndex, subplebbit);
                    }
                    catch (e) {
                        e.message = "failed importing challenge with path '".concat(subplebbitChallengeSettings.path, "': ").concat(e.message);
                        throw e;
                    }
                }
                // else, the challenge is included with plebbit-js
                else if (subplebbitChallengeSettings.name) {
                    ChallengeFileFactory = plebbitJsChallenges[subplebbitChallengeSettings.name];
                    if (!ChallengeFileFactory) {
                        throw Error("plebbit-js challenge with name '".concat(subplebbitChallengeSettings.name, "' doesn't exist"));
                    }
                    validateChallengeFileFactory(ChallengeFileFactory, challengeIndex, subplebbit);
                    challengeFile = ChallengeFileFactory(subplebbitChallengeSettings);
                    validateChallengeFile(challengeFile, challengeIndex, subplebbit);
                }
                challengeResult = void 0, getChallengeError = void 0;
                _h.label = 2;
            case 2:
                _h.trys.push([2, 4, , 5]);
                return [4 /*yield*/, challengeFile.getChallenge(subplebbitChallengeSettings, challengeRequestMessage, challengeIndex)];
            case 3:
                // the getChallenge function could throw
                challengeResult = _h.sent();
                return [3 /*break*/, 5];
            case 4:
                e_1 = _h.sent();
                getChallengeError = e_1;
                return [3 /*break*/, 5];
            case 5:
                validateChallengeOrChallengeResult(challengeResult, getChallengeError, challengeIndex, subplebbit);
                challengeResults.push(challengeResult);
                _h.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 1];
            case 7:
                challengeFailureCount = 0;
                pendingChallenges = [];
                challengeErrors = new Array(challengeResults.length);
                _c = [];
                for (_d in challengeResults)
                    _c.push(_d);
                _e = 0;
                _h.label = 8;
            case 8:
                if (!(_e < _c.length)) return [3 /*break*/, 11];
                i = _c[_e];
                challengeIndex = Number(i);
                challengeResult = challengeResults[challengeIndex];
                subplebbitChallengeSettings = subplebbit.settings.challenges[challengeIndex];
                subplebbitChallenge = getSubplebbitChallengeFromSubplebbitChallengeSettings(subplebbitChallengeSettings);
                // exclude author from challenge based on the subplebbit minimum karma settings
                if ((0, exclude_1.shouldExcludePublication)(subplebbitChallenge, challengeRequestMessage.publication, subplebbit)) {
                    return [3 /*break*/, 10];
                }
                return [4 /*yield*/, (0, exclude_1.shouldExcludeChallengeCommentCids)(subplebbitChallenge, challengeRequestMessage, subplebbit.plebbit)];
            case 9:
                if (_h.sent()) {
                    return [3 /*break*/, 10];
                }
                // exclude based on other challenges successes
                if ((0, exclude_1.shouldExcludeChallengeSuccess)(subplebbitChallenge, challengeResults)) {
                    return [3 /*break*/, 10];
                }
                if (challengeResult.success === false) {
                    challengeFailureCount++;
                    challengeErrors[challengeIndex] = challengeResult.error;
                }
                else if (challengeResult.success === true) {
                    // do nothing
                }
                else {
                    // index is needed to exlude based on other challenge success in getChallengeVerification
                    pendingChallenges.push(__assign(__assign({}, challengeResult), { index: challengeIndex }));
                }
                _h.label = 10;
            case 10:
                _e++;
                return [3 /*break*/, 8];
            case 11:
                challengeSuccess = undefined;
                // if there are any failures, success is false and pending challenges are ignored
                if (challengeFailureCount > 0) {
                    challengeSuccess = false;
                    pendingChallenges = [];
                }
                // if there are no pending challenges and no failures, success is true
                if (pendingChallenges.length === 0 && challengeFailureCount === 0) {
                    challengeSuccess = true;
                }
                // create return value
                if (challengeSuccess === true) {
                    return [2 /*return*/, { challengeSuccess: challengeSuccess }];
                }
                else if (challengeSuccess === false) {
                    return [2 /*return*/, { challengeSuccess: challengeSuccess, challengeErrors: challengeErrors }];
                }
                else {
                    return [2 /*return*/, { pendingChallenges: pendingChallenges }];
                }
                return [2 /*return*/];
        }
    });
}); };
exports.getPendingChallengesOrChallengeVerification = getPendingChallengesOrChallengeVerification;
var getChallengeVerificationFromChallengeAnswers = function (pendingChallenges, challengeAnswers, subplebbit) { return __awaiter(void 0, void 0, void 0, function () {
    var verifyChallengePromises, i, challengeResultsWithPendingIndexes, i, challengeResult, challengeResults, challengeResultToPendingChallenge, i, challengeFailureCount, challengeErrors, i, challengeIndex, challengeResult;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                verifyChallengePromises = [];
                for (i in pendingChallenges) {
                    verifyChallengePromises.push(pendingChallenges[i].verify(challengeAnswers[i]));
                }
                return [4 /*yield*/, Promise.all(verifyChallengePromises)
                    // validate results
                ];
            case 1:
                challengeResultsWithPendingIndexes = _a.sent();
                // validate results
                for (i in challengeResultsWithPendingIndexes) {
                    challengeResult = challengeResultsWithPendingIndexes[Number(i)];
                    validateChallengeResult(challengeResult, pendingChallenges[Number(i)].index, subplebbit);
                }
                challengeResults = [];
                challengeResultToPendingChallenge = [];
                for (i in challengeResultsWithPendingIndexes) {
                    challengeResults[pendingChallenges[i].index] = challengeResultsWithPendingIndexes[i];
                    challengeResultToPendingChallenge[pendingChallenges[i].index] = pendingChallenges[i];
                }
                challengeFailureCount = 0;
                challengeErrors = [];
                for (i in challengeResults) {
                    challengeIndex = Number(i);
                    challengeResult = challengeResults[challengeIndex];
                    // the challenge results that were filtered out were already successful
                    if (challengeResult === undefined) {
                        continue;
                    }
                    // exclude based on other challenges successes
                    if ((0, exclude_1.shouldExcludeChallengeSuccess)(subplebbit.settings.challenges[challengeIndex], challengeResults)) {
                        continue;
                    }
                    if (challengeResult.success === false) {
                        challengeFailureCount++;
                        challengeErrors[challengeIndex] = challengeResult.error;
                    }
                }
                if (challengeFailureCount > 0) {
                    return [2 /*return*/, {
                            challengeSuccess: false,
                            challengeErrors: challengeErrors
                        }];
                }
                return [2 /*return*/, {
                        challengeSuccess: true,
                    }];
        }
    });
}); };
exports.getChallengeVerificationFromChallengeAnswers = getChallengeVerificationFromChallengeAnswers;
var getChallengeVerification = function (challengeRequestMessage, subplebbit, getChallengeAnswers) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, pendingChallenges, challengeSuccess, challengeErrors, challengeVerification, challenges, challengeAnswers;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (!challengeRequestMessage) {
                    throw Error("getChallengeVerification invalid challengeRequestMessage argument '".concat(challengeRequestMessage, "'"));
                }
                if (typeof ((_b = subplebbit === null || subplebbit === void 0 ? void 0 : subplebbit.plebbit) === null || _b === void 0 ? void 0 : _b.getComment) !== 'function') {
                    throw Error("getChallengeVerification invalid subplebbit argument '".concat(subplebbit, "' invalid subplebbit.plebbit instance"));
                }
                if (typeof getChallengeAnswers !== 'function') {
                    throw Error("getChallengeVerification invalid getChallengeAnswers argument '".concat(getChallengeAnswers, "' not a function"));
                }
                return [4 /*yield*/, getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit)];
            case 1:
                _a = _d.sent(), pendingChallenges = _a.pendingChallenges, challengeSuccess = _a.challengeSuccess, challengeErrors = _a.challengeErrors;
                if (!!pendingChallenges) return [3 /*break*/, 2];
                challengeVerification = { challengeSuccess: challengeSuccess };
                if (challengeErrors) {
                    challengeVerification.challengeErrors = challengeErrors;
                }
                return [3 /*break*/, 5];
            case 2:
                challenges = pendingChallenges.map(function (pendingChallenge) { return pendingChallenge.challenge; });
                return [4 /*yield*/, getChallengeAnswers(challenges)];
            case 3:
                challengeAnswers = _d.sent();
                return [4 /*yield*/, getChallengeVerificationFromChallengeAnswers(pendingChallenges, challengeAnswers, subplebbit)];
            case 4:
                challengeVerification = _d.sent();
                _d.label = 5;
            case 5:
                // store the publication result and author address in mem cache for rateLimit exclude challenge settings
                (0, exclude_1.addToRateLimiter)((_c = subplebbit.settings) === null || _c === void 0 ? void 0 : _c.challenges, challengeRequestMessage.publication, challengeVerification.challengeSuccess);
                return [2 /*return*/, challengeVerification];
        }
    });
}); };
exports.getChallengeVerification = getChallengeVerification;
// get the data to be published publicly to subplebbit.challenges
var getSubplebbitChallengeFromSubplebbitChallengeSettings = function (subplebbitChallengeSettings) {
    if (!subplebbitChallengeSettings) {
        throw Error("getSubplebbitChallengeFromSubplebbitChallengeSettings invalid subplebbitChallengeSettings argument '".concat(subplebbitChallengeSettings, "'"));
    }
    // if the challenge is an external file, fetch it and override the subplebbitChallengeSettings values
    var challengeFile;
    if (subplebbitChallengeSettings.path) {
        try {
            var ChallengeFileFactory = require(subplebbitChallengeSettings.path);
            if (typeof ChallengeFileFactory !== 'function') {
                throw Error("invalid challenge file factory exported");
            }
            challengeFile = ChallengeFileFactory(subplebbitChallengeSettings);
            if (typeof (challengeFile === null || challengeFile === void 0 ? void 0 : challengeFile.getChallenge) !== 'function') {
                throw Error("invalid challenge file");
            }
        }
        catch (e) {
            e.message = "getSubplebbitChallengeFromSubplebbitChallengeSettings failed importing challenge with path '".concat(subplebbitChallengeSettings.path, "': ").concat(e.message);
            throw e;
        }
    }
    // else, the challenge is included with plebbit-js
    else if (subplebbitChallengeSettings.name) {
        var ChallengeFileFactory = plebbitJsChallenges[subplebbitChallengeSettings.name];
        if (!ChallengeFileFactory) {
            throw Error("getSubplebbitChallengeFromSubplebbitChallengeSettings plebbit-js challenge with name '".concat(subplebbitChallengeSettings.name, "' doesn't exist"));
        }
        if (typeof ChallengeFileFactory !== 'function') {
            throw Error("getSubplebbitChallengeFromSubplebbitChallengeSettings invalid challenge file factory exported from subplebbit challenge '".concat(subplebbitChallengeSettings.name, "'"));
        }
        challengeFile = ChallengeFileFactory(subplebbitChallengeSettings);
        if (typeof (challengeFile === null || challengeFile === void 0 ? void 0 : challengeFile.getChallenge) !== 'function') {
            throw Error("getSubplebbitChallengeFromSubplebbitChallengeSettings invalid challenge file from subplebbit challenge '".concat(subplebbitChallengeSettings.name, "'"));
        }
    }
    var challenge = challengeFile.challenge, type = challengeFile.type;
    var exclude = subplebbitChallengeSettings.exclude, description = subplebbitChallengeSettings.description;
    return { exclude: exclude, description: description, challenge: challenge, type: type };
};
exports.getSubplebbitChallengeFromSubplebbitChallengeSettings = getSubplebbitChallengeFromSubplebbitChallengeSettings;
//# sourceMappingURL=index.js.map