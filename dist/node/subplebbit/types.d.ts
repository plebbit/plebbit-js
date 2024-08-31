import { z } from "zod";
import { FlairSchema } from "../schema/schema.js";
import { ChallengeExcludeSchema, ChallengeFileFactorySchema, ChallengeFileSchema, ChallengeFromGetChallengeSchema, ChallengeResultSchema, CreateNewLocalSubplebbitParsedOptionsSchema, CreateNewLocalSubplebbitUserOptionsSchema, CreateRemoteSubplebbitOptionsSchema, SubplebbitChallengeSchema, SubplebbitChallengeSettingSchema, SubplebbitEditOptionsSchema, SubplebbitEncryptionSchema, SubplebbitFeaturesSchema, SubplebbitIpfsSchema, SubplebbitRoleSchema, SubplebbitSettingsSchema, SubplebbitSuggestedSchema, RpcRemoteSubplebbitUpdateEventResultSchema } from "./schema.js";
import { RpcLocalSubplebbit } from "./rpc-local-subplebbit.js";
import { LocalSubplebbit } from "../runtime/node/subplebbit/local-subplebbit.js";
import { RemoteSubplebbit } from "./remote-subplebbit.js";
import { RpcRemoteSubplebbit } from "./rpc-remote-subplebbit.js";
import type { JsonOfClass } from "../types.js";
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
export type RpcRemoteSubplebbitType = z.infer<typeof RpcRemoteSubplebbitUpdateEventResultSchema>;
export type SubplebbitIpfsType = z.infer<typeof SubplebbitIpfsSchema>;
export type CreateRemoteSubplebbitOptions = z.infer<typeof CreateRemoteSubplebbitOptionsSchema>;
export type CreateNewLocalSubplebbitUserOptions = z.infer<typeof CreateNewLocalSubplebbitUserOptionsSchema>;
export type CreateNewLocalSubplebbitParsedOptions = z.infer<typeof CreateNewLocalSubplebbitParsedOptionsSchema>;
export type CreateInstanceOfLocalOrRemoteSubplebbitOptions = {
    address: SubplebbitIpfsType["address"];
};
export type SubplebbitEditOptions = z.infer<typeof SubplebbitEditOptionsSchema>;
export type Exclude = z.infer<typeof ChallengeExcludeSchema>;
export type SubplebbitChallenge = z.infer<typeof SubplebbitChallengeSchema>;
export type SubplebbitChallengeSetting = z.infer<typeof SubplebbitChallengeSettingSchema>;
export type Challenge = z.infer<typeof ChallengeFromGetChallengeSchema>;
export type ChallengeResult = z.infer<typeof ChallengeResultSchema>;
export type ChallengeFile = z.infer<typeof ChallengeFileSchema>;
export type ChallengeFileFactory = z.infer<typeof ChallengeFileFactorySchema>;
export type SubplebbitSettings = z.infer<typeof SubplebbitSettingsSchema>;
export type RpcRemoteSubplebbitUpdateEventResultType = z.infer<typeof RpcRemoteSubplebbitUpdateEventResultSchema>;
export type RemoteSubplebbitJson = JsonOfClass<RemoteSubplebbit>;
export type RpcRemoteSubplebbitJson = JsonOfClass<RpcRemoteSubplebbit>;
export type RpcLocalSubplebbitJson = JsonOfClass<RpcLocalSubplebbit>;
export type LocalSubplebbitJson = JsonOfClass<LocalSubplebbit>;
export type SubplebbitJson = RemoteSubplebbitJson | RpcRemoteSubplebbitJson | RpcLocalSubplebbitJson | LocalSubplebbitJson;
export type SubplebbitState = "stopped" | "updating" | "started";
export type SubplebbitStartedState = "stopped" | "publishing-ipns" | "failed" | "succeeded";
export type SubplebbitUpdatingState = SubplebbitStartedState | "stopped" | "resolving-address" | "fetching-ipns" | "fetching-ipfs" | "failed" | "succeeded";
export interface InternalSubplebbitRecordBeforeFirstUpdateType extends CreateNewLocalSubplebbitParsedOptions {
    settings: SubplebbitSettings;
    challenges: SubplebbitIpfsType["challenges"];
    createdAt: SubplebbitIpfsType["createdAt"];
    protocolVersion: SubplebbitIpfsType["protocolVersion"];
    encryption: SubplebbitIpfsType["encryption"];
    _usingDefaultChallenge: boolean;
    _subplebbitUpdateTrigger: boolean;
    _internalStateUpdateId: string;
}
export interface InternalSubplebbitRecordAfterFirstUpdateType extends InternalSubplebbitRecordBeforeFirstUpdateType, SubplebbitIpfsType {
    cid: string;
}
export interface RpcInternalSubplebbitRecordBeforeFirstUpdateType extends Omit<InternalSubplebbitRecordBeforeFirstUpdateType, "signer" | "_subplebbitUpdateTrigger" | "_internalStateUpdateId"> {
    signer: Omit<InternalSubplebbitRecordBeforeFirstUpdateType["signer"], "privateKey">;
    started: boolean;
}
export interface RpcInternalSubplebbitRecordAfterFirstUpdateType extends Omit<InternalSubplebbitRecordAfterFirstUpdateType, "_subplebbitUpdateTrigger" | "signer" | "_internalStateUpdateId"> {
    started: RpcInternalSubplebbitRecordBeforeFirstUpdateType["started"];
    signer: RpcInternalSubplebbitRecordBeforeFirstUpdateType["signer"];
}
export type RpcLocalSubplebbitUpdateResultType = RpcInternalSubplebbitRecordBeforeFirstUpdateType | RpcInternalSubplebbitRecordAfterFirstUpdateType;
export interface ParsedSubplebbitEditOptions extends Omit<SubplebbitEditOptions, "roles">, Pick<InternalSubplebbitRecordBeforeFirstUpdateType, "_usingDefaultChallenge" | "_subplebbitUpdateTrigger" | "challenges" | "roles"> {
}
