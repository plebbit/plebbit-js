import type { ChallengeVerificationMessageType, DecryptedChallengeAnswer, DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../../../../pubsub-messages/types.js";
import type { Challenge, ChallengeFileFactory, SubplebbitChallenge, SubplebbitChallengeSetting } from "../../../../subplebbit/types.js";
import { LocalSubplebbit } from "../local-subplebbit.js";
type PendingChallenge = Challenge & {
    index: number;
};
export type GetChallengeAnswers = (challenges: Omit<Challenge, "verify">[]) => Promise<DecryptedChallengeAnswer["challengeAnswers"]>;
declare const plebbitJsChallenges: Record<string, ChallengeFileFactory>;
declare const getPendingChallengesOrChallengeVerification: (challengeRequestMessage: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, subplebbit: LocalSubplebbit) => Promise<{
    challengeSuccess: true;
} | {
    challengeSuccess: false;
    challengeErrors: NonNullable<ChallengeVerificationMessageType["challengeErrors"]>;
} | {
    pendingChallenges: PendingChallenge[];
}>;
declare const getChallengeVerificationFromChallengeAnswers: (pendingChallenges: PendingChallenge[], challengeAnswers: DecryptedChallengeAnswer["challengeAnswers"], subplebbit: LocalSubplebbit) => Promise<{
    challengeSuccess: true;
} | {
    challengeSuccess: false;
    challengeErrors: NonNullable<ChallengeVerificationMessageType["challengeErrors"]>;
}>;
declare const getChallengeVerification: (challengeRequestMessage: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, subplebbit: LocalSubplebbit, getChallengeAnswers: GetChallengeAnswers) => Promise<Pick<ChallengeVerificationMessageType, "challengeErrors" | "challengeSuccess">>;
declare const getSubplebbitChallengeFromSubplebbitChallengeSettings: (subplebbitChallengeSettings: SubplebbitChallengeSetting) => SubplebbitChallenge;
export { plebbitJsChallenges, getPendingChallengesOrChallengeVerification, getChallengeVerificationFromChallengeAnswers, getChallengeVerification, getSubplebbitChallengeFromSubplebbitChallengeSettings };
