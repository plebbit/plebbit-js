import {controversialScore, hotScore} from "./util";
import {Subplebbit} from "./subplebbit";
import DbHandler from "./runtime/browser/db-handler";

export declare const POSTS_SORT_TYPES: Readonly<{
    HOT: {
        type: string;
        score: typeof hotScore;
    };
    NEW: {
        type: string;
    };
    TOP_HOUR: {
        type: string;
    };
    TOP_DAY: {
        type: string;
    };
    TOP_WEEK: {
        type: string;
    };
    TOP_MONTH: {
        type: string;
    };
    TOP_YEAR: {
        type: string;
    };
    TOP_ALL: {
        type: string;
    };
    CONTROVERSIAL_HOUR: {
        type: string;
        score: typeof controversialScore;
    };
    CONTROVERSIAL_DAY: {
        type: string;
        score: typeof controversialScore;
    };
    CONTROVERSIAL_WEEK: {
        type: string;
        score: typeof controversialScore;
    };
    CONTROVERSIAL_MONTH: {
        type: string;
        score: typeof controversialScore;
    };
    CONTROVERSIAL_YEAR: {
        type: string;
        score: typeof controversialScore;
    };
    CONTROVERSIAL_ALL: {
        type: string;
        score: typeof controversialScore;
    };
}>;
export declare const REPLIES_SORT_TYPES: {
    OLD: {
        type: string;
    };
};
export declare const SORTED_POSTS_PAGE_SIZE = 50;

export declare class SortHandler {
    subplebbit: Subplebbit;
    dbHandler: DbHandler;

    constructor(subplebbit: any);

    chunksToListOfPage(chunks: any): Promise<any[][]>;

    sortComments(comments: any, sortType: any, limit?: number): Promise<any[]>;

    sortCommentsByHot(parentCid: any, trx: any): Promise<any[]>;

    sortCommentsByTop(parentCid: any, timeframe: any, trx: any): Promise<any[]>;

    sortCommentsByControversial(parentCid: any, timeframe: any, trx: any): Promise<any[]>;

    sortCommentsByNew(parentCid: any, trx: any): Promise<any[]>;

    getSortPromises(comment: any, trx: any): any[];

    generatePagesUnderComment(comment: any, trx: any): Promise<{}[]>;
}
