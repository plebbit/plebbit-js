import { create as CreateIpfsClient, Options as IpfsHttpClientOptions } from "kubo-rpc-client";
import { Knex } from "knex";
import { Comment } from "./publications/comment/comment.js";
import { CommentEditSignedPropertyNamesUnion, CommentSignedPropertyNamesUnion, EncodedPubsubSignature, Encrypted, EncryptedEncoded, JsonSignature, PubsubSignature, SignerType, VoteSignedPropertyNamesUnion } from "./signer/constants.js";
import Publication from "./publications/publication.js";
import { PlebbitError } from "./plebbit-error.js";
import { ChallengeFile, Flair } from "./subplebbit/types.js";
import { Plebbit } from "./plebbit.js";
import { RemoteSubplebbit } from "./subplebbit/remote-subplebbit.js";
import { RpcLocalSubplebbit } from "./subplebbit/rpc-local-subplebbit.js";
export type ProtocolVersion = "1.0.0";
export type ChainTicker = "eth" | "matic" | "avax" | "sol";
export type ChainProvider = {
    urls: string[];
    chainId: number;
};
export interface PlebbitOptions {
    ipfsGatewayUrls?: string[];
    ipfsHttpClientsOptions?: (IpfsHttpClientOptions | string)[];
    pubsubHttpClientsOptions?: (IpfsHttpClientOptions | string)[];
    plebbitRpcClientsOptions?: string[];
    dataPath?: string;
    chainProviders?: Partial<Record<ChainTicker, ChainProvider>>;
    resolveAuthorAddresses?: boolean;
    publishInterval?: number;
    updateInterval?: number;
    noData?: boolean;
    browserLibp2pJsPublish?: boolean;
}
export interface ParsedPlebbitOptions extends Required<Omit<PlebbitOptions, "ipfsHttpClientsOptions" | "pubsubHttpClientsOptions" | "plebbitRpcClientsOptions" | "dataPath">> {
    ipfsHttpClientsOptions: IpfsHttpClientOptions[] | undefined;
    pubsubHttpClientsOptions: IpfsHttpClientOptions[] | undefined;
    plebbitRpcClientsOptions: string[] | undefined;
    chainProviders: Partial<Record<ChainTicker, ChainProvider>>;
    dataPath: string | undefined;
}
export interface PageInstanceType {
    comments: Comment[];
    nextCid?: string;
}
export interface PageTypeJson {
    comments: CommentWithCommentUpdateJson[];
    nextCid?: string;
}
export interface PageIpfs {
    comments: {
        comment: CommentIpfsWithCid;
        update: CommentUpdate;
    }[];
    nextCid?: string;
}
export interface PagesInstanceType {
    pages: Partial<Record<PostSortName | ReplySortName, PageInstanceType>>;
    pageCids: Record<PostSortName | ReplySortName, string> | {};
}
export interface PagesTypeJson {
    pages: RepliesPagesTypeJson["pages"] | PostsPagesTypeJson["pages"];
    pageCids: RepliesPagesTypeJson["pageCids"] | PostsPagesTypeJson["pageCids"];
}
export interface RepliesPagesTypeJson {
    pages: Partial<Record<ReplySortName, PageTypeJson>>;
    pageCids: Record<ReplySortName, string>;
}
export interface PostsPagesTypeJson {
    pages: Partial<Record<PostSortName, PageTypeJson>>;
    pageCids: Record<PostSortName, string>;
}
export interface RepliesPagesTypeIpfs {
    pages: Partial<Record<ReplySortName, PageIpfs>>;
    pageCids: Record<ReplySortName, string>;
}
export interface PostsPagesTypeIpfs {
    pages: Partial<Record<PostSortName, PageIpfs>>;
    pageCids: Record<PostSortName, string>;
}
export type PagesTypeIpfs = RepliesPagesTypeIpfs | PostsPagesTypeIpfs;
export interface CreateCommentOptions extends CreatePublicationOptions {
    parentCid?: string;
    content?: string;
    title?: string;
    link?: string;
    linkWidth?: number;
    linkHeight?: number;
    spoiler?: boolean;
    flair?: Flair;
    linkHtmlTagName?: "a" | "img" | "video" | "audio";
}
export interface CommentOptionsToSign extends CreateCommentOptions {
    signer: SignerType;
    timestamp: number;
    author: AuthorIpfsType;
    protocolVersion: ProtocolVersion;
}
export type LocalPublicationProps = LocalCommentOptions | LocalVoteOptions | LocalCommentEditOptions;
export interface CreateVoteOptions extends CreatePublicationOptions {
    commentCid: string;
    vote: 1 | 0 | -1;
    signer: Pick<SignerType, "privateKey" | "type">;
}
export interface VoteOptionsToSign extends CreateVoteOptions {
    signer: SignerType;
    timestamp: number;
    author: AuthorIpfsType;
    protocolVersion: ProtocolVersion;
}
export type LocalCommentOptions = CommentOptionsToSign & {
    signature: JsonSignature;
} & Pick<CreatePublicationOptions, "challengeAnswers" | "challengeCommentCids">;
export type LocalVoteOptions = VoteOptionsToSign & {
    signature: JsonSignature;
} & Pick<CreatePublicationOptions, "challengeAnswers" | "challengeCommentCids">;
export type LocalCommentEditOptions = CommentEditOptionsToSign & {
    signature: JsonSignature;
} & Pick<CreatePublicationOptions, "challengeAnswers" | "challengeCommentCids">;
export interface SubplebbitAuthor {
    postScore: number;
    replyScore: number;
    banExpiresAt?: number;
    flair?: Flair;
    firstCommentTimestamp: number;
    lastCommentCid: string;
}
export interface AuthorIpfsType {
    address: string;
    previousCommentCid?: string;
    displayName?: string;
    wallets?: {
        [chainTicker: string]: Wallet;
    };
    avatar?: Nft;
    flair?: Flair;
}
export interface AuthorTypeWithCommentUpdate extends AuthorIpfsType {
    subplebbit?: SubplebbitAuthor;
}
export type Wallet = {
    address: string;
    timestamp: number;
    signature: {
        signature: "0x${string}";
        type: "eip191";
    };
};
export type PublicationPubsubMessage = CommentPubsubMessage | VotePubsubMessage | CommentEditPubsubMessage;
export interface CreatePublicationOptions {
    signer: Pick<SignerType, "privateKey" | "type">;
    author?: Partial<AuthorIpfsType>;
    subplebbitAddress: string;
    protocolVersion?: ProtocolVersion;
    timestamp?: number;
    challengeAnswers?: string[];
    challengeCommentCids?: string[];
}
export interface ModeratorCommentEditOptions {
    commentCid: string;
    flair?: Flair;
    spoiler?: boolean;
    pinned?: boolean;
    locked?: boolean;
    removed?: boolean;
    reason?: string;
    commentAuthor?: CommentAuthorEditOptions;
}
export interface AuthorCommentEditOptions {
    commentCid: string;
    content?: string;
    deleted?: boolean;
    flair?: Flair;
    spoiler?: boolean;
    reason?: string;
}
export interface CreateCommentEditOptions extends AuthorCommentEditOptions, ModeratorCommentEditOptions, CreatePublicationOptions {
}
export interface AuthorCommentEdit extends AuthorCommentEditOptions {
    signature: JsonSignature;
    author: AuthorIpfsType;
    protocolVersion: ProtocolVersion;
    subplebbitAddress: string;
    timestamp: number;
}
export interface ModeratorCommentEdit extends ModeratorCommentEditOptions {
    signature: JsonSignature;
    author: AuthorIpfsType;
    protocolVersion: ProtocolVersion;
    subplebbitAddress: string;
    timestamp: number;
}
export type CommentAuthorEditOptions = Pick<SubplebbitAuthor, "banExpiresAt" | "flair">;
export interface CommentEditOptionsToSign extends CreateCommentEditOptions {
    signer: SignerType;
    timestamp: number;
    author: AuthorIpfsType;
    protocolVersion: ProtocolVersion;
}
export type Nft = {
    chainTicker: string;
    address: string;
    id: string;
    timestamp: number;
    signature: {
        signature: "0x${string}";
        type: "eip191";
    };
};
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
    caseInsensitive?: boolean;
}
export interface ChallengeRequestMessageType extends PubsubMessage {
    challengeRequestId: Uint8Array;
    type: "CHALLENGEREQUEST";
    encrypted: Encrypted;
    acceptedChallengeTypes?: string[];
}
export interface DecryptedChallengeRequest {
    publication: VotePubsubMessage | CommentEditPubsubMessage | CommentPubsubMessage;
    challengeAnswers: string[] | undefined;
    challengeCommentCids: string[] | undefined;
}
export interface DecryptedChallengeRequestComment extends DecryptedChallengeRequest {
    publication: CommentPubsubMessage;
}
export interface DecryptedChallengeRequestCommentEdit extends DecryptedChallengeRequest {
    publication: CommentEditPubsubMessage;
}
export interface DecryptedChallengeRequestVote extends DecryptedChallengeRequest {
    publication: VotePubsubMessage;
}
export interface DecryptedChallengeRequestMessageType extends ChallengeRequestMessageType, DecryptedChallengeRequest {
}
export type ChallengeRequestVoteWithSubplebbitAuthor = VotePubsubMessage & {
    author: AuthorIpfsType & {
        subplebbit: SubplebbitAuthor | undefined;
    };
};
export type ChallengeRequestCommentEditWithSubplebbitAuthor = CommentEditPubsubMessage & {
    author: AuthorIpfsType & {
        subplebbit: SubplebbitAuthor | undefined;
    };
};
export type ChallengeRequestCommentWithSubplebbitAuthor = CommentPubsubMessage & {
    author: AuthorIpfsType & {
        subplebbit: SubplebbitAuthor | undefined;
    };
};
export interface DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor extends DecryptedChallengeRequestMessageType {
    publication: ChallengeRequestVoteWithSubplebbitAuthor | ChallengeRequestCommentEditWithSubplebbitAuthor | ChallengeRequestCommentWithSubplebbitAuthor;
}
export interface EncodedDecryptedChallengeRequestMessageType extends Omit<DecryptedChallengeRequestMessageType, "challengeRequestId" | "encrypted" | "signature">, BaseEncodedPubsubMessage {
    encrypted: EncryptedEncoded;
}
export interface EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor extends Omit<EncodedDecryptedChallengeRequestMessageType, "publication">, Pick<DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, "publication"> {
}
export interface ChallengeMessageType extends PubsubMessage {
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    type: "CHALLENGE";
    encrypted: Encrypted;
}
export interface DecryptedChallenge {
    challenges: ChallengeType[];
}
export interface DecryptedChallengeMessageType extends ChallengeMessageType, DecryptedChallenge {
}
export interface EncodedDecryptedChallengeMessageType extends Omit<DecryptedChallengeMessageType, "challengeRequestId" | "encrypted" | "signature">, BaseEncodedPubsubMessage {
    encrypted: EncryptedEncoded;
}
export interface ChallengeAnswerMessageType extends PubsubMessage {
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    type: "CHALLENGEANSWER";
    encrypted: Encrypted;
}
export interface DecryptedChallengeAnswer {
    challengeAnswers: string[];
}
export interface DecryptedChallengeAnswerMessageType extends ChallengeAnswerMessageType, DecryptedChallengeAnswer {
}
export interface BaseEncodedPubsubMessage {
    challengeRequestId: string;
    signature: EncodedPubsubSignature;
}
export interface EncodedDecryptedChallengeAnswerMessageType extends Omit<DecryptedChallengeAnswerMessageType, "challengeRequestId" | "encrypted" | "signature">, BaseEncodedPubsubMessage {
    encrypted: EncryptedEncoded;
}
export interface ChallengeVerificationMessageType extends PubsubMessage {
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    type: "CHALLENGEVERIFICATION";
    challengeSuccess: boolean;
    challengeErrors?: (string | undefined)[];
    reason?: string;
    encrypted?: Encrypted;
}
export interface DecryptedChallengeVerification {
    publication: CommentIpfsWithCid | undefined;
}
export interface DecryptedChallengeVerificationMessageType extends ChallengeVerificationMessageType, DecryptedChallengeVerification {
}
export interface DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor extends DecryptedChallengeVerificationMessageType {
    publication: (CommentIpfsWithCid & {
        author: CommentIpfsWithCid["author"] & {
            subplebbit: SubplebbitAuthor;
        };
    }) | undefined;
}
export interface EncodedDecryptedChallengeVerificationMessageType extends Omit<DecryptedChallengeVerificationMessageType, "challengeRequestId" | "encrypted" | "signature">, BaseEncodedPubsubMessage {
    encrypted?: EncryptedEncoded;
}
export interface EncodedDecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor extends Omit<EncodedDecryptedChallengeVerificationMessageType, "publication">, Pick<DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor, "publication"> {
}
export type Timeframe = "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR" | "ALL";
export type PostSortName = "hot" | "new" | "topHour" | "topDay" | "topWeek" | "topMonth" | "topYear" | "topAll" | "controversialHour" | "controversialDay" | "controversialWeek" | "controversialMonth" | "controversialYear" | "controversialAll" | "active";
export type ReplySortName = "topAll" | "new" | "old" | "controversialAll";
export type SortProps = {
    score: (comment: {
        comment: CommentsTableRow;
        update: CommentUpdatesRow;
    }) => number;
    timeframe?: Timeframe;
};
export type PostSort = Record<PostSortName, SortProps>;
export type ReplySort = Record<ReplySortName, SortProps>;
export interface CommentUpdate {
    cid: string;
    upvoteCount: number;
    downvoteCount: number;
    replyCount: number;
    edit?: AuthorCommentEdit;
    replies?: RepliesPagesTypeIpfs;
    flair?: Flair;
    spoiler?: boolean;
    pinned?: boolean;
    locked?: boolean;
    removed?: boolean;
    reason?: string;
    updatedAt: number;
    protocolVersion: ProtocolVersion;
    author?: {
        subplebbit: SubplebbitAuthor;
    };
    lastChildCid?: string;
    lastReplyTimestamp?: number;
    signature: JsonSignature;
}
export interface CommentWithCommentUpdateJson extends CommentIpfsWithCid, Omit<CommentUpdate, "author" | "replies">, CommentTypeJsonBase {
    replies?: RepliesPagesTypeJson;
    original: Pick<CommentPubsubMessage, "author" | "content" | "flair" | "protocolVersion">;
    shortCid: string;
    author: AuthorTypeWithCommentUpdate & {
        shortAddress: string;
    };
    deleted?: boolean;
}
export interface CommentIpfsType extends CommentPubsubMessage {
    depth: number;
    postCid?: string;
    thumbnailUrl?: string;
    thumbnailUrlWidth?: number;
    thumbnailUrlHeight?: number;
    previousCid?: string;
}
export interface CommentIpfsWithCid extends Omit<CommentIpfsType, "cid" | "postCid"> {
    cid: CommentUpdate["cid"];
    postCid: CommentUpdate["cid"];
}
export interface CommentEditTypeJson extends CommentEditPubsubMessage {
    shortSubplebbitAddress: string;
    author: AuthorTypeJson;
}
export type AuthorTypeJson = (AuthorIpfsType | AuthorTypeWithCommentUpdate) & {
    shortAddress: string;
};
export interface VoteTypeJson extends VotePubsubMessage {
    shortSubplebbitAddress: string;
    author: AuthorTypeJson;
}
export type PublicationTypeName = "comment" | "vote" | "commentedit" | "subplebbit" | "commentupdate";
export type CommentPubsubMessage = Pick<LocalCommentOptions, CommentSignedPropertyNamesUnion | "signature" | "protocolVersion">;
export interface VotePubsubMessage extends Pick<LocalVoteOptions, VoteSignedPropertyNamesUnion | "signature" | "protocolVersion"> {
}
export interface CommentEditPubsubMessage extends Pick<LocalCommentEditOptions, CommentEditSignedPropertyNamesUnion | "signature" | "protocolVersion"> {
}
export type NativeFunctions = {
    fetch: typeof fetch;
};
export type OnlyDefinedProperties<T> = Pick<T, {
    [Prop in keyof T]: T[Prop] extends undefined ? never : Prop;
}[keyof T]>;
type CommentTypeJsonBase = {
    shortSubplebbitAddress: string;
};
interface CommentTypeJsonBeforeChallengeVerification extends CommentPubsubMessage, CommentTypeJsonBase {
    author: CommentPubsubMessage["author"] & {
        shortAddress: string;
    };
}
interface CommentTypeJsonAfterChallengeVerificationNoCommentUpdate extends CommentIpfsWithCid, CommentTypeJsonBase {
    shortCid: string;
    author: CommentIpfsWithCid["author"] & {
        shortAddress: string;
    };
}
export type CommentTypeJson = CommentWithCommentUpdateJson | CommentTypeJsonAfterChallengeVerificationNoCommentUpdate | CommentTypeJsonBeforeChallengeVerification;
export interface CommentsTableRow extends CommentIpfsWithCid {
    authorAddress: AuthorIpfsType["address"];
    challengeRequestPublicationSha256: string;
    ipnsName?: string;
    id: number;
    insertedAt: number;
    authorSignerAddress: string;
}
export interface CommentsTableRowInsert extends Omit<CommentsTableRow, "id" | "insertedAt"> {
}
export interface CommentUpdatesRow extends CommentUpdate {
    insertedAt: number;
    ipfsPath: string;
}
export interface CommentUpdatesTableRowInsert extends Omit<CommentUpdatesRow, "insertedAt"> {
}
export interface VotesTableRow extends VotePubsubMessage {
    authorAddress: AuthorIpfsType["address"];
    insertedAt: number;
    authorSignerAddress: string;
}
export interface VotesTableRowInsert extends Omit<VotesTableRow, "insertedAt"> {
}
export interface CommentEditsTableRow extends CommentEditPubsubMessage {
    authorAddress: AuthorIpfsType["address"];
    insertedAt: number;
    isAuthorEdit: boolean;
    authorSignerAddress: string;
}
export interface CommentEditsTableRowInsert extends Omit<CommentEditsTableRow, "insertedAt"> {
}
declare module "knex/types/tables" {
    interface Tables {
        comments: Knex.CompositeTableType<CommentsTableRow, CommentsTableRowInsert>;
        commentUpdates: Knex.CompositeTableType<CommentUpdatesRow, CommentUpdatesTableRowInsert, Omit<CommentUpdatesTableRowInsert, "cid">, Omit<CommentUpdatesTableRowInsert, "cid">>;
        votes: Knex.CompositeTableType<VotesTableRow, VotesTableRowInsert>;
        commentEdits: Knex.CompositeTableType<CommentEditsTableRow, CommentEditsTableRowInsert>;
    }
}
export interface SubplebbitEvents {
    challengerequest: (request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor) => void;
    challenge: (challenge: DecryptedChallengeMessageType) => void;
    challengeanswer: (answer: DecryptedChallengeAnswerMessageType) => void;
    challengeverification: (verification: DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor) => void;
    error: (error: PlebbitError) => void;
    statechange: (newState: RemoteSubplebbit["state"]) => void;
    updatingstatechange: (newState: RemoteSubplebbit["updatingState"]) => void;
    startedstatechange: (newState: RpcLocalSubplebbit["startedState"]) => void;
    update: (updatedSubplebbit: RemoteSubplebbit) => void;
}
export interface PublicationEvents {
    challengerequest: (request: DecryptedChallengeRequestMessageType) => void;
    challenge: (challenge: DecryptedChallengeMessageType) => void;
    challengeanswer: (answer: DecryptedChallengeAnswerMessageType) => void;
    challengeverification: (verification: DecryptedChallengeVerificationMessageType, decryptedComment?: Comment) => void;
    error: (error: PlebbitError) => void;
    publishingstatechange: (newState: Publication["publishingState"]) => void;
    statechange: (newState: Publication["state"]) => void;
    update: (updatedInstance: Comment) => void;
    updatingstatechange: (newState: Comment["updatingState"]) => void;
}
export interface PlebbitEvents {
    error: (error: PlebbitError) => void;
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
export interface IpfsClient {
    peers: () => ReturnType<IpfsClient["_client"]["swarm"]["peers"]>;
    stats?: undefined;
    sessionStats?: undefined;
    subplebbitStats?: undefined;
    _client: ReturnType<typeof CreateIpfsClient>;
    _clientOptions: IpfsHttpClientOptions;
}
export type PubsubSubscriptionHandler = Extract<Parameters<IpfsClient["_client"]["pubsub"]["subscribe"]>[1], Function>;
export type IpfsHttpClientPubsubMessage = Parameters<PubsubSubscriptionHandler>["0"];
export interface PubsubClient {
    peers: () => Promise<string[]>;
    stats?: undefined;
    sessionStats?: undefined;
    subplebbitStats?: undefined;
    _client: Pick<IpfsClient["_client"], "pubsub">;
    _clientOptions: IpfsClient["_clientOptions"];
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
    removeItem: (key: string) => Promise<boolean>;
    clear: () => Promise<void>;
    keys: () => Promise<string[]>;
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
export interface PlebbitWsServerSettings {
    plebbitOptions: PlebbitOptions;
}
export interface PlebbitWsServerSettingsSerialized {
    plebbitOptions: ParsedPlebbitOptions;
    challenges: Record<string, Omit<ChallengeFile, "getChallenge">>;
}
export {};
