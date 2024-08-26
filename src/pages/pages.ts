import { parsePageIpfs } from "../pages/util.js";
import type { PageIpfs, PageTypeJson, PostSortName, PostsPagesTypeIpfs, RepliesPagesTypeIpfs, ReplySortName } from "./types.js";
import { verifyPage } from "../signer/signatures.js";
import assert from "assert";
import { BasePagesClientsManager, PostsPagesClientsManager, RepliesPagesClientsManager } from "../clients/pages-client-manager.js";
import { Plebbit } from "../plebbit.js";
import { PlebbitError } from "../plebbit-error.js";
import Logger from "@plebbit/plebbit-logger";
import * as remeda from "remeda";
import { hideClassPrivateProps } from "../util.js";
import { parseCidStringSchemaWithPlebbitErrorIfItFails } from "../schema/schema-util.js";

type BaseProps = {
    plebbit: BasePages["_plebbit"];
    subplebbitAddress: BasePages["_subplebbitAddress"];
};

type PostsProps = Pick<PostsPages, "pages" | "pageCids"> & BaseProps & { pagesIpfs?: PostsPagesTypeIpfs };
type RepliesProps = Pick<RepliesPages, "pages" | "pageCids"> &
    BaseProps & { parentCid: RepliesPages["_parentCid"]; pagesIpfs?: RepliesPagesTypeIpfs };

export class BasePages {
    pages!: PostsPages["pages"] | RepliesPages["pages"];
    pageCids!: PostsPages["pageCids"] | RepliesPages["pageCids"];
    clients!: BasePagesClientsManager["clients"];
    _clientsManager!: BasePagesClientsManager;
    _plebbit: Plebbit;
    _subplebbitAddress!: string;
    _parentCid: RepliesPages["_parentCid"] | PostsPages["_parentCid"] = undefined;
    protected _pagesIpfs: RepliesPagesTypeIpfs | PostsPagesTypeIpfs | undefined = undefined; // when we create a new page from an existing subplebbit

    constructor(props: PostsProps | RepliesProps) {
        this._plebbit = props.plebbit;
        this._initClientsManager();
        this.updateProps(props);
        hideClassPrivateProps(this);
    }

    updateProps(props: PostsProps | RepliesProps) {
        this.pages = props.pages;
        this.pageCids = props.pageCids;
        this._plebbit = props.plebbit;
        this._subplebbitAddress = props.subplebbitAddress;
        if ("parentCid" in props) this._parentCid = props.parentCid;
        this._pagesIpfs = props.pagesIpfs;
        if (this.pageCids) this._clientsManager.updatePageCidsToSortTypes(this.pageCids);
    }

    protected _initClientsManager() {
        throw Error(`This function should be overridden`);
    }

    resetPages() {
        // Called when the sub changes address and needs to remove all the comments with the old subplebbit address
        this.pageCids = {};
        this.pages = {};
        this._pagesIpfs = undefined;
    }

    async _fetchAndVerifyPage(pageCid: string): Promise<PageIpfs> {
        const pageIpfs = await this._clientsManager.fetchPage(pageCid);
        if (!this._plebbit.plebbitRpcClient) {
            const signatureValidity = await verifyPage(
                pageCid,
                pageIpfs,
                this._plebbit.resolveAuthorAddresses,
                this._clientsManager,
                this._subplebbitAddress,
                this._parentCid,
                true
            );
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

    async getPage(pageCid: string): Promise<PageTypeJson> {
        assert(typeof this._subplebbitAddress === "string", "Subplebbit address needs to be defined under page");
        const parsedCid = parseCidStringSchemaWithPlebbitErrorIfItFails(pageCid);
        return parsePageIpfs(await this._fetchAndVerifyPage(parsedCid));
    }

    toJSONIpfs(): RepliesPagesTypeIpfs | PostsPagesTypeIpfs | undefined {
        if (remeda.isEmpty(this.pages)) return undefined; // I forgot why this line is here
        if (!this._pagesIpfs && !remeda.isEmpty(this.pages)) {
            Logger("plebbit-js:pages:toJSONIpfs").error(
                `toJSONIpfs() is called on sub(${this._subplebbitAddress}) and parentCid (${this._parentCid}) even though _pagesIpfs is undefined. This error should not persist`
            );
            return;
        }
        return this._pagesIpfs;
    }
}

export class RepliesPages extends BasePages {
    override pages!: Partial<Record<ReplySortName, PageTypeJson>>;

    override pageCids!: Record<ReplySortName, string> | {};

    override clients!: RepliesPagesClientsManager["clients"];

    override _clientsManager!: RepliesPagesClientsManager;

    override _parentCid!: string | undefined; // would be undefined if the comment is not initialized yet and we don't have comment.cid

    protected override _pagesIpfs: RepliesPagesTypeIpfs | undefined = undefined; // when we create a new page from an existing subplebbit

    constructor(props: RepliesProps) {
        super(props);
    }

    override updateProps(props: RepliesProps) {
        super.updateProps(props);
    }

    protected override _initClientsManager(): void {
        this._clientsManager = new RepliesPagesClientsManager(this);
        this.clients = this._clientsManager.clients;
    }

    override toJSONIpfs(): RepliesPagesTypeIpfs | undefined {
        return <RepliesPagesTypeIpfs | undefined>super.toJSONIpfs();
    }
}

export class PostsPages extends BasePages {
    override pages!: Partial<Record<PostSortName, PageTypeJson>>;

    override pageCids!: Record<PostSortName, string> | {};

    override clients!: PostsPagesClientsManager["clients"];

    override _clientsManager!: PostsPagesClientsManager;
    override _parentCid: undefined = undefined;
    protected override _pagesIpfs: PostsPagesTypeIpfs | undefined = undefined;

    constructor(props: PostsProps) {
        super(props);
    }

    override updateProps(props: PostsProps) {
        super.updateProps(props);
    }

    protected override _initClientsManager(): void {
        this._clientsManager = new PostsPagesClientsManager(this);
        this.clients = this._clientsManager.clients;
    }

    override toJSONIpfs(): PostsPagesTypeIpfs | undefined {
        return <PostsPagesTypeIpfs | undefined>super.toJSONIpfs();
    }
}
