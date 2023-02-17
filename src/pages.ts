import { loadIpfsFileAsJson, parsePageIpfs, throwWithErrorCode } from "./util";
import { Subplebbit } from "./subplebbit";

import { CommentIpfsType, PageIpfs, PagesType, PageType, PostSortName, ReplySortName } from "./types";
import isIPFS from "is-ipfs";
import { verifyPage } from "./signer/signatures";

export class Pages implements PagesType {
    pages: Partial<Record<PostSortName | ReplySortName, PageType>>;
    pageCids: Partial<Record<PostSortName | ReplySortName, string>>;
    private _subplebbit: Pick<Subplebbit, "address" | "plebbit" | "encryption">;
    private _parentCid: CommentIpfsType["parentCid"];
    constructor(props: PagesType & { subplebbit: Pages["_subplebbit"]; parentCid: CommentIpfsType["parentCid"] }) {
        this.pages = props.pages;
        this.pageCids = props.pageCids;
        this._subplebbit = props.subplebbit;
        this._parentCid = props.parentCid;
    }

    async getPage(pageCid: string): Promise<PageType> {
        if (!isIPFS.cid(pageCid)) throwWithErrorCode("ERR_CID_IS_INVALID", `getPage: cid (${pageCid}) is invalid as a CID`);

        const pageIpfs: PageIpfs = await loadIpfsFileAsJson(pageCid, this._subplebbit.plebbit);
        const signatureValidity = await verifyPage(pageIpfs, this._subplebbit.plebbit, this._subplebbit, this._parentCid);
        if (!signatureValidity.valid) throw Error(signatureValidity.reason);

        return await parsePageIpfs(pageIpfs, this._subplebbit);
    }

    toJSON(): PagesType {
        return {
            pages: this.pages,
            pageCids: this.pageCids
        };
    }
}
