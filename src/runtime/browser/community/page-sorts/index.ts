// Browser build of src/runtime/node/community/page-sorts/index.ts. Resolving a sort by `path` and generating pages are
// community-side and need the database, so none of that exists here; the built-in registry is shared, since the
// scorers are pure, so a browser client re-sorting a page (docs/protocol/page-sorts.md, "Client side") finds the same
// built-ins under `pageSorts` that a community generates with.
export { pkcJsPageSorts } from "../../../../pages/pkc-js-page-sorts/index.js";
