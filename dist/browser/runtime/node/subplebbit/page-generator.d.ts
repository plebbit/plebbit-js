import type { ModQueueCommentInPage, ModQueuePageIpfs, PageIpfs, PostSortName, PostsPagesTypeIpfs, RepliesPagesTypeIpfs, ReplySortName } from "../../../pages/types.js";
import type { CommentsTableRow, CommentUpdateType } from "../../../publications/comment/types.js";
import { POST_REPLIES_SORT_TYPES, REPLY_REPLIES_SORT_TYPES } from "../../../pages/util.js";
import { SubplebbitIpfsType } from "../../../subplebbit/types.js";
export type PageOptions = {
    excludeRemovedComments: boolean;
    excludeDeletedComments: boolean;
    excludeCommentPendingApproval: boolean;
    excludeCommentWithApprovedFalse: boolean;
    excludeCommentsWithDifferentSubAddress: boolean;
    commentUpdateFieldsToExclude?: (keyof CommentUpdateType)[];
    parentCid: string | null;
    preloadedPage: PostSortName | ReplySortName;
    baseTimestamp: number;
    firstPageSizeBytes: number;
};
type SinglePreloadedPageRes = Record<PostSortName | ReplySortName, PageIpfs>;
type PageCidUndefinedIfPreloadedPage = [undefined, ...string[]] | string[];
type AddedPageChunksToIpfsRes = Partial<Record<PostSortName | ReplySortName, {
    pages: PageIpfs[];
    cids: PageCidUndefinedIfPreloadedPage;
}>>;
export declare class PageGenerator {
    private _subplebbit;
    constructor(subplebbit: PageGenerator["_subplebbit"]);
    private addQueuedCommentChunksToIpfs;
    private addCommentChunksToIpfs;
    private addPreloadedCommentChunksToIpfs;
    _chunkComments<T extends PageIpfs["comments"] | ModQueuePageIpfs["comments"]>({ comments, firstPageSizeBytes }: {
        comments: T;
        firstPageSizeBytes: number;
    }): T[];
    sortAndChunkComments(unsortedComments: (PageIpfs["comments"][0] & {
        activeScore?: number;
    })[], sortName: PostSortName | ReplySortName, options: PageOptions): Promise<PageIpfs["comments"][]>;
    sortChunkAddIpfsNonPreloaded(comments: PageIpfs["comments"], sortName: PostSortName | ReplySortName, options: PageOptions): Promise<AddedPageChunksToIpfsRes | undefined>;
    private _generationResToPages;
    generateSubplebbitPosts(preloadedPageSortName: PostSortName, preloadedPageSizeBytes: number): Promise<PostsPagesTypeIpfs | {
        singlePreloadedPage: SinglePreloadedPageRes;
    } | undefined>;
    _bundleLatestCommentUpdateWithQueuedComments(queuedComment: CommentsTableRow): Promise<ModQueueCommentInPage>;
    generateModQueuePages(): Promise<(SubplebbitIpfsType["modQueue"] & {
        combinedHashOfCids: string;
    }) | undefined>;
    generatePostPages(comment: Pick<CommentsTableRow, "cid">, preloadedReplyPageSortName: keyof typeof POST_REPLIES_SORT_TYPES, preloadedPageSizeBytes: number): Promise<{
        pages: Record<string, {
            comments: {
                comment: {
                    [x: string]: unknown;
                    timestamp: number;
                    signature: {
                        type: string;
                        signature: string;
                        publicKey: string;
                        signedPropertyNames: string[];
                    };
                    subplebbitAddress: string;
                    protocolVersion: string;
                    author: {
                        [x: string]: unknown;
                        address: string;
                        previousCommentCid?: string | undefined;
                        displayName?: string | undefined;
                        wallets?: Record<string, {
                            address: string;
                            timestamp: number;
                            signature: {
                                signature: string;
                                type: string;
                            };
                        }> | undefined;
                        avatar?: {
                            [x: string]: unknown;
                            chainTicker: string;
                            address: string;
                            id: string;
                            timestamp: number;
                            signature: {
                                signature: string;
                                type: string;
                            };
                        } | undefined;
                        flair?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        } | undefined;
                    };
                    depth: number;
                    flair?: {
                        [x: string]: unknown;
                        text: string;
                        backgroundColor?: string | undefined;
                        textColor?: string | undefined;
                        expiresAt?: number | undefined;
                    } | undefined;
                    content?: string | undefined;
                    spoiler?: boolean | undefined;
                    nsfw?: boolean | undefined;
                    link?: string | undefined;
                    title?: string | undefined;
                    linkWidth?: number | undefined;
                    linkHeight?: number | undefined;
                    linkHtmlTagName?: string | undefined;
                    parentCid?: string | undefined;
                    postCid?: string | undefined;
                    thumbnailUrl?: string | undefined;
                    thumbnailUrlWidth?: number | undefined;
                    thumbnailUrlHeight?: number | undefined;
                    previousCid?: string | undefined;
                };
                commentUpdate: {
                    [x: string]: unknown;
                    cid: string;
                    upvoteCount: number;
                    downvoteCount: number;
                    replyCount: number;
                    updatedAt: number;
                    signature: {
                        type: string;
                        signature: string;
                        publicKey: string;
                        signedPropertyNames: string[];
                    };
                    protocolVersion: string;
                    childCount?: number | undefined;
                    edit?: {
                        [x: string]: unknown;
                        timestamp: number;
                        signature: {
                            type: string;
                            signature: string;
                            publicKey: string;
                            signedPropertyNames: string[];
                        };
                        subplebbitAddress: string;
                        protocolVersion: string;
                        commentCid: string;
                        author: {
                            [x: string]: unknown;
                            address: string;
                            previousCommentCid?: string | undefined;
                            displayName?: string | undefined;
                            wallets?: Record<string, {
                                address: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            }> | undefined;
                            avatar?: {
                                [x: string]: unknown;
                                chainTicker: string;
                                address: string;
                                id: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            } | undefined;
                            flair?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            } | undefined;
                        };
                        flair?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        } | undefined;
                        content?: string | undefined;
                        deleted?: boolean | undefined;
                        spoiler?: boolean | undefined;
                        nsfw?: boolean | undefined;
                        reason?: string | undefined;
                    } | undefined;
                    flair?: {
                        [x: string]: unknown;
                        text: string;
                        backgroundColor?: string | undefined;
                        textColor?: string | undefined;
                        expiresAt?: number | undefined;
                    } | undefined;
                    spoiler?: boolean | undefined;
                    nsfw?: boolean | undefined;
                    pinned?: boolean | undefined;
                    locked?: boolean | undefined;
                    removed?: boolean | undefined;
                    reason?: string | undefined;
                    approved?: boolean | undefined;
                    author?: {
                        [x: string]: unknown;
                        subplebbit?: {
                            [x: string]: unknown;
                            postScore: number;
                            replyScore: number;
                            firstCommentTimestamp: number;
                            lastCommentCid: string;
                            banExpiresAt?: number | undefined;
                            flair?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            } | undefined;
                        } | undefined;
                    } | undefined;
                    lastChildCid?: string | undefined;
                    lastReplyTimestamp?: number | undefined;
                    replies?: /*elided*/ any | undefined;
                };
            }[];
            nextCid?: string | undefined;
        }>;
        pageCids?: Record<string, string> | undefined;
    } | {
        singlePreloadedPage: {
            [preloadedReplyPageSortName]: {
                comments: {
                    comment: {
                        [x: string]: unknown;
                        timestamp: number;
                        signature: {
                            type: string;
                            signature: string;
                            publicKey: string;
                            signedPropertyNames: string[];
                        };
                        subplebbitAddress: string;
                        protocolVersion: string;
                        author: {
                            [x: string]: unknown;
                            address: string;
                            previousCommentCid?: string | undefined;
                            displayName?: string | undefined;
                            wallets?: Record<string, {
                                address: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            }> | undefined;
                            avatar?: {
                                [x: string]: unknown;
                                chainTicker: string;
                                address: string;
                                id: string;
                                timestamp: number;
                                signature: {
                                    signature: string;
                                    type: string;
                                };
                            } | undefined;
                            flair?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            } | undefined;
                        };
                        depth: number;
                        flair?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        } | undefined;
                        content?: string | undefined;
                        spoiler?: boolean | undefined;
                        nsfw?: boolean | undefined;
                        link?: string | undefined;
                        title?: string | undefined;
                        linkWidth?: number | undefined;
                        linkHeight?: number | undefined;
                        linkHtmlTagName?: string | undefined;
                        parentCid?: string | undefined;
                        postCid?: string | undefined;
                        thumbnailUrl?: string | undefined;
                        thumbnailUrlWidth?: number | undefined;
                        thumbnailUrlHeight?: number | undefined;
                        previousCid?: string | undefined;
                    };
                    commentUpdate: {
                        [x: string]: unknown;
                        cid: string;
                        upvoteCount: number;
                        downvoteCount: number;
                        replyCount: number;
                        updatedAt: number;
                        signature: {
                            type: string;
                            signature: string;
                            publicKey: string;
                            signedPropertyNames: string[];
                        };
                        protocolVersion: string;
                        childCount?: number | undefined;
                        edit?: {
                            [x: string]: unknown;
                            timestamp: number;
                            signature: {
                                type: string;
                                signature: string;
                                publicKey: string;
                                signedPropertyNames: string[];
                            };
                            subplebbitAddress: string;
                            protocolVersion: string;
                            commentCid: string;
                            author: {
                                [x: string]: unknown;
                                address: string;
                                previousCommentCid?: string | undefined;
                                displayName?: string | undefined;
                                wallets?: Record<string, {
                                    address: string;
                                    timestamp: number;
                                    signature: {
                                        signature: string;
                                        type: string;
                                    };
                                }> | undefined;
                                avatar?: {
                                    [x: string]: unknown;
                                    chainTicker: string;
                                    address: string;
                                    id: string;
                                    timestamp: number;
                                    signature: {
                                        signature: string;
                                        type: string;
                                    };
                                } | undefined;
                                flair?: {
                                    [x: string]: unknown;
                                    text: string;
                                    backgroundColor?: string | undefined;
                                    textColor?: string | undefined;
                                    expiresAt?: number | undefined;
                                } | undefined;
                            };
                            flair?: {
                                [x: string]: unknown;
                                text: string;
                                backgroundColor?: string | undefined;
                                textColor?: string | undefined;
                                expiresAt?: number | undefined;
                            } | undefined;
                            content?: string | undefined;
                            deleted?: boolean | undefined;
                            spoiler?: boolean | undefined;
                            nsfw?: boolean | undefined;
                            reason?: string | undefined;
                        } | undefined;
                        flair?: {
                            [x: string]: unknown;
                            text: string;
                            backgroundColor?: string | undefined;
                            textColor?: string | undefined;
                            expiresAt?: number | undefined;
                        } | undefined;
                        spoiler?: boolean | undefined;
                        nsfw?: boolean | undefined;
                        pinned?: boolean | undefined;
                        locked?: boolean | undefined;
                        removed?: boolean | undefined;
                        reason?: string | undefined;
                        approved?: boolean | undefined;
                        author?: {
                            [x: string]: unknown;
                            subplebbit?: {
                                [x: string]: unknown;
                                postScore: number;
                                replyScore: number;
                                firstCommentTimestamp: number;
                                lastCommentCid: string;
                                banExpiresAt?: number | undefined;
                                flair?: {
                                    [x: string]: unknown;
                                    text: string;
                                    backgroundColor?: string | undefined;
                                    textColor?: string | undefined;
                                    expiresAt?: number | undefined;
                                } | undefined;
                            } | undefined;
                        } | undefined;
                        lastChildCid?: string | undefined;
                        lastReplyTimestamp?: number | undefined;
                        replies?: {
                            pages: Record<string, {
                                comments: /*elided*/ any[];
                                nextCid?: string | undefined;
                            }>;
                            pageCids?: Record<string, string> | undefined;
                        } | undefined;
                    };
                }[];
            };
        };
    } | undefined>;
    generateReplyPages(comment: Pick<CommentsTableRow, "cid" | "depth">, preloadedReplyPageSortName: keyof typeof REPLY_REPLIES_SORT_TYPES, preloadedPageSizeBytes: number): Promise<RepliesPagesTypeIpfs | {
        singlePreloadedPage: SinglePreloadedPageRes;
    } | undefined>;
    toJSON(): undefined;
}
export {};
