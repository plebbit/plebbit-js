import { CommentIpfsType, PagesType, PagesTypeIpfs, PagesTypeJson, PageType, PostSortName, PostsPagesTypeJson, RepliesPagesTypeJson, ReplySortName } from "./types";
import { BasePagesClientsManager, PostsPagesClientsManager, RepliesPagesClientsManager } from "./clients/pages-client-manager";
import { Plebbit } from "./plebbit";
declare type ConstructorProps = PagesType & {
    plebbit: BasePages["_plebbit"];
    subplebbitAddress: BasePages["_subplebbitAddress"];
    parentCid?: CommentIpfsType["parentCid"];
    pagesIpfs?: BasePages["_pagesIpfs"];
};
export declare class BasePages implements PagesType {
    pages: Partial<Record<PostSortName | ReplySortName, PageType>>;
    pageCids: Partial<Record<PostSortName | ReplySortName, string>>;
    clients: BasePagesClientsManager["clients"];
    _clientsManager: BasePagesClientsManager;
    _plebbit: Plebbit;
    _subplebbitAddress: string;
    private _parentCid;
    private _pagesIpfs?;
    constructor(props: ConstructorProps);
    updateProps(props: ConstructorProps): void;
    protected _initClientsManager(): void;
    getPage(pageCid: string): Promise<PageType>;
    toJSON(): PagesTypeJson | undefined;
    toJSONIpfs(): PagesTypeIpfs | undefined;
}
export declare class RepliesPages extends BasePages {
    pages: Partial<Record<ReplySortName, PageType>>;
    pageCids: Partial<Record<ReplySortName, string>>;
    clients: RepliesPagesClientsManager["clients"];
    _clientsManager: RepliesPagesClientsManager;
    constructor(props: ConstructorProps & {
        parentCid: string;
    });
    updateProps(props: ConstructorProps & {
        parentCid: string;
    }): void;
    protected _initClientsManager(): void;
    toJSON(): RepliesPagesTypeJson | undefined;
}
export declare class PostsPages extends BasePages {
    pages: Partial<Record<PostSortName, PageType>>;
    pageCids: Partial<Record<PostSortName, string>>;
    clients: PostsPagesClientsManager["clients"];
    _clientsManager: PostsPagesClientsManager;
    constructor(props: Omit<ConstructorProps, "parentCid">);
    updateProps(props: Omit<ConstructorProps, "parentCid">): void;
    protected _initClientsManager(): void;
    toJSON(): PostsPagesTypeJson | undefined;
}
export {};
