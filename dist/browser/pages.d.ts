import { Subplebbit } from "./subplebbit";
import { Comment } from "./comment";
import { PostSortName, ReplySortName } from "./types";
export declare class Pages {
    pages: Partial<Record<PostSortName | ReplySortName, Page>>;
    pageCids: Partial<Record<PostSortName | ReplySortName, string>>;
    subplebbit: Subplebbit;
    constructor(props: Pages);
    getPage?(pageCid: string): Promise<Page>;
    toJSON?(): {
        pages: Partial<Record<"new" | "hot" | "topHour" | "topDay" | "topWeek" | "topMonth" | "topYear" | "topAll" | "controversialHour" | "controversialDay" | "controversialWeek" | "controversialMonth" | "controversialYear" | "controversialAll" | "old", Page>>;
        pageCids: Partial<Record<"new" | "hot" | "topHour" | "topDay" | "topWeek" | "topMonth" | "topYear" | "topAll" | "controversialHour" | "controversialDay" | "controversialWeek" | "controversialMonth" | "controversialYear" | "controversialAll" | "old", string>>;
    };
}
export declare class Page {
    comments: Comment[];
    nextCid?: string;
    constructor(props: Page);
    toJSON?(): {
        comments: import("./types").CommentType[];
        nextCid: string;
    };
}
