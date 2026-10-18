// Type-checked by test/node/pages/page-sort-reply-entry.types.test.ts with exactOptionalPropertyTypes on (#402):
// docs/protocol/page-sorts.md promises a walked page entry can be passed as a PageSortReplyEntry as it is.
import type { PageSortReplyEntry } from "../../../dist/node/index.js";

type PKCInstance = Awaited<ReturnType<typeof import("../../../dist/node/index.js").default>>;
type Community = Awaited<ReturnType<PKCInstance["createCommunity"]>>;
type PagePost = NonNullable<Community["posts"]["pages"][string]>["comments"][number];

export const walked = (post: PagePost): PageSortReplyEntry => post.raw;
