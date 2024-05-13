import { ChallengeVerificationMessageType, DecryptedChallengeAnswer, DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../../../../types.js";
import { Challenge, ChallengeFileFactory, SubplebbitChallenge, SubplebbitChallengeSettings } from "../../../../subplebbit/types.js";
import { LocalSubplebbit } from "../local-subplebbit.js";
type PendingChallenge = Challenge & {
    index: number;
};
export type GetChallengeAnswers = (challenges: Omit<Challenge, "verify">[]) => Promise<string[]>;
declare const plebbitJsChallenges: Record<string, ChallengeFileFactory>;
declare const getPendingChallengesOrChallengeVerification: (challengeRequestMessage: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, subplebbit: LocalSubplebbit) => Promise<{
    challengeSuccess: true;
} | {
    challengeSuccess: false;
    challengeErrors: string[];
} | {
    pendingChallenges: PendingChallenge[];
}>;
declare const getChallengeVerificationFromChallengeAnswers: (pendingChallenges: PendingChallenge[], challengeAnswers: DecryptedChallengeAnswer["challengeAnswers"], subplebbit: LocalSubplebbit) => Promise<{
    challengeSuccess: boolean;
    challengeErrors: string[];
} | {
    challengeSuccess: boolean;
    challengeErrors?: undefined;
}>;
declare const getChallengeVerification: (challengeRequestMessage: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, subplebbit: LocalSubplebbit, getChallengeAnswers: GetChallengeAnswers) => Promise<Pick<ChallengeVerificationMessageType, "challengeErrors" | "challengeSuccess">>;
declare const getSubplebbitChallengeFromSubplebbitChallengeSettings: (subplebbitChallengeSettings: SubplebbitChallengeSettings) => SubplebbitChallenge;
export { plebbitJsChallenges, getPendingChallengesOrChallengeVerification, getChallengeVerificationFromChallengeAnswers, getChallengeVerification, getSubplebbitChallengeFromSubplebbitChallengeSettings };
