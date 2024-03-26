import Plebbit from "../..";
import type { CommentWithCommentUpdate } from "../../types.js";
import { Comment } from "./comment.js";

// This is a comment loaded within a page, should contain all props of CommentWithCommentUpdate
export class CommentInPage extends Comment {
    cid!: string;
    shortCid!: string;
    protocolVersion: ProtocolVersion;
    parentCid: string | undefined;
    previousCid: string | undefined;
    depth: number;
    postCid: string;
    upvoteCount: number;
    downvoteCount: number;
    replyCount: number;
    updatedAt: number;

    constructor(props: CommentWithCommentUpdate, plebbit: Plebbit) {
        super(props, plebbit);
    }

    publish(): Promise<void> {
        throw Error("Should not call publish() on a comment that's already published");
    }
}
