import { z } from "zod";
import type { LocalSubplebbit } from "../runtime/node/subplebbit/local-subplebbit.js";
import { FlairSchema } from "../schema/schema.js";
import type { SignerType } from "../signer/types.js";
import type { SignerWithPublicKeyAddress } from "../signer/index.js";
import type { ChallengeType, DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor } from "../types.js";
import type { RpcLocalSubplebbit } from "./rpc-local-subplebbit.js";
import {
    ChallengeExcludeSchema,
    SubplebbitChallengeSchema,
    SubplebbitEncryptionSchema,
    SubplebbitFeaturesSchema,
    SubplebbitIpfsSchema,
    SubplebbitRoleSchema,
    SubplebbitSuggestedSchema
} from "./schema.js";
import { PostsPagesTypeJson } from "../pages/types.js";

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

export interface RemoteSubplebbitJsonType extends Omit<SubplebbitIpfsType, "posts"> {
    shortAddress: string;
    posts?: PostsPagesTypeJson;
}

export interface LocalSubplebbitJsonType extends Omit<InternalSubplebbitType, "posts" | "signer"> {
    shortAddress: string;
    posts?: PostsPagesTypeJson;
    signer: InternalSubplebbitRpcType["signer"];
}

export type LocalSubplebbitRpcJsonType = Omit<InternalSubplebbitRpcType, "posts"> & {
    shortAddress: string;
    posts?: PostsPagesTypeJson;
};

export type SubplebbitIpfsType = z.infer<typeof SubplebbitIpfsSchema>;

// This type will be stored in the db as the current state
export interface InternalSubplebbitType extends SubplebbitIpfsType, Pick<SubplebbitEditOptions, "settings"> {
    signer: Pick<SignerWithPublicKeyAddress, "address" | "privateKey" | "type" | "shortAddress" | "publicKey">;
    _subplebbitUpdateTrigger: boolean;
    _usingDefaultChallenge: boolean;
}

// This will be transmitted over RPC connection for local subs
export interface InternalSubplebbitRpcType extends Omit<InternalSubplebbitType, "signer" | "_subplebbitUpdateTrigger"> {
    started: RpcLocalSubplebbit["started"];
    signer: Pick<InternalSubplebbitType["signer"], "address" | "type" | "shortAddress" | "publicKey">;
}

// If you're trying to create a subplebbit instance with any props, all props are optional except address
export interface CreateRemoteSubplebbitOptions extends Partial<SubplebbitIpfsType> {
    address: SubplebbitIpfsType["address"];
}

// These are the options to create a new local sub, provided by user (not modified like CreateNewLocalSubplebbitOptions)

export interface CreateNewLocalSubplebbitUserOptions extends Omit<SubplebbitEditOptions, "address"> {
    signer?: Pick<SignerType, "privateKey" | "type">;
}

// These are the options that go straight into _createLocalSub, create a new brand local sub. This is after parsing of plebbit-js

export type CreateNewLocalSubplebbitParsedOptions = CreateNewLocalSubplebbitUserOptions & {
    address: SignerType["address"];
    signer: SignerWithPublicKeyAddress;
};

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

export interface SubplebbitChallengeSettings {
    // the private settings of the challenge (subplebbit.settings.challenges)
    path?: string; // (only if name is undefined) the path to the challenge js file, used to get the props ChallengeFile {optionInputs, type, getChallenge}
    name?: string; // (only if path is undefined) the challengeName from Plebbit.challenges to identify it
    options?: { [optionPropertyName: string]: string }; // the options to be used to the getChallenge function, all values must be strings for UI ease of use
    exclude?: Exclude[]; // singular because it only has to match 1 exclude, the client must know the exclude setting to configure what challengeCommentCids to send
    description?: string; // describe in the frontend what kind of challenge the user will receive when publishing
}

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

export type SubplebbitSettings = {
    fetchThumbnailUrls?: boolean;
    fetchThumbnailUrlsProxyUrl?: string;
    challenges?: SubplebbitChallengeSettings[] | null | undefined;
};
