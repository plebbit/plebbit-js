import { create as CreateIpfsClient, Options as IpfsHttpClientOptions } from "kubo-rpc-client";
import { Knex } from "knex";
import { Comment } from "./publications/comment/comment.js";
import type Publication from "./publications/publication.js";
import type { PlebbitError } from "./plebbit-error.js";
import type { ChallengeFile, Flair } from "./subplebbit/types.js";
import type { Plebbit } from "./plebbit.js";
import type { RemoteSubplebbit } from "./subplebbit/remote-subplebbit.js";
import type { RpcLocalSubplebbit } from "./subplebbit/rpc-local-subplebbit.js";
import {
    AuthorAvatarNftSchema,
    AuthorPubsubSchema,
    CreatePublicationUserOptionsSchema,
    PageIpfsSchema,
    ProtocolVersionSchema,
    RepliesPagesIpfsSchema,
    RepliesPagesJsonSchema,
    ReplySortNameSchema
} from "./schema/schema.js";
import { z } from "zod";
import type {
    CommentSignedPropertyNamesUnion,
    EncodedPubsubSignature,
    Encrypted,
    EncryptedEncoded,
    JsonSignature,
    PubsubSignature,
    SignerType
} from "./signer/types.js";
import {
    AuthorCommentEdit,
    ChallengeRequestCommentEditWithSubplebbitAuthor,
    CommentEditPubsubMessage,
    LocalCommentEditOptions
} from "./publications/comment-edit/types.js";
import { ChallengeRequestVoteWithSubplebbitAuthor, LocalVoteOptions, VotePubsubMessage } from "./publications/vote/types.js";
import {
    CommentIpfsWithCid,
    CommentPubsubMessage,
    CommentUpdate,
    CommentWithCommentUpdateJson,
    LocalCommentOptions,
    SubplebbitAuthor
} from "./publications/comment/types.js";

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

export interface PageInstanceType {
    comments: Comment[]; // TODO should be a comment instance with defined cid and other CommentWithCommentUpdateJson props
    nextCid?: string;
}

export interface PageTypeJson {
    comments: CommentWithCommentUpdateJson[];
    nextCid?: string;
}

export type PageIpfs = z.infer<typeof PageIpfsSchema>;

export interface PagesInstanceType {
    pages: Partial<Record<PostSortName | ReplySortName, PageInstanceType>>;
    pageCids: Record<PostSortName | ReplySortName, string> | {}; // defaults to empty if page instance is not initialized yet
}

export interface PagesTypeJson {
    pages: RepliesPagesTypeJson["pages"] | PostsPagesTypeJson["pages"];
    pageCids: RepliesPagesTypeJson["pageCids"] | PostsPagesTypeJson["pageCids"];
}

export interface PostsPagesTypeJson {
    pages: Partial<Record<PostSortName, PageTypeJson>>;
    pageCids: Record<PostSortName, string>;
}

export type RepliesPagesTypeIpfs = z.infer<typeof RepliesPagesIpfsSchema>;

export type RepliesPagesTypeJson = z.infer<typeof RepliesPagesJsonSchema>;

export interface PostsPagesTypeIpfs {
    pages: Partial<Record<PostSortName, PageIpfs>>;
    pageCids: Record<PostSortName, string>;
}

export type PagesTypeIpfs = RepliesPagesTypeIpfs | PostsPagesTypeIpfs;

export type LocalPublicationProps = LocalCommentOptions | LocalVoteOptions | LocalCommentEditOptions;

export type AuthorPubsubType = z.infer<typeof AuthorPubsubSchema>;

export interface AuthorTypeWithCommentUpdate extends AuthorPubsubType {
    subplebbit?: SubplebbitAuthor; // (added by CommentUpdate) up to date author properties specific to the subplebbit it's in
}

export type PublicationPubsubMessage = CommentPubsubMessage | VotePubsubMessage | CommentEditPubsubMessage;

// creating a new local publication
export type CreatePublicationOptions = z.infer<typeof CreatePublicationUserOptionsSchema>;

