import type { PageIpfs, PageTypeJson, PostSortName, PostsPagesTypeIpfs, RepliesPagesTypeIpfs, ReplySortName } from "./types.js";
import { BasePagesClientsManager, PostsPagesClientsManager, RepliesPagesClientsManager } from "../clients/pages-client-manager.js";
import { Plebbit } from "../plebbit/plebbit.js";
type BaseProps = {
    plebbit: BasePages["_plebbit"];
    subplebbitAddress: BasePages["_subplebbitAddress"];
};
type PostsProps = Pick<PostsPages, "pages" | "pageCids"> & BaseProps & {
    pagesIpfs?: PostsPagesTypeIpfs;
};
type RepliesProps = Pick<RepliesPages, "pages" | "pageCids"> & BaseProps & {
    parentCid: RepliesPages["_parentCid"];
    pagesIpfs?: RepliesPagesTypeIpfs;
};
export declare class BasePages {
    pages: PostsPages["pages"] | RepliesPages["pages"];
    pageCids: PostsPages["pageCids"] | RepliesPages["pageCids"];
    clients: BasePagesClientsManager["clients"];
    _clientsManager: BasePagesClientsManager;
    _plebbit: Plebbit;
    _subplebbitAddress: string;
    _parentCid: RepliesPages["_parentCid"] | PostsPages["_parentCid"];
    protected _pagesIpfs: RepliesPagesTypeIpfs | PostsPagesTypeIpfs | undefined;
    constructor(props: PostsProps | RepliesProps);
    updateProps(props: PostsProps | RepliesProps): void;
    protected _initClientsManager(): void;
    resetPages(): void;
    _fetchAndVerifyPage(pageCid: string): Promise<PageIpfs>;
    getPage(pageCid: string): Promise<PageTypeJson>;
    toJSONIpfs(): RepliesPagesTypeIpfs | PostsPagesTypeIpfs | undefined;
}
export declare class RepliesPages extends BasePages {
    pages: Partial<Record<ReplySortName, PageTypeJson>>;
    pageCids: Record<ReplySortName, string> | {};
    clients: RepliesPagesClientsManager["clients"];
    _clientsManager: RepliesPagesClientsManager;
    _parentCid: string | undefined;
    protected _pagesIpfs: RepliesPagesTypeIpfs | undefined;
    constructor(props: RepliesProps);
    updateProps(props: RepliesProps): void;
    protected _initClientsManager(): void;
    toJSONIpfs(): RepliesPagesTypeIpfs | undefined;
}
export declare class PostsPages extends BasePages {
    pages: Partial<Record<PostSortName, PageTypeJson>>;
    pageCids: Record<PostSortName, string> | {};
    clients: PostsPagesClientsManager["clients"];
    _clientsManager: PostsPagesClientsManager;
    _parentCid: undefined;
    protected _pagesIpfs: PostsPagesTypeIpfs | undefined;
    constructor(props: PostsProps);
    updateProps(props: PostsProps): void;
    protected _initClientsManager(): void;
    toJSONIpfs(): PostsPagesTypeIpfs | undefined;
}
export {};
