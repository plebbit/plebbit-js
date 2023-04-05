import { CID, IPFSHTTPClient, Options as IpfsHttpClientOptions } from "ipfs-http-client";
import { PeersResult } from "ipfs-core-types/src/swarm/index";
import { DbHandler } from "./runtime/node/db-handler";
import fetch from "node-fetch";
import { createCaptcha } from "captcha-canvas";
import { Plebbit } from "./plebbit";
import { Knex } from "knex";
import { Comment } from "./comment";
import {
    CommentEditSignedPropertyNamesUnion,
    CommentSignedPropertyNamesUnion,
    Encrypted,
    SignatureType,
    SignerType,
    VoteSignedPropertyNamesUnion
} from "./signer/constants";
import { Subplebbit } from "./subplebbit";
import Publication from "./publication";
import { PlebbitError } from "./plebbit-error";

export type ProtocolVersion = "1.0.0";

export type ChainProvider = { url: string[]; chainId: number };
export interface PlebbitOptions {
    ipfsGatewayUrls?: string[];
    ipfsHttpClientOptions?: (IpfsHttpClientOptions | string)[];
    pubsubHttpClientOptions?: (IpfsHttpClientOptions | string)[];
    dataPath?: string;
    chainProviders?: { [chainTicker: string]: ChainProvider };
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
    comments: { comment: CommentIpfsWithCid; update: CommentUpdate }[];
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

export type SubplebbitEncryption = {
    type: "ed25519-aes-gcm"; // https://github.com/plebbit/plebbit-js/blob/master/docs/encryption.md
    publicKey: string; // 32 bytes base64 string (same as subplebbit.signer.publicKey)
};
export interface CreateCommentOptions extends CreatePublicationOptions {
    signer: Pick<SignerType, "privateKey" | "type">;
    parentCid?: string; // The parent comment CID, undefined if comment is a post, same as postCid if comment is top level
    content?: string; // Content of the comment, link posts have no content
    title?: string; // If comment is a post, it needs a title
    link?: string; // If comment is a post, it might be a link post
    spoiler?: boolean; // Hide the comment thumbnail behind spoiler warning
    flair?: Flair; // Author or mod chosen colored label for the comment
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
    postScore: number; // total post karma in the subplebbit
    replyScore: number; // total reply karma in the subplebbit
    banExpiresAt?: number; // timestamp in second, if defined the author was banned for this comment
    flair?: Flair; // not part of the signature, mod can edit it after comment is published
    firstCommentTimestamp: number; // timestamp of the first comment by the author in the subplebbit, used for account age based challenges
    lastCommentCid: string; // last comment by the author in the subplebbit, can be used with author.previousCommentCid to get a recent author comment history in all subplebbits
}

export interface AuthorIpfsType {
    address: string;
    previousCommentCid?: string; // linked list of the author's comments
    displayName?: string;
    wallets?: { [chainTicker: string]: Wallet };
    avatar?: Nft;
    flair?: Flair; // (added by author originally, can be overriden by commentUpdate.subplebbit.author.flair)
}

export interface AuthorTypeWithCommentUpdate extends AuthorIpfsType {
    subplebbit?: SubplebbitAuthor; // (added by CommentUpdate) up to date author properties specific to the subplebbit it's in
}

export type Wallet = {
    address: string;
    // ...will add more stuff later, like signer or send/sign or balance
};

export interface PublicationType extends Required<CreatePublicationOptions> {
    author: AuthorIpfsType;
    signature: SignatureType; // sign immutable fields like author, title, content, timestamp to prevent tampering
    protocolVersion: ProtocolVersion; // semantic version of the protocol https://semver.org/
}

export interface CreatePublicationOptions {
    author?: Partial<AuthorIpfsType>;
    subplebbitAddress: string; // all publications are directed to a subplebbit owner
    timestamp?: number; // // Time of publishing in seconds, Math.round(Date.now() / 1000) if undefined
}

// CommentEdit section

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
export interface AuthorCommentEdit extends AuthorCommentEditOptions, PublicationType {}

export interface ModeratorCommentEdit extends ModeratorCommentEditOptions, PublicationType {}
export type CommentAuthorEditOptions = Pick<SubplebbitAuthor, "banExpiresAt" | "flair">;
export interface CreateCommentEditOptions extends AuthorCommentEdit, ModeratorCommentEdit {
    signer: SignerType | Pick<SignerType, "privateKey" | "type">;
}

//*********************
//* "Edit" publications
//*********************

export type Nft = {
    chainTicker: string; // ticker of the chain, like eth, avax, sol, etc in lowercase
    address: string; // address of the NFT contract
    id: string; // tokenId or index of the specific NFT used, must be string type, not number
    timestamp: number; // in seconds, needed to mitigate multiple users using the same signature
    signature: SignatureType; // proof that author.address owns the nft
    // how to resolve and verify NFT signatures https://github.com/plebbit/plebbit-js/blob/master/docs/nft.md
};
export type SubplebbitRole = { role: "owner" | "admin" | "moderator" };

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
    publication?: CommentIpfsWithCid; // Only comments receive new props after verification for now
}

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

