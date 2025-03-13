import { parsePageIpfs } from "../pages/util.js";
import { verifyPage } from "../signer/signatures.js";
import { PostsPagesClientsManager, RepliesPagesClientsManager } from "../clients/pages-client-manager.js";
import { PlebbitError } from "../plebbit-error.js";
import Logger from "@plebbit/plebbit-logger";
import * as remeda from "remeda";
import { hideClassPrivateProps } from "../util.js";
import { parseCidStringSchemaWithPlebbitErrorIfItFails } from "../schema/schema-util.js";
export class BasePages {
    constructor(props) {
        this._parentComment = undefined; // would be undefined if the comment is not initialized yet and we don't have comment.cid
        this._pagesIpfs = undefined; // when we create a new page from an existing subplebbit
        this._initClientsManager(props.plebbit);
        this.updateProps(props);
        hideClassPrivateProps(this);
    }
    updateProps(props) {
        this.pages = props.pages;
        this.pageCids = props.pageCids;
        this._subplebbit = props.subplebbit;
        this._pagesIpfs = props.pagesIpfs;
        if (this.pageCids)
            this._clientsManager.updatePageCidsToSortTypes(this.pageCids);
    }
    _initClientsManager(plebbit) {
        throw Error(`This function should be overridden`);
    }
    resetPages() {
        // Called when the sub changes address and needs to remove all the comments with the old subplebbit address
        this.pageCids = {};
        this.pages = {};
        this._pagesIpfs = undefined;
    }
    async _validatePage(pageIpfs, pageCid) {
        throw Error("should be implemented");
    }
    async _fetchAndVerifyPage(pageCid) {
        const pageIpfs = await this._clientsManager.fetchPage(pageCid);
        if (!this._clientsManager._plebbit._plebbitRpcClient && this._clientsManager._plebbit.validatePages)
            await this._validatePage(pageIpfs, pageCid);
        return pageIpfs;
    }
    async getPage(pageCid) {
        if (!this._subplebbit?.address)
            throw Error("Subplebbit address needs to be defined under page");
        const parsedCid = parseCidStringSchemaWithPlebbitErrorIfItFails(pageCid);
        return parsePageIpfs(await this._fetchAndVerifyPage(parsedCid));
    }
    // method below will be present in both subplebbit.posts and comment.replies
    async validatePage(page) {
        if (this._clientsManager._plebbit.validatePages)
            throw Error("This function is used for manual verification and you need to have plebbit.validatePages=false");
        const pageIpfs = { comments: page.comments.map((comment) => ("comment" in comment ? comment : comment.pageComment)) };
        await this._validatePage(pageIpfs);
    }
    toJSONIpfs() {
        if (remeda.isEmpty(this.pages))
            return undefined; // I forgot why this line is here
        if (!this._pagesIpfs && !remeda.isEmpty(this.pages)) {
            Logger("plebbit-js:pages:toJSONIpfs").error(`toJSONIpfs() is called on sub(${this._subplebbit}) and parentCid (${this._parentComment}) even though _pagesIpfs is undefined. This error should not persist`);
            return;
        }
        return this._pagesIpfs;
    }
}
export class RepliesPages extends BasePages {
    constructor(props) {
        super(props);
        this._pagesIpfs = undefined; // when we create a new page from an existing subplebbit
        this._parentComment = props.parentComment;
        hideClassPrivateProps(this);
    }
    updateProps(props) {
        super.updateProps(props);
    }
    _initClientsManager(plebbit) {
        this._clientsManager = new RepliesPagesClientsManager({ plebbit, pages: this });
        this.clients = this._clientsManager.clients;
    }
    toJSONIpfs() {
        return super.toJSONIpfs();
    }
    async _validatePage(pageIpfs, pageCid) {
        if (!this._parentComment?.cid)
            throw new PlebbitError("ERR_USER_ATTEMPTS_TO_VALIDATE_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_CID", {
                pageIpfs,
                pageCid,
                parentComment: this._parentComment
            });
        if (typeof this._parentComment?.depth !== "number")
            throw new PlebbitError("ERR_USER_ATTEMPTS_TO_VALIDATE_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_DEPTH", {
                pageIpfs,
                parentComment: this._parentComment,
                pageCid
            });
        if (!this._parentComment?.postCid)
            throw new PlebbitError("ERR_USER_ATTEMPTS_TO_VALIDATE_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_POST_CID", {
                pageIpfs,
                pageCid,
                parentComment: this._parentComment
            });
        if (pageIpfs.comments.length === 0)
            return;
        const baseDepth = pageIpfs.comments[0].comment?.depth;
        const isUniformDepth = pageIpfs.comments.every((comment) => comment.comment.depth === baseDepth);
        const verificationOpts = {
            pageCid,
            page: pageIpfs,
            resolveAuthorAddresses: this._clientsManager._plebbit.resolveAuthorAddresses,
            clientsManager: this._clientsManager,
            subplebbit: this._subplebbit,
            parentComment: isUniformDepth ? this._parentComment : { postCid: this._parentComment.postCid }, // if it's a flat page, we don't need to verify the parent comment. Only the post
            overrideAuthorAddressIfInvalid: true,
            validatePages: this._clientsManager._plebbit.validatePages,
            validateUpdateSignature: false // no need because we verified that page cid matches its content
        };
        const signatureValidity = await verifyPage(verificationOpts);
        if (!signatureValidity.valid)
            throw new PlebbitError("ERR_REPLIES_PAGE_IS_INVALID", {
                signatureValidity,
                verificationOpts
            });
    }
}
export class PostsPages extends BasePages {
    constructor(props) {
        super(props);
        this._pagesIpfs = undefined;
        this._parentComment = undefined; // would be undefined because we don't have a parent comment for posts
    }
    updateProps(props) {
        super.updateProps(props);
    }
    _initClientsManager(plebbit) {
        this._clientsManager = new PostsPagesClientsManager({ plebbit, pages: this });
        this.clients = this._clientsManager.clients;
    }
    toJSONIpfs() {
        return super.toJSONIpfs();
    }
    async _validatePage(pageIpfs, pageCid) {
        if (pageIpfs.comments.length === 0)
            return;
        const verificationOpts = {
            pageCid,
            page: pageIpfs,
            resolveAuthorAddresses: this._clientsManager._plebbit.resolveAuthorAddresses,
            clientsManager: this._clientsManager,
            subplebbit: this._subplebbit,
            parentComment: { cid: undefined, postCid: undefined, depth: -1 },
            overrideAuthorAddressIfInvalid: true,
            validatePages: this._clientsManager._plebbit.validatePages,
            validateUpdateSignature: false // no need because we verified that page cid matches its content
        };
        const signatureValidity = await verifyPage(verificationOpts);
        if (!signatureValidity.valid)
            throw new PlebbitError("ERR_POSTS_PAGE_IS_INVALID", {
                signatureValidity,
                verificationOpts
            });
    }
}
//# sourceMappingURL=pages.js.map