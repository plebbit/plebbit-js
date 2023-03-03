import { loadIpfsFileAsJson, parsePageIpfs, throwWithErrorCode } from "./util";
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
import isIPFS from "is-ipfs";
import { verifyPage } from "./signer/signatures";
import lodash from "lodash";
import assert from "assert";

export class Pages implements PagesType {
    pages: Partial<Record<PostSortName | ReplySortName, PageType>>;

    pageCids: Partial<Record<PostSortName | ReplySortName, string>>;
    private _subplebbit: Pick<Subplebbit, "address" | "plebbit">;
    private _parentCid: CommentIpfsType["parentCid"];
    private _pagesIpfs?: PagesTypeIpfs["pages"];
    constructor(
        props: PagesType & { subplebbit: Pages["_subplebbit"]; parentCid: CommentIpfsType["parentCid"]; pagesIpfs?: Pages["_pagesIpfs"] }
    ) {
        this.pages = props.pages;
        this.pageCids = props.pageCids;
        this._subplebbit = props.subplebbit;
        this._parentCid = props.parentCid;
        this._pagesIpfs = props.pagesIpfs;
    }

    async getPage(pageCid: string): Promise<PageType> {
        if (!isIPFS.cid(pageCid)) throwWithErrorCode("ERR_CID_IS_INVALID", `getPage: cid (${pageCid}) is invalid as a CID`);

        const pageIpfs: PageIpfs = await loadIpfsFileAsJson(pageCid, this._subplebbit.plebbit);
        const signatureValidity = await verifyPage(pageIpfs, this._subplebbit.plebbit, this._subplebbit, this._parentCid);
        if (!signatureValidity.valid) throw Error(signatureValidity.reason);

        return await parsePageIpfs(pageIpfs, this._subplebbit);
    }

    toJSON(): PagesTypeJson {
        const pagesJson = lodash.mapValues(this.pages, (page) => {
            const commentsJson: CommentWithCommentUpdate[] = page.comments.map((comment) => comment.toJSONMerged());
            return { comments: commentsJson, nextCid: page.nextCid };
        });
        return { pages: pagesJson, pageCids: this.pageCids };
    }

    toJSONIpfs(): PagesTypeIpfs {
        assert(this._pagesIpfs);
        return {
            pages: this._pagesIpfs,
            pageCids: this.pageCids
        };
    }
}
