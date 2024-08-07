import { create as CreateIpfsClient, Options as IpfsHttpClientOptions } from "kubo-rpc-client";
import { Knex } from "knex";
import { Comment } from "./publications/comment/comment.js";
import {
    CommentEditSignedPropertyNamesUnion,
    CommentSignedPropertyNamesUnion,
    EncodedPubsubSignature,
    Encrypted,
    EncryptedEncoded,
    JsonSignature,
    PubsubSignature,
    SignerType,
    VoteSignedPropertyNamesUnion
} from "./signer/constants.js";
import Publication from "./publications/publication.js";
import { PlebbitError } from "./plebbit-error.js";
import { ChallengeFile, Flair } from "./subplebbit/types.js";
import { Plebbit } from "./plebbit.js";
import { RemoteSubplebbit } from "./subplebbit/remote-subplebbit.js";
import { RpcLocalSubplebbit } from "./subplebbit/rpc-local-subplebbit.js";

export type ProtocolVersion = "1.0.0";
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
    comments: Comment[];
    nextCid?: string;
}

export interface PageTypeJson {
    comments: CommentWithCommentUpdateJson[];
    nextCid?: string;
}

export interface PageIpfs {
    comments: { comment: CommentIpfsWithCid; update: CommentUpdate }[];
    nextCid?: string;
}

export interface PagesInstanceType {
    pages: Partial<Record<PostSortName | ReplySortName, PageInstanceType>>;
    pageCids: Record<PostSortName | ReplySortName, string> | {}; // defaults to empty if page instance is not initialized yet
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
    parentCid?: string; // The parent comment CID, undefined if comment is a post, same as postCid if comment is top level
    content?: string; // Content of the comment, link posts have no content
    title?: string; // If comment is a post, it needs a title
    link?: string; // If comment is a post, it might be a link post
    linkWidth?: number; // author can optionally provide dimensions of image/video link which helps UI clients with infinite scrolling feeds
    linkHeight?: number;
    spoiler?: boolean; // Hide the comment thumbnail behind spoiler warning
    flair?: Flair; // Author or mod chosen colored label for the comment
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

// Below is what's used to initialize a local publication to be published

export type LocalCommentOptions = CommentOptionsToSign & { signature: JsonSignature } & Pick<
        CreatePublicationOptions,
        "challengeAnswers" | "challengeCommentCids"
    >;
export type LocalVoteOptions = VoteOptionsToSign & { signature: JsonSignature } & Pick<
        CreatePublicationOptions,
        "challengeAnswers" | "challengeCommentCids"
    >;
export type LocalCommentEditOptions = CommentEditOptionsToSign & { signature: JsonSignature } & Pick<
        CreatePublicationOptions,
        "challengeAnswers" | "challengeCommentCids"
    >;

export interface SubplebbitAuthor {
    postScore: number; // total post karma in the subplebbit
    replyScore: number; // total reply karma in the subplebbit
    banExpiresAt?: number; // timestamp in second, if defined the author was banned for this comment
    flair?: Flair; // not part of the signature, mod can edit it after comment is published
    firstCommentTimestamp: number; // timestamp of the first comment by the author in the subplebbit, used for account age based challenges
    lastCommentCid: string; // last comment by the author in the subplebbit, can be used with author.previousCommentCid to get a recent author comment history in all subplebbits
}

// TODO should be renamed to AuthorPubsubType
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
    timestamp: number; // in seconds, allows partial blocking multiple authors using the same wallet
    signature: { signature: "0x${string}"; type: "eip191" };
    // ...will add more stuff later, like signer or send/sign or balance
};

export type PublicationPubsubMessage = CommentPubsubMessage | VotePubsubMessage | CommentEditPubsubMessage;

