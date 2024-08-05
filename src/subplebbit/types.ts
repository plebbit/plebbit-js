import { z } from "zod";
import { FlairSchema } from "../schema/schema.js";
import {
    ChallengeExcludeSchema,
    ChallengeFileFactorySchema,
    ChallengeFileSchema,
    ChallengeFromGetChallengeSchema,
    ChallengeResultSchema,
    CreateNewLocalSubplebbitParsedOptionsSchema,
    CreateNewLocalSubplebbitUserOptionsSchema,
    CreateRemoteSubplebbitOptionsSchema,
    InternalSubplebbitRecordBeforeFirstUpdateSchema,
    InternalSubplebbitRecordAfterFirstUpdateSchema,
    RpcInternalSubplebbitRecordBeforeFirstUpdateSchema,
    RpcInternalSubplebbitRecordAfterFirstUpdateSchema,
    SubplebbitChallengeSchema,
    SubplebbitChallengeSettingSchema,
    SubplebbitEditOptionsSchema,
    SubplebbitEncryptionSchema,
    SubplebbitFeaturesSchema,
    SubplebbitIpfsSchema,
    SubplebbitRoleSchema,
    SubplebbitSettingsSchema,
    SubplebbitSuggestedSchema,
    RpcRemoteSubplebbitSchema
} from "./schema.js";
import { RpcLocalSubplebbit } from "./rpc-local-subplebbit.js";
import { LocalSubplebbit } from "../runtime/node/subplebbit/local-subplebbit.js";
import { RemoteSubplebbit } from "./remote-subplebbit.js";
import { RpcRemoteSubplebbit } from "./rpc-remote-subplebbit.js";
import type { ClassWithNoEnumerables } from "../types.js";

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

export type RpcRemoteSubplebbitType = z.infer<typeof RpcRemoteSubplebbitSchema>;

export type SubplebbitIpfsType = z.infer<typeof SubplebbitIpfsSchema>;

export type InternalSubplebbitAfterFirstUpdateType = z.infer<typeof InternalSubplebbitRecordAfterFirstUpdateSchema>;

export type InternalSubplebbitBeforeFirstUpdateType = z.infer<typeof InternalSubplebbitRecordBeforeFirstUpdateSchema>;

export type InternalSubplebbitAfterFirstUpdateRpcType = z.infer<typeof RpcInternalSubplebbitRecordAfterFirstUpdateSchema>;

export type InternalSubplebbitBeforeFirstUpdateRpcType = z.infer<typeof RpcInternalSubplebbitRecordBeforeFirstUpdateSchema>;

export type CreateRemoteSubplebbitOptions = z.infer<typeof CreateRemoteSubplebbitOptionsSchema>;

export type CreateNewLocalSubplebbitUserOptions = z.infer<typeof CreateNewLocalSubplebbitUserOptionsSchema>;

// These are the options that go straight into _createLocalSub, create a new brand local sub. This is after parsing of plebbit-js

export type CreateNewLocalSubplebbitParsedOptions = z.infer<typeof CreateNewLocalSubplebbitParsedOptionsSchema>;

// or load an already existing sub through plebbit.createSubplebbit

export type CreateInstanceOfLocalOrRemoteSubplebbitOptions = { address: SubplebbitIpfsType["address"] };

export type SubplebbitEditOptions = z.infer<typeof SubplebbitEditOptionsSchema>;

export type Exclude = z.infer<typeof ChallengeExcludeSchema>;

export type SubplebbitChallenge = z.infer<typeof SubplebbitChallengeSchema>;

export type SubplebbitChallengeSetting = z.infer<typeof SubplebbitChallengeSettingSchema>;

export type Challenge = z.infer<typeof ChallengeFromGetChallengeSchema>;

export type ChallengeResult = z.infer<typeof ChallengeResultSchema>;

export type ChallengeFile = z.infer<typeof ChallengeFileSchema>;

export type ChallengeFileFactory = z.infer<typeof ChallengeFileFactorySchema>;

export type SubplebbitSettings = z.infer<typeof SubplebbitSettingsSchema>;

// This is the object that gets passed to _updateDbInternalState after calling .edit()
export interface ParsedSubplebbitEditOptions
    extends Omit<SubplebbitEditOptions, "roles">,
        Pick<InternalSubplebbitAfterFirstUpdateType, "_usingDefaultChallenge" | "_subplebbitUpdateTrigger" | "challenges" | "roles"> {}

// Subplebbit json here

export type RemoteSubplebbitJson = ClassWithNoEnumerables<RemoteSubplebbit>;

export type RpcRemoteSubplebbitJson = ClassWithNoEnumerables<RpcRemoteSubplebbit>;

export type RpcLocalSubplebbitJson = ClassWithNoEnumerables<RpcLocalSubplebbit>;

export type LocalSubplebbitJson = ClassWithNoEnumerables<LocalSubplebbit>;

export type SubplebbitJson = RemoteSubplebbitJson | RpcRemoteSubplebbitJson | RpcLocalSubplebbitJson | LocalSubplebbitJson; // after calling JSON.parse(JSON.stringify(subplebbitInstance)), this should be the output
