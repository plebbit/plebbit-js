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
// import {createCaptcha} from 'captcha-canvas'
// import nodeNativeFunctions from "../../../runtime/node/native-functions"
// use a mock native function because don't know how to make tests work with real native functions
var nodeNativeFunctions = { createImageCaptcha: function () { throw Error('not implemented'); } };
var optionInputs = [
    {
        option: 'characters',
        label: 'Characters',
        description: 'Amount of characters of the captcha.',
    },
    {
        option: 'height',
        label: 'Height',
        description: 'Height of the captcha.',
    },
    {
        option: 'width',
        label: 'Width',
        description: 'Width of the captcha.',
    },
    {
        option: 'color',
        label: 'Color',
        description: 'Color of the captcha.',
    },
];
var type = 'image';
var getChallenge = function (subplebbitChallengeSettings, challengeRequestMessage, challengeIndex) { return __awaiter(void 0, void 0, void 0, function () {
    var setCaptchaOptions, _a, width, height, characters, color, res, answer, verify, challenge;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                setCaptchaOptions = {};
                _a = (subplebbitChallengeSettings === null || subplebbitChallengeSettings === void 0 ? void 0 : subplebbitChallengeSettings.options) || {}, width = _a.width, height = _a.height, characters = _a.characters, color = _a.color;
                if (width) {
                    width = Number(width);
                }
                if (height) {
                    height = Number(height);
                }
                if (characters) {
                    setCaptchaOptions.characters = Number(characters);
                }
                if (color) {
                    setCaptchaOptions.color = color;
                }
                return [4 /*yield*/, nodeNativeFunctions.createImageCaptcha(width, height, { captcha: setCaptchaOptions })];
            case 1:
                res = _b.sent();
                answer = res.text;
                verify = function (_answer) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (answer.toLowerCase() === _answer.toLowerCase().trim()) {
                            return [2 /*return*/, { success: true }];
                        }
                        return [2 /*return*/, {
                                success: false, error: 'Wrong captcha.'
                            }];
                    });
                }); };
                challenge = res.image;
                return [2 /*return*/, { challenge: challenge, verify: verify, type: type }];
        }
    });
}); };
function ChallengeFileFactory(subplebbitChallengeSettings) {
    return { getChallenge: getChallenge, optionInputs: optionInputs, type: type };
}
exports.default = ChallengeFileFactory;
//# sourceMappingURL=index.js.map