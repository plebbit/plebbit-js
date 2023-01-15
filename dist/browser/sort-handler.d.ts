import { Page, Pages } from "./pages";
import { Subplebbit } from "./subplebbit";
import { Comment } from "./comment";
import { CommentType, PostSort, PostSortName, ReplySort, ReplySortName } from "./types";
export declare const POSTS_SORT_TYPES: PostSort;
export declare const REPLIES_SORT_TYPES: ReplySort;
export declare type PageOptions = {
    excludeRemovedComments: boolean;
    excludeDeletedComments: boolean;
    excludeCommentsWithDifferentSubAddress: boolean;
    excludeCommentsWithNoUpdate: boolean;
    ensurePinnedCommentsAreOnTop: boolean;
    pageSize: number;
};
declare type PageGenerationRes = Record<Partial<PostSortName | ReplySortName>, {
    pages: Page[];
    cids: string[];
}>;
export declare class SortHandler {
    subplebbit: Pick<Subplebbit, "dbHandler" | "plebbit" | "address">;
    constructor(subplebbit: SortHandler["subplebbit"]);
    private commentChunksToPages;
    sortComments(comments: CommentType[], sortName: PostSortName | ReplySortName, options: PageOptions): Promise<PageGenerationRes | undefined>;
    sortCommentsByHot(parentCid: string | undefined, options: PageOptions, trx?: any): Promise<PageGenerationRes | undefined>;
    sortCommentsByTop(parentCid: string | undefined, sortName: PostSortName | ReplySortName, options: PageOptions, trx?: any): Promise<PageGenerationRes | undefined>;
    sortCommentsByControversial(parentCid: string | undefined, sortName: PostSortName | ReplySortName, options: PageOptions, trx?: any): Promise<PageGenerationRes | undefined>;
    sortCommentsByNew(parentCid: string | undefined, options: PageOptions, trx?: any): Promise<PageGenerationRes | undefined>;
    private _generationResToPages;
    private _generateSubplebbitPosts;
    private _generateCommentReplies;
    cacheCommentsPages(trx?: any): Promise<void>;
    generateRepliesPages(comment: Comment | CommentType, trx?: any): Promise<Pages | undefined>;
    generateSubplebbitPosts(trx?: any): Promise<Pages>;
    deleteCommentPageCache(dbComment: CommentType): Promise<void>;
}
export {};
