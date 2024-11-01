import { Plebbit } from "../../plebbit/plebbit.js";
import Publication from "../publication.js";
import type { CommentEditPubsubMessagePublication, CreateCommentEditOptions } from "./types.js";
import type { PublicationTypeName } from "../../types.js";
import { SignerType } from "../../signer/types.js";
export declare class CommentEdit extends Publication implements CommentEditPubsubMessagePublication {
    commentCid: CommentEditPubsubMessagePublication["commentCid"];
    content?: CommentEditPubsubMessagePublication["content"];
    reason?: CommentEditPubsubMessagePublication["reason"];
    deleted?: CommentEditPubsubMessagePublication["deleted"];
    flair?: CommentEditPubsubMessagePublication["flair"];
    spoiler?: CommentEditPubsubMessagePublication["spoiler"];
    signature: CommentEditPubsubMessagePublication["signature"];
    _pubsubMsgToPublish?: CommentEditPubsubMessagePublication;
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
