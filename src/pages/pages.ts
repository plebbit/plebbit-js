import { parsePageIpfs } from "../pages/util.js";
import type { PageIpfs, PageTypeJson, PostSortName, PostsPagesTypeIpfs, RepliesPagesTypeIpfs, ReplySortName } from "./types.js";
import { verifyPage } from "../signer/signatures.js";
import { BasePagesClientsManager, PostsPagesClientsManager, RepliesPagesClientsManager } from "../clients/pages-client-manager.js";
import { PlebbitError } from "../plebbit-error.js";
import Logger from "@plebbit/plebbit-logger";
import * as remeda from "remeda";
import { hideClassPrivateProps } from "../util.js";
import { parseCidStringSchemaWithPlebbitErrorIfItFails } from "../schema/schema-util.js";
import { Comment } from "../publications/comment/comment.js";
import { RemoteSubplebbit } from "../subplebbit/remote-subplebbit.js";
import { Plebbit } from "../plebbit/plebbit.js";

type BaseProps = {
    subplebbit: Pick<RemoteSubplebbit, "address" | "signature">;
    plebbit: Plebbit;
};

type PostsProps = Pick<PostsPages, "pages" | "pageCids"> & BaseProps & { pagesIpfs?: PostsPagesTypeIpfs };
type RepliesProps = Pick<RepliesPages, "pages" | "pageCids"> &
    BaseProps & {
        pagesIpfs?: RepliesPagesTypeIpfs;
        parentComment: Comment;
    };

export class BasePages {
    pages!: PostsPages["pages"] | RepliesPages["pages"];
    pageCids!: PostsPages["pageCids"] | RepliesPages["pageCids"];
    clients!: BasePagesClientsManager["clients"];
    _clientsManager!: BasePagesClientsManager;
    _parentComment: Comment | undefined = undefined; // would be undefined if the comment is not initialized yet and we don't have comment.cid
    _subplebbit!: BaseProps["subplebbit"];
    _loadedPages: Record<string, PageIpfs> = {}; // cid => pageIpfs. Will be reset on stop or when we update the record of pages cause of new subplebbit update or CommentUpdate
    protected _pagesIpfs: RepliesPagesTypeIpfs | PostsPagesTypeIpfs | undefined = undefined; // when we create a new page from an existing subplebbit

    constructor(props: PostsProps | RepliesProps) {
        this._initClientsManager(props.plebbit);
        this.updateProps(props);
        hideClassPrivateProps(this);
    }

    updateProps(props: Omit<PostsProps | RepliesProps, "plebbit">) {
        this.pages = props.pages;
        if (!remeda.isDeepEqual(this.pageCids, props.pageCids)) this._loadedPages = {};
        this.pageCids = props.pageCids;
        this._subplebbit = props.subplebbit;
        this._pagesIpfs = props.pagesIpfs;
        if (this.pageCids) {
            this._clientsManager.updatePageCidsToSortTypes(this.pageCids);
            this._clientsManager.updatePagesMaxSizeCache(Object.values(this.pageCids), 1024 * 1024);
        }
    }

    protected _initClientsManager(plebbit: Plebbit) {
        throw Error(`This function should be overridden`);
    }

    resetPages() {
        // Called when the sub changes address and needs to remove all the comments with the old subplebbit address
        this.pageCids = {};
        this.pages = {};
        this._pagesIpfs = undefined;
        this._loadedPages = {};
    }

    async _validatePage(pageIpfs: PageIpfs, pageCid?: string) {
        throw Error("should be implemented");
    }

    async _fetchAndVerifyPage(pageCid: string): Promise<PageIpfs> {
        const pageIpfs = await this._clientsManager.fetchPage(pageCid);
        if (!this._clientsManager._plebbit._plebbitRpcClient && this._clientsManager._plebbit.validatePages)
            await this._validatePage(pageIpfs, pageCid);

        return pageIpfs;
    }

    async getPage(pageCid: string): Promise<PageTypeJson> {
        if (!this._subplebbit?.address) throw Error("Subplebbit address needs to be defined under page");
        const parsedCid = parseCidStringSchemaWithPlebbitErrorIfItFails(pageCid);
        if (this._loadedPages[parsedCid]) return parsePageIpfs(this._loadedPages[parsedCid]);

        const pageIpfs = await this._fetchAndVerifyPage(parsedCid);
        this._loadedPages[parsedCid] = pageIpfs;
        return parsePageIpfs(pageIpfs);
    }

    // method below will be present in both subplebbit.posts and comment.replies
    async validatePage(page: PageIpfs | PageTypeJson) {
        if (this._clientsManager._plebbit.validatePages)
            throw Error("This function is used for manual verification and you need to have plebbit.validatePages=false");
        const pageIpfs = <PageIpfs>{ comments: page.comments.map((comment) => ("comment" in comment ? comment : comment.pageComment)) };

        await this._validatePage(pageIpfs);
    }

    toJSONIpfs(): RepliesPagesTypeIpfs | PostsPagesTypeIpfs | undefined {
        if (remeda.isEmpty(this.pages)) return undefined; // I forgot why this line is here
        if (!this._pagesIpfs && !remeda.isEmpty(this.pages)) {
            Logger("plebbit-js:pages:toJSONIpfs").error(
                `toJSONIpfs() is called on sub(${this._subplebbit}) and parentCid (${this._parentComment}) even though _pagesIpfs is undefined. This error should not persist`
            );
            return;
        }
        return this._pagesIpfs;
    }

    _stop() {
        this._loadedPages = {};
    }
}

export class RepliesPages extends BasePages {
    override pages!: Partial<Record<ReplySortName, PageTypeJson>>;

