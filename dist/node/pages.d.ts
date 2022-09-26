import { Subplebbit } from "./subplebbit";
import { CommentType, PagesType, PageType, PostSortName, ReplySortName } from "./types";
export declare class Pages implements PagesType {
    pages?: Partial<Record<PostSortName | ReplySortName, PageType>>;
    pageCids?: Partial<Record<PostSortName | ReplySortName, string>>;
    subplebbit: Pick<Subplebbit, "address" | "plebbit">;
    constructor(props: PagesType & {
        subplebbit: Pages["subplebbit"];
    });
    getPage(pageCid: string): Promise<Page>;
    toJSON(): PagesType;
}
export declare class Page implements PageType {
    comments: CommentType[];
    nextCid?: string;
    constructor(props: PageType);
    toJSON(): {
        comments: CommentType[];
        nextCid: string;
    };
}
