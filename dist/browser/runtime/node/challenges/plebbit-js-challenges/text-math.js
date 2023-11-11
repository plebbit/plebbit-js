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
        option: 'difficulty',
        label: 'Difficulty',
        default: '1',
        description: 'The math difficulty of the challenge between 1-3.',
        placeholder: '1'
    }
];
var type = "text/plain";
var description = 'Ask a plain text math question, insecure, use ONLY for testing.';
var getRandomNumber = function (minNumber, maxNumber) { return Math.floor(Math.random() * (maxNumber - minNumber + 1) + minNumber); };
var getChallengeString = function (minNumber, maxNumber, operators) {
    var firstNumber = getRandomNumber(minNumber, maxNumber);
    var secondNumber = getRandomNumber(minNumber, maxNumber);
    var operator = operators[getRandomNumber(0, operators.length - 1)];
    // reduce multiply difficulty
    if (operator === '*') {
        firstNumber = Math.ceil(firstNumber / 10);
        secondNumber = Math.ceil(secondNumber / 10);
    }
    // don't allow negative numbers
    if (operator === '-' && firstNumber < secondNumber) {
        var _firstNumber = firstNumber;
        firstNumber = secondNumber;
        secondNumber = _firstNumber;
    }
    return "".concat(firstNumber, " ").concat(operator, " ").concat(secondNumber);
};
var getChallenge = function (subplebbitChallengeSettings, challengeRequestMessage, challengeIndex) { return __awaiter(void 0, void 0, void 0, function () {
    var difficultyString, difficulty, challenge, verify;
    var _a;
    return __generator(this, function (_b) {
        difficultyString = ((_a = subplebbitChallengeSettings === null || subplebbitChallengeSettings === void 0 ? void 0 : subplebbitChallengeSettings.options) === null || _a === void 0 ? void 0 : _a.difficulty) || "1";
        difficulty = Number(difficultyString);
        if (difficulty === 1) {
            challenge = getChallengeString(1, 10, ['+', '-']);
        }
        else if (difficulty === 2) {
            challenge = getChallengeString(10, 100, ['+', '-', '*']);
        }
        else if (difficulty === 3) {
            challenge = getChallengeString(100, 1000, ['+', '-', '*']);
        }
        else {
            throw Error("invalid challenge difficulty '".concat(difficulty, "'"));
        }
        verify = function (_answer) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (String(eval(challenge)) === _answer) {
                    return [2 /*return*/, { success: true }];
                }
                return [2 /*return*/, {
                        success: false, error: 'Wrong answer.'
                    }];
            });
        }); };
        return [2 /*return*/, { challenge: challenge, verify: verify, type: type }];
    });
}); };
function ChallengeFileFactory(subplebbitChallengeSettings) {
    return { getChallenge: getChallenge, optionInputs: optionInputs, type: type, description: description };
}
exports.default = ChallengeFileFactory;
//# sourceMappingURL=text-math.js.map