//*********************
//* "Edit" publications
//*********************

export type Nft = z.infer<typeof AuthorAvatarNftSchema>;

export interface PubsubMessage {
    type: "CHALLENGEREQUEST" | "CHALLENGE" | "CHALLENGEANSWER" | "CHALLENGEVERIFICATION";
    signature: PubsubSignature;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    timestamp: number;
}

export interface ChallengeType {
    challenge: string;
    type: "image/png" | "text/plain" | "chain/<chainTicker>";
    caseInsensitive?: boolean; // challenge answer capitalization is ignored, informational only option added by the challenge file
}

export interface ChallengeRequestMessageType extends PubsubMessage {
    challengeRequestId: Uint8Array; // (byte string in cbor) // multihash of challengeRequestMessage.signature.publicKey, each challengeRequestMessage must use a new public key
    type: "CHALLENGEREQUEST";
    encrypted: Encrypted;
    acceptedChallengeTypes?: string[];
}

export interface DecryptedChallengeRequest {
    // ChallengeRequestMessage.encrypted.ciphertext decrypts to JSON, with these props
    publication: VotePubsubMessage | CommentEditPubsubMessage | CommentPubsubMessage;
    challengeAnswers: string[] | undefined; // some challenges might be included in subplebbit.challenges and can be pre-answered
    challengeCommentCids: string[] | undefined; // some challenges could require including comment cids in other subs, like friendly subplebbit karma challenges
}

export interface DecryptedChallengeRequestComment extends DecryptedChallengeRequest {
    publication: CommentPubsubMessage;
}

export interface DecryptedChallengeRequestMessageType extends ChallengeRequestMessageType, DecryptedChallengeRequest {}

export type ChallengeRequestCommentWithSubplebbitAuthor = CommentPubsubMessage & {
    author: AuthorPubsubType & { subplebbit: SubplebbitAuthor | undefined };
};

export interface DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor extends DecryptedChallengeRequestMessageType {
    // This interface will query author.subplebbit and embed it within publication.author
    // We may add author
    publication:
        | ChallengeRequestVoteWithSubplebbitAuthor
        | ChallengeRequestCommentEditWithSubplebbitAuthor
        | ChallengeRequestCommentWithSubplebbitAuthor;
}

export interface EncodedDecryptedChallengeRequestMessageType
    extends Omit<DecryptedChallengeRequestMessageType, "challengeRequestId" | "encrypted" | "signature">,
        BaseEncodedPubsubMessage {
    encrypted: EncryptedEncoded; // all base64 strings
}

export interface EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor
    extends Omit<EncodedDecryptedChallengeRequestMessageType, "publication">,
        Pick<DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, "publication"> {}

export interface ChallengeMessageType extends PubsubMessage {
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    type: "CHALLENGE";
    encrypted: Encrypted; // Will decrypt to {challenges: ChallengeType[]}
}

export interface DecryptedChallenge {
    challenges: ChallengeType[];
}

export interface DecryptedChallengeMessageType extends ChallengeMessageType, DecryptedChallenge {}

export interface EncodedDecryptedChallengeMessageType
    extends Omit<DecryptedChallengeMessageType, "challengeRequestId" | "encrypted" | "signature">,
        BaseEncodedPubsubMessage {
    encrypted: EncryptedEncoded; // all base64 strings
}

export interface ChallengeAnswerMessageType extends PubsubMessage {
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    type: "CHALLENGEANSWER";
    encrypted: Encrypted; // Will decrypt to {challengeAnswers: string[]}
}

export interface DecryptedChallengeAnswer {
    challengeAnswers: string[]; // for example ['2+2=4', '1+7=8']
}

export interface DecryptedChallengeAnswerMessageType extends ChallengeAnswerMessageType, DecryptedChallengeAnswer {}

export interface BaseEncodedPubsubMessage {
    challengeRequestId: string; // base64 string
    signature: EncodedPubsubSignature;
}

