import { create as CreateIpfsClient, Options as IpfsHttpClientOptions } from "kubo-rpc-client";
import { Knex } from "knex";
import { Comment } from "./publications/comment/comment.js";
import type Publication from "./publications/publication.js";
import type { PlebbitError } from "./plebbit-error.js";
import type { ChallengeFile } from "./subplebbit/types.js";
import type { Plebbit } from "./plebbit.js";
import type { RemoteSubplebbit } from "./subplebbit/remote-subplebbit.js";
import type { RpcLocalSubplebbit } from "./subplebbit/rpc-local-subplebbit.js";
import {
    AuthorAvatarNftSchema,
    AuthorPubsubSchema,
    AuthorWithOptionalCommentUpdate,
    CreatePublicationUserOptionsSchema,
    ProtocolVersionSchema
} from "./schema/schema.js";
import { z } from "zod";
import type { SignerType } from "./signer/types.js";
import type { CommentEditPubsubMessage, LocalCommentEditOptions } from "./publications/comment-edit/types.js";
import type { LocalVoteOptions, VotePubsubMessage } from "./publications/vote/types.js";
import type { CommentPubsubMessage, CommentUpdate, LocalCommentOptions } from "./publications/comment/types.js";
import { CommentsTableRowSchema } from "./publications/comment/schema.js";

import type {
    DecryptedChallengeAnswerMessageType,
    DecryptedChallengeMessageType,
    DecryptedChallengeRequestMessageType,
    DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    DecryptedChallengeVerificationMessageType
} from "./pubsub-messages/types.js";

export type ProtocolVersion = z.infer<typeof ProtocolVersionSchema>;
export type ChainTicker = "eth" | "matic" | "avax" | "sol";
export type ChainProvider = { urls: string[]; chainId: number };
export interface PlebbitOptions {
    // Options as inputted by user
    ipfsGatewayUrls?: string[];
    ipfsHttpClientsOptions?: (IpfsHttpClientOptions | string)[];
    pubsubHttpClientsOptions?: (IpfsHttpClientOptions | string)[];
    plebbitRpcClientsOptions?: string[]; // Optional websocket URLs of plebbit RPC servers, required to run a sub from a browser/electron/webview
    dataPath?: string;
    chainProviders?: Partial<Record<ChainTicker, ChainProvider>>;
    resolveAuthorAddresses?: boolean;
    // Options for tests only. Should not be used in production
    publishInterval?: number; // in ms, the time to wait for subplebbit instances to publish updates
    updateInterval?: number; // in ms, the time to wait for comment/subplebbit instances to check for updates
    noData?: boolean; // if true, dataPath is ignored, all database and cache data is saved in memory
    browserLibp2pJsPublish?: boolean; // if true and on browser, it will bootstrap pubsub through libp2p instead of relying on pubsub providers
}

export interface ParsedPlebbitOptions
    extends Required<
        Omit<PlebbitOptions, "ipfsHttpClientsOptions" | "pubsubHttpClientsOptions" | "plebbitRpcClientsOptions" | "dataPath">
    > {
    // These will be the final options after parsing/processing
    ipfsHttpClientsOptions: IpfsHttpClientOptions[] | undefined;
    pubsubHttpClientsOptions: IpfsHttpClientOptions[] | undefined;
    plebbitRpcClientsOptions: string[] | undefined;
    // ChainTicker -> ChainProvider
    chainProviders: Partial<Record<ChainTicker, ChainProvider>>; // chain providers could be empty if we're using rpc
    dataPath: string | undefined;
}

export type LocalPublicationProps = LocalCommentOptions | LocalVoteOptions | LocalCommentEditOptions;

export type AuthorPubsubType = z.infer<typeof AuthorPubsubSchema>;

export type AuthorTypeWithCommentUpdate = z.infer<typeof AuthorWithOptionalCommentUpdate>;

export type PublicationPubsubMessage = CommentPubsubMessage | VotePubsubMessage | CommentEditPubsubMessage;

// creating a new local publication
export type CreatePublicationOptions = z.infer<typeof CreatePublicationUserOptionsSchema>;

//*********************
//* "Edit" publications
//*********************

export type Nft = z.infer<typeof AuthorAvatarNftSchema>;

export type AuthorTypeJson = (AuthorPubsubType | AuthorTypeWithCommentUpdate) & { shortAddress: string };

export type PublicationTypeName = "comment" | "vote" | "commentedit" | "subplebbit" | "commentupdate";

export type NativeFunctions = {
    fetch: typeof fetch;
};

// Define database tables and fields here

export type CommentsTableRow = z.infer<typeof CommentsTableRowSchema>;

export interface CommentsTableRowInsert extends Omit<CommentsTableRow, "id" | "insertedAt"> {}

// CommentUpdates table

