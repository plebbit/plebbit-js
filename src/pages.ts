import { parsePageIpfs } from "./util.js";
import {
    PageInstanceType,
    PostSortName,
    PostsPagesTypeIpfs,
    PostsPagesTypeJson,
    RepliesPagesTypeIpfs,
    RepliesPagesTypeJson,
    ReplySortName
} from "./types.js";
import { verifyPage } from "./signer/signatures.js";
import assert from "assert";
import { BasePagesClientsManager, PostsPagesClientsManager, RepliesPagesClientsManager } from "./clients/pages-client-manager.js";
import { Plebbit } from "./plebbit.js";
import { PlebbitError } from "./plebbit-error.js";
import Logger from "@plebbit/plebbit-logger";
import * as remeda from "remeda";

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
    _parentCid: RepliesPages["_parentCid"] | PostsPages["_parentCid"];
    protected _pagesIpfs: RepliesPagesTypeIpfs | PostsPagesTypeIpfs | undefined; // when we create a new page from an existing subplebbit

    constructor(props: PostsProps | RepliesProps) {
        this._plebbit = props.plebbit;
        this._initClientsManager();
        this.updateProps(props);
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

    async _fetchAndVerifyPage(pageCid: string) {
        assert(typeof this._subplebbitAddress === "string", "Subplebbit address needs to be defined under page");
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

    async getPage(pageCid: string): Promise<PageInstanceType> {
        assert(typeof this._subplebbitAddress === "string", "Subplebbit address needs to be defined under page");
        return await parsePageIpfs(await this._fetchAndVerifyPage(pageCid), this._plebbit);
    }

    toJSON(): RepliesPagesTypeJson | PostsPagesTypeJson | undefined {
        if (remeda.isEmpty(this.pages)) return undefined;
        if (remeda.isEmpty(this.pageCids)) throw Error("pageInstance.pageCids should not be empty while pageInstance.pages is defined");
        const pagesJson: RepliesPagesTypeJson["pages"] | PostsPagesTypeJson["pages"] = remeda.mapValues(this.pages, (page) => {
            if (!page) return undefined;
            const commentsJson = page.comments.map((comment) => comment.toJSONCommentWithinPage());
            return { comments: commentsJson, nextCid: page.nextCid };
        });
        return { pages: pagesJson, pageCids: this.pageCids };
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
    pages!: Partial<Record<ReplySortName, PageInstanceType>>;

    pageCids!: Record<ReplySortName, string> | {};

    clients!: RepliesPagesClientsManager["clients"];

    _clientsManager!: RepliesPagesClientsManager;

    _parentCid!: string | undefined; // would be undefined if the comment is not initialized yet and we don't have comment.cid

    protected _pagesIpfs: RepliesPagesTypeIpfs | undefined; // when we create a new page from an existing subplebbit

    constructor(props: RepliesProps) {
        super(props);
    }

    updateProps(props: RepliesProps) {
        super.updateProps(props);
    }

    protected _initClientsManager(): void {
        this._clientsManager = new RepliesPagesClientsManager(this);
        this.clients = this._clientsManager.clients;
    }

    toJSON(): RepliesPagesTypeJson | undefined {
        return <RepliesPagesTypeJson | undefined>super.toJSON();
    }

    toJSONIpfs(): RepliesPagesTypeIpfs | undefined {
        return <RepliesPagesTypeIpfs | undefined>super.toJSONIpfs();
    }
}

export class PostsPages extends BasePages {
    pages!: Partial<Record<PostSortName, PageInstanceType>>;

    pageCids!: Record<PostSortName, string> | {};

    clients!: PostsPagesClientsManager["clients"];

    _clientsManager!: PostsPagesClientsManager;
    _parentCid: undefined;
    protected _pagesIpfs: PostsPagesTypeIpfs | undefined;

    constructor(props: PostsProps) {
        super(props);
    }

    updateProps(props: PostsProps) {
        super.updateProps(props);
    }

    protected _initClientsManager(): void {
        this._clientsManager = new PostsPagesClientsManager(this);
        this.clients = this._clientsManager.clients;
    }

    toJSON(): PostsPagesTypeJson | undefined {
        return <PostsPagesTypeJson | undefined>super.toJSON();
    }

    toJSONIpfs(): PostsPagesTypeIpfs | undefined {
        return <PostsPagesTypeIpfs | undefined>super.toJSONIpfs();
    }
}