export type SubplebbitFeatures = {
    // any boolean that changes the functionality of the sub, add "no" in front if doesn't default to false
    noVideos?: boolean;
    noSpoilers?: boolean; // author can't comment.spoiler = true their own comments
    noImages?: boolean;
    noVideoReplies?: boolean;
    noSpoilerReplies?: boolean;
    noImageReplies?: boolean;
    noPolls?: boolean;
    noCrossposts?: boolean;
    noUpvotes?: boolean;
    noDownvotes?: boolean;
    noAuthors?: boolean; // no authors at all, like 4chan
    anonymousAuthors?: boolean; // authors are given anonymous ids inside threads, like 4chan
    noNestedReplies?: boolean; // no nested replies, like old school forums and 4chan
    safeForWork?: boolean;
    authorFlairs?: boolean; // authors can choose their own author flairs (otherwise only mods can)
    requireAuthorFlairs?: boolean; // force authors to choose an author flair before posting
    postFlairs?: boolean; // authors can choose their own post flairs (otherwise only mods can)
    requirePostFlairs?: boolean; // force authors to choose a post flair before posting
    noMarkdownImages?: boolean; // don't embed images in text posts markdown
    noMarkdownVideos?: boolean; // don't embed videos in text posts markdown
    markdownImageReplies?: boolean;
    markdownVideoReplies?: boolean;
};

export type SubplebbitSuggested = {
    // values suggested by the sub owner, the client/user can ignore them without breaking interoperability
    primaryColor?: string;
    secondaryColor?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    backgroundUrl?: string;
    language?: string;
    // TODO: menu links, wiki pages, sidebar widgets
};

export type Flair = {
    text: string;
    backgroundColor?: string;
    textColor?: string;
    expiresAt?: number; // timestamp in second, a flair assigned to an author by a mod will follow the author in future comments, unless it expires
};

export type FlairOwner = "post" | "author";

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
    protocolVersion: ProtocolVersion; // semantic version of the protocol https://semver.org/
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
    signature?: SignatureType; // signature of the Subplebbit update by the sub owner to protect against malicious gateway
}

export interface SubplebbitEditOptions {
    title?: string;
    description?: string;
    roles?: { [authorAddress: string]: SubplebbitRole };
    rules?: string[];
    lastPostCid?: string;
    pubsubTopic?: string;
    challengeTypes?: ChallengeType[];
    stats?: SubplebbitStats;
    features?: SubplebbitFeatures;
    suggested?: SubplebbitSuggested;
    flairs?: Record<FlairOwner, Flair[]>; // list of post/author flairs authors and mods can choose from
    address?: string;
    settings?: SubplebbitSettings;
}

export type SubplebbitSettings = {
    fetchThumbnailUrls?: boolean;
    fetchThumbnailUrlsProxyUrl?: string;
};

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
    | "controversialAll";
export type ReplySortName = "topAll" | "new" | "old" | "controversialAll";

export type SortProps = {
    score: (comment: Pick<CommentWithCommentUpdate, "timestamp" | "upvoteCount" | "downvoteCount">) => number;
    timeframe?: Timeframe;
};

export type PostSort = Record<PostSortName, SortProps>;

export type ReplySort = Record<ReplySortName, SortProps>;

