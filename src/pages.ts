import { getDebugLevels, loadIpfsFileAsJson } from "./util";
import { verifyPublication } from "./signer";
import assert from "assert";
import { Subplebbit } from "./subplebbit";
import { Comment } from "./comment";
import Post from "./post";
import { PostSortName, ReplySortName } from "./types";

const debugs = getDebugLevels("pages");

export class Pages {
    pages: Partial<Record<PostSortName | ReplySortName, Page>>;
    pageCids: Partial<Record<PostSortName | ReplySortName, string>>;
    subplebbit: Subplebbit;

    constructor(props: Pages) {
        Object.assign(this, props);
        assert(this.subplebbit.address, "Address of subplebbit is needed to verify pages");
    }

    async getPage?(pageCid: string): Promise<Page> {
        const page = new Page(await loadIpfsFileAsJson(pageCid, this.subplebbit.plebbit));
        const verifyComment = async (comment: Comment | Post, parentComment?: Comment | Post) => {
            assert.equal(comment.subplebbitAddress, this.subplebbit.address, "Comment in page should be under the same subplebbit");
            if (parentComment)
                assert.equal(parentComment.cid, comment.parentCid, "Comment under parent comment/post should have parentCid initialized");
            debugs.TRACE(
                `In page (${pageCid}), Attempting to verify comment (${comment.cid}) under parent comment (${parentComment?.cid})`
            );
            const [signatureIsVerified, failedVerificationReason] = await verifyPublication(comment, this.subplebbit.plebbit);
            assert.equal(
                signatureIsVerified,
                true,
                `Signature of published comment should be valid, Failed verification reason is ${failedVerificationReason}`
            );
            debugs.TRACE(`Comment (${comment.cid}) has been verified. Will attempt to verify its ${comment.replyCount} replies`);
            if (comment.replies) {
                const preloadedCommentsChunks = Object.keys(comment.replies.pages).map(
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

    toJSON?() {
        return { pages: this.pages, pageCids: this.pageCids };
    }
}

export class Page {
    comments: Comment[];
    nextCid?: string;

    constructor(props: Page) {
        Object.assign(this, props);
    }
}
