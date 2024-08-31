import type { DecryptedChallengeAnswerMessageType, DecryptedChallengeMessageType, DecryptedChallengeRequestMessageType, DecryptedChallengeVerificationMessageType, EncodedDecryptedChallengeAnswerMessageType, EncodedDecryptedChallengeMessageType, EncodedDecryptedChallengeRequestMessageType, EncodedDecryptedChallengeVerificationMessageType } from "../../pubsub-messages/types.js";
export declare const clone: (obj: any) => any;
export declare const generateSubscriptionId: () => number;
export declare function encodeChallengeRequest(msg: DecryptedChallengeRequestMessageType): EncodedDecryptedChallengeRequestMessageType;
export declare function encodeChallengeMessage(msg: DecryptedChallengeMessageType): EncodedDecryptedChallengeMessageType;
export declare function encodeChallengeAnswerMessage(msg: DecryptedChallengeAnswerMessageType): EncodedDecryptedChallengeAnswerMessageType;
export declare function encodeChallengeVerificationMessage(msg: DecryptedChallengeVerificationMessageType): EncodedDecryptedChallengeVerificationMessageType;