export interface CommentUpdate {
    cid: string; // cid of the comment, need it in signature to prevent attack
    upvoteCount: number;
    downvoteCount: number;
    replyCount: number;
    edit?: AuthorCommentEdit; // most recent edit by comment author, commentUpdate.edit.content, commentUpdate.edit.deleted, commentUpdate.edit.flair override Comment instance props. Validate commentUpdate.edit.signature
    replies?: PagesTypeIpfs; // only preload page 1 sorted by 'topAll', might preload more later, only provide sorting for posts (not comments) that have 100+ child comments
    flair?: Flair; // arbitrary colored string to describe the comment, added by mods, override comment.flair and comment.edit.flair (which are added by author)
    spoiler?: boolean;
    pinned?: boolean;
    locked?: boolean;
    removed?: boolean; // mod deleted a comment
    reason?: string; // reason the mod took a mod action
    updatedAt: number; // timestamp in seconds the IPNS record was updated
    protocolVersion: ProtocolVersion; // semantic version of the protocol https://semver.org/
    signature: SignatureType; // signature of the CommentUpdate by the sub owner to protect against malicious gateway
    author?: {
        // add commentUpdate.author.subplebbit to comment.author.subplebbit, override comment.author.flair with commentUpdate.author.subplebbit.flair if any
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
    previousCid?: string; // each post is a linked list
    ipnsKeyName?: string;
    depth?: number;
    signer?: SignerType;
    original?: Pick<Partial<CommentType>, "author" | "content" | "flair" | "protocolVersion">;
    deleted?: CommentType["edit"]["deleted"];
    thumbnailUrl?: string;
    cid?: string; // (Not for publishing) Gives access to Comment.on('update') for a comment already fetched
    shortCid?: string;
    ipnsName?: string; // (Not for publishing) Gives access to Comment.on('update') for a comment already fetched
}

export interface CommentWithCommentUpdate
    extends Omit<
            CommentType,
            | "replyCount"
            | "downvoteCount"
            | "upvoteCount"
            | "replies"
            | "updatedAt"
            | "original"
            | "cid"
            | "postCid"
            | "depth"
            | "ipnsKeyName"
            | "signer"
        >,
        Required<Pick<CommentType, "original" | "cid" | "postCid" | "depth">>,
        Omit<CommentUpdate, "author" | "replies"> {
    replies?: PagesTypeJson;
}

export interface CommentIpfsType
    extends Omit<CreateCommentOptions, "signer" | "timestamp" | "author">,
        PublicationType,
        Pick<CommentType, "previousCid" | "postCid" | "thumbnailUrl">,
        Pick<Required<CommentType>, "depth" | "ipnsName"> {
    author: AuthorIpfsType;
}

export interface CommentIpfsWithCid extends Omit<CommentIpfsType, "cid" | "postCid">, Pick<CommentWithCommentUpdate, "cid" | "postCid"> {}

export interface PostType extends Omit<CommentType, "parentCid" | "depth"> {
    depth: 0;
    parentCid: undefined;
}

export interface PostIpfsWithCid
    extends Omit<CommentIpfsType, "cid" | "postCid" | "depth" | "parentCid" | "title" | "link" | "thumbnailUrl">,
        Pick<CommentWithCommentUpdate, "cid" | "postCid">,
        Pick<PostType, "depth" | "parentCid" | "title" | "link" | "thumbnailUrl"> {}

export interface CommentEditType extends PublicationType, Omit<CreateCommentEditOptions, "signer"> {
    author: CommentIpfsType["author"];
    signer?: SignerType;
}

export type PublicationTypeName = "comment" | "vote" | "commentedit" | "commentupdate" | "subplebbit";

export interface CommentPubsubMessage
    extends Pick<CommentType, CommentSignedPropertyNamesUnion | "signature" | "protocolVersion" | "flair" | "spoiler"> {}
export interface PostPubsubMessage
    extends Pick<PostType, CommentSignedPropertyNamesUnion | "signature" | "protocolVersion" | "flair" | "spoiler"> {}
export interface VotePubsubMessage extends Pick<VoteType, VoteSignedPropertyNamesUnion | "signature" | "protocolVersion"> {}
export interface CommentEditPubsubMessage
    extends Pick<CommentEditType, CommentEditSignedPropertyNamesUnion | "signature" | "protocolVersion"> {}

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
    pin: Pick<IPFSHTTPClient["pin"], "rm">;
    block: { rm: (...p: Parameters<IPFSHTTPClient["block"]["rm"]>) => Promise<{ cid: CID; error?: Error }[]> };
    swarm: Pick<IPFSHTTPClient["swarm"], "peers">;
};
export type NativeFunctions = {
    listSubplebbits: (dataPath: string) => Promise<string[]>;
    createDbHandler: (subplebbit: DbHandler["_subplebbit"]) => DbHandlerPublicAPI;
    fetch: typeof fetch;
    createIpfsClient: (options: IpfsHttpClientOptions) => IpfsHttpClientPublicAPI;
    createImageCaptcha: (...p: Parameters<typeof createCaptcha>) => Promise<{ image: string; text: string }>;
    // This is a temporary method until https://github.com/ipfs/js-ipfs/issues/3547 is fixed
    importSignerIntoIpfsNode: (ipnsKeyName: string, ipfsKey: Uint8Array, plebbit: Plebbit) => Promise<{ Id: string; Name: string }>;
    deleteSubplebbit(subplebbitAddress: string, dataPath: string): Promise<void>;
};

