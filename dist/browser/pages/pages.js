import { parseModQueuePageIpfs, parsePageIpfs } from "./util.js";
import { verifyModQueuePage, verifyPage } from "../signer/signatures.js";
import { SubplebbitPostsPagesClientsManager, RepliesPagesClientsManager, SubplebbitModQueueClientsManager } from "./pages-client-manager.js";
import { PlebbitError } from "../plebbit-error.js";
import { hideClassPrivateProps } from "../util.js";
import { parseCidStringSchemaWithPlebbitErrorIfItFails } from "../schema/schema-util.js";
export class BasePages {
    constructor(props) {
        this._parentComment = undefined; // would be undefined if the comment is not initialized yet and we don't have comment.cid
        this._initClientsManager(props.plebbit);
        this.updateProps(props);
        hideClassPrivateProps(this);
    }
    updateProps(props) {
        this.pages = props.pages;
        this.pageCids = props.pageCids;
        this._subplebbit = props.subplebbit;
        if (this.pageCids) {
            this._clientsManager.updatePageCidsToSortTypes(this.pageCids);
            this._clientsManager.updatePagesMaxSizeCache(Object.values(this.pageCids), 1024 * 1024);
        }
        if (this.pages)
            for (const preloadedPage of Object.values(this.pages))
                if (preloadedPage?.nextCid)
                    this._clientsManager.updatePagesMaxSizeCache([preloadedPage.nextCid], 1024 * 1024);
    }
    _initClientsManager(plebbit) {
        throw Error(`This function should be overridden`);
    }
    resetPages() {
        // Called when the sub changes address and needs to remove all the comments with the old subplebbit address
        this.pageCids = {};
        this.pages = {};
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
    _parseRawPageIpfs(pageIpfs) {
        throw Error("should be implemented");
    }
    async getPage(pageCid) {
        if (!this._subplebbit?.address)
            throw Error("Subplebbit address needs to be defined under page");
        const parsedCid = parseCidStringSchemaWithPlebbitErrorIfItFails(pageCid);
        const pageIpfs = await this._fetchAndVerifyPage(parsedCid);
        return this._parseRawPageIpfs(pageIpfs);
    }
    // method below will be present in both subplebbit.posts and comment.replies
    async validatePage(page) {
        if (this._clientsManager._plebbit.validatePages)
            throw Error("This function is used for manual verification and you need to have plebbit.validatePages=false");
        const pageIpfs = { comments: page.comments.map((comment) => ("comment" in comment ? comment : comment.raw)) };
        await this._validatePage(pageIpfs);
    }
    _stop() { }
}
export class RepliesPages extends BasePages {
    constructor(props) {
        super(props);
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
    async _fetchAndVerifyPage(pageCid) {
        return await super._fetchAndVerifyPage(pageCid);
    }
    _parseRawPageIpfs(pageIpfs) {
        return parsePageIpfs(pageIpfs);
    }
    async getPage(pageCid) {
        if (!this._parentComment?.cid)
            throw new PlebbitError("ERR_USER_ATTEMPTS_TO_GET_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_CID", {
                pageCid,
                parentComment: this._parentComment
            });
        if (typeof this._parentComment?.depth !== "number")
            throw new PlebbitError("ERR_USER_ATTEMPTS_TO_GET_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_DEPTH", {
                parentComment: this._parentComment,
                pageCid
            });
        if (!this._parentComment?.postCid)
            throw new PlebbitError("ERR_USER_ATTEMPTS_TO_GET_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_POST_CID", {
                pageCid,
                parentComment: this._parentComment
            });
        // we need to make all updating comment instances do the getPage call to cache _loadedUniqueCommentFromGetPage in a centralized instance
        return await super.getPage(pageCid);
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
        const pageSortName = Object.entries(this.pageCids).find(([_, pageCid]) => pageCid === pageCid)?.[0];
        const verificationOpts = {
            pageCid,
            pageSortName,
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
        this._parentComment = undefined; // would be undefined because we don't have a parent comment for posts
    }
    updateProps(props) {
        super.updateProps(props);
    }
    _initClientsManager(plebbit) {
        this._clientsManager = new SubplebbitPostsPagesClientsManager({ plebbit, pages: this });
        this.clients = this._clientsManager.clients;
    }
    async _fetchAndVerifyPage(pageCid) {
        return await super._fetchAndVerifyPage(pageCid);
    }
    _parseRawPageIpfs(pageIpfs) {
        return parsePageIpfs(pageIpfs);
    }
    async getPage(pageCid) {
        // we need to make all updating subplebbit instances do the getPage call to cache _loadedUniqueCommentFromGetPage
        return await super.getPage(pageCid);
    }
    async _validatePage(pageIpfs, pageCid) {
        if (pageIpfs.comments.length === 0)
            return;
        const pageSortName = Object.entries(this.pageCids).find(([_, pageCid]) => pageCid === pageCid)?.[0];
        const verificationOpts = {
            pageCid,
            pageSortName,
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
export class ModQueuePages extends BasePages {
    constructor(props) {
        super(props);
        this.pages = undefined;
        this._parentComment = undefined;
        this.pages = undefined;
    }
    resetPages() {
        this.pageCids = {};
        this.pages = undefined;
    }
    _initClientsManager(plebbit) {
        this._clientsManager = new SubplebbitModQueueClientsManager({ plebbit, pages: this });
        this.clients = this._clientsManager.clients;
    }
    async _fetchAndVerifyPage(pageCid) {
        return await super._fetchAndVerifyPage(pageCid);
    }
    _parseRawPageIpfs(pageIpfs) {
        return parseModQueuePageIpfs(pageIpfs);
    }
    async getPage(pageCid) {
        return await super.getPage(pageCid);
    }
    async _validatePage(pageIpfs, pageCid) {
        if (pageIpfs.comments.length === 0)
            return;
        const pageSortName = Object.entries(this.pageCids).find(([_, pageCid]) => pageCid === pageCid)?.[0];
        const verificationOpts = {
            pageCid,
            pageSortName,
            page: pageIpfs,
            resolveAuthorAddresses: this._clientsManager._plebbit.resolveAuthorAddresses,
            clientsManager: this._clientsManager,
            subplebbit: this._subplebbit,
            parentComment: { cid: undefined, postCid: undefined, depth: -1 },
            overrideAuthorAddressIfInvalid: true,
            validatePages: this._clientsManager._plebbit.validatePages,
            validateUpdateSignature: false // no need because we verified that page cid matches its content
        };
        const signatureValidity = await verifyModQueuePage(verificationOpts);
        if (!signatureValidity.valid)
            throw new PlebbitError("ERR_MOD_QUEUE_PAGE_IS_INVALID", {
                signatureValidity,
                verificationOpts
            });
    }
}
//# sourceMappingURL=pages.js.map