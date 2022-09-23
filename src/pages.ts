import { loadIpfsFileAsJson } from "./util";
import { verifyPublication } from "./signer";
import assert from "assert";
import { Subplebbit } from "./subplebbit";
import { Comment } from "./comment";
import { CommentType, PagesType, PageType, PostSortName, ReplySortName } from "./types";
import errcode from "err-code";
import { codes, messages } from "./errors";
import Logger from "@plebbit/plebbit-logger";
import isIPFS from "is-ipfs";
import { Plebbit } from "./plebbit";

export class Pages implements PagesType {
    pages?: Partial<Record<PostSortName | ReplySortName, PageType>>;
    pageCids?: Partial<Record<PostSortName | ReplySortName, string>>;
    subplebbit: Pick<Subplebbit, "address" | "plebbit">;
    constructor(props: PagesType & { subplebbit: { plebbit: Plebbit; address: string } }) {
        this.pages = props.pages;
        this.pageCids = props.pageCids;
        this.subplebbit = props.subplebbit;
    }

    async getPage(pageCid: string): Promise<Page> {
        const log = Logger("plebbit-js:pages:getPage");
        if (!isIPFS.cid(pageCid))
            throw errcode(Error(messages.ERR_CID_IS_INVALID), codes.ERR_CID_IS_INVALID, {
                details: `getPage: cid (${pageCid}) is invalid as a CID`
            });

        assert(this.subplebbit.address, "Address of subplebbit is needed to load pages");

        const page = new Page(await loadIpfsFileAsJson(pageCid, this.subplebbit.plebbit));
        const verifyComment = async (comment: CommentType, parentComment?: CommentType) => {
            assert(typeof comment.upvoteCount === "number" && typeof comment.downvoteCount === "number");
            assert.equal(comment.subplebbitAddress, this.subplebbit.address, "Comment in page should be under the same subplebbit");
            if (parentComment)
                assert.equal(parentComment.cid, comment.parentCid, "Comment under parent comment/post should have parentCid initialized");

            const [signatureIsVerified, failedVerificationReason] = await verifyPublication(comment, this.subplebbit.plebbit, "comment");
            if (!signatureIsVerified)
                throw errcode(Error(messages.ERR_FAILED_TO_VERIFY_SIGNATURE), codes.ERR_FAILED_TO_VERIFY_SIGNATURE, {
                    details: `getPage: Failed verification reason: ${failedVerificationReason}, ${
                        comment.depth === 0 ? "post" : "comment"
                    }: ${JSON.stringify(comment)}`
                });
            log.trace(`Comment (${comment.cid}) has been verified. Will attempt to verify its ${comment.replyCount} replies`);
            if (comment.replies) {
                const preloadedCommentsChunks: Comment[][] = Object.keys(comment.replies.pages).map(
                    (sortType) => comment.replies.pages[sortType].comments
                );
                await Promise.all(
                    preloadedCommentsChunks.map(
                        async (preloadedComments) =>
                            await Promise.all(preloadedComments.map((preloadedComment) => verifyComment(preloadedComment, comment)))
                    )
                );
            }
        };

        await Promise.all(
            page.comments.map(async (comment) => {
                await verifyComment(comment, undefined);
            })
        );
        return page;
    }

    toJSON(): PagesType {
        return {
            pages: this.pages,
            pageCids: this.pageCids,
            subplebbit: { address: this.subplebbit.address }
        };
    }
}

export class Page implements PageType {
    comments: CommentType[];
    nextCid?: string;

    constructor(props: PageType) {
        this.comments = props.comments;
        this.nextCid = props.nextCid;
    }

    toJSON() {
        return {
            comments: this.comments,
            nextCid: this.nextCid
        };
    }
}
