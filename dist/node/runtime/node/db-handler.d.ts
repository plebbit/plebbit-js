import Post from "../../post";
import Author from "../../author";
import { Comment, CommentEdit } from "../../comment";
import Vote from "../../vote";
import { Knex } from "knex";
import { Subplebbit } from "../../subplebbit";
import { Signer } from "../../signer";
import Transaction = Knex.Transaction;
export declare const SIGNER_USAGES: {
    SUBPLEBBIT: string;
    COMMENT: string;
};
export declare class DbHandler {
    _dbConfig: Knex.Config;
    knex: Knex;
    subplebbit: Subplebbit;
    constructor(dbConfig: any, subplebbit: any);
    createTransaction(): Promise<Transaction>;
    baseTransaction(trx?: Transaction): Transaction | Knex;
    createCommentsTable(): Promise<void>;
    createVotesTable(): Promise<void>;
    createAuthorsTable(): Promise<void>;
    createChallengesTable(): Promise<void>;
    createSignersTable(): Promise<void>;
    createTablesIfNeeded(): Promise<void>;
    addAuthorToDbIfNeeded(author: Author, trx: Transaction | undefined): Promise<any>;
    upsertVote(vote: any, challengeRequestId: any, trx?: any): Promise<any>;
    upsertComment(postOrComment: Post | Comment | CommentEdit, challengeRequestId?: string, trx?: Transaction): Promise<void>;
    upsertChallenge(challenge: any, trx?: any): Promise<unknown>;
    getLastVoteOfAuthor(commentCid: any, authorAddress: any, trx?: any): Promise<Vote>;
    baseCommentQuery(trx?: Transaction): Knex.QueryBuilder<any, {
        _base: any;
        _hasSelection: true;
        _keys: "comments.*";
        _aliases: Knex.QueryBuilder<any, {
            _base: {};
            _hasSelection: true;
            _keys: never;
            _aliases: {};
            _single: false;
            _intersectProps: {
                [k: string]: string | number;
            };
            _unionProps: never;
        }[]> & Knex.QueryBuilder<{}, {
            _base: {};
            _hasSelection: boolean;
            _keys: string;
            _aliases: {};
            _single: boolean;
            _intersectProps: string;
            _unionProps: unknown;
        }[]>;
        _single: false;
        _intersectProps: {};
        _unionProps: never;
    }[]>;
    createCommentsFromRows(commentsRows?: Comment[] | Post[]): Promise<Comment[] | Post[] | undefined[]>;
    createVotesFromRows(voteRows: any, trx: any): Promise<unknown>;
    queryCommentsSortedByTimestamp(parentCid: any, order?: string, trx?: any): Promise<unknown>;
    queryCommentsBetweenTimestampRange(parentCid: any, timestamp1: any, timestamp2: any, trx?: any): Promise<unknown>;
    queryTopCommentsBetweenTimestampRange(parentCid: any, timestamp1: any, timestamp2: any, trx?: any): Promise<unknown>;
    queryCommentsUnderComment(parentCid: string, trx?: Transaction): Promise<Comment[] | Post[] | undefined[]>;
    queryComments(trx?: Transaction): Promise<Comment[] | Post[] | undefined[]>;
    querySubplebbitActiveUserCount(timeframe: any, trx: any): Promise<unknown>;
    querySubplebbitPostCount(timeframe: any, trx: any): Promise<unknown>;
    querySubplebbitMetrics(trx: any): Promise<unknown>;
    queryComment(cid: string, trx?: Transaction): Promise<Comment | Post | undefined>;
    queryLatestPost(trx?: Transaction): Promise<Post | undefined>;
    insertSigner(signer: any, trx?: Transaction): Promise<number[]>;
    querySubplebbitSigner(trx: any): Promise<Signer>;
    querySigner(ipnsKeyName: any, trx: any): Promise<Signer | undefined>;
    changeDbFilename(newDbFileName: string): Promise<void>;
}
export declare const subplebbitInitDbIfNeeded: (subplebbit: Subplebbit) => Promise<void>;
