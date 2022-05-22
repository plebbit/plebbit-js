import {Subplebbit} from "./subplebbit";
import {Comment} from "./comment";

export declare class Pages {
    pages: {
        [sortType: string]: Page;
    };
    pageCids: {
        [sortType: string]: string;
    };
    subplebbit: Subplebbit;

    constructor(props: any);

    getPage(pageCid: any): Promise<Page>;
    toJSON(): {
        pages: {
            [sortType: string]: Page;
        };
        pageCids: {
            [sortType: string]: string;
        };
    };
}
export declare class Page {
    comments: Comment[];
    nextCid: string;
    constructor(props: any);
}
