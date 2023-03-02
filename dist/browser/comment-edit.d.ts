import { Plebbit } from "./plebbit";
import Publication from "./publication";
import { AuthorCommentEdit, CommentAuthorEditOptions, CommentEditPubsubMessage, CommentEditsTableRowInsert, CommentEditType, Flair, ModeratorCommentEdit, PublicationTypeName } from "./types";
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
    toJSONIpfs(): CommentEditPubsubMessage;
    toJSON(): CommentEditPubsubMessage;
    toJSONAfterChallengeVerification(): CommentEditPubsubMessage;
    toJSONForDb(challengeRequestId: string): CommentEditsTableRowInsert;
    getType(): PublicationTypeName;
    private _validateSignature;
    publish(): Promise<void>;
}
