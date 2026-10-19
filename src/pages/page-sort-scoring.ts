import { PageSortFileSchema } from "../community/schema.js";
import { getEquivalentCommunityAddresses } from "../util.js";
import { isStringDomain } from "../domain-util.js";
import type { ParsedReservedPageSortOptions } from "./page-sort-options.js";
import type { PageSortFile } from "../community/types.js";
import type { PageIpfs, PageSortExclusionOptionName, PageSortReplyEntry } from "./types.js";

// Scoring a comment set with a page sort file (issue #73): the reserved exclusions, pinned placement and the maxAge
// window pkc-js applies around a file's `score`, and the file validation the registry runs. Used by the page generator;
// nothing here touches the database, only what a page entry carries.

type PageComment = PageIpfs["comments"][number];

// Validate what a factory returned, once, and hand back the file with its own functions rather than the schema's
// per-call wrappers: `score` runs once per comment per sort, and the wrapper re-validated its argument object (the
// whole `replies` list included, for a requireReplies file) on every call (issue #351). The generator checks the
// score's type itself.
export function validatePageSortFile(rawFile: unknown): PageSortFile {
    const validated = PageSortFileSchema.parse(rawFile);
    const raw = rawFile as PageSortFile;
    return {
        ...validated,
        score: raw.score,
        ...(raw.validatePageSortSettings ? { validatePageSortSettings: raw.validatePageSortSettings } : {})
    };
}

// The community identity rule (issue #401): which rows belong in this community's pages and counts, by the community
// fields the comment's author signed. It is the rule client page verification applies (verifyPageComment), so the
// community never hides a row a client would accept: a community with a name admits rows whose communityName is absent
// or is that name or its .eth/.bso alias; a community without a name admits rows whose communityPublicKey is absent or
// is its key. The JS twin of DbHandler's community identity clause. Always on, it is not a page sort option.
export function createCommunityIdentityRowFilter(
    communityAddress: string
): (comment: { communityPublicKey?: string; communityName?: string }) => boolean {
    if (isStringDomain(communityAddress)) {
        const equivalentNames = new Set(getEquivalentCommunityAddresses(communityAddress));
        return (comment) => !comment.communityName || equivalentNames.has(comment.communityName);
    }
    return (comment) => !comment.communityPublicKey || comment.communityPublicKey === communityAddress;
}

// The reserved exclusions applied to page entries in JS, plus the always-on community identity rule. Mirrors the SQL
// clauses in DbHandler (exclusionClauses): a comment is removed when commentUpdate.removed is true, deleted when its
// author's edit says so, disapproved when commentUpdate.approved is false, pending when commentUpdate.pendingApproval
// is true.
export function applyPageSortExclusions<T extends PageSortReplyEntry>({
    comments,
    exclusions,
    communityAddress
}: {
    comments: T[];
    exclusions: Record<PageSortExclusionOptionName, boolean>;
    communityAddress: string; // the community the page belongs to, for the community identity rule
}): T[] {
    const belongsToCommunity = createCommunityIdentityRowFilter(communityAddress);
    return comments.filter(({ comment, commentUpdate }) => {
        if (!belongsToCommunity(comment)) return false;
        if (exclusions.excludeRemovedComments && commentUpdate.removed === true) return false;
        if (exclusions.excludeDeletedComments && commentUpdate.edit?.deleted === true) return false;
        if (exclusions.excludeCommentWithApprovedFalse && commentUpdate.approved === false) return false;
        if (exclusions.excludeCommentPendingApproval && commentUpdate.pendingApproval === true) return false;
        return true;
    });
}

// The `replies` a requireReplies file receives: every reply in the scope that passes the community identity rule
// (issues #401, #407). The sort's exclude* options are not applied, they reach the file in `options`: a removed or deleted
// reply is a tombstone whose present replies still count (docs/protocol/comment-lifecycle.md, "Which replies count"),
// so dropping it would cut its subtree, and the file decides what counts. Replies with no CommentUpdate never get
// here (the DB query joins on commentUpdates). Reply pages keep tombstones too, so a client walking them gets this set.
export function filterRepliesForPageSort<T extends PageSortReplyEntry>({
    replies,
    communityAddress
}: {
    replies: T[];
    communityAddress: string;
}): T[] {
    return applyPageSortExclusions({
        comments: replies,
        exclusions: {
            excludeRemovedComments: false,
            excludeDeletedComments: false,
            excludeCommentWithApprovedFalse: false,
            excludeCommentPendingApproval: false
        },
        communityAddress
    });
}

