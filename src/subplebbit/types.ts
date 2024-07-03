import { z } from "zod";
import type { LocalSubplebbit } from "../runtime/node/subplebbit/local-subplebbit.js";
import { FlairSchema } from "../schema/schema.js";
import type { ChallengeType, DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../pubsub-messages/types";
import {
    ChallengeExcludeSchema,
    ChallengeOptionInputSchema,
    ChallengeResultSchema,
    CreateNewLocalSubplebbitParsedOptionsSchema,
    CreateNewLocalSubplebbitUserOptionsSchema,
    CreateRemoteSubplebbitOptionsSchema,
    InternalSubplebbitRecordSchema,
    LocalSubplebbitJsonSchema,
    RemoteSubplebbitJsonSchema,
    ResultOfGetChallengeSchema,
    RpcInternalSubplebbitRecordSchema,
    RpcLocalSubplebbitJsonSchema,
    SubplebbitChallengeSchema,
    SubplebbitChallengeSettingSchema,
    SubplebbitEditOptionsSchema,
    SubplebbitEncryptionSchema,
    SubplebbitFeaturesSchema,
    SubplebbitIpfsSchema,
    SubplebbitOnlyAddressAndPageCidsSchema,
    SubplebbitRoleSchema,
    SubplebbitSettingsSchema,
    SubplebbitSuggestedSchema
} from "./schema.js";

export type SubplebbitStats = {
    hourActiveUserCount: number;
    dayActiveUserCount: number;
    weekActiveUserCount: number;
    monthActiveUserCount: number;
    yearActiveUserCount: number;
    allActiveUserCount: number;
    hourPostCount: number;
    dayPostCount: number;
    weekPostCount: number;
    monthPostCount: number;
    yearPostCount: number;
    allPostCount: number;
};

export type SubplebbitFeatures = z.infer<typeof SubplebbitFeaturesSchema>;

export type SubplebbitSuggested = z.infer<typeof SubplebbitSuggestedSchema>;

export type Flair = z.infer<typeof FlairSchema>;

export type SubplebbitEncryption = z.infer<typeof SubplebbitEncryptionSchema>;

export type SubplebbitRole = z.infer<typeof SubplebbitRoleSchema>;

export type RemoteSubplebbitJsonType = z.infer<typeof RemoteSubplebbitJsonSchema>;

export type LocalSubplebbitJsonType = z.infer<typeof LocalSubplebbitJsonSchema>;

export type LocalSubplebbitRpcJsonType = z.infer<typeof RpcLocalSubplebbitJsonSchema>;

export type SubplebbitIpfsType = z.infer<typeof SubplebbitIpfsSchema>;

export type InternalSubplebbitType = z.infer<typeof InternalSubplebbitRecordSchema>;

export type InternalSubplebbitRpcType = z.infer<typeof RpcInternalSubplebbitRecordSchema>;

export type CreateRemoteSubplebbitOptions = z.infer<typeof CreateRemoteSubplebbitOptionsSchema>;

export type CreateNewLocalSubplebbitUserOptions = z.infer<typeof CreateNewLocalSubplebbitUserOptionsSchema>;

// These are the options that go straight into _createLocalSub, create a new brand local sub. This is after parsing of plebbit-js

export type CreateNewLocalSubplebbitParsedOptions = z.infer<typeof CreateNewLocalSubplebbitParsedOptionsSchema>;

// or load an already existing sub through plebbit.createSubplebbit

export type CreateInstanceOfLocalOrRemoteSubplebbitOptions = { address: SubplebbitIpfsType["address"] };

export type SubplebbitEditOptions = z.infer<typeof SubplebbitEditOptionsSchema>;

export type Exclude = z.infer<typeof ChallengeExcludeSchema>;

type OptionInput = z.infer<typeof ChallengeOptionInputSchema>;

export type SubplebbitChallenge = z.infer<typeof SubplebbitChallengeSchema>;

export type SubplebbitChallengeSettings = z.infer<typeof SubplebbitChallengeSettingSchema>;

export type Challenge = z.infer<typeof ResultOfGetChallengeSchema>;

export type ChallengeResult = z.infer<typeof ChallengeResultSchema>;

export interface ChallengeFile {
    // the result of the function exported by the challenge file
    optionInputs?: OptionInput[]; // the options inputs fields to display to the user
    type: ChallengeType["type"];
    challenge?: ChallengeType["challenge"]; // some challenges can be static and asked before the user publishes, like a password for example
    caseInsensitive?: ChallengeType["caseInsensitive"]; // challenge answer capitalization is ignored, informational only option added by the challenge file
    description?: string; // describe what the challenge does to display in the UI
    getChallenge: (
        challenge: SubplebbitChallengeSettings,
        challengeRequest: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
        challengeIndex: number,
        subplebbit: LocalSubplebbit
    ) => Promise<Challenge | ChallengeResult>;
}

export type ChallengeFileFactory = (subplebbitChallengeSettings: SubplebbitChallengeSettings) => ChallengeFile;

export type SubplebbitSettings = z.infer<typeof SubplebbitSettingsSchema>;

export type SubplebbitOnlyAddressAndPageCidsType = z.infer<typeof SubplebbitOnlyAddressAndPageCidsSchema>;
