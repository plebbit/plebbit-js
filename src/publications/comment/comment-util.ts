import { RemoteSubplebbit } from "../../subplebbit/remote-subplebbit.js";
import type { PageIpfs, PageTypeJson } from "../../pages/types.js";
import type { CommentIpfsWithCidDefined, CommentUpdateType } from "./types.js";
import Logger from "@plebbit/plebbit-logger";

export async function loadAllPagesUnderSubplebbitToFindComment(opts: {
    commentCidToFind: CommentIpfsWithCidDefined["cid"];
    subplebbit: RemoteSubplebbit;
    signal?: AbortSignal;
}): Promise<PageIpfs["comments"][number] | undefined> {
    const { commentCidToFind, subplebbit, signal } = opts;
    if (!commentCidToFind) throw Error("commentCidToFind should be defined");

    const log = Logger("plebbit-js:comment:loadAllPagesUnderSubplebbitToFindComment");

    type PendingPageCid = { cid: string; source: "posts" | "replies"; parentCommentCid?: string };
    const queue: PendingPageCid[] = [];
    const queued = new Map<string, PendingPageCid>();
    const visited = new Set<string>();
    const parentCommentCache = new Map<string, Promise<any>>();

    const getParentCommentInstance = (parentCid: string) => {
        let existing = parentCommentCache.get(parentCid);
        if (!existing) {
            existing = subplebbit._plebbit.getComment(parentCid);
            parentCommentCache.set(parentCid, existing);
        }
        return existing;
    };

    const throwIfAborted = () => {
        if (!signal?.aborted) return;
        const abortErr = new Error("Aborted");
        abortErr.name = "AbortError";
        throw abortErr;
    };

    const normalizePage = (page: PageIpfs | PageTypeJson): PageIpfs => {
        if ("comments" in page && page.comments.length > 0 && "raw" in page.comments[0])
            return { comments: (page as PageTypeJson).comments.map((comment) => comment.raw), nextCid: page.nextCid };
        return page as PageIpfs;
    };

    const enqueue = (cid: string | undefined, source: PendingPageCid["source"], parentCommentCid?: string) => {
        if (typeof cid !== "string" || cid.length === 0 || visited.has(cid)) return;
        const existingEntry = queued.get(cid);
        if (existingEntry) return;
        const entry = { cid, source, parentCommentCid };
        queued.set(cid, entry);
        queue.push(entry);
    };

    const fetchPage = async (
        cid: string,
        source: PendingPageCid["source"],
        parentCommentCid?: string
    ): Promise<PageIpfs | PageTypeJson | undefined> => {
        throwIfAborted();
        if (source === "posts") {
            try {
                return await subplebbit.posts.getPage(cid);
            } catch (err) {
                log.trace("posts.getPage failed", { cid, err });
                return undefined;
            }
        } else {
            if (!parentCommentCid) return undefined;
            try {
                const parentCommentInstance = await getParentCommentInstance(parentCommentCid);
                return await parentCommentInstance.replies.getPage(cid);
            } catch (err) {
                log.trace("replies.getPage failed", { cid, parentCommentCid, err });
                return undefined;
            }
        }
    };

    const processReplies = async (
        replies: CommentUpdateType["replies"],
        parentCommentCid: string
    ): Promise<PageIpfs["comments"][number] | undefined> => {
        throwIfAborted();
        if (!replies) return undefined;

        if (replies.pages)
            for (const page of Object.values(replies.pages)) {
                if (!page) continue;
                const comment = await processPage(page, "replies", parentCommentCid);
                if (comment) return comment;
            }

        if (replies.pageCids) {
            const initialPageCid = replies.pageCids.new || Object.values(replies.pageCids)[0];
            enqueue(initialPageCid, "replies", parentCommentCid);
        }

        return undefined;
    };

    const processPage = async (
        page: PageIpfs | PageTypeJson,
        source: PendingPageCid["source"],
        parentCommentCid?: string
    ): Promise<PageIpfs["comments"][number] | undefined> => {
        throwIfAborted();
        const pageIpfs = normalizePage(page);
        for (const pageComment of pageIpfs.comments) {
            if (pageComment.commentUpdate.cid === commentCidToFind) return pageComment;
            const childComment = await processReplies(pageComment.commentUpdate.replies, pageComment.commentUpdate.cid);
            if (childComment) return childComment;
        }

        if (pageIpfs.nextCid) enqueue(pageIpfs.nextCid, source, parentCommentCid);
        return undefined;
    };

    for (const page of Object.values(subplebbit.posts.pages || {})) {
        if (!page) continue;
        const comment = await processPage(page, "posts");
        if (comment) return comment;
    }

    const initialPageCid =
        subplebbit.posts.pageCids?.new || Object.values(subplebbit.posts.pageCids || {}).find((cid) => typeof cid === "string");
    enqueue(initialPageCid, "posts");

    while (queue.length) {
        throwIfAborted();
        const { cid, source, parentCommentCid } = queue.shift() as PendingPageCid;
        queued.delete(cid);
        if (visited.has(cid)) continue;
        visited.add(cid);

        const page = await fetchPage(cid, source, parentCommentCid);
        if (!page) continue;

        const foundComment = await processPage(page, source, parentCommentCid);
        if (foundComment) return foundComment;
    }

    return undefined;
}
