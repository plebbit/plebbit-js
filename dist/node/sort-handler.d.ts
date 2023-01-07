import { Page, Pages } from "./pages";
import { Subplebbit } from "./subplebbit";
import { Comment } from "./comment";
import { CommentType, PostSort, PostSortName, ReplySort, ReplySortName } from "./types";
export declare const POSTS_SORT_TYPES: PostSort;
export declare const REPLIES_SORT_TYPES: ReplySort;
export declare const SORTED_POSTS_PAGE_SIZE = 50;
export declare class SortHandler {
    subplebbit: Pick<Subplebbit, "dbHandler" | "plebbit" | "address">;
    constructor(subplebbit: SortHandler["subplebbit"]);
    chunksToListOfPage(chunks: CommentType[][]): Promise<[Page[], string[]]>;
    sortComments(comments: CommentType[], sortName: PostSortName | ReplySortName, limit?: number): Promise<[Partial<Record<PostSortName | ReplySortName, Page>>, string]>;
    sortCommentsByHot(parentCid?: string, trx?: any): Promise<any[] | [Partial<Record<"new" | "hot" | "topHour" | "topDay" | "topWeek" | "topMonth" | "topYear" | "topAll" | "controversialHour" | "controversialDay" | "controversialWeek" | "controversialMonth" | "controversialYear" | "controversialAll" | "old", Page>>, string]>;
    sortCommentsByTop(parentCid: string | undefined, sortName: PostSortName | ReplySortName, trx?: any): Promise<any[] | [Partial<Record<"new" | "hot" | "topHour" | "topDay" | "topWeek" | "topMonth" | "topYear" | "topAll" | "controversialHour" | "controversialDay" | "controversialWeek" | "controversialMonth" | "controversialYear" | "controversialAll" | "old", Page>>, string]>;
    sortCommentsByControversial(parentCid: string | undefined, sortName: PostSortName | ReplySortName, trx?: any): Promise<any[] | [Partial<Record<"new" | "hot" | "topHour" | "topDay" | "topWeek" | "topMonth" | "topYear" | "topAll" | "controversialHour" | "controversialDay" | "controversialWeek" | "controversialMonth" | "controversialYear" | "controversialAll" | "old", Page>>, string]>;
    sortCommentsByNew(parentCid?: string, trx?: any): Promise<any[] | [Partial<Record<"new" | "hot" | "topHour" | "topDay" | "topWeek" | "topMonth" | "topYear" | "topAll" | "controversialHour" | "controversialDay" | "controversialWeek" | "controversialMonth" | "controversialYear" | "controversialAll" | "old", Page>>, string]>;
    private _getPostsPromises;
    private _getRepliesPromises;
    cacheCommentsPages(trx?: any): Promise<void>;
    generateRepliesPages(comment: Comment | CommentType, trx?: any): Promise<Pages | undefined>;
    generateSubplebbitPosts(trx?: any): Promise<Pages>;
    deleteCommentPageCache(dbComment: CommentType): Promise<void>;
}