// Pinned placement and the maxAge window, the two reserved options that shape every sort's set and order. Pinned
// comments sort first and bypass the window when pinnedFirst is on (the default), so a sticky never ages out of a
// windowed index; with pinnedFirst off they are ordinary comments. Shared with the community's page generator.
export function partitionPageCommentsForSort({
    comments,
    reserved,
    baseTimestamp
}: {
    comments: PageComment[];
    reserved: Pick<ParsedReservedPageSortOptions, "pinnedFirst" | "maxAgeSeconds">;
    baseTimestamp: number;
}): { pinned: PageComment[]; unpinned: PageComment[] } {
    const pinned = reserved.pinnedFirst ? comments.filter((entry) => entry.commentUpdate.pinned === true) : [];
    let unpinned = reserved.pinnedFirst ? comments.filter((entry) => entry.commentUpdate.pinned !== true) : comments;
    if (typeof reserved.maxAgeSeconds === "number") {
        const timestampLower = baseTimestamp - reserved.maxAgeSeconds;
        unpinned = unpinned.filter((entry) => entry.comment.timestamp >= timestampLower);
    }
    return { pinned, unpinned };
}

// Order pinned then unpinned by descending score. `null` declines the comment from this sort, pinned or not. A
// missing or non-numeric score is a bug in the sort file. Equal scores keep the input order (a stable sort), which is
// the community's insertion order at generation and the page's order on a client.
export function orderPageCommentsByScore({
    pinned,
    unpinned,
    scoreOf,
    sortName
}: {
    pinned: PageComment[];
    unpinned: PageComment[];
    scoreOf: (entry: PageComment) => number | null | undefined;
    sortName: string;
}): PageComment[] {
    const kept = (entries: PageComment[]) => {
        const scored: { entry: PageComment; score: number }[] = [];
        for (const entry of entries) {
            const score = scoreOf(entry);
            if (score === null) continue;
            if (typeof score !== "number" || Number.isNaN(score))
                throw Error(`Page sort ${sortName} returned no numeric score for comment ${entry.commentUpdate.cid}`);
            scored.push({ entry, score });
        }
        return scored.sort((a, b) => b.score - a.score).map(({ entry }) => entry); // Array.prototype.sort is stable
    };
    return kept(pinned).concat(kept(unpinned));
}

// What `score` receives: the entry with the CommentUpdate's nested `replies` stripped, so a file cannot mistake the
// preloaded slice for the reply set (docs/protocol/page-sorts.md, "Writing a page sort file").
export function stripRepliesFromPageComment<T extends PageSortReplyEntry>(entry: T): T {
    if (!("replies" in entry.commentUpdate)) return entry;
    const { replies: _replies, ...commentUpdate } = entry.commentUpdate as T["commentUpdate"] & { replies?: unknown };
    return { comment: entry.comment, commentUpdate } as T;
}

// The `replies` a file with requireReplies gets per scored comment: its descendants, out of one flat list of every
// descendant of the page's comments (the community loads the scope's descendants once; a client passes what it
// walked). Indexed by parentCid, so a reply on a reply page gets its own subtree and a post gets everything under it;
// a node whose parent is not in the list is unreachable (only a foreign reply's subtree, see filterRepliesForPageSort).
export function createDescendantsLookup(replies: PageSortReplyEntry[]): (cid: string) => PageSortReplyEntry[] {
    const childrenByParent = new Map<string, PageSortReplyEntry[]>();
    for (const entry of replies) {
        const stripped = stripRepliesFromPageComment(entry);
        const parentCid = stripped.comment.parentCid;
        if (!parentCid) continue;
        const siblings = childrenByParent.get(parentCid);
        if (siblings) siblings.push(stripped);
        else childrenByParent.set(parentCid, [stripped]);
    }
    return (cid) => {
        const collected: PageSortReplyEntry[] = [];
        const stack = [cid];
        while (stack.length) {
            const children = childrenByParent.get(stack.pop()!);
            if (!children) continue;
            for (const child of children) {
                collected.push(child);
                stack.push(child.commentUpdate.cid);
            }
        }
        return collected;
    };
}

// Score every entry the way both the community and a client do: the stripped entry, plus its descendants when the
// file asks for them. `replies` is required here only when the file requires it.
export function scorePageCommentsWithFile({
    file,
    options,
    baseTimestamp,
    replies,
    stripEntry = stripRepliesFromPageComment,
    descendantsOf: descendantsOfOverride
}: {
    file: PageSortFile;
    options: Record<string, string>;
    baseTimestamp: number;
    replies?: PageSortReplyEntry[];
    stripEntry?: (entry: PageComment) => PageComment; // the community strips each entry once and reuses it across sorts
    descendantsOf?: (cid: string) => PageSortReplyEntry[]; // the community streams subtrees instead of passing `replies`
}): (entry: PageComment) => number | null {
    const descendantsOf = file.requireReplies ? descendantsOfOverride ?? createDescendantsLookup(replies ?? []) : undefined;
    return (entry) => {
        const { comment, commentUpdate } = stripEntry(entry);
        return file.score({
            comment,
            commentUpdate,
            options,
            baseTimestamp,
            ...(descendantsOf ? { replies: descendantsOf(commentUpdate.cid) } : {})
        });
    };
}
