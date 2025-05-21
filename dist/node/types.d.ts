import { create as CreateIpfsClient, Options as IpfsHttpClientOptions } from "kubo-rpc-client";
import { Comment } from "./publications/comment/comment.js";
import type Publication from "./publications/publication.js";
import type { PlebbitError } from "./plebbit-error.js";
import type { Plebbit } from "./plebbit/plebbit.js";
import type { RemoteSubplebbit } from "./subplebbit/remote-subplebbit.js";
import type { RpcLocalSubplebbit } from "./subplebbit/rpc-local-subplebbit.js";
import { AuthorAvatarNftSchema, AuthorPubsubSchema, AuthorWithOptionalCommentUpdateSchema, CreatePublicationUserOptionsSchema, ProtocolVersionSchema } from "./schema/schema.js";
import { z } from "zod";
import type { CommentUpdateType } from "./publications/comment/types.js";
import { CommentsTableRowSchema } from "./publications/comment/schema.js";
import type { DecryptedChallengeAnswerMessageType, DecryptedChallengeMessageType, DecryptedChallengeRequestMessageType, DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, DecryptedChallengeRequestPublication, DecryptedChallengeVerificationMessageType } from "./pubsub-messages/types.js";
import { ChainProviderSchema, ChainTickerSchema, PlebbitParsedOptionsSchema, PlebbitUserOptionsSchema } from "./schema.js";
import { VoteTablesRowSchema } from "./publications/vote/schema.js";
import { CommentEditsTableRowSchema } from "./publications/comment-edit/schema.js";
import PlebbitRpcClient from "./clients/rpc-client/plebbit-rpc-client.js";
import type { PlebbitWsServerSettingsSerialized } from "./rpc/src/types.js";
import { CommentModerationTableRow } from "./publications/comment-moderation/types.js";
import { LRUCache } from "lru-cache";
import type { SubplebbitIpfsType } from "./subplebbit/types.js";
import type { PageIpfs } from "./pages/types.js";
export type ProtocolVersion = z.infer<typeof ProtocolVersionSchema>;
export type ChainTicker = z.infer<typeof ChainTickerSchema>;
export type ChainProvider = z.infer<typeof ChainProviderSchema>;
export type InputPlebbitOptions = z.input<typeof PlebbitUserOptionsSchema>;
export type ParsedPlebbitOptions = z.output<typeof PlebbitParsedOptionsSchema>;
export type AuthorPubsubType = z.infer<typeof AuthorPubsubSchema>;
export type AuthorTypeWithCommentUpdate = z.infer<typeof AuthorWithOptionalCommentUpdateSchema>;
export type CreatePublicationOptions = z.infer<typeof CreatePublicationUserOptionsSchema>;
export type Nft = z.infer<typeof AuthorAvatarNftSchema>;
export type AuthorPubsubJsonType = AuthorPubsubType & {
    shortAddress: string;
};
export type AuthorWithOptionalCommentUpdateJson = AuthorTypeWithCommentUpdate & {
    shortAddress: string;
};
export type PublicationTypeName = keyof DecryptedChallengeRequestPublication;
export type NativeFunctions = {
    fetch: typeof fetch;
};
export type CommentsTableRow = z.infer<typeof CommentsTableRowSchema>;
export interface CommentsTableRowInsert extends Omit<CommentsTableRow, "rowid"> {
}
export interface CommentUpdatesRow extends CommentUpdateType {
    insertedAt: number;
    postUpdatesBucket: number | undefined;
    publishedToPostUpdatesMFS: boolean;
    postCommentUpdateCid: string | undefined;
}
export type CommentUpdatesTableRowInsert = CommentUpdatesRow;
export type VotesTableRow = z.infer<typeof VoteTablesRowSchema>;
export type VotesTableRowInsert = VotesTableRow;
export type CommentEditsTableRow = z.infer<typeof CommentEditsTableRowSchema>;
export interface CommentEditsTableRowInsert extends Omit<CommentEditsTableRow, "rowid"> {
}
export interface CommentModerationsTableRowInsert extends Omit<CommentModerationTableRow, "rowid"> {
}
export interface SubplebbitEvents {
    challengerequest: (request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor) => void;
    challenge: (challenge: DecryptedChallengeMessageType) => void;
    challengeanswer: (answer: DecryptedChallengeAnswerMessageType) => void;
    challengeverification: (verification: DecryptedChallengeVerificationMessageType) => void;
    error: (error: PlebbitError | Error) => void;
    statechange: (newState: RemoteSubplebbit["state"]) => void;
    updatingstatechange: (newState: RemoteSubplebbit["updatingState"]) => void;
    startedstatechange: (newState: RpcLocalSubplebbit["startedState"]) => void;
    update: (updatedSubplebbit: RemoteSubplebbit) => void;
    removeListener: (eventName: string, listener: Function) => void;
}
export interface PublicationEvents {
    challengerequest: (request: DecryptedChallengeRequestMessageType) => void;
    challenge: (challenge: DecryptedChallengeMessageType) => void;
    challengeanswer: (answer: DecryptedChallengeAnswerMessageType) => void;
    challengeverification: (verification: DecryptedChallengeVerificationMessageType, decryptedComment?: Comment) => void;
    error: (error: PlebbitError | Error) => void;
    publishingstatechange: (newState: Publication["publishingState"]) => void;
    statechange: (newState: Publication["state"]) => void;
    update: (updatedInstance: Comment) => void;
    updatingstatechange: (newState: Comment["updatingState"]) => void;
    removeListener: (eventName: string, listener: Function) => void;
}
export interface PlebbitEvents {
    error: (error: PlebbitError | Error) => void;
    subplebbitschange: (listOfSubplebbits: string[]) => void;
    settingschange: (newSettings: ParsedPlebbitOptions) => void;
}
export interface PlebbitRpcClientEvents {
    statechange: (state: PlebbitRpcClient["state"]) => void;
    error: (error: PlebbitError | Error) => void;
    subplebbitschange: (listOfSubplebbits: string[]) => void;
    settingschange: (newSettings: PlebbitWsServerSettingsSerialized) => void;
}
export interface GenericClientEvents<T extends string> {
    statechange: (state: T) => void;
}
export interface IpfsStats {
    totalIn: number;
    totalOut: number;
    rateIn: number;
    rateOut: number;
    succeededIpfsCount: number;
    failedIpfsCount: number;
    succeededIpfsAverageTime: number;
    succeededIpfsMedianTime: number;
    succeededIpnsCount: number;
    failedIpnsCount: number;
    succeededIpnsAverageTime: number;
    succeededIpnsMedianTime: number;
}
export interface IpfsSubplebbitStats {
    stats: IpfsStats;
    sessionStats: IpfsStats;
}
export interface PubsubStats {
    totalIn: number;
    totalOut: number;
    rateIn: number;
    rateOut: number;
    succeededChallengeRequestMessageCount: number;
    failedChallengeRequestMessageCount: number;
    succeededChallengeRequestMessageAverageTime: number;
    succeededChallengeRequestMessageMedianTime: number;
    succeededChallengeAnswerMessageCount: number;
    failedChallengeAnswerMessageCount: number;
    succeededChallengeAnswerMessageAverageTime: number;
    succeededChallengeAnswerMessageMedianTime: number;
}
export interface PubsubSubplebbitStats {
    stats: PubsubStats;
    sessionStats: PubsubStats;
}
export interface KuboRpcClient {
    peers: () => ReturnType<KuboRpcClient["_client"]["swarm"]["peers"]>;
    stats?: undefined;
    sessionStats?: undefined;
    subplebbitStats?: undefined;
    _client: ReturnType<typeof CreateIpfsClient>;
    _clientOptions: IpfsHttpClientOptions;
}
export type PubsubSubscriptionHandler = Extract<Parameters<KuboRpcClient["_client"]["pubsub"]["subscribe"]>[1], Function>;
export type IpfsHttpClientPubsubMessage = Parameters<PubsubSubscriptionHandler>["0"];
export interface PubsubClient {
    peers: () => Promise<string[]>;
    stats?: undefined;
    sessionStats?: undefined;
    subplebbitStats?: undefined;
    _client: Pick<KuboRpcClient["_client"], "pubsub">;
    _clientOptions: KuboRpcClient["_clientOptions"];
}
export interface GatewayClient {
    stats?: IpfsStats;
    sessionStats?: IpfsStats;
    subplebbitStats?: {
        [subplebbitAddress: string]: IpfsSubplebbitStats;
    };
}
export interface StorageInterface {
    init: () => Promise<void>;
    getItem: (key: string) => Promise<any | undefined>;
    setItem: (key: string, value: any) => Promise<void>;
    removeItem: (key: string | string[]) => Promise<boolean>;
    clear: () => Promise<void>;
    destroy: () => Promise<void>;
}
type LRUStorageCacheNames = "plebbitjs_lrustorage_postTimestamp" | "plebbitjs_lrustorage_commentPostUpdatesParentsPath";
export interface LRUStorageConstructor {
    maxItems: number;
    cacheName: LRUStorageCacheNames | string;
    plebbit: Pick<Plebbit, "dataPath" | "noData">;
}
export interface LRUStorageInterface {
    init: () => Promise<void>;
    getItem: (key: string) => Promise<any | undefined>;
    setItem: (key: string, value: any) => Promise<void>;
    removeItem: (key: string) => Promise<boolean>;
    clear: () => Promise<void>;
    keys: () => Promise<string[]>;
    destroy: () => Promise<void>;
}
type OmitUnderscoreProps<T> = Omit<T, `_${string}`>;
type ExcludeMethods<T> = {
    [K in keyof T as T[K] extends Function ? never : K]: T[K];
};
export type JsonOfClass<T> = ExcludeMethods<OmitUnderscoreProps<T>>;
export type PlebbitMemCaches = {
    subplebbitVerificationCache: LRUCache<string, boolean>;
    pageVerificationCache: LRUCache<string, boolean>;
    commentVerificationCache: LRUCache<string, boolean>;
    commentUpdateVerificationCache: LRUCache<string, boolean>;
    subplebbitForPublishing: LRUCache<SubplebbitIpfsType["address"], NonNullable<Publication["_subplebbit"]>>;
    pageCidToSortTypes: LRUCache<NonNullable<PageIpfs["nextCid"]>, string[]>;
    pagesMaxSize: LRUCache<NonNullable<PageIpfs["nextCid"]>, number>;
};
export {};