// creating a new local publication
export interface CreatePublicationOptions {
    signer: Pick<SignerType, "privateKey" | "type">;
    author?: Partial<AuthorIpfsType>;
    subplebbitAddress: string; // all publications are directed to a subplebbit owner
    protocolVersion?: ProtocolVersion;
    timestamp?: number; // // Time of publishing in seconds, Defaults to Math.round(Date.now() / 1000) if undefined
    challengeAnswers?: string[]; // Optional pre-answers to subplebbit.challenges
    challengeCommentCids?: string[]; // Optional comment cids for subplebbit.challenges related to author karma/age in other subs
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
export interface AuthorCommentEditOptions {
    commentCid: string;
    content?: string;
    deleted?: boolean;
    flair?: Flair;
    spoiler?: boolean;
    reason?: string;
}
export interface CreateCommentEditOptions extends AuthorCommentEditOptions, ModeratorCommentEditOptions, CreatePublicationOptions {}

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

//*********************
//* "Edit" publications
//*********************

export type Nft = {
    chainTicker: string; // ticker of the chain, like eth, avax, sol, etc in lowercase
    address: string; // address of the NFT contract
    id: string; // tokenId or index of the specific NFT used, must be string type, not number
    timestamp: number; // in seconds, needed to mitigate multiple users using the same signature
    signature: { signature: "0x${string}"; type: "eip191" }; // proof that author.address owns the nft
    // how to resolve and verify NFT signatures https://github.com/plebbit/plebbit-js/blob/master/docs/nft.md
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

export interface DecryptedChallengeRequestCommentEdit extends DecryptedChallengeRequest {
    publication: CommentEditPubsubMessage;
}

export interface DecryptedChallengeRequestVote extends DecryptedChallengeRequest {
    publication: VotePubsubMessage;
}

export interface DecryptedChallengeRequestMessageType extends ChallengeRequestMessageType, DecryptedChallengeRequest {}

export type ChallengeRequestVoteWithSubplebbitAuthor = VotePubsubMessage & {
    author: AuthorIpfsType & { subplebbit: SubplebbitAuthor | undefined };
};
export type ChallengeRequestCommentEditWithSubplebbitAuthor = CommentEditPubsubMessage & {
    author: AuthorIpfsType & { subplebbit: SubplebbitAuthor | undefined };
};
export type ChallengeRequestCommentWithSubplebbitAuthor = CommentPubsubMessage & {
    author: AuthorIpfsType & { subplebbit: SubplebbitAuthor | undefined };
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
export type ReplySortName = "topAll" | "new" | "old" | "controversialAll";

export type SortProps = {
    score: (comment: { comment: CommentsTableRow; update: CommentUpdatesRow }) => number;
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
    replies?: RepliesPagesTypeIpfs; // only preload page 1 sorted by 'topAll', might preload more later, only provide sorting for posts (not comments) that have 100+ child comments
    flair?: Flair; // arbitrary colored string to describe the comment, added by mods, override comment.flair and comment.edit.flair (which are added by author)
    spoiler?: boolean;
    pinned?: boolean;
    locked?: boolean;
    removed?: boolean; // mod deleted a comment
    reason?: string; // reason the mod took a mod action
    updatedAt: number; // timestamp in seconds the CommentUpdate was updated
    protocolVersion: ProtocolVersion; // semantic version of the protocol https://semver.org/
    author?: {
        // add commentUpdate.author.subplebbit to comment.author.subplebbit, override comment.author.flair with commentUpdate.author.subplebbit.flair if any
        subplebbit: SubplebbitAuthor;
    };
    lastChildCid?: string; // The cid of the most recent direct child of the comment
    lastReplyTimestamp?: number; // The timestamp of the most recent direct or indirect child of the comment
    signature: JsonSignature; // signature of the CommentUpdate by the sub owner to protect against malicious gateway
}

export interface CommentWithCommentUpdateJson extends CommentIpfsWithCid, Omit<CommentUpdate, "author" | "replies">, CommentTypeJsonBase {
    replies?: RepliesPagesTypeJson;
    original: Pick<CommentPubsubMessage, "author" | "content" | "flair" | "protocolVersion">;
    shortCid: string;
    author: AuthorTypeWithCommentUpdate & { shortAddress: string };
    deleted?: boolean;
}

// These are the props added by the subplebbit before adding the comment to ipfs
export interface CommentIpfsType extends CommentPubsubMessage {
    depth: number;
    postCid?: string;
    thumbnailUrl?: string;
    thumbnailUrlWidth?: number;
    thumbnailUrlHeight?: number;
    previousCid?: string;
}

export interface CommentIpfsWithCid extends Omit<CommentIpfsType, "cid" | "postCid"> {
    // We're using CommentUpdate["cid"] here because we want cid strings to be defined in a global place, instead of cid:string everywhere
    cid: CommentUpdate["cid"];
    postCid: CommentUpdate["cid"];
}

export interface CommentEditTypeJson extends CommentEditPubsubMessage {
    shortSubplebbitAddress: string;
    author: AuthorTypeJson;
}

export type AuthorTypeJson = (AuthorIpfsType | AuthorTypeWithCommentUpdate) & { shortAddress: string };

export interface VoteTypeJson extends VotePubsubMessage {
    shortSubplebbitAddress: string;
    author: AuthorTypeJson;
}

export type PublicationTypeName = "comment" | "vote" | "commentedit" | "subplebbit" | "commentupdate";

export type CommentPubsubMessage = Pick<LocalCommentOptions, CommentSignedPropertyNamesUnion | "signature" | "protocolVersion">;

export interface VotePubsubMessage extends Pick<LocalVoteOptions, VoteSignedPropertyNamesUnion | "signature" | "protocolVersion"> {}
export interface CommentEditPubsubMessage
    extends Pick<LocalCommentEditOptions, CommentEditSignedPropertyNamesUnion | "signature" | "protocolVersion"> {}

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
    authorAddress: AuthorIpfsType["address"];
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
    authorAddress: AuthorIpfsType["address"];
    insertedAt: number;
    authorSignerAddress: string;
}

export interface VotesTableRowInsert extends Omit<VotesTableRow, "insertedAt"> {}

// Comment edits table

export interface CommentEditsTableRow extends CommentEditPubsubMessage {
    authorAddress: AuthorIpfsType["address"];
    insertedAt: number;
    isAuthorEdit: boolean; // If false, then mod edit
    authorSignerAddress: string;
}

export interface CommentEditsTableRowInsert extends Omit<CommentEditsTableRow, "insertedAt"> {}
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
