import { LocalSubplebbit } from "./local-subplebbit.js";
import type { PageIpfs, PostSortName, PostsPagesTypeIpfs, RepliesPagesTypeIpfs, ReplySortName } from "../../../pages/types.js";
import type { CommentIpfsWithCidDefined } from "../../../publications/comment/types.js";
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
    sortComments(comments: PageIpfs["comments"], sortName: PostSortName | ReplySortName, options: PageOptions): Promise<PageGenerationRes | undefined>;
    private _generationResToPages;
    generateSubplebbitPosts(): Promise<PostsPagesTypeIpfs | undefined>;
    generateRepliesPages(comment: Pick<CommentIpfsWithCidDefined, "cid">): Promise<RepliesPagesTypeIpfs | undefined>;
    toJSON(): undefined;
}
export {};