export type OnlyDefinedProperties<T> = Pick<
    T,
    {
        [Prop in keyof T]: T[Prop] extends undefined ? never : Prop;
    }[keyof T]
>;

// Define database tables and fields here

export interface CommentsTableRow extends CommentIpfsWithCid, Required<Pick<CommentType, "ipnsKeyName">> {
    authorAddress: AuthorIpfsType["address"];
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    id: number;
    insertedAt: number;
}

export interface CommentsTableRowInsert extends Omit<CommentsTableRow, "id" | "insertedAt"> {}

// CommentUpdates table

export interface CommentUpdatesRow extends CommentUpdate {
    insertedAt: number;
}

export interface CommentUpdatesTableRowInsert extends Omit<CommentUpdatesRow, "insertedAt"> {}

// Votes table

export interface VotesTableRow extends VoteType {
    authorAddress: AuthorIpfsType["address"];
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    insertedAt: number;
}

export interface VotesTableRowInsert extends Omit<VotesTableRow, "insertedAt"> {}

// Challenge Request table

export interface ChallengeRequestsTableRow extends Omit<ChallengeRequestMessageType, "type" | "encryptedPublication"> {
    insertedAt: number;
}

export interface ChallengeRequestsTableRowInsert extends Omit<ChallengeRequestsTableRow, "insertedAt"> {}

// Challenges table
export interface ChallengesTableRow extends Omit<ChallengeMessageType, "type" | "encryptedChallenges"> {
    challengeTypes: ChallengeType["type"][];
    insertedAt: number;
}

export interface ChallengesTableRowInsert extends Omit<ChallengesTableRow, "insertedAt"> {}

// Challenge answers table

export interface ChallengeAnswersTableRow extends Omit<DecryptedChallengeAnswerMessageType, "type" | "encryptedChallengeAnswers"> {
    insertedAt: number;
}

export interface ChallengeAnswersTableRowInsert extends Omit<ChallengeAnswersTableRow, "insertedAt"> {}

// Challenge verifications table
export interface ChallengeVerificationsTableRow extends Omit<ChallengeVerificationMessageType, "type" | "encryptedPublication"> {
    insertedAt: number;
}

export interface ChallengeVerificationsTableRowInsert extends Omit<ChallengeVerificationsTableRow, "insertedAt"> {}

// Signers table
export interface SignersTableRow extends Required<Pick<SignerType, "privateKey" | "ipnsKeyName" | "type">> {
    insertedAt: number;
}

export interface SingersTableRowInsert extends Omit<SignersTableRow, "insertedAt"> {}

// Comment edits table

export interface CommentEditsTableRow extends CommentEditType {
    authorAddress: AuthorIpfsType["address"];
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    insertedAt: number;
}

export interface CommentEditsTableRowInsert extends Omit<CommentEditsTableRow, "insertedAt"> {}
declare module "knex/types/tables" {
    interface Tables {
        comments: Knex.CompositeTableType<CommentsTableRow, CommentsTableRowInsert, null, null>;
        commentUpdates: Knex.CompositeTableType<
            CommentUpdatesRow,
            CommentUpdatesTableRowInsert,
            Omit<CommentUpdatesTableRowInsert, "cid">,
            Omit<CommentUpdatesTableRowInsert, "cid">
        >;
        votes: Knex.CompositeTableType<VotesTableRow, VotesTableRowInsert, null>;
        challengeRequests: Knex.CompositeTableType<ChallengeRequestsTableRow, ChallengeRequestsTableRowInsert, null, null>;
        challenges: Knex.CompositeTableType<ChallengesTableRow, ChallengesTableRowInsert, null, null>;
        challengeAnswers: Knex.CompositeTableType<ChallengeAnswersTableRow, ChallengeAnswersTableRowInsert, null, null>;
        challengeVerifications: Knex.CompositeTableType<ChallengeVerificationsTableRow, ChallengeVerificationsTableRowInsert, null, null>;
        signers: Knex.CompositeTableType<SignersTableRow, SingersTableRowInsert, null, null>;
        commentEdits: Knex.CompositeTableType<CommentEditsTableRow, CommentEditsTableRowInsert, null, null>;
    }
}

