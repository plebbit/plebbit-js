import Publication from "./publication";
import { AuthorCommentEdit, CommentAuthorEditOptions, CommentEditType, Flair, ModeratorCommentEdit, PublicationTypeName } from "./types";
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
    moderatorReason?: string;
    commentAuthor?: CommentAuthorEditOptions;
    _initProps(props: CommentEditType): void;
    toJSON(): CommentEditType;
    toJSONForDb(challengeRequestId: string): any;
    getType(): PublicationTypeName;
    publish(userOptions: any): Promise<void>;
}
