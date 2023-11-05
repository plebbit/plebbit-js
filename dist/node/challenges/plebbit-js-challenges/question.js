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
        option: 'question',
        label: 'Question',
        default: '',
        description: 'The question to answer.',
        placeholder: '',
    },
    {
        option: 'answer',
        label: 'Answer',
        default: '',
        description: 'The answer to the question.',
        placeholder: '',
        required: true
    }
];
var type = "text/plain";
var description = "Ask a question, like 'What is the password?'";
var getChallenge = function (subplebbitChallengeSettings, challengeRequestMessage, challengeIndex) { return __awaiter(void 0, void 0, void 0, function () {
    var answer, challengeAnswer;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        answer = (_a = subplebbitChallengeSettings === null || subplebbitChallengeSettings === void 0 ? void 0 : subplebbitChallengeSettings.options) === null || _a === void 0 ? void 0 : _a.answer;
        if (!answer) {
            throw Error('no option answer');
        }
        challengeAnswer = (_b = challengeRequestMessage === null || challengeRequestMessage === void 0 ? void 0 : challengeRequestMessage.challengeAnswers) === null || _b === void 0 ? void 0 : _b[challengeIndex];
        // the author didn't preinclude his answer, so send him a pubsub challenge message
        if (challengeAnswer === undefined) {
            return [2 /*return*/, {
                    challenge: (_c = subplebbitChallengeSettings === null || subplebbitChallengeSettings === void 0 ? void 0 : subplebbitChallengeSettings.options) === null || _c === void 0 ? void 0 : _c.question,
                    verify: function (_answer) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (_answer === answer)
                                return [2 /*return*/, {
                                        success: true
                                    }];
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Wrong answer.'
                                }];
                        });
                    }); },
                    type: type
                }];
        }
        // the author did preinclude his answer, but it's wrong, so send him a failed challenge verification
        if (challengeAnswer !== answer) {
            return [2 /*return*/, {
                    success: false,
                    error: 'Wrong answer.'
                }];
        }
        // the author did preinclude his answer, and it's correct, so send him a success challenge verification
        return [2 /*return*/, {
                success: true
            }];
    });
}); };
function ChallengeFileFactory(subplebbitChallengeSettings) {
    var _a;
    // some challenges can prepublish the challenge so that it can be preanswered
    // in the challengeRequestMessage
    var question = (_a = subplebbitChallengeSettings === null || subplebbitChallengeSettings === void 0 ? void 0 : subplebbitChallengeSettings.options) === null || _a === void 0 ? void 0 : _a.question;
    var challenge = question;
    return { getChallenge: getChallenge, optionInputs: optionInputs, type: type, challenge: challenge, description: description };
}
exports.default = ChallengeFileFactory;
//# sourceMappingURL=question.js.map