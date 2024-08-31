import type { PageIpfs, PagesTypeIpfs, PagesTypeJson, PostSort, ReplySort, Timeframe, RepliesPagesTypeIpfs, PostsPagesTypeIpfs, PageTypeJson } from "./types.js";
import { BasePages } from "./pages.js";
export declare const TIMEFRAMES_TO_SECONDS: Record<Timeframe, number>;
export declare const POSTS_SORT_TYPES: PostSort;
export declare const REPLIES_SORT_TYPES: ReplySort;
type CommentToSort = PageIpfs["comments"][0];
export declare function hotScore(comment: CommentToSort): number;
export declare function controversialScore(comment: CommentToSort): number;
export declare function topScore(comment: CommentToSort): number;
export declare function newScore(comment: CommentToSort): number;
export declare function oldScore(comment: CommentToSort): number;
export declare function parsePageIpfs(pageIpfs: PageIpfs): PageTypeJson;
export declare function parsePagesIpfs(pagesRaw: PagesTypeIpfs): Omit<PagesTypeJson, "clients">;
export declare function parseRawPages(pages: PagesTypeIpfs | Omit<PagesTypeJson, "clients"> | BasePages | undefined): Pick<BasePages, "pages"> & {
    pagesIpfs: RepliesPagesTypeIpfs | PostsPagesTypeIpfs | undefined;
};
export {};