    override pageCids!: Record<ReplySortName, string>;

    override clients!: RepliesPagesClientsManager["clients"];

    override _clientsManager!: RepliesPagesClientsManager;
    override _parentComment: Comment; // is always defined but we need to check its field if they're initialized or not

    protected override _pagesIpfs: RepliesPagesTypeIpfs | undefined = undefined; // when we create a new page from an existing subplebbit

    constructor(props: RepliesProps) {
        super(props);
        this._parentComment = props.parentComment;
        hideClassPrivateProps(this);
    }

    override updateProps(props: Omit<RepliesProps, "plebbit" | "parentComment">) {
        super.updateProps(props);
    }

    protected override _initClientsManager(plebbit: Plebbit): void {
        this._clientsManager = new RepliesPagesClientsManager({ plebbit, pages: this });
        this.clients = this._clientsManager.clients;
    }

    override toJSONIpfs(): RepliesPagesTypeIpfs | undefined {
        return <RepliesPagesTypeIpfs | undefined>super.toJSONIpfs();
    }

    override async getPage(pageCid: string): Promise<PageTypeJson> {
        if (!this._parentComment?.cid)
            throw new PlebbitError("ERR_USER_ATTEMPTS_TO_GET_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_CID", {
                pageCid,
                parentComment: this._parentComment
            });

        if (typeof this._parentComment?.depth !== "number")
            throw new PlebbitError("ERR_USER_ATTEMPTS_TO_GET_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_DEPTH", {
                parentComment: this._parentComment,
                pageCid
            });

        if (!this._parentComment?.postCid)
            throw new PlebbitError("ERR_USER_ATTEMPTS_TO_GET_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_POST_CID", {
                pageCid,
                parentComment: this._parentComment
            });
        return super.getPage(pageCid);
    }

    override async _validatePage(pageIpfs: PageIpfs, pageCid?: string) {
        if (!this._parentComment?.cid)
            throw new PlebbitError("ERR_USER_ATTEMPTS_TO_VALIDATE_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_CID", {
                pageIpfs,
                pageCid,
                parentComment: this._parentComment
            });

        if (typeof this._parentComment?.depth !== "number")
            throw new PlebbitError("ERR_USER_ATTEMPTS_TO_VALIDATE_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_DEPTH", {
                pageIpfs,
                parentComment: this._parentComment,
                pageCid
            });

        if (!this._parentComment?.postCid)
            throw new PlebbitError("ERR_USER_ATTEMPTS_TO_VALIDATE_REPLIES_PAGE_WITHOUT_PARENT_COMMENT_POST_CID", {
                pageIpfs,
                pageCid,
                parentComment: this._parentComment
            });

        if (pageIpfs.comments.length === 0) return;
        const baseDepth = pageIpfs.comments[0].comment?.depth;
        const isUniformDepth = pageIpfs.comments.every((comment) => comment.comment.depth === baseDepth);
        const verificationOpts = {
            pageCid,
            page: pageIpfs,
            resolveAuthorAddresses: this._clientsManager._plebbit.resolveAuthorAddresses,
            clientsManager: this._clientsManager,
            subplebbit: this._subplebbit,
            parentComment: isUniformDepth ? this._parentComment : { postCid: this._parentComment.postCid }, // if it's a flat page, we don't need to verify the parent comment. Only the post
            overrideAuthorAddressIfInvalid: true,
            validatePages: this._clientsManager._plebbit.validatePages,
            validateUpdateSignature: false // no need because we verified that page cid matches its content
        };
        const signatureValidity = await verifyPage(verificationOpts);
        if (!signatureValidity.valid)
            throw new PlebbitError("ERR_REPLIES_PAGE_IS_INVALID", {
                signatureValidity,
                verificationOpts
            });
    }
}

export class PostsPages extends BasePages {
    override pages!: Partial<Record<PostSortName, PageTypeJson>>;

    override pageCids!: Record<PostSortName, string>;

    override clients!: PostsPagesClientsManager["clients"];

    override _clientsManager!: PostsPagesClientsManager;
    protected override _pagesIpfs: PostsPagesTypeIpfs | undefined = undefined;
    override _parentComment: undefined = undefined; // would be undefined because we don't have a parent comment for posts

    constructor(props: PostsProps) {
        super(props);
    }

    override updateProps(props: Omit<PostsProps, "plebbit">) {
        super.updateProps(props);
    }

    protected override _initClientsManager(plebbit: Plebbit): void {
        this._clientsManager = new PostsPagesClientsManager({ plebbit, pages: this });
        this.clients = this._clientsManager.clients;
    }

    override toJSONIpfs(): PostsPagesTypeIpfs | undefined {
        return <PostsPagesTypeIpfs | undefined>super.toJSONIpfs();
    }

    override async _validatePage(pageIpfs: PageIpfs, pageCid?: string) {
        if (pageIpfs.comments.length === 0) return;
        const verificationOpts = {
            pageCid,
            page: pageIpfs,
            resolveAuthorAddresses: this._clientsManager._plebbit.resolveAuthorAddresses,
            clientsManager: this._clientsManager,
            subplebbit: this._subplebbit,
            parentComment: { cid: undefined, postCid: undefined, depth: -1 },
            overrideAuthorAddressIfInvalid: true,
            validatePages: this._clientsManager._plebbit.validatePages,
            validateUpdateSignature: false // no need because we verified that page cid matches its content
        };
        const signatureValidity = await verifyPage(verificationOpts);
        if (!signatureValidity.valid)
            throw new PlebbitError("ERR_POSTS_PAGE_IS_INVALID", {
                signatureValidity,
                verificationOpts
            });
    }
}
