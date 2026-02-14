import { Plebbit } from "../../plebbit/plebbit.js";
import Publication from "../publication.js";
import type { CommentEditPubsubMessagePublication, CreateCommentEditOptions } from "./types.js";
import type { PublicationTypeName } from "../../types.js";
import type { SignerType } from "../../signer/types.js";
export declare class CommentEdit extends Publication implements CommentEditPubsubMessagePublication {
    commentCid: CommentEditPubsubMessagePublication["commentCid"];
    content?: CommentEditPubsubMessagePublication["content"];
    reason?: CommentEditPubsubMessagePublication["reason"];
    deleted?: CommentEditPubsubMessagePublication["deleted"];
    flairs?: CommentEditPubsubMessagePublication["flairs"];
    spoiler?: CommentEditPubsubMessagePublication["spoiler"];
    nsfw?: CommentEditPubsubMessagePublication["nsfw"];
    signature: CommentEditPubsubMessagePublication["signature"];
    raw: {
        pubsubMessageToPublish?: CommentEditPubsubMessagePublication;
    };
    challengeRequest?: CreateCommentEditOptions["challengeRequest"];
    constructor(plebbit: Plebbit);
    _initLocalProps(props: {
        commentEdit: CommentEditPubsubMessagePublication;
        signer?: SignerType;
        challengeRequest?: CreateCommentEditOptions["challengeRequest"];
    }): void;
    _initPubsubPublicationProps(props: CommentEditPubsubMessagePublication): void;
    toJSONPubsubMessagePublication(): CommentEditPubsubMessagePublication;
    getType(): PublicationTypeName;
    private _validateSignature;
    publish(): Promise<void>;
}
