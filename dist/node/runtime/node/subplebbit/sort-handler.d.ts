import { LocalSubplebbit } from "./local-subplebbit.js";
import { CommentIpfsWithCid, CommentsTableRow, CommentUpdatesRow, PageIpfs, PostSortName, PostsPagesTypeIpfs, RepliesPagesTypeIpfs, ReplySortName } from "../../../types.js";
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
    generateSubplebbitPosts(): Promise<PostsPagesTypeIpfs | undefined>;
    generateRepliesPages(comment: Pick<CommentIpfsWithCid, "cid">): Promise<RepliesPagesTypeIpfs | undefined>;
    toJSON(): undefined;
}
export {};
