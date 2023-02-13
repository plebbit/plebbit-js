import { loadIpfsFileAsJson, parsePageIpfs, throwWithErrorCode } from "./util";
import { Subplebbit } from "./subplebbit";

import { CommentIpfsType, PageIpfs, PagesType, PageType, PostSortName, ReplySortName } from "./types";
import { Comment } from "./comment";
import isIPFS from "is-ipfs";
import { verifyPage } from "./signer/signatures";

export class Pages implements PagesType {
    pages: Partial<Record<PostSortName | ReplySortName, PageType>>;
    pageCids: Partial<Record<PostSortName | ReplySortName, string>>;
    subplebbit: Pick<Subplebbit, "address" | "plebbit" | "encryption">;
    parentCid: CommentIpfsType["parentCid"];
    constructor(props: PagesType & { subplebbit: Pages["subplebbit"]; parentCid: CommentIpfsType["parentCid"] }) {
        this.pages = props.pages;
        this.pageCids = props.pageCids;
        this.subplebbit = props.subplebbit;
        this.parentCid = props.parentCid;
    }

    async getPage(pageCid: string): Promise<Page> {
        if (!isIPFS.cid(pageCid)) throwWithErrorCode("ERR_CID_IS_INVALID", `getPage: cid (${pageCid}) is invalid as a CID`);

        if (typeof this.subplebbit.address !== "string") throw Error("Address of subplebbit is needed to load pages");

        const pageIpfs: PageIpfs = await loadIpfsFileAsJson(pageCid, this.subplebbit.plebbit);
        const signatureValidity = await verifyPage(pageIpfs, this.subplebbit.plebbit, this.subplebbit, this.parentCid);
        if (!signatureValidity.valid) throw Error(signatureValidity.reason);

        const parsedPage = await parsePageIpfs(pageIpfs, this.subplebbit.plebbit);
        return new Page(parsedPage);
    }

    toJSON(): PagesType {
        return {
            pages: this.pages,
            pageCids: this.pageCids
        };
    }
}

export class Page implements PageType {
    comments: Comment[];
    nextCid?: string;

    constructor(props: PageType) {
        this.comments = props.comments;
        this.nextCid = props.nextCid;
    }

    toJSON(): PageType {
        return { comments: this.comments, nextCid: this.nextCid };
    }
}