export interface EncodedDecryptedChallengeAnswerMessageType
    extends Omit<DecryptedChallengeAnswerMessageType, "challengeRequestId" | "encrypted" | "signature">,
        BaseEncodedPubsubMessage {
    encrypted: EncryptedEncoded; // all base64 strings
}

export interface ChallengeVerificationMessageType extends PubsubMessage {
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    type: "CHALLENGEVERIFICATION";
    challengeSuccess: boolean;
    challengeErrors?: (string | undefined)[];
    reason?: string;
    encrypted?: Encrypted; // Can be undefined if challengeSuccess is false or publication is of a vote/commentedit
}

export interface DecryptedChallengeVerification {
    publication: CommentIpfsWithCid | undefined; // Only comments receive new props after verification for now
    // signature: Signature // TODO: maybe include a signature from the sub owner eventually, need to define spec
}

export interface DecryptedChallengeVerificationMessageType extends ChallengeVerificationMessageType, DecryptedChallengeVerification {}

export interface DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor extends DecryptedChallengeVerificationMessageType {
    // This interface will query author.subplebbit and embed it within publication.author
    // We may add author
    publication:
        | (CommentIpfsWithCid & {
              author: CommentIpfsWithCid["author"] & { subplebbit: SubplebbitAuthor };
          })
        | undefined;
}

export interface EncodedDecryptedChallengeVerificationMessageType
    extends Omit<DecryptedChallengeVerificationMessageType, "challengeRequestId" | "encrypted" | "signature">,
        BaseEncodedPubsubMessage {
    encrypted?: EncryptedEncoded; // all base64 strings
}

export interface EncodedDecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor
    extends Omit<EncodedDecryptedChallengeVerificationMessageType, "publication">,
        Pick<DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor, "publication"> {}

export type Timeframe = "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR" | "ALL";

export type PostSortName =
    | "hot"
    | "new"
    | "topHour"
    | "topDay"
    | "topWeek"
    | "topMonth"
    | "topYear"
    | "topAll"
    | "controversialHour"
    | "controversialDay"
    | "controversialWeek"
    | "controversialMonth"
    | "controversialYear"
    | "controversialAll"
    | "active";
export type ReplySortName = z.infer<typeof ReplySortNameSchema>;

export type SortProps = {
    score: (comment: { comment: CommentsTableRow; update: CommentUpdatesRow }) => number;
    timeframe?: Timeframe;
};

export type PostSort = Record<PostSortName, SortProps>;

export type ReplySort = Record<ReplySortName, SortProps>;

export type AuthorTypeJson = (AuthorPubsubType | AuthorTypeWithCommentUpdate) & { shortAddress: string };

export type PublicationTypeName = "comment" | "vote" | "commentedit" | "subplebbit" | "commentupdate";

export type NativeFunctions = {
    fetch: typeof fetch;
};

export type OnlyDefinedProperties<T> = Pick<
    T,
    {
        [Prop in keyof T]: T[Prop] extends undefined ? never : Prop;
    }[keyof T]
>;

type CommentTypeJsonBase = {
    shortSubplebbitAddress: string;
};

interface CommentTypeJsonBeforeChallengeVerification extends CommentPubsubMessage, CommentTypeJsonBase {
    author: CommentPubsubMessage["author"] & { shortAddress: string };
}

interface CommentTypeJsonAfterChallengeVerificationNoCommentUpdate extends CommentIpfsWithCid, CommentTypeJsonBase {
    shortCid: string;
    author: CommentIpfsWithCid["author"] & { shortAddress: string };
}

export type CommentTypeJson =
    | CommentWithCommentUpdateJson
    | CommentTypeJsonAfterChallengeVerificationNoCommentUpdate
    | CommentTypeJsonBeforeChallengeVerification;

// Define database tables and fields here

export interface CommentsTableRow extends CommentIpfsWithCid {
    authorAddress: AuthorPubsubType["address"];
    challengeRequestPublicationSha256: string;
    ipnsName?: string;
    id: number;
    insertedAt: number;
    authorSignerAddress: string;
}

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
    challengeverification: (verification: DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor) => void;

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
