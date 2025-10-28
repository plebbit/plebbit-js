import { Plebbit } from "../../plebbit/plebbit.js";
import Publication from "../publication.js";
import type { CommentModerationPubsubMessagePublication, CreateCommentModerationOptions } from "./types.js";
import type { PublicationTypeName } from "../../types.js";
import type { SignerType } from "../../signer/types.js";
export declare class CommentModeration extends Publication implements CommentModerationPubsubMessagePublication {
    commentCid: CommentModerationPubsubMessagePublication["commentCid"];
    commentModeration: CommentModerationPubsubMessagePublication["commentModeration"];
    signature: CommentModerationPubsubMessagePublication["signature"];
    raw: {
        pubsubMessageToPublish?: CommentModerationPubsubMessagePublication;
    };
    challengeRequest?: CreateCommentModerationOptions["challengeRequest"];
    constructor(plebbit: Plebbit);
    _initLocalProps(props: {
        commentModeration: CommentModerationPubsubMessagePublication;
        signer?: SignerType;
        challengeRequest?: CreateCommentModerationOptions["challengeRequest"];
    }): void;
    _initPubsubPublication(pubsubMsgPub: CommentModerationPubsubMessagePublication): void;
    toJSONPubsubMessagePublication(): CommentModerationPubsubMessagePublication;
    getType(): PublicationTypeName;
    private _validateSignature;
    publish(): Promise<void>;
}
