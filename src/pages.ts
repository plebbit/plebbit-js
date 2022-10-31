import { loadIpfsFileAsJson } from "./util";
import { Subplebbit } from "./subplebbit";

import { CommentType, PagesType, PageType, PostSortName, ReplySortName } from "./types";
import errcode from "err-code";
import { codes, messages } from "./errors";
import isIPFS from "is-ipfs";
import { verifyPage } from "./signer/signatures";

export class Pages implements PagesType {
    pages?: Partial<Record<PostSortName | ReplySortName, PageType>>;
    pageCids?: Partial<Record<PostSortName | ReplySortName, string>>;
    subplebbit: Pick<Subplebbit, "address" | "plebbit">;
    constructor(props: PagesType & { subplebbit: Pages["subplebbit"] }) {
        this.pages = props.pages;
        this.pageCids = props.pageCids;
        this.subplebbit = props.subplebbit;
    }

    async getPage(pageCid: string): Promise<Page> {
        if (!isIPFS.cid(pageCid))
            throw errcode(Error(messages.ERR_CID_IS_INVALID), codes.ERR_CID_IS_INVALID, {
                details: `getPage: cid (${pageCid}) is invalid as a CID`
            });

        if (typeof this.subplebbit.address !== "string") throw Error("Address of subplebbit is needed to load pages");

        const page = new Page(await loadIpfsFileAsJson(pageCid, this.subplebbit.plebbit));

        const signatureValidity = await verifyPage(page, this.subplebbit.plebbit, this.subplebbit.address);
        if (!signatureValidity.valid) throw Error(signatureValidity.reason);

        return page;
    }

    toJSON(): PagesType {
        return {
            pages: this.pages,
            pageCids: this.pageCids
        };
    }
}

export class Page implements PageType {
    comments: CommentType[];
    nextCid?: string;

    constructor(props: PageType) {
        this.comments = props.comments;
        this.nextCid = props.nextCid;
    }

    toJSON() {
        return {
            comments: this.comments,
            nextCid: this.nextCid
        };
    }
}
