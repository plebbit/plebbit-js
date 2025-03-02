import { parsePageIpfs } from "../pages/util.js";
import type { PageIpfs, PageTypeJson, PostSortName, PostsPagesTypeIpfs, RepliesPagesTypeIpfs, ReplySortName } from "./types.js";
import { verifyPage, verifyPageComment } from "../signer/signatures.js";
import assert from "assert";
import { BasePagesClientsManager, PostsPagesClientsManager, RepliesPagesClientsManager } from "../clients/pages-client-manager.js";
import { Plebbit } from "../plebbit/plebbit.js";
import { PlebbitError } from "../plebbit-error.js";
import Logger from "@plebbit/plebbit-logger";
import * as remeda from "remeda";
import { hideClassPrivateProps } from "../util.js";
import { parseCidStringSchemaWithPlebbitErrorIfItFails } from "../schema/schema-util.js";
import type { SubplebbitIpfsType } from "../subplebbit/types.js";
import { CommentIpfsWithCidPostCidDefined } from "../publications/comment/types.js";

type BaseProps = {
    plebbit: BasePages["_plebbit"];
    subplebbit: BasePages["_subplebbit"];
};

type PostsProps = Pick<PostsPages, "pages" | "pageCids"> & BaseProps & { pagesIpfs?: PostsPagesTypeIpfs };
type RepliesProps = Pick<RepliesPages, "pages" | "pageCids"> &
    BaseProps & {
        parentComment: Partial<Pick<CommentIpfsWithCidPostCidDefined, "cid" | "postCid" | "depth">> | undefined;
        pagesIpfs?: RepliesPagesTypeIpfs;
        postComment: Partial<Pick<CommentIpfsWithCidPostCidDefined, "postCid">> | undefined;
    };

export class BasePages {
    pages!: PostsPages["pages"] | RepliesPages["pages"];
    pageCids!: PostsPages["pageCids"] | RepliesPages["pageCids"];
    clients!: BasePagesClientsManager["clients"];
    _clientsManager!: BasePagesClientsManager;
    _plebbit: Plebbit;
    _parentComment!: RepliesProps["parentComment"]; // would be undefined if the comment is not initialized yet and we don't have comment.cid
    _postComment!: RepliesProps["postComment"];
    _subplebbit!: Pick<SubplebbitIpfsType, "address"> & { signature?: Pick<SubplebbitIpfsType["signature"], "publicKey"> };
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
        this._subplebbit = props.subplebbit;
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
        if (!this._plebbit._plebbitRpcClient && this._plebbit.validatePages) {
            const baseDepth =
                typeof this._parentComment?.depth === "number" ? this._parentComment.depth + 1 : pageIpfs.comments[0].comment.depth;
            const isUniformDepth = pageIpfs.comments.every((comment) => comment.comment.depth === baseDepth);
            const verificationOpts = {
                pageCid,
                page: pageIpfs,
                resolveAuthorAddresses: this._plebbit.resolveAuthorAddresses,
                clientsManager: this._clientsManager,
                subplebbit: this._subplebbit,
                parentComment: isUniformDepth ? this._parentComment : undefined, // if it's a flat page, we don't need to verify the parent comment
                post: this._postComment,
                overrideAuthorAddressIfInvalid: true,
                validatePages: this._plebbit.validatePages,
                validateUpdateSignature: false // no need because we verified that page cid matches its content
            };
            const signatureValidity = await verifyPage(verificationOpts);
            if (!signatureValidity.valid)
                throw new PlebbitError("ERR_PAGE_SIGNATURE_IS_INVALID", {
                    signatureValidity,
                    verificationOpts
                });
        }

        return pageIpfs;
    }

    async getPage(pageCid: string): Promise<PageTypeJson> {
        if (!this._subplebbit?.address) throw Error("Subplebbit address needs to be defined under page");
        const parsedCid = parseCidStringSchemaWithPlebbitErrorIfItFails(pageCid);
        return parsePageIpfs(await this._fetchAndVerifyPage(parsedCid));
    }

    // method below will be present in both subplebbit.posts and comment.replies
    async validatePage({ comments }: { comments: PageIpfs["comments"] | PageTypeJson["comments"] }) {
        if (this._plebbit.validatePages)
            throw Error("This function is used for manual verification and you need to have plebbit.validatePages=false");
        // TODO this function should take into consideration a flat page
        // comments could be either of a flat page or nested page
        const pageIpfs = <PageIpfs>{ comments: comments.map((comment) => ("comment" in comment ? comment : comment.pageComment)) };
        // Check if all comments have the same depth
        const baseDepth =
            typeof this._parentComment?.depth === "number" ? this._parentComment.depth + 1 : pageIpfs.comments[0].comment.depth;
        const isUniformDepth = pageIpfs.comments.every((comment) => comment.comment.depth === baseDepth);
        const verificationOpts = {
            page: pageIpfs,
            pageCid: undefined,
            resolveAuthorAddresses: this._plebbit.resolveAuthorAddresses,
            overrideAuthorAddressIfInvalid: true,
            parentComment: isUniformDepth ? this._parentComment : undefined,
            post: this._postComment,
            subplebbit: this._subplebbit,
            clientsManager: this._clientsManager,
            validatePages: false,
            validateUpdateSignature: false
        };
        const validation = await verifyPage(verificationOpts);
        if (!validation.valid) throw new PlebbitError("ERR_PAGE_COMMENT_IS_INVALID", { validation, verificationOpts });
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
}

export class RepliesPages extends BasePages {
    override pages!: Partial<Record<ReplySortName, PageTypeJson>>;

    override pageCids!: Record<ReplySortName, string> | {};

    override clients!: RepliesPagesClientsManager["clients"];

    override _clientsManager!: RepliesPagesClientsManager;

    protected override _pagesIpfs: RepliesPagesTypeIpfs | undefined = undefined; // when we create a new page from an existing subplebbit

    constructor(props: RepliesProps) {
        super(props);
    }

    override updateProps(props: RepliesProps) {
        super.updateProps(props);
        if ("parentComment" in props) this._parentComment = props.parentComment;
        if ("postComment" in props) this._postComment = props.postComment;
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
    override _parentComment: undefined = undefined;
    override _postComment: undefined = undefined;
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
