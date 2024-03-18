import { parsePageIpfs } from "./util.js";
import {
    CommentIpfsType,
    CommentWithCommentUpdate,
    PagesType,
    PagesTypeJson,
    PageType,
    PostSortName,
    PostsPagesTypeIpfs,
    PostsPagesTypeJson,
    RepliesPagesTypeIpfs,
    RepliesPagesTypeJson,
    ReplySortName
} from "./types.js";
import { verifyPage } from "./signer/signatures.js";
import lodash from "lodash";
import assert from "assert";
import { BasePagesClientsManager, PostsPagesClientsManager, RepliesPagesClientsManager } from "./clients/pages-client-manager.js";
import { Plebbit } from "./plebbit.js";
import { PlebbitError } from "./plebbit-error.js";
import Logger from "@plebbit/plebbit-logger";

type ConstructorProps = PagesType & {
    plebbit: BasePages["_plebbit"];
    subplebbitAddress: BasePages["_subplebbitAddress"];
    parentCid?: CommentIpfsType["parentCid"];
    pagesIpfs?: PostsPagesTypeIpfs | RepliesPagesTypeIpfs;
};
export class BasePages implements PagesType {
    pages!: Partial<Record<PostSortName | ReplySortName, PageType>>;
    pageCids!: Partial<Record<PostSortName | ReplySortName, string>>;
    clients!: BasePagesClientsManager["clients"];
    _clientsManager!: BasePagesClientsManager;
    _plebbit: Plebbit;
    _subplebbitAddress!: string;
    _parentCid: CommentIpfsType["parentCid"];
    private _pagesIpfs?: ConstructorProps["pagesIpfs"];
    constructor(props: ConstructorProps) {
        this._plebbit = props.plebbit;
        this._initClientsManager();
        this.updateProps(props);
    }

    updateProps(props: ConstructorProps) {
        this.pages = props.pages;
        this.pageCids = props.pageCids;
        this._plebbit = props.plebbit;
        this._subplebbitAddress = props.subplebbitAddress;
        this._parentCid = props.parentCid;
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

    async getPage(pageCid: string): Promise<PageType> {
        return await parsePageIpfs(await this._fetchAndVerifyPage(pageCid), this._plebbit);
    }

    toJSON(): PagesTypeJson | undefined {
        if (!this.pages) return undefined;
        const pagesJson = lodash.mapValues(this.pages, (page) => {
            if (!page) return undefined;
            const commentsJson: CommentWithCommentUpdate[] = page.comments.map((comment) => comment.toJSONMerged());
            return { comments: commentsJson, nextCid: page.nextCid };
        });
        return { pages: pagesJson, pageCids: this.pageCids };
    }

    toJSONIpfs(): RepliesPagesTypeIpfs | PostsPagesTypeIpfs | undefined {
        if (!this.pages) return undefined;
        if (!this._pagesIpfs) {
            Logger("plebbit-js:pages:toJSONIpfs").error(
                `toJSONIpfs() is called on sub(${this._subplebbitAddress}) and parentCid (${this._parentCid}) even though _pagesIpfs is undefined. This error should not persist`
            );
            return;
        }
        return {
            pages: this._pagesIpfs.pages,
            pageCids: this.pageCids
        };
    }
}

export class RepliesPages extends BasePages {
    pages!: Partial<Record<ReplySortName, PageType>>;

    pageCids!: Partial<Record<ReplySortName, string>>;

    clients!: RepliesPagesClientsManager["clients"];
    _parentCid!: string;

    _clientsManager!: RepliesPagesClientsManager;

    constructor(props: ConstructorProps & { parentCid: string }) {
        super(props);
    }

    updateProps(props: ConstructorProps & { parentCid: string }): void {
        super.updateProps(props);
    }

    protected _initClientsManager(): void {
        this._clientsManager = new RepliesPagesClientsManager(this);
        this.clients = this._clientsManager.clients;
    }

    // TODO override toJSON, toJSONIpfs

    toJSON(): RepliesPagesTypeJson | undefined {
        return super.toJSON();
    }

    toJSONIpfs(): RepliesPagesTypeIpfs | undefined {
        return super.toJSONIpfs();
    }
}

export class PostsPages extends BasePages {
    pages!: Partial<Record<PostSortName, PageType>>;

    pageCids!: Partial<Record<PostSortName, string>>;

    clients!: PostsPagesClientsManager["clients"];

    _clientsManager!: PostsPagesClientsManager;

    constructor(props: Omit<ConstructorProps, "parentCid">) {
        super(props);
    }

    updateProps(props: Omit<ConstructorProps, "parentCid">): void {
        super.updateProps(props);
    }

    protected _initClientsManager(): void {
        this._clientsManager = new PostsPagesClientsManager(this);
        this.clients = this._clientsManager.clients;
    }

    toJSON(): PostsPagesTypeJson | undefined {
        return super.toJSON();
    }

    toJSONIpfs(): PostsPagesTypeIpfs | undefined {
        return super.toJSONIpfs();
    }
}
