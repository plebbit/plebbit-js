import type { ChallengeVerificationMessageType, DecryptedChallengeAnswer, DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../../../../pubsub-messages/types.js";
import type { Challenge, ChallengeFileFactoryInput, SubplebbitChallenge, SubplebbitChallengeSetting } from "../../../../subplebbit/types.js";
import { LocalSubplebbit } from "../local-subplebbit.js";
type PendingChallenge = Challenge & {
    index: number;
};
export type GetChallengeAnswers = (challenges: Omit<Challenge, "verify">[]) => Promise<DecryptedChallengeAnswer["challengeAnswers"]>;
type ChallengeVerificationSuccess = {
    challengeSuccess: true;
    pendingApprovalSuccess: boolean;
};
type ChallengeVerificationPending = {
    pendingChallenges: PendingChallenge[];
    pendingApprovalSuccess: boolean;
};
type ChallengeVerificationFailure = {
    challengeSuccess: false;
    challengeErrors: NonNullable<ChallengeVerificationMessageType["challengeErrors"]>;
};
declare const plebbitJsChallenges: Record<string, ChallengeFileFactoryInput>;
declare const getPendingChallengesOrChallengeVerification: (challengeRequestMessage: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, subplebbit: LocalSubplebbit) => Promise<ChallengeVerificationSuccess | ChallengeVerificationPending | ChallengeVerificationFailure>;
declare const getChallengeVerificationFromChallengeAnswers: (pendingChallenges: PendingChallenge[], challengeAnswers: DecryptedChallengeAnswer["challengeAnswers"], subplebbit: LocalSubplebbit) => Promise<ChallengeVerificationSuccess | ChallengeVerificationFailure>;
declare const getChallengeVerification: (challengeRequestMessage: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, subplebbit: LocalSubplebbit, getChallengeAnswers: GetChallengeAnswers) => Promise<Pick<ChallengeVerificationMessageType, "challengeErrors" | "challengeSuccess"> & {
    pendingApproval?: boolean;
}>;
declare const getSubplebbitChallengeFromSubplebbitChallengeSettings: (subplebbitChallengeSettings: SubplebbitChallengeSetting) => Promise<SubplebbitChallenge>;
export { plebbitJsChallenges, getPendingChallengesOrChallengeVerification, getChallengeVerificationFromChallengeAnswers, getChallengeVerification, getSubplebbitChallengeFromSubplebbitChallengeSettings };
