import { CID, IPFSHTTPClient, Options } from "ipfs-http-client";
import { DbHandler } from "./runtime/browser/db-handler";
import fetch from "node-fetch";
import { createCaptcha } from "captcha-canvas";
import { Plebbit } from "./plebbit";
import { Knex } from "knex";
import { Comment } from "./comment";
import { CommentEditSignedPropertyNamesUnion, CommentSignedPropertyNamesUnion, Encrypted, SignatureType, SignerType, VoteSignedPropertyNamesUnion } from "./signer/constants";
import { Subplebbit } from "./subplebbit";
import Publication from "./publication";
import { PlebbitError } from "./plebbit-error";
export declare type ProtocolVersion = "1.0.0";
export declare type ChainProvider = {
    url: string;
    chainId: number;
};
export interface PlebbitOptions {
    ipfsGatewayUrl?: string;
    ipfsHttpClientOptions?: Options | string;
    pubsubHttpClientOptions?: Options | string;
    dataPath?: string;
    chainProviders?: {
        [chainTicker: string]: ChainProvider;
    };
    resolveAuthorAddresses?: boolean;
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
export interface PagesTypeIpfs {
    pages: Partial<Record<PostSortName | ReplySortName, PageIpfs>>;
    pageCids: Partial<Record<PostSortName | ReplySortName, string>>;
}
export declare type SubplebbitEncryption = {
    type: "ed25519-aes-gcm";
    publicKey: string;
};
export interface CreateCommentOptions extends CreatePublicationOptions {
    signer: Pick<SignerType, "privateKey" | "type">;
    parentCid?: string;
    content?: string;
    title?: string;
    link?: string;
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
export declare type Wallet = {
    address: string;
};
export interface PublicationType extends Required<CreatePublicationOptions> {
    author: AuthorIpfsType;
    signature: SignatureType;
    protocolVersion: ProtocolVersion;
}
export interface CreatePublicationOptions {
    author?: Partial<AuthorIpfsType>;
    subplebbitAddress: string;
    timestamp?: number;
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
export declare type CommentAuthorEditOptions = Pick<SubplebbitAuthor, "banExpiresAt" | "flair">;
export interface CreateCommentEditOptions extends AuthorCommentEdit, ModeratorCommentEdit {
    signer: SignerType | Pick<SignerType, "privateKey" | "type">;
}
export declare type Nft = {
    chainTicker: string;
    address: string;
    id: string;
    timestamp: number;
    signature: SignatureType;
};
export declare type SubplebbitRole = {
    role: "owner" | "admin" | "moderator";
};
interface PubsubMessage {
    type: "CHALLENGEREQUEST" | "CHALLENGE" | "CHALLENGEANSWER" | "CHALLENGEVERIFICATION";
    signature: SignatureType;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    timestamp: number;
}
export interface ChallengeType {
    challenge: string;
    type: "image/png" | "text/plain" | "chain/<chainTicker>";
}
export interface ChallengeRequestMessageType extends PubsubMessage {
    challengeRequestId: string;
    type: "CHALLENGEREQUEST";
    encryptedPublication: Encrypted;
    acceptedChallengeTypes?: string[];
}
export interface DecryptedChallengeRequestMessageType extends ChallengeRequestMessageType {
    publication: VotePubsubMessage | CommentEditPubsubMessage | CommentPubsubMessage | PostPubsubMessage;
}
export interface ChallengeMessageType extends PubsubMessage {
    challengeRequestId: string;
    type: "CHALLENGE";
    encryptedChallenges: Encrypted;
}
export interface DecryptedChallengeMessageType extends ChallengeMessageType {
    challenges: ChallengeType[];
}
export interface ChallengeAnswerMessageType extends PubsubMessage {
    challengeRequestId: string;
    type: "CHALLENGEANSWER";
    challengeAnswerId: string;
    encryptedChallengeAnswers: Encrypted;
}
export interface DecryptedChallengeAnswerMessageType extends ChallengeAnswerMessageType {
    challengeAnswers: string[];
}
export interface ChallengeVerificationMessageType extends PubsubMessage {
    challengeRequestId: string;
    type: "CHALLENGEVERIFICATION";
    challengeAnswerId: string;
    challengeSuccess: boolean;
    challengeErrors?: (string | undefined)[];
    reason?: string;
    encryptedPublication?: Encrypted;
}
export interface DecryptedChallengeVerificationMessageType extends ChallengeVerificationMessageType {
    publication?: CommentIpfsWithCid;
}
export declare type SubplebbitStats = {
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
export declare type SubplebbitFeatures = {
    noVideos?: boolean;
    noSpoilers?: boolean;
    noImages?: boolean;
    noVideoReplies?: boolean;
    noSpoilerReplies?: boolean;
    noImageReplies?: boolean;
    noPolls?: boolean;
    noCrossposts?: boolean;
    noUpvotes?: boolean;
    noDownvotes?: boolean;
    noAuthors?: boolean;
    anonymousAuthors?: boolean;
    noNestedReplies?: boolean;
    safeForWork?: boolean;
    authorFlairs?: boolean;
    requireAuthorFlairs?: boolean;
    postFlairs?: boolean;
    requirePostFlairs?: boolean;
    noMarkdownImages?: boolean;
    noMarkdownVideos?: boolean;
    markdownImageReplies?: boolean;
    markdownVideoReplies?: boolean;
};
export declare type SubplebbitSuggested = {
    primaryColor?: string;
    secondaryColor?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    backgroundUrl?: string;
    language?: string;
};
export declare type Flair = {
    text: string;
    backgroundColor?: string;
    textColor?: string;
    expiresAt?: number;
};
export declare type FlairOwner = "post" | "author";
export interface SubplebbitType extends Omit<CreateSubplebbitOptions, "database" | "signer"> {
    signature: SignatureType;
    encryption: SubplebbitEncryption;
    address: string;
    shortAddress: string;
    signer?: SignerType;
    createdAt: number;
    updatedAt: number;
    pubsubTopic?: string;
    statsCid?: string;
    protocolVersion: ProtocolVersion;
    posts?: PagesTypeJson;
}
export interface SubplebbitIpfsType extends Omit<SubplebbitType, "posts" | "shortAddress" | "settings"> {
    posts?: PagesTypeIpfs;
}
export interface InternalSubplebbitType extends Omit<SubplebbitType, "shortAddress"> {
    signer: Pick<SignerType, "address" | "privateKey" | "type">;
    _subplebbitUpdateTrigger: boolean;
}
export interface CreateSubplebbitOptions extends SubplebbitEditOptions {
    createdAt?: number;
    updatedAt?: number;
    signer?: Pick<SignerType, "privateKey" | "type">;
    encryption?: SubplebbitEncryption;
    signature?: SignatureType;
}
export interface SubplebbitEditOptions {
    title?: string;
    description?: string;
    roles?: {
        [authorAddress: string]: SubplebbitRole;
    };
    rules?: string[];
    lastPostCid?: string;
    pubsubTopic?: string;
    challengeTypes?: ChallengeType[];
    stats?: SubplebbitStats;
    features?: SubplebbitFeatures;
    suggested?: SubplebbitSuggested;
    flairs?: Record<FlairOwner, Flair[]>;
    address?: string;
    settings?: SubplebbitSettings;
}
export declare type SubplebbitSettings = {
    fetchThumbnailUrls?: boolean;
    fetchThumbnailUrlsProxyUrl?: string;
};
export declare type Timeframe = "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR" | "ALL";
export declare type PostSortName = "hot" | "new" | "topHour" | "topDay" | "topWeek" | "topMonth" | "topYear" | "topAll" | "controversialHour" | "controversialDay" | "controversialWeek" | "controversialMonth" | "controversialYear" | "controversialAll";
export declare type ReplySortName = "topAll" | "new" | "old" | "controversialAll";
export declare type SortProps = {
    score: (comment: Pick<CommentWithCommentUpdate, "timestamp" | "upvoteCount" | "downvoteCount">) => number;
    timeframe?: Timeframe;
};
export declare type PostSort = Record<PostSortName, SortProps>;
export declare type ReplySort = Record<ReplySortName, SortProps>;
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
    signature: SignatureType;
    author?: {
        subplebbit: SubplebbitAuthor;
    };
}
export interface CommentType extends Partial<Omit<CommentUpdate, "author" | "replies">>, Omit<CreateCommentOptions, "signer"> {
    author: AuthorTypeWithCommentUpdate;
    timestamp: number;
    protocolVersion: ProtocolVersion;
    signature: SignatureType;
    replies?: PagesTypeJson;
    postCid?: string;
    previousCid?: string;
    ipnsKeyName?: string;
    depth?: number;
    signer?: SignerType;
    original?: Pick<Partial<CommentType>, "author" | "content" | "flair" | "protocolVersion">;
    deleted?: CommentType["edit"]["deleted"];
    thumbnailUrl?: string;
    cid?: string;
    shortCid?: string;
    ipnsName?: string;
}
export interface CommentWithCommentUpdate extends Omit<CommentType, "replyCount" | "downvoteCount" | "upvoteCount" | "replies" | "updatedAt" | "original" | "cid" | "postCid" | "depth" | "ipnsKeyName" | "signer">, Required<Pick<CommentType, "original" | "cid" | "postCid" | "depth">>, Omit<CommentUpdate, "author" | "replies"> {
    replies?: PagesTypeJson;
}
export interface CommentIpfsType extends Omit<CreateCommentOptions, "signer" | "timestamp" | "author">, PublicationType, Pick<CommentType, "previousCid" | "postCid" | "thumbnailUrl">, Pick<Required<CommentType>, "depth" | "ipnsName"> {
    author: AuthorIpfsType;
}
export interface CommentIpfsWithCid extends Omit<CommentIpfsType, "cid" | "postCid">, Pick<CommentWithCommentUpdate, "cid" | "postCid"> {
}
export interface PostType extends Omit<CommentType, "parentCid" | "depth"> {
    depth: 0;
    parentCid: undefined;
}
export interface PostIpfsWithCid extends Omit<CommentIpfsType, "cid" | "postCid" | "depth" | "parentCid" | "title" | "link" | "thumbnailUrl">, Pick<CommentWithCommentUpdate, "cid" | "postCid">, Pick<PostType, "depth" | "parentCid" | "title" | "link" | "thumbnailUrl"> {
}
export interface CommentEditType extends PublicationType, Omit<CreateCommentEditOptions, "signer"> {
    author: CommentIpfsType["author"];
    signer?: SignerType;
}
export declare type PublicationTypeName = "comment" | "vote" | "commentedit" | "commentupdate" | "subplebbit";
export interface CommentPubsubMessage extends Pick<CommentType, CommentSignedPropertyNamesUnion | "signature" | "protocolVersion" | "flair" | "spoiler"> {
}
export interface PostPubsubMessage extends Pick<PostType, CommentSignedPropertyNamesUnion | "signature" | "protocolVersion" | "flair" | "spoiler"> {
}
export interface VotePubsubMessage extends Pick<VoteType, VoteSignedPropertyNamesUnion | "signature" | "protocolVersion"> {
}
export interface CommentEditPubsubMessage extends Pick<CommentEditType, CommentEditSignedPropertyNamesUnion | "signature" | "protocolVersion"> {
}
declare type FunctionPropertyOf<T> = {
    [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];
export declare type DbHandlerPublicAPI = Pick<DbHandler, FunctionPropertyOf<DbHandler>>;
export declare type IpfsHttpClientPublicAPI = {
    add: IPFSHTTPClient["add"];
    cat: (...p: Parameters<IPFSHTTPClient["cat"]>) => Promise<string | undefined>;
    pubsub: Pick<IPFSHTTPClient["pubsub"], "subscribe" | "unsubscribe" | "publish" | "ls">;
    name: {
        resolve: (...p: Parameters<IPFSHTTPClient["name"]["resolve"]>) => Promise<string | undefined>;
        publish: IPFSHTTPClient["name"]["publish"];
    };
    config: Pick<IPFSHTTPClient["config"], "get">;
    key: Pick<IPFSHTTPClient["key"], "list" | "rm">;
    pin: Pick<IPFSHTTPClient["pin"], "rm">;
    block: {
        rm: (...p: Parameters<IPFSHTTPClient["block"]["rm"]>) => Promise<{
            cid: CID;
            error?: Error;
        }[]>;
    };
};
export declare type NativeFunctions = {
    listSubplebbits: (dataPath: string) => Promise<string[]>;
    createDbHandler: (subplebbit: DbHandler["_subplebbit"]) => DbHandlerPublicAPI;
    fetch: typeof fetch;
    createIpfsClient: (options: Options) => IpfsHttpClientPublicAPI;
    createImageCaptcha: (...p: Parameters<typeof createCaptcha>) => Promise<{
        image: string;
        text: string;
    }>;
    importSignerIntoIpfsNode: (ipnsKeyName: string, ipfsKey: Uint8Array, plebbit: Plebbit) => Promise<{
        Id: string;
        Name: string;
    }>;
    deleteSubplebbit(subplebbitAddress: string, dataPath: string): Promise<void>;
};
export declare type OnlyDefinedProperties<T> = Pick<T, {
    [Prop in keyof T]: T[Prop] extends undefined ? never : Prop;
}[keyof T]>;
export interface CommentsTableRow extends CommentIpfsWithCid, Required<Pick<CommentType, "ipnsKeyName">> {
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
export interface VotesTableRow extends VoteType {
    authorAddress: AuthorIpfsType["address"];
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    insertedAt: number;
}
export interface VotesTableRowInsert extends Omit<VotesTableRow, "insertedAt"> {
}
export interface ChallengeRequestsTableRow extends Omit<ChallengeRequestMessageType, "type" | "encryptedPublication"> {
    insertedAt: number;
}
export interface ChallengeRequestsTableRowInsert extends Omit<ChallengeRequestsTableRow, "insertedAt"> {
}
export interface ChallengesTableRow extends Omit<ChallengeMessageType, "type" | "encryptedChallenges"> {
    challengeTypes: ChallengeType["type"][];
    insertedAt: number;
}
export interface ChallengesTableRowInsert extends Omit<ChallengesTableRow, "insertedAt"> {
}
export interface ChallengeAnswersTableRow extends Omit<DecryptedChallengeAnswerMessageType, "type" | "encryptedChallengeAnswers"> {
    insertedAt: number;
}
export interface ChallengeAnswersTableRowInsert extends Omit<ChallengeAnswersTableRow, "insertedAt"> {
}
export interface ChallengeVerificationsTableRow extends Omit<ChallengeVerificationMessageType, "type" | "encryptedPublication"> {
    insertedAt: number;
}
export interface ChallengeVerificationsTableRowInsert extends Omit<ChallengeVerificationsTableRow, "insertedAt"> {
}
export interface SignersTableRow extends Required<Pick<SignerType, "privateKey" | "ipnsKeyName" | "type">> {
    insertedAt: number;
}
export interface SingersTableRowInsert extends Omit<SignersTableRow, "insertedAt"> {
}
export interface CommentEditsTableRow extends CommentEditType {
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
    challengerequest: (request: DecryptedChallengeRequestMessageType) => void;
    challengemessage: (challenge: DecryptedChallengeMessageType) => void;
    challengeanswer: (answer: DecryptedChallengeAnswerMessageType) => void;
    challengeverification: (verification: DecryptedChallengeVerificationMessageType) => void;
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
    resolvedsubplebbitaddress: (subplebbitAddress: string, resolvedSubplebbitAddress: string) => void;
    resolvedauthoraddress: (authorAddress: string, resolvedAuthorAddress: string) => void;
    resolvedipns: (ipns: string, cid: string) => void;
    fetchedcid: (cid: string, content: string) => void;
    fetchedipns: (ipns: string, content: string) => void;
    error: (error: PlebbitError) => void;
}
export {};
