import { Plebbit } from "../../plebbit.js";
import Publication from "../publication.js";
import type { CommentEditChallengeRequestToEncryptType, CommentEditPubsubMessage, LocalCommentEditOptions } from "./types.js";
import type { PublicationTypeName } from "../../types.js";
export declare class CommentEdit extends Publication {
    commentCid: CommentEditPubsubMessage["commentCid"];
    content?: CommentEditPubsubMessage["content"];
    reason?: CommentEditPubsubMessage["reason"];
    deleted?: CommentEditPubsubMessage["deleted"];
    flair?: CommentEditPubsubMessage["flair"];
    spoiler?: CommentEditPubsubMessage["spoiler"];
    pinned?: CommentEditPubsubMessage["pinned"];
    locked?: CommentEditPubsubMessage["locked"];
    removed?: CommentEditPubsubMessage["removed"];
    commentAuthor?: CommentEditPubsubMessage["commentAuthor"];
    _pubsubMsgToPublish?: CommentEditPubsubMessage;
    constructor(plebbit: Plebbit);
    _initEditProps(props: LocalCommentEditOptions | CommentEditPubsubMessage): void;
    _initLocalProps(props: LocalCommentEditOptions): void;
    _initRemoteProps(props: CommentEditPubsubMessage): void;
    _initChallengeRequestProps(props: CommentEditChallengeRequestToEncryptType): void;
    toJSONPubsubMessagePublication(): CommentEditPubsubMessage;
    getType(): PublicationTypeName;
    private _validateSignature;
    publish(): Promise<void>;
}
