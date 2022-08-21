import { Subplebbit } from "./subplebbit";
import { CommentType, PagesType, PageType, PostSortName, ReplySortName } from "./types";
export declare class Pages implements PagesType {
    pages: Partial<Record<PostSortName | ReplySortName, PageType>>;
    pageCids: Partial<Record<PostSortName | ReplySortName, string>>;
    subplebbit: Subplebbit;
    constructor(props: PagesType);
    getPage(pageCid: string): Promise<Page>;
    toJSON(): {
        pages: Partial<Record<"new" | "hot" | "topHour" | "topDay" | "topWeek" | "topMonth" | "topYear" | "topAll" | "controversialHour" | "controversialDay" | "controversialWeek" | "controversialMonth" | "controversialYear" | "controversialAll" | "old", PageType>>;
        pageCids: Partial<Record<"new" | "hot" | "topHour" | "topDay" | "topWeek" | "topMonth" | "topYear" | "topAll" | "controversialHour" | "controversialDay" | "controversialWeek" | "controversialMonth" | "controversialYear" | "controversialAll" | "old", string>>;
    };
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
