import { CID, IPFSHTTPClient, Options } from "ipfs-http-client";
import { Knex } from "knex";
import { Pages } from "./pages";
import { DbHandler } from "./runtime/browser/db-handler";
import fetch from "node-fetch";
import { createCaptcha } from "captcha-canvas";
import { Plebbit } from "./plebbit";
export declare type ProtocolVersion = "1.0.0";
export declare type BlockchainProvider = {
    url: string;
    chainId: number;
};
export interface PlebbitOptions {
    ipfsGatewayUrl?: string;
    ipfsHttpClientOptions?: Options | string;
    pubsubHttpClientOptions?: Options | string;
    dataPath?: string;
    blockchainProviders?: {
        [chainTicker: string]: BlockchainProvider;
    };
    resolveAuthorAddresses?: boolean;
}
export declare type CreateSignerOptions = {
    privateKey?: string;
    type?: "rsa";
};
export interface PageType {
    comments: CommentType[];
    nextCid?: string;
}
export interface PagesType {
    pages?: Partial<Record<PostSortName | ReplySortName, PageType>>;
    pageCids?: Partial<Record<PostSortName | ReplySortName, string>>;
}
export interface SignerType {
    type: "rsa";
    privateKey: string;
    publicKey?: string;
    address?: string;
    ipfsKey?: Uint8Array;
    ipnsKeyName?: string;
}
export declare type Encrypted = {
    encrypted: string;
    encryptedKey: string;
    type: "aes-cbc";
};
export declare type SubplebbitEncryption = {
    type: "aes-cbc";
    publicKey: string;
};
export interface CreateCommentOptions extends CreatePublicationOptions {
    signer: SignerType;
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
    signer: SignerType;
}
export interface VoteType extends Omit<CreateVoteOptions, "signer">, PublicationType {
    author: AuthorType;
    timestamp: number;
    signer?: SignerType;
}
export interface SubplebbitAuthor {
    postScore: number;
    replyScore: number;
    lastCommentCid: string;
}
export interface AuthorType {
    address: string;
    previousCommentCid?: string;
    displayName?: string;
    wallets?: {
        [chainTicker: string]: Wallet;
    };
    avatar?: Nft;
    flair?: Flair;
    banExpiresAt?: number;
    subplebbit?: SubplebbitAuthor;
}
export declare type Wallet = {
    address: string;
};
export interface SignatureType {
    signature: string;
    publicKey: string;
    type: "rsa";
    signedPropertyNames: SignedPropertyNames;
}
export interface PublicationType extends Required<CreatePublicationOptions> {
    author: AuthorType;
    signature: SignatureType;
    protocolVersion: ProtocolVersion;
}
interface CreatePublicationOptions {
    author?: Partial<Omit<AuthorType, "subplebbit" | "banExpiresAt">>;
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
    moderatorReason?: string;
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
export declare type CommentAuthorEditOptions = Pick<AuthorType, "banExpiresAt" | "flair">;
export interface CreateCommentEditOptions extends AuthorCommentEdit, ModeratorCommentEdit {
    signer: SignerType;
}
export declare type Nft = {
    chainTicker: string;
    id: string;
    address: string;
    signature: string;
};
export declare type SubplebbitRole = {
    role: "owner" | "admin" | "moderator";
};
interface PubsubMessage {
    type: "CHALLENGEREQUEST" | "CHALLENGE" | "CHALLENGEANSWER" | "CHALLENGEVERIFICATION";
    signature: SignatureType;
    protocolVersion: ProtocolVersion;
    userAgent: string;
}
export interface ChallengeType {
    challenge: string;
    type: "image" | "text" | "video" | "audio" | "html";
}
export interface ChallengeRequestMessageType extends PubsubMessage {
    challengeRequestId: string;
    type: "CHALLENGEREQUEST";
    encryptedPublication: Encrypted;
    acceptedChallengeTypes?: string[];
}
export interface DecryptedChallengeRequestMessageType extends ChallengeRequestMessageType {
    publication: VoteType | CommentEditType | CommentType | PostType;
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
    publication?: DecryptedChallengeRequestMessageType["publication"];
}
export declare type SubplebbitMetrics = {
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
export interface SubplebbitType extends Omit<CreateSubplebbitOptions, "database"> {
    signature: SignatureType;
    encryption: SubplebbitEncryption;
    address: string;
    createdAt: number;
    updatedAt: number;
    pubsubTopic: string;
    metricsCid?: string;
    protocolVersion: ProtocolVersion;
    posts: Pages | Pick<Pages, "pages" | "pageCids">;
}
export interface CreateSubplebbitOptions extends SubplebbitEditOptions {
    createdAt?: number;
    updatedAt?: number;
    signer?: SignerType;
    encryption?: SubplebbitEncryption;
    signature?: SignatureType;
    database?: Omit<Knex.Config, "client" | "connection" | "pool" | "postProcessResponse" | "wrapIdentifier" | "seeds" | "log"> & {
        connection: {
            filename: string;
            flags?: string[];
            debug?: boolean;
            expirationChecker?(): boolean;
        };
        client: string;
        useNullAsDefault: true;
    };
}
export interface SubplebbitEditOptions {
    title?: string;
    description?: string;
    roles?: {
        [authorAddress: string]: SubplebbitRole;
    };
    rules?: string[];
    lastPostCid?: string;
    posts?: Pages | Pick<Pages, "pages" | "pageCids">;
    pubsubTopic?: string;
    challengeTypes?: ChallengeType[];
    metrics?: SubplebbitMetrics;
    features?: SubplebbitFeatures;
    suggested?: SubplebbitSuggested;
    flairs?: Record<FlairOwner, Flair[]>;
    address?: string;
}
export declare type Timeframe = "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR" | "ALL";
export declare type PostSortName = "hot" | "new" | "topHour" | "topDay" | "topWeek" | "topMonth" | "topYear" | "topAll" | "controversialHour" | "controversialDay" | "controversialWeek" | "controversialMonth" | "controversialYear" | "controversialAll";
export declare type ReplySortName = "topAll" | "new" | "old" | "controversialAll";
export declare type SortProps = {
    score?: (comment: CommentType) => number;
    timeframe?: Timeframe;
};
export declare type PostSort = Record<PostSortName, SortProps>;
export declare type ReplySort = Record<ReplySortName, SortProps>;
export interface CommentUpdate {
    upvoteCount: number;
    downvoteCount: number;
    replyCount: number;
    authorEdit?: AuthorCommentEdit;
    replies: PagesType;
    flair?: Flair;
    spoiler?: boolean;
    pinned?: boolean;
    locked?: boolean;
    removed?: boolean;
    moderatorReason?: string;
    updatedAt: number;
    protocolVersion: ProtocolVersion;
    signature: SignatureType;
    author?: Pick<AuthorType, "banExpiresAt" | "flair" | "subplebbit">;
}
export interface CommentType extends Partial<CommentUpdate>, Omit<CreateCommentOptions, "signer">, PublicationType {
    author: AuthorType;
    timestamp: number;
    protocolVersion: ProtocolVersion;
    signature: SignatureType;
    postCid?: string;
    previousCid?: string;
    ipnsKeyName?: string;
    depth?: number;
    signer?: SignerType;
    original?: Pick<Partial<CommentType>, "author" | "content" | "flair">;
    thumbnailUrl?: string;
    cid?: string;
    ipnsName?: string;
}
export interface CommentIpfsType extends Omit<CreateCommentOptions, "signer" | "timestamp" | "author">, PublicationType, Pick<CommentType, "previousCid" | "postCid" | "thumbnailUrl">, Pick<Required<CommentType>, "depth" | "ipnsName"> {
}
export interface PostType extends Omit<CommentType, "parentCid" | "depth"> {
    depth: 0;
    parentCid: undefined;
    title: string;
    link?: string;
    thumbnailUrl?: string;
}
export interface CommentEditType extends PublicationType, Omit<CreateCommentEditOptions, "signer"> {
    signer?: SignerType;
}
export declare type PublicationTypeName = "comment" | "vote" | "commentedit" | "commentupdate" | "subplebbit";
export declare type SignatureTypes = PublicationTypeName | "challengerequestmessage" | "challengemessage" | "challengeanswermessage" | "challengeverificationmessage";
export declare type CommentSignedPropertyNames = (keyof Pick<CreateCommentOptions, "subplebbitAddress" | "author" | "timestamp" | "content" | "title" | "link" | "parentCid">)[];
export declare type CommentEditSignedPropertyNames = (keyof Omit<CreateCommentEditOptions, "signer" | "signature" | "protocolVersion">)[];
export declare type CommentUpdatedSignedPropertyNames = (keyof Omit<CommentUpdate, "signature" | "protocolVersion">)[];
export declare type VoteSignedPropertyNames = (keyof Omit<CreateVoteOptions, "signer" | "protocolVersion">)[];
export declare type SubplebbitSignedPropertyNames = (keyof Omit<SubplebbitType, "signer" | "signature" | "protocolVersion">)[];
export declare type ChallengeRequestMessageSignedPropertyNames = (keyof Omit<ChallengeRequestMessageType, "signature" | "protocolVersion" | "userAgent">)[];
export declare type ChallengeMessageSignedPropertyNames = (keyof Omit<ChallengeMessageType, "signature" | "protocolVersion" | "userAgent">)[];
export declare type ChallengeAnswerMessageSignedPropertyNames = (keyof Omit<ChallengeAnswerMessageType, "signature" | "protocolVersion" | "userAgent">)[];
export declare type ChallengeVerificationMessageSignedPropertyNames = (keyof Omit<ChallengeVerificationMessageType, "signature" | "protocolVersion" | "userAgent">)[];
export declare type SignedPropertyNames = CommentSignedPropertyNames | CommentEditSignedPropertyNames | VoteSignedPropertyNames | SubplebbitSignedPropertyNames | CommentUpdatedSignedPropertyNames | ChallengeRequestMessageSignedPropertyNames | ChallengeMessageSignedPropertyNames | ChallengeAnswerMessageSignedPropertyNames | ChallengeVerificationMessageSignedPropertyNames;
declare type FunctionPropertyOf<T> = {
    [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];
export declare type DbHandlerPublicAPI = Pick<DbHandler, FunctionPropertyOf<DbHandler>>;
export declare type IpfsHttpClientPublicAPI = {
    add: IPFSHTTPClient["add"];
    cat: (...p: Parameters<IPFSHTTPClient["cat"]>) => Promise<string | undefined>;
    pubsub: Pick<IPFSHTTPClient["pubsub"], "subscribe" | "unsubscribe" | "publish">;
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
    createIpfsClient: (options: Options | string) => IpfsHttpClientPublicAPI;
    createImageCaptcha: (...p: Parameters<typeof createCaptcha>) => Promise<{
        image: string;
        text: string;
    }>;
    importSignerIntoIpfsNode: (signer: SignerType, plebbit: Plebbit) => Promise<{
        Id: string;
        Name: string;
    }>;
    deleteSubplebbit(subplebbitAddress: string, dataPath: string): Promise<void>;
    copyDbToDatapathIfNeeded(databaseConfig: CreateSubplebbitOptions["database"], dataPath: string): Promise<void>;
};
export declare type OnlyDefinedProperties<T> = Pick<T, {
    [Prop in keyof T]: T[Prop] extends undefined ? never : Prop;
}[keyof T]>;
export declare type CommentEditForDbType = OnlyDefinedProperties<Omit<CommentEditType, "author"> & {
    author: string;
    authorAddress: string;
    challengeRequestId: string;
}>;
export declare type CommentForDbType = OnlyDefinedProperties<Omit<CommentType, "replyCount" | "upvoteCount" | "downvoteCount" | "replies" | "signature" | "author" | "authorEdit"> & {
    authorEdit: string;
    original: string;
    author: string;
    authorAddress: string;
    challengeRequestId?: string;
    ipnsKeyName: string;
    signature: string;
}>;
export declare type VoteForDbType = Omit<VoteType, "author" | "signature"> & {
    author: string;
    authorAddress: string;
    challengeRequestId: string;
    signature: string;
};
export declare type AuthorDbType = Pick<AuthorType, "address" | "banExpiresAt" | "flair">;
export declare type PublicationToVerify = CommentEditType | VoteType | CommentType | PostType | CommentUpdate | SubplebbitType | ChallengeRequestMessageType | ChallengeMessageType | ChallengeAnswerMessageType | ChallengeVerificationMessageType;
export declare type PublicationsToSign = CreateCommentEditOptions | CreateVoteOptions | CreateCommentOptions | Omit<CommentUpdate, "signature"> | Omit<SubplebbitType, "signature"> | Omit<ChallengeAnswerMessageType, "signature"> | Omit<ChallengeRequestMessageType, "signature"> | Omit<ChallengeVerificationMessageType, "signature"> | Omit<ChallengeMessageType, "signature">;
export {};
