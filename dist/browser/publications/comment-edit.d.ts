import { Plebbit } from "../plebbit.js";
import Publication from "./publication.js";
import { Flair } from "../subplebbit/types.js";
import { CommentAuthorEditOptions, CommentEditPubsubMessage, CommentEditTypeJson, CommentEditsTableRowInsert, DecryptedChallengeRequestCommentEdit, LocalCommentEditOptions, PublicationTypeName } from "../types.js";
export declare class CommentEdit extends Publication {
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
    constructor(plebbit: Plebbit);
    _initEditProps(props: LocalCommentEditOptions | CommentEditPubsubMessage): void;
    _initLocalProps(props: LocalCommentEditOptions): void;
    _initRemoteProps(props: CommentEditPubsubMessage): void;
    _initChallengeRequestProps(props: DecryptedChallengeRequestCommentEdit): void;
    toJSONPubsubMessagePublication(): CommentEditPubsubMessage;
    toJSON(): CommentEditTypeJson;
    toJSONForDb(isAuthorEdit: boolean, authorSignerAddress: string): CommentEditsTableRowInsert;
    getType(): PublicationTypeName;
    private _validateSignature;
    publish(): Promise<void>;
}
