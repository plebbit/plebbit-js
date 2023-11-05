import { Subplebbit } from "./subplebbit";
import { CommentsTableRow, CommentUpdatesRow, CommentWithCommentUpdate, PageIpfs, PagesTypeIpfs, PostSort, PostSortName, ReplySort, ReplySortName } from "../types";
export declare const POSTS_SORT_TYPES: PostSort;
export declare const REPLIES_SORT_TYPES: ReplySort;
export type PageOptions = {
    excludeRemovedComments: boolean;
    excludeDeletedComments: boolean;
    excludeCommentsWithDifferentSubAddress: boolean;
    parentCid: string | null;
    pageSize: number;
};
type PageGenerationRes = Partial<Record<PostSortName | ReplySortName, {
    pages: PageIpfs[];
    cids: string[];
}>>;
export declare class SortHandler {
    subplebbit: Pick<Subplebbit, "dbHandler" | "plebbit" | "address" | "encryption" | "_clientsManager">;
    constructor(subplebbit: SortHandler["subplebbit"]);
    private commentChunksToPages;
    sortComments(comments: {
        comment: CommentsTableRow;
        update: CommentUpdatesRow;
    }[], sortName: PostSortName | ReplySortName, options: PageOptions): Promise<PageGenerationRes | undefined>;
    private _generationResToPages;
    private _generateSubplebbitPosts;
    private _generateCommentReplies;
    generateRepliesPages(comment: Pick<CommentWithCommentUpdate, "cid">): Promise<PagesTypeIpfs | undefined>;
    generateSubplebbitPosts(): Promise<PagesTypeIpfs | undefined>;
}
export {};
