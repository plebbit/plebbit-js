import { parsePageIpfs } from "./util";
import { Subplebbit } from "./subplebbit";

import {
    CommentIpfsType,
    CommentWithCommentUpdate,
    PageIpfs,
    PagesType,
    PagesTypeIpfs,
    PagesTypeJson,
    PageType,
    PostSortName,
    ReplySortName
} from "./types";
import { verifyPage } from "./signer/signatures";
import lodash from "lodash";
import assert from "assert";
import { ClientsManager } from "./client";

export class Pages implements PagesType {
    pages: Partial<Record<PostSortName | ReplySortName, PageType>>;

    pageCids: Partial<Record<PostSortName | ReplySortName, string>>;
    private _subplebbit: Pick<Subplebbit, "address" | "plebbit">;
    private _clientsManager: ClientsManager;
    private _parentCid: CommentIpfsType["parentCid"];
    private _pagesIpfs?: PagesTypeIpfs["pages"];
    constructor(
        props: PagesType & {
            subplebbit: Pages["_subplebbit"];
            parentCid: CommentIpfsType["parentCid"];
            clientManager: Pages["_clientsManager"];
            pagesIpfs?: Pages["_pagesIpfs"];
        }
    ) {
        this.pages = props.pages;
        this.pageCids = props.pageCids;
        this._subplebbit = props.subplebbit;
        this._parentCid = props.parentCid;
        this._pagesIpfs = props.pagesIpfs;
        this._clientsManager = props.clientManager;
    }

    async getPage(pageCid: string): Promise<PageType> {
        const pageIpfs: PageIpfs = JSON.parse(await this._subplebbit.plebbit.fetchCid(pageCid));
        const signatureValidity = await verifyPage(
            pageIpfs,
            this._subplebbit.plebbit.resolveAuthorAddresses,
            this._clientsManager,
            this._subplebbit.address,
            this._parentCid
        );
        if (!signatureValidity.valid) throw Error(signatureValidity.reason);

        return await parsePageIpfs(pageIpfs, this._subplebbit);
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
