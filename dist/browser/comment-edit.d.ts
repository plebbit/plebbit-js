import { Plebbit } from "./plebbit.js";
import Publication from "./publication.js";
import { Flair } from "./subplebbit/types.js";
import { CommentAuthorEditOptions, CommentEditPubsubMessage, CommentEditsTableRowInsert, CommentEditType, PublicationTypeName } from "./types.js";
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
                [chainTicker: string]: import("./types.js").Wallet;
            };
            avatar?: import("./types.js").Nft;
            flair?: Flair;
        };
        signature: import("./signer/constants.js").JsonSignature;
        flair?: Flair;
        spoiler?: boolean;
        pinned?: boolean;
        locked?: boolean;
        removed?: boolean;
        reason?: string;
        protocolVersion: "1.0.0";
        timestamp: number;
        subplebbitAddress: string;
        content?: string;
        deleted?: boolean;
        commentCid: string;
        commentAuthor?: CommentAuthorEditOptions;
    };
    toJSONForDb(isAuthorEdit: boolean, authorSignerAddress: string): CommentEditsTableRowInsert;
    getType(): PublicationTypeName;
    private _validateSignature;
    publish(): Promise<void>;
}
