import { parsePageIpfs } from "./util";
import {
    CommentIpfsType,
    CommentWithCommentUpdate,
    PagesType,
    PagesTypeIpfs,
    PagesTypeJson,
    PageType,
    PostSortName,
    PostsPagesTypeJson,
    RepliesPagesTypeJson,
    ReplySortName
} from "./types";
import { verifyPage } from "./signer/signatures";
import lodash from "lodash";
import assert from "assert";
import { BasePagesClientsManager, PostsPagesClientsManager, RepliesPagesClientsManager } from "./clients/pages-client-manager";
import { Plebbit } from "./plebbit";

type ConstructorProps = PagesType & {
    plebbit: BasePages["_plebbit"];
    subplebbitAddress: BasePages["_subplebbitAddress"];
    parentCid?: CommentIpfsType["parentCid"];
    pagesIpfs?: BasePages["_pagesIpfs"];
};
export class BasePages implements PagesType {
    pages: Partial<Record<PostSortName | ReplySortName, PageType>>;

    pageCids: Partial<Record<PostSortName | ReplySortName, string>>;

    clients: BasePagesClientsManager["clients"];

    _clientsManager: BasePagesClientsManager;

    _plebbit: Plebbit;
    protected _subplebbitAddress: string;
    protected _parentCid: CommentIpfsType["parentCid"];
    private _pagesIpfs?: PagesTypeIpfs["pages"];
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

    async getPage(pageCid: string): Promise<PageType> {
        assert(typeof this._subplebbitAddress === "string", "Subplebbit address needs to be defined under page");
        const pageIpfs = await this._clientsManager.fetchPage(pageCid);
        const signatureValidity = await verifyPage(
            pageIpfs,
            this._plebbit.resolveAuthorAddresses,
            this._clientsManager,
            this._subplebbitAddress,
            this._parentCid,
            true
        );
        if (!signatureValidity.valid) throw Error(signatureValidity.reason);

        return await parsePageIpfs(pageIpfs, this._plebbit);
    }

    toJSON(): PagesTypeJson | undefined {
        if (!this.pages) return undefined;
        const pagesJson = lodash.mapValues(this.pages, (page) => {
            const commentsJson: CommentWithCommentUpdate[] = page.comments.map((comment) => comment.toJSONMerged());
            return { comments: commentsJson, nextCid: page.nextCid };
        });
        return { pages: pagesJson, pageCids: this.pageCids };
    }

    toJSONIpfs(): PagesTypeIpfs | undefined {
        if (!this.pages) return undefined;
        assert(this._pagesIpfs);
        return {
            pages: this._pagesIpfs,
            pageCids: this.pageCids
        };
    }
}

export class RepliesPages extends BasePages {
    pages: Partial<Record<ReplySortName, PageType>>;

    pageCids: Partial<Record<ReplySortName, string>>;

    clients: RepliesPagesClientsManager["clients"];
    protected _parentCid: string;

    _clientsManager: RepliesPagesClientsManager;

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

    async getPage(pageCid: string): Promise<PageType> {
        if (this._plebbit.plebbitRpcClient)
            return await parsePageIpfs(
                await this._plebbit.plebbitRpcClient.getCommentPage(pageCid, this._parentCid, this._subplebbitAddress),
                this._plebbit
            );
        else return super.getPage(pageCid);
    }

    // TODO override toJSON, toJSONIpfs

    toJSON(): RepliesPagesTypeJson | undefined {
        return super.toJSON();
    }
}

export class PostsPages extends BasePages {
    pages: Partial<Record<PostSortName, PageType>>;

    pageCids: Partial<Record<PostSortName, string>>;

    clients: PostsPagesClientsManager["clients"];

    _clientsManager: PostsPagesClientsManager;

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

    async getPage(pageCid: string): Promise<PageType> {
        if (this._plebbit.plebbitRpcClient)
            return await parsePageIpfs(
                await this._plebbit.plebbitRpcClient.getSubplebbitPage(pageCid, this._subplebbitAddress),
                this._plebbit
            );
        else return super.getPage(pageCid);
    }

    toJSON(): PostsPagesTypeJson | undefined {
        return super.toJSON();
    }
}
