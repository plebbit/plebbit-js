import type { GetPageParam, ModQueuePageIpfs, ModQueuePageTypeJson, PageIpfs, PageTypeJson, PostSortName, ReplySortName } from "./types.js";
import { BasePagesClientsManager, SubplebbitPostsPagesClientsManager, RepliesPagesClientsManager } from "./pages-client-manager.js";
import { Comment } from "../publications/comment/comment.js";
import { RemoteSubplebbit } from "../subplebbit/remote-subplebbit.js";
import { Plebbit } from "../plebbit/plebbit.js";
type BaseProps = {
    subplebbit: Pick<RemoteSubplebbit, "address" | "signature">;
    plebbit: Plebbit;
};
type PostsProps = Pick<PostsPages, "pages" | "pageCids"> & BaseProps & {
    subplebbit: RemoteSubplebbit;
};
type RepliesProps = Pick<RepliesPages, "pages" | "pageCids"> & BaseProps & {
    parentComment: Comment;
};
type ModQueueProps = Pick<ModQueuePages, "pageCids" | "pages"> & BaseProps & {
    subplebbit: RemoteSubplebbit;
};
export declare class BasePages {
    pages: PostsPages["pages"] | RepliesPages["pages"] | ModQueuePages["pages"];
    pageCids: PostsPages["pageCids"] | RepliesPages["pageCids"] | ModQueuePages["pageCids"];
    clients: BasePagesClientsManager["clients"];
    _clientsManager: BasePagesClientsManager;
    _parentComment: Comment | undefined;
    _subplebbit: BaseProps["subplebbit"];
    constructor(props: PostsProps | RepliesProps | ModQueueProps);
    updateProps(props: Omit<PostsProps | RepliesProps | ModQueueProps, "plebbit">): void;
    protected _initClientsManager(plebbit: Plebbit): void;
    resetPages(): void;
    _validatePage(pageIpfs: PageIpfs | ModQueuePageIpfs, pageCid?: string): Promise<void>;
    _fetchAndVerifyPage(pageCid: string): Promise<PageIpfs | ModQueuePageIpfs>;
    _parseRawPageIpfs(pageIpfs: PageIpfs | ModQueuePageIpfs): ModQueuePageTypeJson | PageTypeJson;
    getPage(pageCid: GetPageParam): Promise<PageTypeJson | ModQueuePageTypeJson>;
    validatePage(page: PageIpfs | PageTypeJson): Promise<void>;
    _stop(): void;
}
export declare class RepliesPages extends BasePages {
    pages: Partial<Record<ReplySortName, PageTypeJson>>;
    pageCids: Record<ReplySortName, string>;
    clients: RepliesPagesClientsManager["clients"];
    _clientsManager: RepliesPagesClientsManager;
    _parentComment: Comment;
    constructor(props: RepliesProps);
    updateProps(props: Omit<RepliesProps, "plebbit" | "parentComment">): void;
    protected _initClientsManager(plebbit: Plebbit): void;
    _fetchAndVerifyPage(pageCid: string): Promise<PageIpfs>;
    _parseRawPageIpfs(pageIpfs: PageIpfs): PageTypeJson;
    getPage(args: GetPageParam): Promise<PageTypeJson>;
    _validatePage(pageIpfs: PageIpfs, pageCid?: string): Promise<void>;
}
export declare class PostsPages extends BasePages {
    pages: Partial<Record<PostSortName, PageTypeJson>>;
    pageCids: Record<PostSortName, string>;
    clients: SubplebbitPostsPagesClientsManager["clients"];
    _clientsManager: SubplebbitPostsPagesClientsManager;
    _parentComment: undefined;
    _subplebbit: RemoteSubplebbit;
    constructor(props: PostsProps);
    updateProps(props: Omit<PostsProps, "plebbit">): void;
    protected _initClientsManager(plebbit: Plebbit): void;
    _fetchAndVerifyPage(pageCid: string): Promise<PageIpfs>;
    _parseRawPageIpfs(pageIpfs: PageIpfs): PageTypeJson;
    getPage(getPageArgs: GetPageParam): Promise<PageTypeJson>;
    _validatePage(pageIpfs: PageIpfs, pageCid?: string): Promise<void>;
}
type ModQueuePageCids = Record<string, string>;
export declare class ModQueuePages extends BasePages {
    pages: undefined;
    pageCids: ModQueuePageCids;
    _parentComment: undefined;
    constructor(props: ModQueueProps);
    resetPages(): void;
    protected _initClientsManager(plebbit: Plebbit): void;
    _fetchAndVerifyPage(pageCid: string): Promise<ModQueuePageIpfs>;
    _parseRawPageIpfs(pageIpfs: ModQueuePageIpfs): ModQueuePageTypeJson;
    getPage(getPageArgs: GetPageParam): Promise<ModQueuePageTypeJson>;
    _validatePage(pageIpfs: ModQueuePageIpfs, pageCid?: string): Promise<void>;
}
export {};