export interface CommentUpdatesRow extends CommentUpdate {
    insertedAt: number;
    ipfsPath: string;
}

export interface CommentUpdatesTableRowInsert extends Omit<CommentUpdatesRow, "insertedAt"> {}

// Votes table

export interface VotesTableRow extends VotePubsubMessage {
    authorAddress: AuthorPubsubType["address"];
    insertedAt: number;
    authorSignerAddress: SignerType["address"];
}

export interface VotesTableRowInsert extends Omit<VotesTableRow, "insertedAt"> {}

// Comment edits table

export interface CommentEditsTableRow extends CommentEditPubsubMessage {
    authorAddress: AuthorPubsubType["address"];
    insertedAt: number;
    isAuthorEdit: boolean; // If false, then mod edit
    authorSignerAddress: string;
}

export interface CommentEditsTableRowInsert extends Omit<CommentEditsTableRow, "insertedAt"> {}

// Setting up the types of tables here so we can utilize auto completion in queries
declare module "knex/types/tables" {
    interface Tables {
        comments: Knex.CompositeTableType<CommentsTableRow, CommentsTableRowInsert>;
        commentUpdates: Knex.CompositeTableType<
            CommentUpdatesRow,
            CommentUpdatesTableRowInsert,
            Omit<CommentUpdatesTableRowInsert, "cid">,
            Omit<CommentUpdatesTableRowInsert, "cid">
        >;
        votes: Knex.CompositeTableType<VotesTableRow, VotesTableRowInsert>;
        commentEdits: Knex.CompositeTableType<CommentEditsTableRow, CommentEditsTableRowInsert>;
    }
}

// Event emitter declaration
export interface SubplebbitEvents {
    challengerequest: (request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor) => void;
    challenge: (challenge: DecryptedChallengeMessageType) => void;
    challengeanswer: (answer: DecryptedChallengeAnswerMessageType) => void;
    challengeverification: (verification: DecryptedChallengeVerificationMessageType) => void;

    error: (error: PlebbitError) => void;

    // State changes
    statechange: (newState: RemoteSubplebbit["state"]) => void;
    updatingstatechange: (newState: RemoteSubplebbit["updatingState"]) => void;
    startedstatechange: (newState: RpcLocalSubplebbit["startedState"]) => void;

    update: (updatedSubplebbit: RemoteSubplebbit) => void;
}

export interface PublicationEvents {
    challengerequest: (request: DecryptedChallengeRequestMessageType) => void;
    challenge: (challenge: DecryptedChallengeMessageType) => void;
    challengeanswer: (answer: DecryptedChallengeAnswerMessageType) => void;
    challengeverification: (verification: DecryptedChallengeVerificationMessageType, decryptedComment?: Comment) => void; // Should we include the updated publication instance here? not sure
    error: (error: PlebbitError) => void;

    // State changes
    publishingstatechange: (newState: Publication["publishingState"]) => void;
    statechange: (newState: Publication["state"]) => void;

    // For comment only
    update: (updatedInstance: Comment) => void;
    updatingstatechange: (newState: Comment["updatingState"]) => void;
}

export interface PlebbitEvents {
    error: (error: PlebbitError) => void;
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

export interface IpfsClient {
    peers: () => ReturnType<IpfsClient["_client"]["swarm"]["peers"]>; // https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-swarm-peers
    stats?: undefined; // Should be defined, will change later
    sessionStats?: undefined; // Should be defined, will change later
    subplebbitStats?: undefined; // Should be defined, will change later
    _client: ReturnType<typeof CreateIpfsClient>; // Private API, shouldn't be used by consumers
    _clientOptions: IpfsHttpClientOptions;
}

export type PubsubSubscriptionHandler = Extract<Parameters<IpfsClient["_client"]["pubsub"]["subscribe"]>[1], Function>;
export type IpfsHttpClientPubsubMessage = Parameters<PubsubSubscriptionHandler>["0"];
export interface PubsubClient {
    peers: () => Promise<string[]>; // IPFS peers https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-pubsub-peers
    stats?: undefined; // Should be defined, will change later
    sessionStats?: undefined; // Should be defined, will change later
    subplebbitStats?: undefined; // Should be defined, will change later
    _client: Pick<IpfsClient["_client"], "pubsub">; // Private API, shouldn't be used by consumers
    _clientOptions: IpfsClient["_clientOptions"];
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
    removeItem: (key: string) => Promise<boolean>;
    clear: () => Promise<void>;
    keys: () => Promise<string[]>;
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

// RPC types
export interface PlebbitWsServerSettings {
    plebbitOptions: PlebbitOptions;
}

export interface PlebbitWsServerSettingsSerialized {
    plebbitOptions: ParsedPlebbitOptions;
    challenges: Record<string, Omit<ChallengeFile, "getChallenge">>;
}
