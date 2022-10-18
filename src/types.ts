import { IPFSHTTPClient, Options } from "ipfs-http-client";
import { Knex } from "knex";
import { Pages } from "./pages";
import { DbHandler } from "./runtime/node/db-handler";
import { Subplebbit } from "./subplebbit";
import fetch from "node-fetch";
import { createCaptcha } from "captcha-canvas";
import { Plebbit } from "./plebbit";

export type ProtocolVersion = "1.0.0";

export type BlockchainProvider = { url: string; chainId: number };
export interface PlebbitOptions {
    ipfsGatewayUrl?: string;
    ipfsHttpClientOptions?: Options | string;
    pubsubHttpClientOptions?: Options | string;
    dataPath?: string;
    blockchainProviders?: { [chainTicker: string]: BlockchainProvider };
    resolveAuthorAddresses?: boolean;
}
export type CreateSignerOptions = {
    privateKey?: string; // If undefined, generate a random private key
    type?: "rsa";
};

export interface PageType {
    comments: CommentType[];
    nextCid?: string;
}

export interface PagesType {
    pages?: Partial<Record<PostSortName | ReplySortName, PageType>>;
    pageCids?: Partial<Record<PostSortName | ReplySortName, string>>;
    subplebbit: Pick<Subplebbit, "address">; // We don't need full Subplebbit, just these two
}
export interface SignerType {
    type: "rsa";
    privateKey: string;
    publicKey?: string;
    address?: string;
    ipfsKey?: Uint8Array;
    usage?: "comment" | "subplebbit";
    ipnsKeyName?: string;
}
export type Encrypted = {
    // examples available at https://github.com/plebbit/plebbit-js/blob/master/docs/encryption.md
    encrypted: string; // base64 encrypted string with AES CBC 128 // https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher_block_chaining_(CBC)
    encryptedKey: string; // base64 encrypted key for the AES CBC 128 encrypted content, encrypted using subplebbit.encryption settings, always generate a new key with AES CBC or it's insecure
    type: "aes-cbc";
};
export type SubplebbitEncryption = {
    type: "aes-cbc"; // https://github.com/plebbit/plebbit-js/blob/master/docs/encryption.md
    publicKey: string; // PEM format https://en.wikipedia.org/wiki/PKCS_8
};
export interface CreateCommentOptions extends CreatePublicationOptions {
    signer: SignerType;
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
    signer: SignerType;
}

export interface VoteType extends Omit<CreateVoteOptions, "signer">, PublicationType {
    author: AuthorType;
    timestamp: number;
    signer?: SignerType;
}

export interface AuthorType {
    address: string;
    previousCommentCid?: string; // linked list of the author's comments
    displayName?: string;
    wallets?: { [chainTicker: string]: Wallet };
    avatar?: Nft;
    flair?: Flair; // not part of the signature, mod can edit it after comment is published
    banExpiresAt?: number; // timestamp in second, if defined the author was banned for this comment
}

export type Wallet = {
    address: string;
    // ...will add more stuff later, like signer or send/sign or balance
};

export interface SignatureType {
    signature: string;
    publicKey: string;
    type: "rsa";
    signedPropertyNames: SignedPropertyNames;
}

export interface PublicationType extends Required<CreatePublicationOptions> {
    author: AuthorType;
    signature: SignatureType; // sign immutable fields like author, title, content, timestamp to prevent tampering
    protocolVersion: ProtocolVersion; // semantic version of the protocol https://semver.org/
}

