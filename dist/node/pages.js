import { parsePageIpfs } from "./util.js";
import { verifyPage } from "./signer/signatures.js";
import assert from "assert";
import { PostsPagesClientsManager, RepliesPagesClientsManager } from "./clients/pages-client-manager.js";
import { PlebbitError } from "./plebbit-error.js";
import Logger from "@plebbit/plebbit-logger";
import * as remeda from "remeda";
export class BasePages {
    constructor(props) {
        this._plebbit = props.plebbit;
        this._initClientsManager();
        this.updateProps(props);
    }
    updateProps(props) {
        this.pages = props.pages;
        this.pageCids = props.pageCids;
        this._plebbit = props.plebbit;
        this._subplebbitAddress = props.subplebbitAddress;
        if ("parentCid" in props)
            this._parentCid = props.parentCid;
        this._pagesIpfs = props.pagesIpfs;
        if (this.pageCids)
            this._clientsManager.updatePageCidsToSortTypes(this.pageCids);
    }
    _initClientsManager() {
        throw Error(`This function should be overridden`);
    }
    resetPages() {
        // Called when the sub changes address and needs to remove all the comments with the old subplebbit address
        this.pageCids = {};
        this.pages = {};
        this._pagesIpfs = undefined;
    }
    async _fetchAndVerifyPage(pageCid) {
        assert(typeof this._subplebbitAddress === "string", "Subplebbit address needs to be defined under page");
        const pageIpfs = await this._clientsManager.fetchPage(pageCid);
        if (!this._plebbit.plebbitRpcClient) {
            const signatureValidity = await verifyPage(pageCid, pageIpfs, this._plebbit.resolveAuthorAddresses, this._clientsManager, this._subplebbitAddress, this._parentCid, true);
            if (!signatureValidity.valid)
                throw new PlebbitError("ERR_PAGE_SIGNATURE_IS_INVALID", {
                    signatureValidity,
                    parentCid: this._parentCid,
                    subplebbitAddress: this._subplebbitAddress,
                    pageIpfs,
                    pageCid
                });
        }
        return pageIpfs;
    }
    async getPage(pageCid) {
        assert(typeof this._subplebbitAddress === "string", "Subplebbit address needs to be defined under page");
        return await parsePageIpfs(await this._fetchAndVerifyPage(pageCid), this._plebbit);
    }
    toJSON() {
        if (remeda.isEmpty(this.pages))
            return undefined;
        if (remeda.isEmpty(this.pageCids))
            throw Error("pageInstance.pageCids should not be empty while pageInstance.pages is defined");
        const pagesJson = remeda.mapValues(this.pages, (page) => {
            if (!page)
                return undefined;
            const commentsJson = page.comments.map((comment) => comment.toJSONCommentWithinPage());
            return { comments: commentsJson, nextCid: page.nextCid };
        });
        return { pages: pagesJson, pageCids: this.pageCids };
    }
    toJSONIpfs() {
        if (remeda.isEmpty(this.pages))
            return undefined; // I forgot why this line is here
        if (!this._pagesIpfs && !remeda.isEmpty(this.pages)) {
            Logger("plebbit-js:pages:toJSONIpfs").error(`toJSONIpfs() is called on sub(${this._subplebbitAddress}) and parentCid (${this._parentCid}) even though _pagesIpfs is undefined. This error should not persist`);
            return;
        }
        return this._pagesIpfs;
    }
}
export class RepliesPages extends BasePages {
    constructor(props) {
        super(props);
    }
    updateProps(props) {
        super.updateProps(props);
    }
    _initClientsManager() {
        this._clientsManager = new RepliesPagesClientsManager(this);
        this.clients = this._clientsManager.clients;
    }
    toJSON() {
        return super.toJSON();
    }
    toJSONIpfs() {
        return super.toJSONIpfs();
    }
}
export class PostsPages extends BasePages {
    constructor(props) {
        super(props);
    }
    updateProps(props) {
        super.updateProps(props);
    }
    _initClientsManager() {
        this._clientsManager = new PostsPagesClientsManager(this);
        this.clients = this._clientsManager.clients;
    }
    toJSON() {
        return super.toJSON();
    }
    toJSONIpfs() {
        return super.toJSONIpfs();
    }
}
//# sourceMappingURL=pages.js.map