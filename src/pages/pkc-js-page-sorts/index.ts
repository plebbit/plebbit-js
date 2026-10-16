import hot from "./hot.js";
import newSort from "./new.js";
import old from "./old.js";
import best from "./best.js";
import top from "./top.js";
import topHour from "./top-hour.js";
import topDay from "./top-day.js";
import topWeek from "./top-week.js";
import topMonth from "./top-month.js";
import topYear from "./top-year.js";
import topAll from "./top-all.js";
import active from "./active.js";
import controversial from "./controversial.js";
import newFlat from "./new-flat.js";
import oldFlat from "./old-flat.js";
import type { PageSortFileFactoryInput } from "../../community/types.js";

// The page sorts included with pkc-js (issue #73), as `PKC.pageSorts` and the package's `pageSorts` export on every
// runtime. Each file is a pure scorer over page entries, so a browser client re-sorting a page it loaded reaches the
// same built-ins a community generates with (docs/protocol/page-sorts.md, "Client side"). Resolving a sort by `path`
// from disk, and everything else that needs the community database, stays in runtime/node/community/page-sorts.
export const pkcJsPageSorts: Record<string, PageSortFileFactoryInput> = {
    hot,
    new: newSort,
    old,
    best,
    top,
    topHour,
    topDay,
    topWeek,
    topMonth,
    topYear,
    topAll,
    active,
    controversial,
    newFlat,
    oldFlat
};
