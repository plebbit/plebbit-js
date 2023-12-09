import { Plebbit } from "./plebbit";
import Publication from "./publication";
import { Flair } from "./subplebbit/types";
import { AuthorCommentEdit, CommentAuthorEditOptions, CommentEditPubsubMessage, CommentEditsTableRowInsert, CommentEditType, ModeratorCommentEdit, PublicationTypeName } from "./types";
export declare const MOD_EDIT_FIELDS: (keyof ModeratorCommentEdit)[];
export declare const AUTHOR_EDIT_FIELDS: (keyof AuthorCommentEdit)[];
export declare class CommentEdit extends Publication implements CommentEditType {
    commentCid: string;
    content?: string;
    reason?: string;
    deleted?: boolean;
    flair?: Flair;
    spoiler?: boolean;
    pinned?: boolean;
    locked?: boolean;
    removed?: boolean;
    commentAuthor?: CommentAuthorEditOptions;
    constructor(props: CommentEditType, plebbit: Plebbit);
    _initProps(props: CommentEditType): void;
    toJSONPubsubMessagePublication(): CommentEditPubsubMessage;
    toJSON(): {
        shortSubplebbitAddress: string;
        author: {
            shortAddress: string;
            address: string;
            previousCommentCid?: string;
            displayName?: string;
            wallets?: {
                [chainTicker: string]: import("./types").Wallet;
            };
            avatar?: import("./types").Nft;
            flair?: Flair;
        };
        signature: import("./signer/constants").JsonSignature;
        protocolVersion: "1.0.0";
        timestamp: number;
        reason?: string;
        content?: string;
        spoiler?: boolean;
        flair?: Flair;
        subplebbitAddress: string;
        challengeAnswers?: string[];
        challengeCommentCids?: string[];
        commentCid: string;
        deleted?: boolean;
        pinned?: boolean;
        locked?: boolean;
        removed?: boolean;
        commentAuthor?: CommentAuthorEditOptions;
    };
    toJSONForDb(): CommentEditsTableRowInsert;
    getType(): PublicationTypeName;
    private _validateSignature;
    publish(): Promise<void>;
}
