import { CID, IPFSHTTPClient, Options as IpfsHttpClientOptions } from "ipfs-http-client";
import { PeersResult } from "ipfs-core-types/src/swarm/index";
import { LsResult } from "ipfs-core-types/src/pin/index";
import { DbHandler } from "./runtime/node/db-handler";
import fetch from "node-fetch";
import { createCaptcha } from "captcha-canvas";
import { Key as IpfsKey } from "ipfs-core-types/types/src/key/index";
import { Knex } from "knex";
import { Comment } from "./comment";
import { CommentEditSignedPropertyNamesUnion, CommentSignedPropertyNamesUnion, EncodedPubsubSignature, Encrypted, EncryptedEncoded, JsonSignature, PubsubSignature, SignerType, VoteSignedPropertyNamesUnion } from "./signer/constants";
import { Subplebbit } from "./subplebbit/subplebbit";
import Publication from "./publication";
import { PlebbitError } from "./plebbit-error";
import { ChallengeFile, Flair } from "./subplebbit/types";
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
interface AuthorCommentEditOptions {
    commentCid: string;
    content?: string;
    deleted?: boolean;
    flair?: Flair;
    spoiler?: boolean;
    reason?: string;
}
export interface AuthorCommentEdit extends AuthorCommentEditOptions, PublicationType {
}
export interface ModeratorCommentEdit extends ModeratorCommentEditOptions, PublicationType {
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
export interface DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor extends DecryptedChallengeRequestMessageType {
    publication: (VotePubsubMessage | CommentEditPubsubMessage | CommentPubsubMessage | PostPubsubMessage) & {
        author: AuthorIpfsType & {
            subplebbit: SubplebbitAuthor | undefined;
        };
    };
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
    signature: JsonSignature;
    author?: {
        subplebbit: SubplebbitAuthor;
    };
    lastChildCid?: string;
    lastReplyTimestamp?: number;
}
export interface CommentType extends Partial<Omit<CommentUpdate, "author" | "replies">>, Omit<CreateCommentOptions, "signer"> {
    author: AuthorTypeWithCommentUpdate;
    timestamp: number;
    protocolVersion: ProtocolVersion;
    signature: JsonSignature;
    replies?: PagesTypeJson;
    postCid?: string;
    previousCid?: string;
    ipnsKeyName?: string;
    depth?: number;
    signer?: SignerType;
    original?: Pick<Partial<CommentType>, "author" | "content" | "flair" | "protocolVersion">;
    deleted?: CommentType["edit"]["deleted"];
    thumbnailUrl?: string;
    thumbnailUrlWidth?: number;
    thumbnailUrlHeight?: number;
    cid?: string;
    shortCid?: string;
    ipnsName?: string;
    shortSubplebbitAddress: string;
}
export interface CommentWithCommentUpdate extends Omit<CommentType, "replyCount" | "downvoteCount" | "upvoteCount" | "replies" | "updatedAt" | "original" | "cid" | "shortCid" | "postCid" | "depth" | "ipnsKeyName" | "signer">, Required<Pick<CommentType, "original" | "cid" | "postCid" | "depth" | "shortCid">>, Omit<CommentUpdate, "author" | "replies"> {
    replies?: PagesTypeJson;
}
export interface CommentIpfsType extends Omit<CreateCommentOptions, "signer" | "timestamp" | "author">, PublicationType, Pick<CommentType, "previousCid" | "postCid" | "thumbnailUrl" | "thumbnailUrlWidth" | "thumbnailUrlHeight">, Pick<Required<CommentType>, "depth" | "ipnsName"> {
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
export type PublicationTypeName = "comment" | "vote" | "commentedit" | "commentupdate" | "subplebbit";
export interface CommentPubsubMessage extends Pick<CommentType, CommentSignedPropertyNamesUnion | "signature" | "protocolVersion" | "flair" | "spoiler"> {
}
export interface PostPubsubMessage extends Pick<PostType, CommentSignedPropertyNamesUnion | "signature" | "protocolVersion" | "flair" | "spoiler"> {
}
export interface VotePubsubMessage extends Pick<VoteType, VoteSignedPropertyNamesUnion | "signature" | "protocolVersion"> {
}
export interface CommentEditPubsubMessage extends Pick<CommentEditType, CommentEditSignedPropertyNamesUnion | "signature" | "protocolVersion"> {
}
type FunctionPropertyOf<T> = {
    [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];
export type DbHandlerPublicAPI = Pick<DbHandler, FunctionPropertyOf<DbHandler>>;
export type IpfsHttpClientPublicAPI = {
    add: IPFSHTTPClient["add"];
    cat: (...p: Parameters<IPFSHTTPClient["cat"]>) => Promise<string | undefined>;
    pubsub: Pick<IPFSHTTPClient["pubsub"], "subscribe" | "unsubscribe" | "publish" | "ls" | "peers">;
    name: {
        resolve: (...p: Parameters<IPFSHTTPClient["name"]["resolve"]>) => Promise<string | undefined>;
        publish: IPFSHTTPClient["name"]["publish"];
    };
    config: Pick<IPFSHTTPClient["config"], "get">;
    key: Pick<IPFSHTTPClient["key"], "list" | "rm">;
    pin: {
        rm: IPFSHTTPClient["pin"]["rm"];
        addAll: (...p: Parameters<IPFSHTTPClient["pin"]["addAll"]>) => Promise<CID[]>;
        ls: (...p: Parameters<IPFSHTTPClient["pin"]["ls"]>) => Promise<LsResult[]>;
    };
    block: {
        rm: (...p: Parameters<IPFSHTTPClient["block"]["rm"]>) => Promise<{
            cid: CID;
            error?: Error;
        }[]>;
    };
    swarm: Pick<IPFSHTTPClient["swarm"], "peers">;
};
export type NativeFunctions = {
    listSubplebbits: (dataPath: string) => Promise<string[]>;
    createDbHandler: (subplebbit: DbHandler["_subplebbit"]) => DbHandlerPublicAPI;
    fetch: typeof fetch;
    createIpfsClient: (options: IpfsHttpClientOptions) => IpfsHttpClientPublicAPI;
    createImageCaptcha: (...p: Parameters<typeof createCaptcha>) => Promise<{
        image: string;
        text: string;
    }>;
    importSignerIntoIpfsNode: (ipnsKeyName: string, ipfsKey: Uint8Array, ipfsNode: {
        url: string;
        headers?: Object;
    }) => Promise<IpfsKey>;
    deleteSubplebbit(subplebbitAddress: string, dataPath: string): Promise<void>;
};
export type OnlyDefinedProperties<T> = Pick<T, {
    [Prop in keyof T]: T[Prop] extends undefined ? never : Prop;
}[keyof T]>;
export interface CommentsTableRow extends Omit<CommentIpfsWithCid, "challengeAnswers" | "challengeCommentCids">, Required<Pick<CommentType, "ipnsKeyName">> {
    authorAddress: AuthorIpfsType["address"];
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    id: number;
    insertedAt: number;
}
export interface CommentsTableRowInsert extends Omit<CommentsTableRow, "id" | "insertedAt"> {
}
export interface CommentUpdatesRow extends CommentUpdate {
    insertedAt: number;
}
export interface CommentUpdatesTableRowInsert extends Omit<CommentUpdatesRow, "insertedAt"> {
}
export interface VotesTableRow extends Omit<VoteType, "challengeAnswers" | "challengeCommentCids"> {
    authorAddress: AuthorIpfsType["address"];
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    insertedAt: number;
}
export interface VotesTableRowInsert extends Omit<VotesTableRow, "insertedAt"> {
}
export interface ChallengeRequestsTableRow extends Omit<DecryptedChallengeRequestMessageType, "type" | "encrypted" | "publication" | "challengeAnswers" | "challengeCommentCids"> {
    insertedAt: number;
    challengeAnswers?: string;
    challengeCommentCids?: string;
}
export interface ChallengeRequestsTableRowInsert extends Omit<ChallengeRequestsTableRow, "insertedAt" | "acceptedChallengeTypes"> {
    acceptedChallengeTypes?: string;
}
export interface ChallengesTableRow extends Omit<ChallengeMessageType, "type" | "encrypted"> {
    challengeTypes: ChallengeType["type"][];
    insertedAt: number;
}
export interface ChallengesTableRowInsert extends Omit<ChallengesTableRow, "insertedAt" | "challengeTypes"> {
    challengeTypes: string;
}
export interface ChallengeAnswersTableRow extends Omit<DecryptedChallengeAnswerMessageType, "type" | "encrypted"> {
    insertedAt: number;
}
export interface ChallengeAnswersTableRowInsert extends Omit<ChallengeAnswersTableRow, "insertedAt" | "challengeAnswers"> {
    challengeAnswers: string;
}
export interface ChallengeVerificationsTableRow extends Omit<DecryptedChallengeVerificationMessageType, "type" | "encrypted" | "publication"> {
    insertedAt: number;
}
export interface ChallengeVerificationsTableRowInsert extends Omit<ChallengeVerificationsTableRow, "insertedAt" | "challengeErrors"> {
    challengeErrors?: string;
}
export interface SignersTableRow extends Required<Pick<SignerType, "privateKey" | "ipnsKeyName" | "type">> {
    insertedAt: number;
}
export interface SingersTableRowInsert extends Omit<SignersTableRow, "insertedAt"> {
}
export interface CommentEditsTableRow extends Omit<CommentEditType, "challengeAnswers" | "challengeCommentCids"> {
    authorAddress: AuthorIpfsType["address"];
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    insertedAt: number;
}
export interface CommentEditsTableRowInsert extends Omit<CommentEditsTableRow, "insertedAt"> {
}
declare module "knex/types/tables" {
    interface Tables {
        comments: Knex.CompositeTableType<CommentsTableRow, CommentsTableRowInsert, null, null>;
        commentUpdates: Knex.CompositeTableType<CommentUpdatesRow, CommentUpdatesTableRowInsert, Omit<CommentUpdatesTableRowInsert, "cid">, Omit<CommentUpdatesTableRowInsert, "cid">>;
        votes: Knex.CompositeTableType<VotesTableRow, VotesTableRowInsert, null>;
        challengeRequests: Knex.CompositeTableType<ChallengeRequestsTableRow, ChallengeRequestsTableRowInsert, null, null>;
        challenges: Knex.CompositeTableType<ChallengesTableRow, ChallengesTableRowInsert, null, null>;
        challengeAnswers: Knex.CompositeTableType<ChallengeAnswersTableRow, ChallengeAnswersTableRowInsert, null, null>;
        challengeVerifications: Knex.CompositeTableType<ChallengeVerificationsTableRow, ChallengeVerificationsTableRowInsert, null, null>;
        signers: Knex.CompositeTableType<SignersTableRow, SingersTableRowInsert, null, null>;
        commentEdits: Knex.CompositeTableType<CommentEditsTableRow, CommentEditsTableRowInsert, null, null>;
    }
}
export interface SubplebbitEvents {
    challengerequest: (request: DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor) => void;
    challenge: (challenge: DecryptedChallengeMessageType) => void;
    challengeanswer: (answer: DecryptedChallengeAnswerMessageType) => void;
    challengeverification: (verification: DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor) => void;
    error: (error: PlebbitError) => void;
    statechange: (newState: Subplebbit["state"]) => void;
    updatingstatechange: (newState: Subplebbit["updatingState"]) => void;
    startedstatechange: (newState: Subplebbit["startedState"]) => void;
    update: (updatedSubplebbit: Subplebbit) => void;
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
    peers: () => Promise<PeersResult[]>;
    stats?: undefined;
    sessionStats?: undefined;
    subplebbitStats?: undefined;
    _client: IpfsHttpClientPublicAPI;
    _clientOptions: IpfsHttpClientOptions;
}
export interface PubsubClient {
    peers: () => Promise<string[]>;
    stats?: undefined;
    sessionStats?: undefined;
    subplebbitStats?: undefined;
    _client: Pick<ReturnType<NativeFunctions["createIpfsClient"]>, "pubsub">;
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
    getItem: (key: string) => Promise<any>;
    setItem: (key: string, value: any) => Promise<void>;
    removeItem: (key: string) => Promise<boolean>;
    clear: () => Promise<void>;
    keys: () => Promise<string[]>;
}
export interface PlebbitWsServerSettings {
    plebbitOptions: PlebbitOptions;
}
export interface PlebbitWsServerSettingsSerialized {
    plebbitOptions: ParsedPlebbitOptions;
    challenges: Record<string, Omit<ChallengeFile, "getChallenge">>;
}
export {};