interface CreatePublicationOptions {
    author?: Partial<AuthorType>;
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
export interface AuthorCommentEdit extends AuthorCommentEditOptions, PublicationType {}

export interface ModeratorCommentEdit extends ModeratorCommentEditOptions, PublicationType {}
export type CommentAuthorEditOptions = Pick<AuthorType, "banExpiresAt" | "flair">;
export interface CreateCommentEditOptions extends AuthorCommentEdit, ModeratorCommentEdit {
    signer: SignerType;
}

//*********************
//* "Edit" publications
//*********************

export type Nft = { chainTicker: string; id: string; address: string; signature: string };
export type SubplebbitRole = { role: "owner" | "admin" | "moderator" };

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

export type SubplebbitMetrics = {
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

export interface SubplebbitType extends Omit<CreateSubplebbitOptions, "database"> {
    signature: SignatureType;
    encryption: SubplebbitEncryption;
    address: string;
    createdAt: number;
    updatedAt: number;
    pubsubTopic: string;
    metricsCid?: string;
    protocolVersion: ProtocolVersion; // semantic version of the protocol https://semver.org/
    posts: Pages | Pick<Pages, "pages" | "pageCids">;
}
export interface CreateSubplebbitOptions extends SubplebbitEditOptions {
    createdAt?: number;
    updatedAt?: number;
    signer?: SignerType;
    encryption?: SubplebbitEncryption;
    signature?: SignatureType; // signature of the Subplebbit update by the sub owner to protect against malicious gateway

    database?: Omit<Knex.Config, "client" | "connection" | "pool" | "postProcessResponse" | "wrapIdentifier" | "seeds" | "log"> & {
        connection: { filename: string; flags?: string[]; debug?: boolean; expirationChecker?(): boolean };
        client: string;
        useNullAsDefault: true;
    }; // "client" field causes an error in plebbit-cli tsoa routes generation. Easier to omit it here than to debug there
}

export interface SubplebbitEditOptions {
    title?: string;
    description?: string;
    roles?: { [authorAddress: string]: SubplebbitRole };
    rules?: string[];
    lastPostCid?: string;
    posts?: Pages | Pick<Pages, "pages" | "pageCids">;
    pubsubTopic?: string;
    challengeTypes?: ChallengeType[];
    metrics?: SubplebbitMetrics;
    features?: SubplebbitFeatures;
    suggested?: SubplebbitSuggested;
    flairs?: Record<FlairOwner, Flair[]>; // list of post/author flairs authors and mods can choose from
    address?: string;
}

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

export type SortProps = { score?: (comment: CommentType) => number; timeframe?: Timeframe };

export type PostSort = Record<PostSortName, SortProps>; // If score is undefined means it's sorted from db, no need to sort in code

export type ReplySort = Record<ReplySortName, SortProps>;

export interface CommentUpdate {
    upvoteCount: number;
    downvoteCount: number;
    replyCount: number;
    authorEdit?: AuthorCommentEdit; // most recent edit by comment author, merge authorEdit.content, authorEdit.deleted, authorEdit.flair with comment. Validate authorEdit.signature
    replies: PagesType; // only preload page 1 sorted by 'topAll', might preload more later, only provide sorting for posts (not comments) that have 100+ child comments
    flair?: Flair; // arbitrary colored strings added by the author or mods to describe the author or comment
    spoiler?: boolean;
    pinned?: boolean;
    locked?: boolean;
    removed?: boolean; // mod deleted a comment
    moderatorReason?: string; // reason the mod took a mod action
    updatedAt: number; // timestamp in seconds the IPNS record was updated
    protocolVersion: ProtocolVersion; // semantic version of the protocol https://semver.org/
    signature: SignatureType; // signature of the CommentUpdate by the sub owner to protect against malicious gateway
    author?: CommentAuthorEditOptions;
}

export interface CommentType extends Partial<CommentUpdate>, Omit<CreateCommentOptions, "signer">, PublicationType {
    author: AuthorType;
    timestamp: number;
    protocolVersion: ProtocolVersion;
    signature: SignatureType;
    postCid?: string;
    previousCid?: string; // each post is a linked list
    ipnsKeyName?: string;
    depth?: number;
    signer?: SignerType;
    original?: Pick<Partial<CommentType>, "author" | "content" | "flair">;
    thumbnailUrl?: string;
    cid?: string; // (Not for publishing) Gives access to Comment.on('update') for a comment already fetched
    ipnsName?: string; // (Not for publishing) Gives access to Comment.on('update') for a comment already fetched
}

export interface CommentIpfsType
    extends Omit<CreateCommentOptions, "signer" | "timestamp" | "author">,
        PublicationType,
        Pick<CommentType, "previousCid" | "postCid" | "thumbnailUrl">,
        Pick<Required<CommentType>, "depth" | "ipnsName"> {}

export interface PostType extends Omit<CommentType, "parentCid" | "depth"> {
    depth: 0;
    parentCid: undefined;
    title: string;
    link?: string;
    thumbnailUrl?: string; // fetched by subplebbit owner, not author, some web pages have thumbnail urls in their meta tags https://moz.com/blog/meta-data-templates-123
}

export interface CommentEditType extends PublicationType, Omit<CreateCommentEditOptions, "signer"> {
    signer?: SignerType;
}

export type PublicationTypeName = "comment" | "vote" | "commentedit" | "commentupdate" | "subplebbit";

export type SignatureTypes =
    | PublicationTypeName
    | "challengerequestmessage"
    | "challengemessage"
    | "challengeanswermessage"
    | "challengeverificationmessage";

export type CommentSignedPropertyNames = (keyof Pick<
    CreateCommentOptions,
    "subplebbitAddress" | "author" | "timestamp" | "content" | "title" | "link" | "parentCid"
>)[];
export type CommentEditSignedPropertyNames = (keyof Omit<CreateCommentEditOptions, "signer" | "signature" | "protocolVersion">)[];

export type CommentUpdatedSignedPropertyNames = (keyof Omit<CommentUpdate, "signature" | "protocolVersion">)[];
export type VoteSignedPropertyNames = (keyof Omit<CreateVoteOptions, "signer" | "protocolVersion">)[];
export type SubplebbitSignedPropertyNames = (keyof Omit<SubplebbitType, "signer" | "signature" | "protocolVersion">)[];
export type ChallengeRequestMessageSignedPropertyNames = (keyof Omit<
    ChallengeRequestMessageType,
    "signature" | "protocolVersion" | "userAgent"
>)[];
export type ChallengeMessageSignedPropertyNames = (keyof Omit<ChallengeMessageType, "signature" | "protocolVersion" | "userAgent">)[];
export type ChallengeAnswerMessageSignedPropertyNames = (keyof Omit<
    ChallengeAnswerMessageType,
    "signature" | "protocolVersion" | "userAgent"
>)[];
export type ChallengeVerificationMessageSignedPropertyNames = (keyof Omit<
    ChallengeVerificationMessageType,
    "signature" | "protocolVersion" | "userAgent"
>)[];
// MultisubSignedPropertyNames: // TODO

// the fields that were signed as part of the signature, client should require that certain fields be signed or reject the publication
export type SignedPropertyNames =
    | CommentSignedPropertyNames
    | CommentEditSignedPropertyNames
    | VoteSignedPropertyNames
    | SubplebbitSignedPropertyNames
    | CommentUpdatedSignedPropertyNames
    | ChallengeRequestMessageSignedPropertyNames
    | ChallengeMessageSignedPropertyNames
    | ChallengeAnswerMessageSignedPropertyNames
    | ChallengeVerificationMessageSignedPropertyNames;
// | MultisubSignedPropertyNames;

type FunctionPropertyOf<T> = {
    [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];

export type DbHandlerPublicAPI = Pick<DbHandler, FunctionPropertyOf<DbHandler>>;

export type IpfsHttpClientPublicAPI = {
    add: IPFSHTTPClient["add"];
    cat: (...p: Parameters<IPFSHTTPClient["cat"]>) => Promise<string | undefined>;
    pubsub: Pick<IPFSHTTPClient["pubsub"], "subscribe" | "unsubscribe" | "publish">;
    name: {
        resolve: (...p: Parameters<IPFSHTTPClient["name"]["resolve"]>) => Promise<string | undefined>;
        publish: IPFSHTTPClient["name"]["publish"];
    };
    config: Pick<IPFSHTTPClient["config"], "get">;
    key: Pick<IPFSHTTPClient["key"], "list">;
};
export type NativeFunctions = {
    listSubplebbits: (dataPath: string) => Promise<string[]>;
    createDbHandler: (subplebbit: DbHandler["_subplebbit"]) => DbHandlerPublicAPI;
    fetch: typeof fetch;
    createIpfsClient: (options: Options | string) => IpfsHttpClientPublicAPI;
    createImageCaptcha: (...p: Parameters<typeof createCaptcha>) => Promise<{ image: string; text: string }>;
    // This is a temporary method until https://github.com/ipfs/js-ipfs/issues/3547 is fixed
    importSignerIntoIpfsNode: (signer: SignerType, plebbit: Plebbit) => Promise<{ Id: string; Name: string }>;
};

export type OnlyDefinedProperties<T> = Pick<
    T,
    {
        [Prop in keyof T]: T[Prop] extends undefined ? never : Prop;
    }[keyof T]
>;

// These types are for DB handler

export type CommentEditForDbType = OnlyDefinedProperties<
    Omit<CommentEditType, "author"> & { author: string; authorAddress: string; challengeRequestId: string }
>;

export type CommentForDbType = OnlyDefinedProperties<
    Omit<CommentType, "replyCount" | "upvoteCount" | "downvoteCount" | "replies" | "signature" | "author" | "authorEdit"> & {
        authorEdit: string;
        original: string;
        author: string;
        authorAddress: string;
        challengeRequestId?: string;
        ipnsKeyName: string;
        signature: string;
    }
>;

export type VoteForDbType = Omit<VoteType, "author" | "signature"> & {
    author: string;
    authorAddress: string;
    challengeRequestId: string;
    signature: string;
};

export type AuthorDbType = Pick<AuthorType, "address" | "banExpiresAt" | "flair">;

// Signatures
export type PublicationToVerify =
    | CommentEditType
    | VoteType
    | CommentType
    | PostType
    | CommentUpdate
    | SubplebbitType
    | ChallengeRequestMessageType
    | ChallengeMessageType
    | ChallengeAnswerMessageType
    | ChallengeVerificationMessageType;

export type PublicationsToSign =
    | CreateCommentEditOptions
    | CreateVoteOptions
    | CreateCommentOptions
    | Omit<CommentUpdate, "signature">
    | Omit<SubplebbitType, "signature">
    | Omit<ChallengeAnswerMessageType, "signature">
    | Omit<ChallengeRequestMessageType, "signature">
    | Omit<ChallengeVerificationMessageType, "signature">
    | Omit<ChallengeMessageType, "signature">;
