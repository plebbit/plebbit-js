import { Options } from "ipfs-http-client";
import { Knex } from "knex";
import Author from "./author";
import { Comment } from "./comment";
import { Pages } from "./pages";
import { Signature, Signer } from "./signer";

export type BlockchainProvider = { url: string; chainId: number };
export interface PlebbitOptions {
    ipfsGatewayUrl?: string;
    ipfsHttpClientOptions?: Options;
    pubsubHttpClientOptions?: Options;
    dataPath?: string;
    blockchainProviders?: { [chainTicker: string]: BlockchainProvider };
    resolveAuthorAddresses?: boolean;
}
export type CreateSignerOptions = {
    privateKey?: string; // If undefined, generate a random private key
    type?: "rsa";
};
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
export interface CreateCommentOptions {
    subplebbitAddress: string;
    timestamp?: number; // Time of publishing in seconds, Math.round(Date.now() / 1000) if undefined
    author: Author;
    signer: Signer;
    parentCid?: string; // The parent comment CID, undefined if comment is a post, same as postCid if comment is top level
    content?: string; // Content of the comment, link posts have no content
    title?: string; // If comment is a post, it needs a title
    link?: string; // If comment is a post, it might be a link post
    spoiler?: boolean; // Hide the comment thumbnail behind spoiler warning
    flair?: Flair; // Author or mod chosen colored label for the comment
    cid?: string; // (Not for publishing) Gives access to Comment.on('update') for a comment already fetched
    ipnsName?: string; // (Not for publishing) Gives access to Comment.on('update') for a comment already fetched
}

export interface CreateVoteOptions {
    subplebbitAddress: string;
    commentCid: string;
    author: Author;
    vote: 1 | 0 | -1;
    signer: Signer;
    timestamp?: number;
}

export interface CreateCommentEditOptions {
    subplebbitAddress: string;
    commentCid: string; // The comment CID to be edited (don't use 'cid' because eventually CommentEdit.cid will exist)
    signer: Signer; // Signer of the edit, either original author or mod
    content?: string; // (Only author) Edited content of the comment
    editTimestamp?: number; // (Only author) Time of content edit in ms, Math.round(Date.now() / 1000) if undefined
    editReason?: string; // (Only author) Reason of the edit
    deleted?: boolean; // (Only author) Edited deleted status of the comment
    flair?: Flair; // (Author or mod) Edited flair of the comment
    spoiler?: boolean; // (Author or mod) Edited spoiler of the comment
    pinned?: boolean; // (Only mod) Edited pinned status of the comment
    locked?: boolean; // (Only mod) Edited locked status of the comment
    removed?: boolean; // (Only mod) Edited removed status of the comment
    authorBanExpiresAt?: number; // (Only author) Author was banned for this comment
    authorFlair?: Flair; // (Only mod) Edited flair of the author
    moderatorReason?: string; // (Only mod) Reason for mod action
}
export type Nft = { chainTicker: string; id: string; address: string; signature: string };
export type SubplebbitRole = { role: "owner" | "admin" | "moderator" };
export type ChallengeType = {
    type: "image" | "text" | "video" | "audio" | "html";
};

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

export interface SubplebbitType {
    title?: string;
    description?: string;
    roles?: { [authorAddress: string]: SubplebbitRole }; // each author address can be mapped to 1 SubplebbitRole
    pubsubTopic?: string; // the string to publish to in the pubsub, a public key of the subplebbit owner's choice
    latestPostCid?: string; // the most recent post in the linked list of posts
    posts?: Pages; // only preload page 1 sorted by 'hot', might preload more later, comments should include Comment + CommentUpdate data
    challengeTypes?: ChallengeType[]; // optional, only used for displaying on frontend, don't rely on it for challenge negotiation
    metricsCid?: string;
    createdAt?: number;
    updatedAt?: number;
    features?: SubplebbitFeatures;
    suggested?: SubplebbitSuggested;
    rules?: string[];
    address?: string;
    signer?: Signer;
    flairs?: Record<FlairOwner, Flair[]>; // list of post/author flairs authors and mods can choose from
    protocolVersion?: "1.0.0"; // semantic version of the protocol https://semver.org/
    encryption?: SubplebbitEncryption;
    signature?: Signature; // signature of the Subplebbit update by the sub owner to protect against malicious gateway
}
export type CreateSubplebbitOptions = SubplebbitType & { database?: Knex.Config };

export interface SubplebbitEditOptions {
    title?: string;
    description?: string;
    roles?: { [authorAddress: string]: SubplebbitRole };
    latestPostCid?: string;
    posts?: Pages;
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

export type SortProps = { score?: (comment: Comment) => number; timeframe?: Timeframe };

export type PostSort = Record<PostSortName, SortProps>; // If score is undefined means it's sorted from db, no need to sort in code

export type ReplySort = Record<ReplySortName, SortProps>;

export interface CommentUpdate {
    content?: string; // the author has edited the comment content
    editSignature?: Signature; // signature of the edited content by the author
    editTimestamp?: number; // the time of the last content edit
    editReason?: string; // reason of the author edit
    deleted?: boolean; // author deleted their comment
    upvoteCount?: number;
    downvoteCount?: number;
    replies?: Pages; // only preload page 1 sorted by 'topAll', might preload more later, only provide sorting for posts (not comments) that have 100+ child comments
    flair?: Flair; // arbitrary colored strings added by the author or mods to describe the author or comment
    spoiler?: boolean;
    pinned?: boolean;
    locked?: boolean;
    removed?: boolean; // mod deleted a comment
    authorBanExpiresAt?: number; // timestamp in second, if defined the author was banned for this comment
    moderatorReason?: string; // reason the mod took a mod action
    updatedAt?: number; // timestamp in seconds the IPNS record was updated
    authorFlair?: Flair; // mod can edit an author's flair
    protocolVersion: "1.0.0"; // semantic version of the protocol https://semver.org/
    signature: Signature; // signature of the CommentUpdate by the sub owner to protect against malicious gateway
}

export type CommentSignedPropertyNames = (keyof Pick<
    CreateCommentOptions,
    "subplebbitAddress" | "author" | "timestamp" | "content" | "title" | "link" | "parentCid"
>)[];
export type CommentEditSignedPropertyNames = (keyof Pick<
    CreateCommentEditOptions,
    | "subplebbitAddress"
    | "content"
    | "commentCid"
    | "editTimestamp"
    | "editReason"
    | "deleted"
    | "spoiler"
    | "pinned"
    | "locked"
    | "removed"
    | "moderatorReason"
>)[];

[];

export type CommentUpdatedSignedPropertyNames = (keyof Omit<CommentUpdate, "signature">)[];
export type VoteSignedPropertyNames = (keyof Omit<CreateVoteOptions, "signer">)[];
export type SubplebbitSignedPropertyNames = (keyof Omit<SubplebbitType, "signer" | "signature">)[];
// MultisubSignedPropertyNames: // TODO

// the fields that were signed as part of the signature, client should require that certain fields be signed or reject the publication
export type SignedPropertyNames =
    | CommentSignedPropertyNames
    | CommentEditSignedPropertyNames
    | VoteSignedPropertyNames
    | SubplebbitSignedPropertyNames
    | CommentUpdatedSignedPropertyNames;
// | MultisubSignedPropertyNames;
