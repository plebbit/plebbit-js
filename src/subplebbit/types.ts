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
    SubplebbitChallengeSchema,
    SubplebbitChallengeSettingSchema,
    SubplebbitEditOptionsSchema,
    SubplebbitEncryptionSchema,
    SubplebbitFeaturesSchema,
    SubplebbitIpfsSchema,
    SubplebbitRoleSchema,
    SubplebbitSettingsSchema,
    SubplebbitSuggestedSchema,
    RpcRemoteSubplebbitUpdateEventResultSchema,
    SubplebbitSignedPropertyNames
} from "./schema.js";
import { RpcLocalSubplebbit } from "./rpc-local-subplebbit.js";
import { LocalSubplebbit } from "../runtime/node/subplebbit/local-subplebbit.js";
import { RemoteSubplebbit } from "./remote-subplebbit.js";
import { RpcRemoteSubplebbit } from "./rpc-remote-subplebbit.js";
import type { JsonOfClass } from "../types.js";
import type { JsonSignature } from "../signer/types.js";

export type ReplyStats = {
    hourReplyCount: number;
    dayReplyCount: number;
    weekReplyCount: number;
    monthReplyCount: number;
    yearReplyCount: number;
    allReplyCount: number;
};

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
} & ReplyStats;

export type SubplebbitFeatures = z.infer<typeof SubplebbitFeaturesSchema>;

export type SubplebbitSuggested = z.infer<typeof SubplebbitSuggestedSchema>;

export type Flair = z.infer<typeof FlairSchema>;

export type SubplebbitEncryption = z.infer<typeof SubplebbitEncryptionSchema>;

export type SubplebbitRole = z.infer<typeof SubplebbitRoleSchema>;

export type RpcRemoteSubplebbitType = z.infer<typeof RpcRemoteSubplebbitUpdateEventResultSchema>;

export type SubplebbitIpfsType = z.infer<typeof SubplebbitIpfsSchema>;

export interface SubplebbitSignature extends JsonSignature {
    signedPropertyNames: typeof SubplebbitSignedPropertyNames;
}

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

// RPC update events

export type RpcRemoteSubplebbitUpdateEventResultType = z.infer<typeof RpcRemoteSubplebbitUpdateEventResultSchema>;

// Subplebbit json here

export type RemoteSubplebbitJson = JsonOfClass<RemoteSubplebbit>;

export type RpcRemoteSubplebbitJson = JsonOfClass<RpcRemoteSubplebbit>;

export type RpcLocalSubplebbitJson = JsonOfClass<RpcLocalSubplebbit>;

export type LocalSubplebbitJson = JsonOfClass<LocalSubplebbit>;

export type SubplebbitJson = RemoteSubplebbitJson | RpcRemoteSubplebbitJson | RpcLocalSubplebbitJson | LocalSubplebbitJson; // after calling JSON.parse(JSON.stringify(subplebbitInstance)), this should be the output

// States here

export type SubplebbitState = "stopped" | "updating" | "started";

export type SubplebbitStartedState = "stopped" | "publishing-ipns" | "failed" | "succeeded";

export type SubplebbitUpdatingState =
    | SubplebbitStartedState
    | "stopped"
    | "resolving-address"
    | "fetching-ipns"
    | "fetching-ipfs"
    | "failed"
    | "succeeded";

// Internal subplebbit state (in DB)

export interface InternalSubplebbitRecordBeforeFirstUpdateType extends CreateNewLocalSubplebbitParsedOptions {
    settings: SubplebbitSettings;
    challenges: SubplebbitIpfsType["challenges"];
    createdAt: SubplebbitIpfsType["createdAt"];
    protocolVersion: SubplebbitIpfsType["protocolVersion"];
    encryption: SubplebbitIpfsType["encryption"];
    _usingDefaultChallenge: boolean;
    _subplebbitUpdateTrigger: boolean;
    _internalStateUpdateId: string; // uuid v4, everytime we update the internal state of db we will change this id
}

export interface InternalSubplebbitRecordAfterFirstUpdateType extends InternalSubplebbitRecordBeforeFirstUpdateType, SubplebbitIpfsType {
    cid: string;
}

// RPC server transmitting Internal Subplebbit records to clients

export interface RpcInternalSubplebbitRecordBeforeFirstUpdateType
    extends Omit<InternalSubplebbitRecordBeforeFirstUpdateType, "signer" | "_subplebbitUpdateTrigger" | "_internalStateUpdateId"> {
    signer: Omit<InternalSubplebbitRecordBeforeFirstUpdateType["signer"], "privateKey">;
    started: boolean;
}

export interface RpcInternalSubplebbitRecordAfterFirstUpdateType
    extends Omit<InternalSubplebbitRecordAfterFirstUpdateType, "_subplebbitUpdateTrigger" | "signer" | "_internalStateUpdateId"> {
    started: RpcInternalSubplebbitRecordBeforeFirstUpdateType["started"];
    signer: RpcInternalSubplebbitRecordBeforeFirstUpdateType["signer"];
}

export type RpcLocalSubplebbitUpdateResultType =
    | RpcInternalSubplebbitRecordBeforeFirstUpdateType
    | RpcInternalSubplebbitRecordAfterFirstUpdateType;

// This is the object that gets passed to _updateDbInternalState after calling .edit()
export interface ParsedSubplebbitEditOptions
    extends Omit<SubplebbitEditOptions, "roles">,
        Pick<
            InternalSubplebbitRecordBeforeFirstUpdateType,
            "_usingDefaultChallenge" | "_subplebbitUpdateTrigger" | "challenges" | "roles"
        > {}
