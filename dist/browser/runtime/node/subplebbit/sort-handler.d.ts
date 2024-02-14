import { LocalSubplebbit } from "./local-subplebbit.js";
import { CommentsTableRow, CommentUpdatesRow, CommentWithCommentUpdate, PageIpfs, PagesTypeIpfs, PostSortName, ReplySortName } from "../../../types.js";
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
    subplebbit: LocalSubplebbit;
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
    toJSON(): any;
}
export {};
