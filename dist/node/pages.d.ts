import { Subplebbit } from "./subplebbit";
import { Comment } from "./comment";
import { PostSortName, ReplySortName } from "./types";
export declare class Pages {
    pages: Partial<Record<PostSortName | ReplySortName, Page>>;
    pageCids: Partial<Record<PostSortName | ReplySortName, string>>;
    subplebbit: Subplebbit;
    constructor(props: Pages);
    getPage?(pageCid: string): Promise<Page>;
    toJSON?(): {
        pages: Partial<Record<"new" | "hot" | "topHour" | "topDay" | "topWeek" | "topMonth" | "topYear" | "topAll" | "controversialHour" | "controversialDay" | "controversialWeek" | "controversialMonth" | "controversialYear" | "controversialAll" | "old", Page>>;
        pageCids: Partial<Record<"new" | "hot" | "topHour" | "topDay" | "topWeek" | "topMonth" | "topYear" | "topAll" | "controversialHour" | "controversialDay" | "controversialWeek" | "controversialMonth" | "controversialYear" | "controversialAll" | "old", string>>;
    };
}
export declare class Page {
    comments: Comment[];
    nextCid?: string;
    constructor(props: Page);
    toJSON?(): {
        comments: {
            cid: string;
            originalContent: string;
            updatedAt: number;
            editSignature: import("./signer").Signature;
            editTimestamp: number;
            editReason: string;
            deleted: boolean;
            spoiler: boolean;
            pinned: boolean;
            locked: boolean;
            removed: boolean;
            moderatorReason: string;
            authorBansExpiresAt: number;
            protocolVersion: "1.0.0";
            content: string;
            replyCount: number;
            upvoteCount: number;
            downvoteCount: number;
            replies: Pages;
            previousCid: string;
            ipnsName: string;
            postCid: string;
            depth: number;
            parentCid: string;
            subplebbitAddress: string;
            timestamp: number;
            signature: import("./signer").Signature;
            author: import("./author").default;
        }[];
        nextCid: string;
    };
}
