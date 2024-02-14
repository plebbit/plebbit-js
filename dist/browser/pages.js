import { parsePageIpfs } from "./util.js";
import { verifyPage } from "./signer/signatures.js";
import lodash from "lodash";
import assert from "assert";
import { PostsPagesClientsManager, RepliesPagesClientsManager } from "./clients/pages-client-manager.js";
import { PlebbitError } from "./plebbit-error.js";
import Logger from "@plebbit/plebbit-logger";
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
        this._parentCid = props.parentCid;
        this._pagesIpfs = props.pagesIpfs;
        if (this.pageCids)
            this._clientsManager.updatePageCidsToSortTypes(this.pageCids);
    }
    _initClientsManager() {
        throw Error(`This function should be overridden`);
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
        return await parsePageIpfs(await this._fetchAndVerifyPage(pageCid), this._plebbit);
    }
    toJSON() {
        if (!this.pages)
            return undefined;
        const pagesJson = lodash.mapValues(this.pages, (page) => {
            const commentsJson = page.comments.map((comment) => comment.toJSONMerged());
            return { comments: commentsJson, nextCid: page.nextCid };
        });
        return { pages: pagesJson, pageCids: this.pageCids };
    }
    toJSONIpfs() {
        if (!this.pages)
            return undefined;
        if (!this._pagesIpfs) {
            Logger("plebbit-js:pages:toJSONIpfs").error(`toJSONIpfs() is called on sub(${this._subplebbitAddress}) and parentCid (${this._parentCid}) even though _pagesIpfs is undefined. This error should not persist`);
            return;
        }
        return {
            pages: this._pagesIpfs,
            pageCids: this.pageCids
        };
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
    // TODO override toJSON, toJSONIpfs
    toJSON() {
        return super.toJSON();
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
}
//# sourceMappingURL=pages.js.map