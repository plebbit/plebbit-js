import { CommentIpfsType, PagesType, PagesTypeIpfs, PagesTypeJson, PageType, PostSortName, ReplySortName } from "./types";
export declare class Pages implements PagesType {
    pages: Partial<Record<PostSortName | ReplySortName, PageType>>;
    pageCids: Partial<Record<PostSortName | ReplySortName, string>>;
    private _subplebbit;
    private _parentCid;
    private _pagesIpfs?;
    constructor(props: PagesType & {
        subplebbit: Pages["_subplebbit"];
        parentCid: CommentIpfsType["parentCid"];
        pagesIpfs?: Pages["_pagesIpfs"];
    });
    getPage(pageCid: string): Promise<PageType>;
    toJSON(): PagesTypeJson;
    toJSONIpfs(): PagesTypeIpfs;
}
