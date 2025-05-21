import type { PageIpfs, PostSortName, PostsPagesTypeIpfs, RepliesPagesTypeIpfs, ReplySortName } from "../../../pages/types.js";
import type { CommentUpdateType } from "../../../publications/comment/types.js";
import { POST_REPLIES_SORT_TYPES, REPLY_REPLIES_SORT_TYPES } from "../../../pages/util.js";
import type { CommentsTableRow } from "../../../types.js";
export type PageOptions = {
    excludeRemovedComments: boolean;
    excludeDeletedComments: boolean;
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
    private addCommentChunksToIpfs;
    private addPreloadedCommentChunksToIpfs;
    _chunkComments({ comments, firstPageSizeBytes }: {
        comments: PageIpfs["comments"];
        firstPageSizeBytes: number;
    }): PageIpfs["comments"][];
    sortAndChunkComments(unsortedComments: (PageIpfs["comments"][0] & {
        activeScore?: number;
    })[], sortName: PostSortName | ReplySortName, options: PageOptions): Promise<PageIpfs["comments"][]>;
    sortChunkAddIpfsNonPreloaded(comments: PageIpfs["comments"], sortName: PostSortName | ReplySortName, options: PageOptions): Promise<AddedPageChunksToIpfsRes | undefined>;
    private _generationResToPages;
    generateSubplebbitPosts(preloadedPageSortName: PostSortName, preloadedPageSizeBytes: number): Promise<PostsPagesTypeIpfs | {
        singlePreloadedPage: SinglePreloadedPageRes;
    } | undefined>;
    generatePostPages(comment: Pick<CommentsTableRow, "cid">, preloadedReplyPageSortName: keyof typeof POST_REPLIES_SORT_TYPES, preloadedPageSizeBytes: number): Promise<{
        pages: Record<string, import("../../../pages/types.js").PageIpfsManuallyDefined>;
        pageCids?: Record<string, string> | undefined;
    } | {
        singlePreloadedPage: {
            [preloadedReplyPageSortName]: {
                comments: {
                    comment: import("../../../publications/comment/types.js").CommentIpfsType;
                    commentUpdate: CommentUpdateType;
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
