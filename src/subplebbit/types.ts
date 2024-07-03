import { z } from "zod";
import type { LocalSubplebbit } from "../runtime/node/subplebbit/local-subplebbit.js";
import { FlairSchema } from "../schema/schema.js";
import type { SignerType } from "../signer/types.js";
import type { SignerWithPublicKeyAddress } from "../signer/index.js";
import type { ChallengeType, DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../pubsub-messages/types";
import {
    ChallengeExcludeSchema,
    CreateNewLocalSubplebbitParsedOptionsSchema,
    CreateNewLocalSubplebbitUserOptionsSchema,
    CreateRemoteSubplebbitOptionsSchema,
    InternalSubplebbitRecordSchema,
    LocalSubplebbitJsonSchema,
    RemoteSubplebbitJsonSchema,
    RpcInternalSubplebbitRecordSchema,
    RpcLocalSubplebbitJsonSchema,
    SubplebbitChallengeSchema,
    SubplebbitChallengeSettingSchema,
    SubplebbitEncryptionSchema,
    SubplebbitFeaturesSchema,
    SubplebbitIpfsSchema,
    SubplebbitRoleSchema,
    SubplebbitSettingsSchema,
    SubplebbitSuggestedSchema
} from "./schema.js";
import type { PostsPagesTypeIpfs } from "../pages/types.js";

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

export interface SubplebbitEditOptions
    extends Partial<
        Pick<
            SubplebbitIpfsType,
            | "flairs"
            | "address"
            | "title"
            | "description"
            | "roles"
            | "rules"
            | "lastPostCid"
            | "lastCommentCid"
            | "pubsubTopic"
            | "features"
            | "suggested"
        >
    > {
    settings?: SubplebbitSettings;
}

export type Exclude = z.infer<typeof ChallengeExcludeSchema>;

interface OptionInput {
    option: string; // option property name, e.g. characterCount
    label: string; // option title, e.g. Character Count
    default?: string; // option default value, e.g. 10
    description?: string; // e.g. Amount of characters of the captcha
    placeholder?: string; // the value to display if the input field is empty, e.g. 10
    required?: boolean; // the option is required, the challenge will throw without it
}

export type SubplebbitChallenge = z.infer<typeof SubplebbitChallengeSchema>;

export type SubplebbitChallengeSettings = z.infer<typeof SubplebbitChallengeSettingSchema>;

export interface Challenge {
    // if the result of a challenge can't be optained by getChallenge(), return a challenge
    challenge: string; // e.g. '2 + 2'
    verify: (answer: string) => Promise<ChallengeResult>;
    type: ChallengeType["type"];
}

export type ChallengeResult =
    | { success: true }
    | {
          success: false;
          error: string; // the reason why the challenge failed, add it to ChallengeVerificationMessage.errors
      };

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

export type SubplebbitOnlyAddressAndPageCidsType = Pick<SubplebbitIpfsType, "address"> & {
    posts: Pick<PostsPagesTypeIpfs, "pageCids">;
};
