import { create as CreateIpfsClient, Options as IpfsHttpClientOptions } from "kubo-rpc-client";
import { Knex } from "knex";
import { Comment } from "./comment.js";
import { CommentEditSignedPropertyNamesUnion, CommentSignedPropertyNamesUnion, EncodedPubsubSignature, Encrypted, EncryptedEncoded, JsonSignature, PubsubSignature, SignerType, VoteSignedPropertyNamesUnion } from "./signer/constants.js";
import Publication from "./publication.js";
import { PlebbitError } from "./plebbit-error.js";
import { ChallengeFile, Flair } from "./subplebbit/types.js";
import { Plebbit } from "./plebbit.js";
import { RemoteSubplebbit } from "./subplebbit/remote-subplebbit.js";
export type ProtocolVersion = "1.0.0";
export type Chain = "eth" | "matic" | "avax";
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
    chainProviders?: {
        [chainTicker: string]: ChainProvider;
    };
    resolveAuthorAddresses?: boolean;
    publishInterval?: number;
    updateInterval?: number;
    noData?: boolean;
    browserLibp2pJsPublish?: boolean;
}
export interface ParsedPlebbitOptions extends Required<PlebbitOptions> {
    ipfsHttpClientsOptions: IpfsHttpClientOptions[] | undefined;
    pubsubHttpClientsOptions: IpfsHttpClientOptions[] | undefined;
    plebbitRpcClientsOptions: string[] | undefined;
    dataPath: string | undefined;
}
export interface PageType {
    comments: Comment[];
    nextCid?: string;
}
export interface PageTypeJson {
    comments: CommentWithCommentUpdate[];
    nextCid?: string;
}
export interface PageIpfs extends Omit<PageType, "comments"> {
    comments: {
        comment: CommentIpfsWithCid;
        update: CommentUpdate;
    }[];
}
export interface PagesType {
    pages: Partial<Record<PostSortName | ReplySortName, PageType>>;
    pageCids: Partial<Record<PostSortName | ReplySortName, string>>;
}
export interface PagesTypeJson {
    pages: Partial<Record<PostSortName | ReplySortName, PageTypeJson>>;
    pageCids: Partial<Record<PostSortName | ReplySortName, string>>;
}
export interface RepliesPagesTypeJson extends PagesTypeJson {
    pages: Partial<Record<ReplySortName, PageTypeJson>>;
    pageCids: Partial<Record<ReplySortName, string>>;
}
export interface PostsPagesTypeJson extends PagesTypeJson {
    pages: Partial<Record<PostSortName, PageTypeJson>>;
    pageCids: Partial<Record<PostSortName, string>>;
}
export interface PagesTypeIpfs {
    pages: Partial<Record<PostSortName | ReplySortName, PageIpfs>>;
    pageCids: Partial<Record<PostSortName | ReplySortName, string>>;
}
export interface CreateCommentOptions extends CreatePublicationOptions {
    signer: Pick<SignerType, "privateKey" | "type">;
    parentCid?: string;
    content?: string;
    title?: string;
    link?: string;
    linkWidth?: number;
    linkHeight?: number;
    spoiler?: boolean;
    flair?: Flair;
}
export interface CreateVoteOptions extends CreatePublicationOptions {
    commentCid: string;
    vote: 1 | 0 | -1;
    signer: Pick<SignerType, "privateKey" | "type">;
}
export interface VoteType extends Omit<CreateVoteOptions, "signer">, PublicationType {
    author: CommentIpfsType["author"];
    timestamp: number;
    signer?: SignerType;
}
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
    signature: JsonSignature;
};
export interface PublicationType extends Required<Omit<CreatePublicationOptions, "challengeAnswers" | "challengeCommentCids">>, Pick<CreatePublicationOptions, "challengeAnswers" | "challengeCommentCids"> {
    author: AuthorIpfsType;
    signature: JsonSignature;
    protocolVersion: ProtocolVersion;
}
export interface CreatePublicationOptions {
    author?: Partial<AuthorIpfsType>;
    subplebbitAddress: string;
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
export interface AuthorCommentEdit extends AuthorCommentEditOptions, Omit<PublicationType, "challengeAnswers" | "challengeCommentCids"> {
}
export interface ModeratorCommentEdit extends ModeratorCommentEditOptions, Omit<PublicationType, "challengeAnswers" | "challengeCommentCids"> {
}
export type CommentAuthorEditOptions = Pick<SubplebbitAuthor, "banExpiresAt" | "flair">;
export interface CreateCommentEditOptions extends AuthorCommentEdit, ModeratorCommentEdit {
    signer: SignerType | Pick<SignerType, "privateKey" | "type">;
}
export type Nft = {
    chainTicker: string;
    address: string;
    id: string;
    timestamp: number;
    signature: JsonSignature;
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
}
export interface ChallengeRequestMessageType extends PubsubMessage {
    challengeRequestId: Uint8Array;
    type: "CHALLENGEREQUEST";
    encrypted: Encrypted;
    acceptedChallengeTypes?: string[];
}
export interface DecryptedChallengeRequest {
    publication: VotePubsubMessage | CommentEditPubsubMessage | CommentPubsubMessage | PostPubsubMessage;
    challengeAnswers: string[] | undefined;
    challengeCommentCids: string[] | undefined;
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
export type ChallengeRequestPostWithSubplebbitAuthor = PostPubsubMessage & {
    author: AuthorIpfsType & {
        subplebbit: SubplebbitAuthor | undefined;
    };
};
export interface DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor extends DecryptedChallengeRequestMessageType {
    publication: ChallengeRequestVoteWithSubplebbitAuthor | ChallengeRequestCommentEditWithSubplebbitAuthor | ChallengeRequestCommentWithSubplebbitAuthor | ChallengeRequestPostWithSubplebbitAuthor;
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
    replies?: PagesTypeIpfs;
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
export interface CommentType extends Partial<Omit<CommentUpdate, "author" | "replies">>, Omit<CreateCommentOptions, "signer"> {
    author: AuthorTypeWithCommentUpdate;
    timestamp: number;
    protocolVersion: ProtocolVersion;
    signature: JsonSignature;
    replies?: PagesTypeJson;
    postCid?: string;
    previousCid?: string;
    depth?: number;
    signer?: SignerType;
    original?: Pick<Partial<CommentType>, "author" | "content" | "flair" | "protocolVersion">;
    deleted?: CommentType["edit"]["deleted"];
    thumbnailUrl?: string;
    thumbnailUrlWidth?: number;
    thumbnailUrlHeight?: number;
    cid?: string;
    shortCid?: string;
    shortSubplebbitAddress: string;
}
export interface CommentWithCommentUpdate extends Omit<CommentType, "replyCount" | "downvoteCount" | "upvoteCount" | "replies" | "updatedAt" | "original" | "cid" | "shortCid" | "postCid" | "depth" | "signer">, Required<Pick<CommentType, "original" | "cid" | "postCid" | "depth" | "shortCid">>, Omit<CommentUpdate, "author" | "replies"> {
    replies?: PagesTypeJson;
}
export interface CommentIpfsType extends Omit<CreateCommentOptions, "signer" | "timestamp" | "author">, PublicationType, Pick<CommentType, "previousCid" | "postCid" | "thumbnailUrl" | "thumbnailUrlWidth" | "thumbnailUrlHeight">, Pick<Required<CommentType>, "depth"> {
    author: AuthorIpfsType;
}
export interface CommentIpfsWithCid extends Omit<CommentIpfsType, "cid" | "postCid">, Pick<CommentWithCommentUpdate, "cid" | "postCid"> {
}
export interface PostType extends Omit<CommentType, "parentCid" | "depth"> {
    depth: 0;
    parentCid: undefined;
}
export interface PostIpfsWithCid extends Omit<CommentIpfsType, "cid" | "postCid" | "depth" | "parentCid" | "title" | "link" | "thumbnailUrl" | "thumbnailUrlWidth" | "thumbnailUrlHeight">, Pick<CommentWithCommentUpdate, "cid" | "postCid">, Pick<PostType, "depth" | "parentCid" | "title" | "link" | "thumbnailUrl" | "thumbnailUrlWidth" | "thumbnailUrlHeight"> {
}
export interface CommentEditType extends PublicationType, Omit<CreateCommentEditOptions, "signer"> {
    author: CommentIpfsType["author"];
    signer?: SignerType;
}
export type PublicationTypeName = "comment" | "vote" | "commentedit" | "subplebbit" | "commentupdate";
export interface CommentPubsubMessage extends Pick<CommentType, CommentSignedPropertyNamesUnion | "signature" | "protocolVersion" | "flair" | "spoiler"> {
}
export interface PostPubsubMessage extends Pick<PostType, CommentSignedPropertyNamesUnion | "signature" | "protocolVersion" | "flair" | "spoiler"> {
}
export interface VotePubsubMessage extends Pick<VoteType, VoteSignedPropertyNamesUnion | "signature" | "protocolVersion"> {
}
export interface CommentEditPubsubMessage extends Pick<CommentEditType, CommentEditSignedPropertyNamesUnion | "signature" | "protocolVersion"> {
}
export type NativeFunctions = {
    fetch: typeof fetch;
};
export type OnlyDefinedProperties<T> = Pick<T, {
    [Prop in keyof T]: T[Prop] extends undefined ? never : Prop;
}[keyof T]>;
export interface CommentsTableRow extends Omit<CommentIpfsWithCid, "challengeAnswers" | "challengeCommentCids"> {
    authorAddress: AuthorIpfsType["address"];
    challengeRequestPublicationSha256: string;
    ipnsName?: string;
    id: number;
    insertedAt: number;
}
export interface CommentsTableRowInsert extends Omit<CommentsTableRow, "id" | "insertedAt"> {
}
export interface CommentUpdatesRow extends CommentUpdate {
    insertedAt: number;
    ipfsPath: string;
}
export interface CommentUpdatesTableRowInsert extends Omit<CommentUpdatesRow, "insertedAt"> {
}
export interface VotesTableRow extends Omit<VoteType, "challengeAnswers" | "challengeCommentCids"> {
    authorAddress: AuthorIpfsType["address"];
    insertedAt: number;
}
export interface VotesTableRowInsert extends Omit<VotesTableRow, "insertedAt"> {
}
export interface CommentEditsTableRow extends Omit<CommentEditType, "challengeAnswers" | "challengeCommentCids"> {
    authorAddress: AuthorIpfsType["address"];
    insertedAt: number;
    isAuthorEdit: boolean;
}
export interface CommentEditsTableRowInsert extends Omit<CommentEditsTableRow, "insertedAt"> {
}
declare module "knex/types/tables" {
    interface Tables {
        comments: Knex.CompositeTableType<CommentsTableRow, CommentsTableRowInsert, null, null>;
        commentUpdates: Knex.CompositeTableType<CommentUpdatesRow, CommentUpdatesTableRowInsert, Omit<CommentUpdatesTableRowInsert, "cid">, Omit<CommentUpdatesTableRowInsert, "cid">>;
        votes: Knex.CompositeTableType<VotesTableRow, VotesTableRowInsert, null>;
        commentEdits: Knex.CompositeTableType<CommentEditsTableRow, CommentEditsTableRowInsert, null, null>;
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
    startedstatechange: (newState: RemoteSubplebbit["startedState"]) => void;
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
    _clientOptions: Parameters<typeof CreateIpfsClient>[0];
}
export type PubsubSubscriptionHandler = Extract<Parameters<IpfsClient["_client"]["pubsub"]["subscribe"]>[1], Function>;
export type IpfsHttpClientPubsubMessage = Parameters<PubsubSubscriptionHandler>["0"];
export interface PubsubClient {
    peers: () => Promise<string[]>;
    stats?: undefined;
    sessionStats?: undefined;
    subplebbitStats?: undefined;
    _client: Pick<IpfsClient["_client"], "pubsub">;
    _clientOptions: IpfsHttpClientOptions;
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
    maxItems?: number;
    cacheName: LRUStorageCacheNames;
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
