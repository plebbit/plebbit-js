import textMath from './plebbit-js-challenges/text-math';
import captchaCanvasV3 from './plebbit-js-challenges/captcha-canvas-v3';
import fail from './plebbit-js-challenges/fail';
import blacklist from './plebbit-js-challenges/blacklist';
import question from './plebbit-js-challenges/question';
import evmContractCall from './plebbit-js-challenges/evm-contract-call';
declare const plebbitJsChallenges: {
    'text-math': typeof textMath;
    'captcha-canvas-v3': typeof captchaCanvasV3;
    fail: typeof fail;
    blacklist: typeof blacklist;
    question: typeof question;
    'evm-contract-call': typeof evmContractCall;
};
declare const getPendingChallengesOrChallengeVerification: (challengeRequestMessage: any, subplebbit: any) => Promise<{
    challengeSuccess: any;
    challengeErrors?: undefined;
    pendingChallenges?: undefined;
} | {
    challengeSuccess: any;
    challengeErrors: any[];
    pendingChallenges?: undefined;
} | {
    pendingChallenges: any[];
    challengeSuccess?: undefined;
    challengeErrors?: undefined;
}>;
declare const getChallengeVerificationFromChallengeAnswers: (pendingChallenges: any, challengeAnswers: any, subplebbit: any) => Promise<{
    challengeSuccess: boolean;
    challengeErrors: any[];
} | {
    challengeSuccess: boolean;
    challengeErrors?: undefined;
}>;
declare const getChallengeVerification: (challengeRequestMessage: any, subplebbit: any, getChallengeAnswers: any) => Promise<any>;
declare const getSubplebbitChallengeFromSubplebbitChallengeSettings: (subplebbitChallengeSettings: any) => {
    exclude: any;
    description: any;
    challenge: any;
    type: any;
};
export { plebbitJsChallenges, getPendingChallengesOrChallengeVerification, getChallengeVerificationFromChallengeAnswers, getChallengeVerification, getSubplebbitChallengeFromSubplebbitChallengeSettings };
