import { parsePageIpfs } from "../pages/util.js";
import { verifyPage } from "../signer/signatures.js";
import assert from "assert";
import { PostsPagesClientsManager, RepliesPagesClientsManager } from "../clients/pages-client-manager.js";
import { PlebbitError } from "../plebbit-error.js";
import Logger from "@plebbit/plebbit-logger";
import * as remeda from "remeda";
import { hideClassPrivateProps } from "../util.js";
import { parseCidStringSchemaWithPlebbitErrorIfItFails } from "../schema/schema-util.js";
export class BasePages {
    constructor(props) {
        this._parentCid = undefined;
        this._pagesIpfs = undefined; // when we create a new page from an existing subplebbit
        this._plebbit = props.plebbit;
        this._initClientsManager();
        this.updateProps(props);
        hideClassPrivateProps(this);
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
        const pageIpfs = await this._clientsManager.fetchPage(pageCid);
        if (!this._plebbit._plebbitRpcClient) {
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
        const parsedCid = parseCidStringSchemaWithPlebbitErrorIfItFails(pageCid);
        return parsePageIpfs(await this._fetchAndVerifyPage(parsedCid));
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
        this._pagesIpfs = undefined; // when we create a new page from an existing subplebbit
    }
    updateProps(props) {
        super.updateProps(props);
    }
    _initClientsManager() {
        this._clientsManager = new RepliesPagesClientsManager(this);
        this.clients = this._clientsManager.clients;
    }
    toJSONIpfs() {
        return super.toJSONIpfs();
    }
}
export class PostsPages extends BasePages {
    constructor(props) {
        super(props);
        this._parentCid = undefined;
        this._pagesIpfs = undefined;
    }
    updateProps(props) {
        super.updateProps(props);
    }
    _initClientsManager() {
        this._clientsManager = new PostsPagesClientsManager(this);
        this.clients = this._clientsManager.clients;
    }
    toJSONIpfs() {
        return super.toJSONIpfs();
    }
}
//# sourceMappingURL=pages.js.map