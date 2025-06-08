import { parsePageIpfs } from "./util.js";
import type { PageIpfs, PageTypeJson, PostSortName, PostsPagesTypeIpfs, RepliesPagesTypeIpfs, ReplySortName } from "./types.js";
import { verifyPage } from "../signer/signatures.js";
import { BasePagesClientsManager, SubplebbitPostsPagesClientsManager, RepliesPagesClientsManager } from "./pages-client-manager.js";
import { PlebbitError } from "../plebbit-error.js";
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

type PostsProps = Pick<PostsPages, "pages" | "pageCids"> & BaseProps & { subplebbit: RemoteSubplebbit };
type RepliesProps = Pick<RepliesPages, "pages" | "pageCids"> &
    BaseProps & {
        parentComment: Comment;
    };

export class BasePages {
    pages!: PostsPages["pages"] | RepliesPages["pages"];
    pageCids!: PostsPages["pageCids"] | RepliesPages["pageCids"];
    clients!: BasePagesClientsManager["clients"];
    _clientsManager!: BasePagesClientsManager;
    _parentComment: Comment | undefined = undefined; // would be undefined if the comment is not initialized yet and we don't have comment.cid
    _subplebbit!: BaseProps["subplebbit"];
    _loadedUniqueCommentFromGetPage: Record<string, PageIpfs["comments"][0]> = {}; // comment cid => CommentInPageIpfs. Will be reset on stop or when we update the record of pages cause of new subplebbit update or CommentUpdate

    constructor(props: PostsProps | RepliesProps) {
        this._initClientsManager(props.plebbit);
        this.updateProps(props);
        hideClassPrivateProps(this);
    }

    updateProps(props: Omit<PostsProps | RepliesProps, "plebbit">) {
        this.pages = props.pages;
        if (!remeda.isDeepEqual(this.pageCids, props.pageCids)) this._loadedUniqueCommentFromGetPage = {};
        this.pageCids = props.pageCids;
        this._subplebbit = props.subplebbit;
        if (this.pageCids) {
            this._clientsManager.updatePageCidsToSortTypes(this.pageCids);
            this._clientsManager.updatePagesMaxSizeCache(Object.values(this.pageCids), 1024 * 1024);
        }
        for (const preloadedPage of Object.values(this.pages))
            if (preloadedPage?.nextCid) this._clientsManager.updatePagesMaxSizeCache([preloadedPage.nextCid], 1024 * 1024);
    }

    protected _initClientsManager(plebbit: Plebbit) {
        throw Error(`This function should be overridden`);
    }

    resetPages() {
        // Called when the sub changes address and needs to remove all the comments with the old subplebbit address
        this.pageCids = {};
        this.pages = {};
        this._loadedUniqueCommentFromGetPage = {};
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

    _updateLoadedUniqueCommentFromGetPage(pageIpfs: PageIpfs) {
        pageIpfs.comments.forEach((comment) => {
            this._loadedUniqueCommentFromGetPage[comment.commentUpdate.cid] = comment;
            if (comment.commentUpdate.replies)
                for (const preloadedPage of Object.values(comment.commentUpdate.replies.pages)) {
                    return this._updateLoadedUniqueCommentFromGetPage(preloadedPage);
                }
        });
    }

    async getPage(pageCid: string): Promise<PageTypeJson> {
        if (!this._subplebbit?.address) throw Error("Subplebbit address needs to be defined under page");
        const parsedCid = parseCidStringSchemaWithPlebbitErrorIfItFails(pageCid);

        const pageIpfs = await this._fetchAndVerifyPage(parsedCid);
        this._updateLoadedUniqueCommentFromGetPage(pageIpfs);
        return parsePageIpfs(pageIpfs);
    }

    // method below will be present in both subplebbit.posts and comment.replies
    async validatePage(page: PageIpfs | PageTypeJson) {
        if (this._clientsManager._plebbit.validatePages)
            throw Error("This function is used for manual verification and you need to have plebbit.validatePages=false");
        const pageIpfs = <PageIpfs>{ comments: page.comments.map((comment) => ("comment" in comment ? comment : comment.raw)) };

        await this._validatePage(pageIpfs);
    }

    _stop() {
        this._loadedUniqueCommentFromGetPage = {};
    }
}

export class RepliesPages extends BasePages {
    override pages!: Partial<Record<ReplySortName, PageTypeJson>>;

    override pageCids!: Record<ReplySortName, string>;

    override clients!: RepliesPagesClientsManager["clients"];

    override _clientsManager!: RepliesPagesClientsManager;
    override _parentComment: Comment; // is always defined but we need to check its field if they're initialized or not

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

        // we need to make all updating comment instances do the getPage call to cache _loadedUniqueCommentFromGetPage in a centralized instance

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
        const pageSortName = Object.entries(this.pageCids).find(([_, pageCid]) => pageCid === pageCid)?.[0];
        const verificationOpts = {
            pageCid,
            pageSortName,
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

    override clients!: SubplebbitPostsPagesClientsManager["clients"];

    override _clientsManager!: SubplebbitPostsPagesClientsManager;
    override _parentComment: undefined = undefined; // would be undefined because we don't have a parent comment for posts
    override _subplebbit!: RemoteSubplebbit;

    constructor(props: PostsProps) {
        super(props);
    }

    override updateProps(props: Omit<PostsProps, "plebbit">) {
        super.updateProps(props);
    }

    protected override _initClientsManager(plebbit: Plebbit): void {
        this._clientsManager = new SubplebbitPostsPagesClientsManager({ plebbit, pages: this });
        this.clients = this._clientsManager.clients;
    }

    override getPage(pageCid: string): Promise<PageTypeJson> {
        // we need to make all updating subplebbit instances do the getPage call to cache _loadedUniqueCommentFromGetPage

        return super.getPage(pageCid);
    }

    override async _validatePage(pageIpfs: PageIpfs, pageCid?: string) {
        if (pageIpfs.comments.length === 0) return;
        const pageSortName = Object.entries(this.pageCids).find(([_, pageCid]) => pageCid === pageCid)?.[0];
        const verificationOpts = {
            pageCid,
            pageSortName,
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
