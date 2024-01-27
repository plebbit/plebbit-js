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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var native_functions_1 = __importDefault(require("../../../../../runtime/node/native-functions"));
var optionInputs = [
    {
        option: "characters",
        label: "Characters",
        description: "Amount of characters of the captcha.",
        default: "6",
        placeholder: "example: 6"
    },
    {
        option: "height",
        label: "Height",
        description: "Height of the captcha in pixels.",
        default: "100",
        placeholder: "example: 100"
    },
    {
        option: "width",
        label: "Width",
        description: "Width of the captcha in pixels.",
        default: "300",
        placeholder: "example: 300"
    },
    {
        option: "colors",
        label: "Colors",
        description: "Colors of the captcha text as hex comma separated values.",
        default: "#32cf7e",
        placeholder: "example: #ff0000,#00ff00,#0000ff"
    },
];
var type = "image/png";
var description = "make custom image captcha";
var getChallenge = function (subplebbitChallengeSettings, challengeRequestMessage, challengeIndex) { return __awaiter(void 0, void 0, void 0, function () {
    var width, height, characters, colors, setCaptchaOptions, res, answer, verify, challenge;
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                width = ((_a = subplebbitChallengeSettings === null || subplebbitChallengeSettings === void 0 ? void 0 : subplebbitChallengeSettings.options) === null || _a === void 0 ? void 0 : _a.width) ? Number((_b = subplebbitChallengeSettings === null || subplebbitChallengeSettings === void 0 ? void 0 : subplebbitChallengeSettings.options) === null || _b === void 0 ? void 0 : _b.width) : 300;
                height = ((_c = subplebbitChallengeSettings === null || subplebbitChallengeSettings === void 0 ? void 0 : subplebbitChallengeSettings.options) === null || _c === void 0 ? void 0 : _c.height) ? Number((_d = subplebbitChallengeSettings === null || subplebbitChallengeSettings === void 0 ? void 0 : subplebbitChallengeSettings.options) === null || _d === void 0 ? void 0 : _d.height) : 100;
                characters = ((_e = subplebbitChallengeSettings === null || subplebbitChallengeSettings === void 0 ? void 0 : subplebbitChallengeSettings.options) === null || _e === void 0 ? void 0 : _e.characters) ? Number((_f = subplebbitChallengeSettings === null || subplebbitChallengeSettings === void 0 ? void 0 : subplebbitChallengeSettings.options) === null || _f === void 0 ? void 0 : _f.characters) : 6;
                colors = ((_g = subplebbitChallengeSettings === null || subplebbitChallengeSettings === void 0 ? void 0 : subplebbitChallengeSettings.options) === null || _g === void 0 ? void 0 : _g.colors) ? ((_h = subplebbitChallengeSettings === null || subplebbitChallengeSettings === void 0 ? void 0 : subplebbitChallengeSettings.options) === null || _h === void 0 ? void 0 : _h.colors).split(",") : ["#32cf7e"];
                setCaptchaOptions = {};
                if (characters)
                    setCaptchaOptions.characters = characters;
                if (colors)
                    setCaptchaOptions.colors = colors;
                return [4 /*yield*/, native_functions_1.default.createImageCaptcha(width, height, { captcha: setCaptchaOptions })];
            case 1:
                res = _j.sent();
                answer = res.text;
                verify = function (_answer) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (answer.toLowerCase() === _answer.toLowerCase().trim()) {
                            return [2 /*return*/, { success: true }];
                        }
                        return [2 /*return*/, {
                                success: false, error: "Wrong captcha."
                            }];
                    });
                }); };
                challenge = res.image;
                return [2 /*return*/, { challenge: challenge, verify: verify, type: type }];
        }
    });
}); };
function ChallengeFileFactory(subplebbitChallengeSettings) {
    return { getChallenge: getChallenge, optionInputs: optionInputs, type: type, description: description };
}
exports.default = ChallengeFileFactory;
//# sourceMappingURL=index.js.map