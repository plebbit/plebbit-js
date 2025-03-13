import type { PageIpfs, PostSortName, PostsPagesTypeIpfs, RepliesPagesTypeIpfs, ReplySortName } from "../../../pages/types.js";
import type { CommentUpdateType } from "../../../publications/comment/types.js";
import type { CommentsTableRow } from "../../../types.js";
export type PageOptions = {
    excludeRemovedComments: boolean;
    excludeDeletedComments: boolean;
    excludeCommentsWithDifferentSubAddress: boolean;
    commentUpdateFieldsToExclude?: (keyof CommentUpdateType)[];
    parentCid: string | null;
    preloadedPages: (PostSortName | ReplySortName)[] | undefined;
};
type PageGenerationRes = Partial<Record<PostSortName | ReplySortName, {
    pages: PageIpfs[];
    cids: string[];
}>>;
export declare class PageGenerator {
    private _subplebbit;
    constructor(subplebbit: PageGenerator["_subplebbit"]);
    private commentChunksToPages;
    _chunkComments(comments: PageIpfs["comments"], isPreloadedSort: boolean): PageIpfs["comments"][];
    sortComments(comments: PageIpfs["comments"], sortName: PostSortName | ReplySortName, options: PageOptions): Promise<PageGenerationRes | undefined>;
    private _generationResToPages;
    generateSubplebbitPosts(preloadedPages: PostSortName[]): Promise<PostsPagesTypeIpfs | undefined>;
    generateRepliesPages(comment: Pick<CommentsTableRow, "cid" | "depth">, preloadedPages: ReplySortName[]): Promise<RepliesPagesTypeIpfs | undefined>;
    toJSON(): undefined;
}
export {};
