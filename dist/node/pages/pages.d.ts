import type { PageIpfs, PageTypeJson, PostSortName, PostsPagesTypeIpfs, RepliesPagesTypeIpfs, ReplySortName } from "./types.js";
import { BasePagesClientsManager, PostsPagesClientsManager, RepliesPagesClientsManager } from "../clients/pages-client-manager.js";
import { Comment } from "../publications/comment/comment.js";
import { RemoteSubplebbit } from "../subplebbit/remote-subplebbit.js";
import { Plebbit } from "../plebbit/plebbit.js";
type BaseProps = {
    subplebbit: Pick<RemoteSubplebbit, "address" | "signature">;
    plebbit: Plebbit;
};
type PostsProps = Pick<PostsPages, "pages" | "pageCids"> & BaseProps & {
    pagesIpfs?: PostsPagesTypeIpfs;
};
type RepliesProps = Pick<RepliesPages, "pages" | "pageCids"> & BaseProps & {
    pagesIpfs?: RepliesPagesTypeIpfs;
    parentComment: Comment;
};
export declare class BasePages {
    pages: PostsPages["pages"] | RepliesPages["pages"];
    pageCids: PostsPages["pageCids"] | RepliesPages["pageCids"];
    clients: BasePagesClientsManager["clients"];
    _clientsManager: BasePagesClientsManager;
    _parentComment: Comment | undefined;
    _subplebbit: BaseProps["subplebbit"];
    protected _pagesIpfs: RepliesPagesTypeIpfs | PostsPagesTypeIpfs | undefined;
    constructor(props: PostsProps | RepliesProps);
    updateProps(props: Omit<PostsProps | RepliesProps, "plebbit">): void;
    protected _initClientsManager(plebbit: Plebbit): void;
    resetPages(): void;
    _validatePage(pageIpfs: PageIpfs, pageCid?: string): Promise<void>;
    _fetchAndVerifyPage(pageCid: string): Promise<PageIpfs>;
    getPage(pageCid: string): Promise<PageTypeJson>;
    validatePage(page: PageIpfs | PageTypeJson): Promise<void>;
    toJSONIpfs(): RepliesPagesTypeIpfs | PostsPagesTypeIpfs | undefined;
}
export declare class RepliesPages extends BasePages {
    pages: Partial<Record<ReplySortName, PageTypeJson>>;
    pageCids: Record<ReplySortName, string>;
    clients: RepliesPagesClientsManager["clients"];
    _clientsManager: RepliesPagesClientsManager;
    _parentComment: Comment;
    protected _pagesIpfs: RepliesPagesTypeIpfs | undefined;
    constructor(props: RepliesProps);
    updateProps(props: Omit<RepliesProps, "plebbit" | "parentComment">): void;
    protected _initClientsManager(plebbit: Plebbit): void;
    toJSONIpfs(): RepliesPagesTypeIpfs | undefined;
    _validatePage(pageIpfs: PageIpfs, pageCid?: string): Promise<void>;
}
export declare class PostsPages extends BasePages {
    pages: Partial<Record<PostSortName, PageTypeJson>>;
    pageCids: Record<PostSortName, string>;
    clients: PostsPagesClientsManager["clients"];
    _clientsManager: PostsPagesClientsManager;
    protected _pagesIpfs: PostsPagesTypeIpfs | undefined;
    _parentComment: undefined;
    constructor(props: PostsProps);
    updateProps(props: Omit<PostsProps, "plebbit">): void;
    protected _initClientsManager(plebbit: Plebbit): void;
    toJSONIpfs(): PostsPagesTypeIpfs | undefined;
    _validatePage(pageIpfs: PageIpfs, pageCid?: string): Promise<void>;
}
export {};
