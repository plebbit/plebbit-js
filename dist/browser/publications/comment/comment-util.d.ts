import { RemoteSubplebbit } from "../../subplebbit/remote-subplebbit.js";
import type { PageIpfs } from "../../pages/types.js";
import type { CommentIpfsWithCidDefined } from "./types.js";
export declare function loadAllPagesUnderSubplebbitToFindComment(opts: {
    commentCidToFind: CommentIpfsWithCidDefined["cid"];
    subplebbit: RemoteSubplebbit;
    postCid?: CommentIpfsWithCidDefined["cid"];
    parentCid?: CommentIpfsWithCidDefined["cid"];
    signal?: AbortSignal;
}): Promise<PageIpfs["comments"][number] | undefined>;