// Event emitter declaration
export interface SubplebbitEvents {
    challengerequest: (request: DecryptedChallengeRequestMessageType) => void;
    challengemessage: (challenge: DecryptedChallengeMessageType) => void;
    challengeanswer: (answer: DecryptedChallengeAnswerMessageType) => void;
    challengeverification: (verification: DecryptedChallengeVerificationMessageType) => void;

    error: (error: PlebbitError) => void;

    // State changes
    statechange: (newState: Subplebbit["state"]) => void;
    updatingstatechange: (newState: Subplebbit["updatingState"]) => void;
    startedstatechange: (newState: Subplebbit["startedState"]) => void;

    update: (updatedSubplebbit: Subplebbit) => void;
}

export interface PublicationEvents {
    challengerequest: (request: DecryptedChallengeRequestMessageType) => void;
    challenge: (challenge: DecryptedChallengeMessageType) => void;
    challengeanswer: (answer: DecryptedChallengeAnswerMessageType) => void;
    challengeverification: (verification: DecryptedChallengeVerificationMessageType, decryptedComment?: Comment) => void; // Should we include the updated publication instance here? not sure
    error: (error: PlebbitError) => void;
    publishingstatechange: (newState: Publication["publishingState"]) => void;
    statechange: (newState: Publication["state"]) => void;

    // For comment only
    update: (updatedInstance: Comment) => void;
    updatingstatechange: (newState: Comment["updatingState"]) => void;
}

export interface PlebbitEvents {
    resolvedsubplebbitaddress: (subplebbitAddress: string, resolvedSubplebbitAddress: string) => void; // Emitted when subplebbit address (domain) is resolved to an IPNS
    resolvedauthoraddress: (authorAddress: string, resolvedAuthorAddress: string) => void; // Emitted when author address is resolved to an IPNS
    resolvedipns: (ipns: string, cid: string) => void; // Emitted when IPNS is resolved to a CID
    fetchedcid: (cid: string, content: string) => void; // Emitted when a CID is fetched with its file content
    fetchedipns: (ipns: string, content: string) => void; // Emitted when an IPNS is fetched with its file content
    error: (error: PlebbitError) => void;
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
    peers: () => Promise<PeersResult[]>; // https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-swarm-peers
    stats?: undefined; // Should be defined, will change later
    sessionStats?: undefined; // Should be defined, will change later
    subplebbitStats?: undefined; // Should be defined, will change later
    _client: IpfsHttpClientPublicAPI; // Private API, shouldn't be used by consumers
    _clientOptions: IpfsHttpClientOptions;
}

export interface PubsubClient {
    peers: () => Promise<string[]>; // IPFS peers https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-pubsub-peers
    stats?: undefined; // Should be defined, will change later
    sessionStats?: undefined; // Should be defined, will change later
    subplebbitStats?: undefined; // Should be defined, will change later
    _client: Pick<ReturnType<NativeFunctions["createIpfsClient"]>, "pubsub">; // Private API, shouldn't be used by consumers
    _clientOptions?: IpfsHttpClientOptions;
}

export interface GatewayClient {
    stats?: IpfsStats; // Should be defined, will change later
    sessionStats?: IpfsStats; // Should be defined, will change later. session means in the last 1h
    subplebbitStats?: { [subplebbitAddress: string]: IpfsSubplebbitStats }; // Should be defined, will change later
}

// Cache interface, will be used to set up general cache using localforage (for browser) or key-v SQLite (Node)
export interface CacheInterface {
    init: () => Promise<void>;
    getItem: (key: string) => Promise<any>;
    setItem: (key: string, value: any) => Promise<void>;
    removeItem: (key: string) => Promise<boolean>;
    clear: () => Promise<void>;
    keys: () => Promise<string[]>;

}
