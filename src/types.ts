import { create as CreateIpfsClient, Options as IpfsHttpClientOptions } from "kubo-rpc-client";
import { Comment } from "./publications/comment/comment.js";
import type Publication from "./publications/publication.js";
import type { PlebbitError } from "./plebbit-error.js";
import type { Plebbit } from "./plebbit/plebbit.js";
import type { RemoteSubplebbit } from "./subplebbit/remote-subplebbit.js";
import type { RpcLocalSubplebbit } from "./subplebbit/rpc-local-subplebbit.js";
import {
    AuthorAvatarNftSchema,
    AuthorPubsubSchema,
    AuthorWithOptionalCommentUpdateSchema,
    CreatePublicationUserOptionsSchema,
    ProtocolVersionSchema
} from "./schema/schema.js";
import { z } from "zod";
import type { CommentUpdateType } from "./publications/comment/types.js";
import { CommentsTableRowSchema } from "./publications/comment/schema.js";

import type {
    DecryptedChallengeAnswerMessageType,
    DecryptedChallengeMessageType,
    DecryptedChallengeRequestMessageType,
    DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    DecryptedChallengeRequestPublication,
    DecryptedChallengeVerificationMessageType
} from "./pubsub-messages/types.js";
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

// creating a new local publication
export type CreatePublicationOptions = z.infer<typeof CreatePublicationUserOptionsSchema>;

//*********************
//* "Edit" publications
//*********************

export type Nft = z.infer<typeof AuthorAvatarNftSchema>;

export type AuthorPubsubJsonType = AuthorPubsubType & { shortAddress: string };

export type AuthorWithOptionalCommentUpdateJson = AuthorTypeWithCommentUpdate & { shortAddress: string };

export type PublicationTypeName = keyof DecryptedChallengeRequestPublication; // Publications published by authors over pubsub, not subplebbits

export type NativeFunctions = {
    fetch: typeof fetch;
};

// Define database tables and fields here

export type CommentsTableRow = z.infer<typeof CommentsTableRowSchema>;

export interface CommentsTableRowInsert extends Omit<CommentsTableRow, "rowid"> {}

// CommentUpdates table

export interface CommentUpdatesRow extends CommentUpdateType {
    insertedAt: number;
    postUpdatesBucket: number | undefined; // the post updates bucket of post CommentUpdate, not applicable to replies
    publishedToPostUpdatesMFS: boolean; // whether the comment latest update has been published
    postCommentUpdateCid: string | undefined; // the cid of the post comment update, cid v0. Not applicable to replies
}

export type CommentUpdatesTableRowInsert = CommentUpdatesRow;

// Votes table

export type VotesTableRow = z.infer<typeof VoteTablesRowSchema>;

export type VotesTableRowInsert = VotesTableRow;

// Comment edits table

export type CommentEditsTableRow = z.infer<typeof CommentEditsTableRowSchema>;
export interface CommentEditsTableRowInsert extends Omit<CommentEditsTableRow, "rowid"> {}
export interface CommentModerationsTableRowInsert extends Omit<CommentModerationTableRow, "rowid"> {}

// Event emitter declaration
export interface SubplebbitEvents {
    challengerequest: (request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor) => void;
    challenge: (challenge: DecryptedChallengeMessageType) => void;
    challengeanswer: (answer: DecryptedChallengeAnswerMessageType) => void;
    challengeverification: (verification: DecryptedChallengeVerificationMessageType) => void;

    error: (error: PlebbitError | Error) => void;

    // State changes
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
    challengeverification: (verification: DecryptedChallengeVerificationMessageType, decryptedComment?: Comment) => void; // Should we include the updated publication instance here? not sure
    error: (error: PlebbitError | Error) => void;

    // State changes
    publishingstatechange: (newState: Publication["publishingState"]) => void;
    statechange: (newState: Publication["state"]) => void;

    // For comment only
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

// Plebbit types here

export interface IpfsStats {
    totalIn: number; // IPFS stats https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-stats-bw
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
    sessionStats: IpfsStats; // session means in the last 1h
}

export interface PubsubStats {
    totalIn: number; // IPFS stats https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-stats-bw
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
    sessionStats: PubsubStats; // session means in the last 1h
}

export interface KuboRpcClient {
    peers: () => ReturnType<KuboRpcClient["_client"]["swarm"]["peers"]>; // https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-swarm-peers
    stats?: undefined; // Should be defined, will change later
    sessionStats?: undefined; // Should be defined, will change later
    subplebbitStats?: undefined; // Should be defined, will change later
    _client: ReturnType<typeof CreateIpfsClient>; // Private API, shouldn't be used by consumers
    _clientOptions: IpfsHttpClientOptions;
}

export type PubsubSubscriptionHandler = Extract<Parameters<KuboRpcClient["_client"]["pubsub"]["subscribe"]>[1], Function>;
export type IpfsHttpClientPubsubMessage = Parameters<PubsubSubscriptionHandler>["0"];
export interface PubsubClient {
    peers: () => Promise<string[]>; // IPFS peers https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-pubsub-peers
    stats?: undefined; // Should be defined, will change later
    sessionStats?: undefined; // Should be defined, will change later
    subplebbitStats?: undefined; // Should be defined, will change later
    _client: Pick<KuboRpcClient["_client"], "pubsub">; // Private API, shouldn't be used by consumers
    _clientOptions: KuboRpcClient["_clientOptions"];
}

export interface GatewayClient {
    stats?: IpfsStats; // Should be defined, will change later
    sessionStats?: IpfsStats; // Should be defined, will change later. session means in the last 1h
    subplebbitStats?: { [subplebbitAddress: string]: IpfsSubplebbitStats }; // Should be defined, will change later
}

// Storage interface, will be used to set up storage cache using localforage (for browser) or key-v SQLite (Node)
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
    maxItems: number; // Will start evicting after this number of items is stored
    cacheName: LRUStorageCacheNames | string; // The cache name will be used as the name of the table in sqlite. For browser it will be used as the name of the local forage instance
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

// Util function of types here

type OmitUnderscoreProps<T> = Omit<T, `_${string}`>;
type ExcludeMethods<T> = { [K in keyof T as T[K] extends Function ? never : K]: T[K] };

export type JsonOfClass<T> = ExcludeMethods<OmitUnderscoreProps<T>>;

export type PlebbitMemCaches = {
    subplebbitVerificationCache: LRUCache<string, boolean>;
    pageVerificationCache: LRUCache<string, boolean>;
    commentVerificationCache: LRUCache<string, boolean>;
    commentUpdateVerificationCache: LRUCache<string, boolean>;
    subplebbitForPublishing: LRUCache<SubplebbitIpfsType["address"], NonNullable<Publication["_subplebbit"]>>;
    pageCidToSortTypes: LRUCache<NonNullable<PageIpfs["nextCid"]>, string[]>; // page cid => sort types
    pagesMaxSize: LRUCache<NonNullable<PageIpfs["nextCid"]>, number>; // page cid => max file size (number of bytes )
};
