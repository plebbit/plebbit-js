import {loadIpfsFileAsJson} from "./Util.js";
import {verifyPublication} from "./Signer.js";
import assert from "assert";
import Debug from "debug";

const debug = Debug("plebbit-js:Pages");

export class Pages {
    constructor(props) {
        this.pages = props["pages"];
        this.pageCids = props["pageCids"];
        this.subplebbit = props["subplebbit"];
    }

    async getPage(pageCid) {

        const page = new Page(await loadIpfsFileAsJson(pageCid, this.subplebbit.plebbit));
        const verifyComment = async (comment, parentComment) => {
            assert.equal(comment.subplebbitAddress, this.subplebbit.address, "Comment in page should be under the same subplebbit");
            if (parentComment)
                assert.equal(parentComment.cid, comment.parentCid, "Comment under parent comment/post should have parentCid initialized");
            const [signatureIsVerified, failedVerificationReason] = await verifyPublication(comment);
            assert.equal(signatureIsVerified, true, `Signature of published comment should be valid, Failed verification reason is ${failedVerificationReason}`);
            debug(`Comment (${comment.cid}) has been verified. Will attempt to verify its ${comment.replyCount} replies`);
            if (comment.replies) {
                const preloadedCommentsChunks = Object.keys(comment.replies.pages).map(sortType => comment.replies.pages[sortType].comments);
                await Promise.all(preloadedCommentsChunks.map(async preloadedComments => await Promise.all(preloadedComments.map(preloadedComment => verifyComment(preloadedComment, comment)))));
            }
        }

        await Promise.all(page.comments.map(async comment => {
            // TODO verify signature
            await verifyComment(comment, undefined);
        }));
        return page;
    }

    toJSON() {
        return {"pages": this.pages, "pageCids": this.pageCids};
    }
}

export class Page {
    constructor(props) {
        this.comments = props["comments"];
        this.nextCid = props["nextCid"];
    }

}
