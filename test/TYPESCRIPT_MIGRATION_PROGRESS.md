# TypeScript Test Migration Progress

This document tracks the progress of migrating test files from JavaScript (.test.js) to TypeScript (.test.ts).

## Prohibited Practices

**IMPORTANT:** The following practices are **FORBIDDEN** during migration:

1. **`// @ts-nocheck`** - Never use this directive. It defeats the purpose of TypeScript migration by disabling all type checking for the file.

2. **`any` type without approval** - Do not use the `any` type to bypass type restrictions without explicit approval. If you need to use `any`, consult the maintainer first.

The goal of this migration is to have **fully typed tests** so we can detect problematic code early. Using escape hatches like `@ts-nocheck` prevents us from taking advantage of TypeScript's type safety.

## Approved Type Patterns

When working with types, prioritize these approaches in order:

### 1. Import types from plebbit-js (preferred)

Always import types from the compiled output instead of creating custom types:
```typescript
import type { ChallengeResult, Challenge } from "../../dist/node/subplebbit/types.js";
```

When you only need a subset of fields from a type, use `Pick<>` instead of defining a local interface:
```typescript
// Good - use Pick<> to select only needed fields
import type { CommentsTableRow, CommentUpdatesRow, SubplebbitAuthor } from "../../../../dist/node/publications/comment/types.js";
import type { PseudonymityAliasRow } from "../../../../dist/node/runtime/node/subplebbit/db-handler-types.js";

type AliasRow = Pick<PseudonymityAliasRow, "mode" | "aliasPrivateKey" | "originalAuthorSignerPublicKey">;
type StoredComment = Pick<CommentsTableRow, "cid" | "author" | "signature" | "parentCid">;
type SubplebbitAuthorRow = Partial<SubplebbitAuthor>;  // Use Partial<> when all fields should be optional

// Avoid - manually defining types that exist in plebbit-js
interface AliasRow {
    mode: string;
    aliasPrivateKey: string;
    originalAuthorSignerPublicKey: string;
}
```

When you need to transform all fields of a type (e.g., adding `| null` to every field), use mapped types:
```typescript
// Good - use mapped types to derive from existing types
import type { CommentsTableRow } from "../../../../dist/node/publications/comment/types.js";

// Adds | null to every field (useful for SQLite where missing values are NULL)
type TestCommentRow = {
    [K in keyof CommentsTableRow]: CommentsTableRow[K] | null;
};

// Avoid - manually copying 20+ fields just to add | null
interface TestCommentRow {
    cid: string | null;
    author: CommentsTableRow["author"] | null;
    // ... 20 more fields manually defined
}
```

This ensures types stay in sync with the source and reduces maintenance burden.

### 2. Derive types from function signatures (preferred over manual definitions)

When you need a type for a callback parameter or return value, derive it from the function signature rather than manually defining it:

```typescript
// Good - derive from function signature
type PubsubHandler = Extract<Parameters<PubsubClient["_client"]["pubsub"]["subscribe"]>[1], Function>;
type PubsubMessage = Parameters<PubsubHandler>[0];

// Avoid - manually defining types that already exist in function signatures
interface PubsubMessage {
    data: Uint8Array;
    // ... manually copying properties
}
```

This ensures types stay in sync with the underlying library and reduces maintenance burden.

### 3. Type assertions on mock objects (when necessary)

Only When mock objects don't match full API types:
```typescript
const mockRequest = { comment: { author } } as unknown as DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor;
```

### 4. Wrapper functions for repeated type assertions

Only For functions called many times with mock data, create typed wrapper functions:
```typescript
const testShouldExcludePublication = (
    subplebbitChallenge: Record<string, unknown>,
    request: Record<string, unknown>
): boolean => {
    return shouldExcludePublication(
        subplebbitChallenge as unknown as SubplebbitChallengeArg,
        request as unknown as ChallengeRequestArg
    );
};
```

Also make sure to always use types from plebbit-js and minimize any creation of new types or interfaces.

### 5. File organization

When you must declare new types or interfaces in a test file, place them at the top of the file (after imports) so they are easy to review.

DO NOT use `unknown` or `any` or `never` as a type unless you consult with me and I approve it. 

## Phase 1: Configuration Setup

- [x] Create `test/tsconfig.json`
- [x] Create `config/vitest.tsconfig.json`
- [x] Convert `config/vitest.config.js` to `config/vitest.config.ts`
- [x] Update `test/run-test-config.js` with type checking
- [x] Install type dependencies (@types/chai, @types/sinon)
- [x] Update AGENTS.md documentation

## Phase 2: Test File Migration

### test/browser/ (2 files)

- [ ] libp2p.browser.test.js
- [ ] plebbit.test.js

### test/challenges/ (6 files) - Complete

- [x] challenges.test.ts (type-safe)
- [x] exclude.test.ts (type-safe)
- [x] pending-approval.test.ts (type-safe)
- [x] publication-match.test.ts (type-safe)
- [x] rate-limiter.test.ts (type-safe)
- [x] voucher.test.ts (type-safe)
- [x] fixtures/fixtures.ts

### test/node/ (57 files)

#### test/node/comment/ - Complete

- [x] loading.update.test.ts (type-safe)
- [x] load.pages.to.find.comment.test.ts (type-safe)
- [x] publishing.update.test.ts (type-safe)

#### test/node/comment/post/ - Complete

- [x] pages.posts.test.ts (type-safe)

#### test/node/

- [x] httprouter.test.ts (type-safe)

#### test/node/plebbit/ - Complete

- [x] hanging.plebbit.test.ts (type-safe)
- [x] plebbit.test.ts (type-safe)
- [x] started-subplebbits.test.ts (type-safe)
- [x] validatecomment.plebbit.test.ts (type-safe)

#### test/node/plebbit-rpc/ - Complete

- [x] rpc.listeners.test.ts (type-safe)
- [x] rpc.server.test.ts (type-safe)
- [x] rpc.stress.publish.test.ts (type-safe)

#### test/node/publications/comment/replies/ - Complete

- [x] replies.test.ts (type-safe)

#### test/node/publications/comment/update/ - Complete

- [x] reply.updatingstate.test.ts (type-safe)

#### test/node/pubsub/

- [ ] mock.pubsub.server.test.js

#### test/node/subplebbit/ - Complete

- [x] commentsToUpdate.db.subplebbit.test.ts (type-safe)
- [x] commentUpdate.fields.db.subplebbit.test.ts (type-safe)
- [x] create.subplebbit.test.ts (type-safe)
- [x] db.subplebbit.test.ts (type-safe)
- [x] delete.subplebbit.test.ts (type-safe)
- [x] editable.subplebbit.test.ts (type-safe)
- [x] edit.subplebbit.test.ts (type-safe)
- [x] error.start.subplebbit.test.ts (type-safe)
- [x] garbage.collection.subplebbit.test.ts (type-safe)
- [x] gateway.loading.subplebbit.test.ts (type-safe)
- [x] local.publishing.subplebbit.test.ts (type-safe)
- [x] maximum.depth.test.ts (type-safe)
- [x] misc.subplebbit.test.ts (type-safe)
- [x] multiplegateways.update.test.ts (type-safe)
- [x] parsing.db.subplebbit.test.ts (type-safe)
- [x] postUpdates.subplebbit.test.ts (type-safe)
- [x] republishing.subplebbit.test.ts (type-safe)
- [x] startedState.subplebbit.test.ts (type-safe)
- [x] start.subplebbit.test.ts (type-safe)
- [x] state.subplebbit.test.ts (type-safe)
- [x] stats.subplebbit.test.ts (type-safe)
- [x] unique.migration.db.subplebbit.test.ts (type-safe)
- [x] unique.publishing.subplebbit.test.ts (type-safe)
- [x] updateCid.subplebbit.test.ts (type-safe)
- [x] update.subplebbit.test.ts (type-safe)
- [x] updatingstate.subplebbit.test.ts (type-safe)

#### test/node/subplebbit/challenges/ - Complete

- [x] challenges.settings.test.ts (type-safe)
- [x] evm.contract.challenge.test.ts (type-safe)
- [x] path.challenge.test.ts (type-safe)

#### test/node/subplebbit/features/ - Complete

- [x] features.subplebbit.test.ts (type-safe)
- [x] per-author.pseudonymityMode.subplebbit.features.test.ts (type-safe)
- [x] per-post.pseudonymityMode.subplebbit.features.test.ts (type-safe)
- [x] per-reply.pseudonymityMode.subplebbit.features.test.ts (type-safe)

#### test/node/subplebbit/ipns/ - Complete

- [x] resolve.ipns.subplebbit.test.ts (type-safe)

#### test/node/subplebbit/modqueue/ - Complete

- [x] approved.modqueue.subplebbit.test.ts (type-safe)
- [x] limit.modqueue.subplebbit.test.ts (type-safe)
- [x] modqueue.subplebbit.test.ts (type-safe)
- [x] page.modqueue.subplebbit.test.ts (type-safe)
- [x] pendingapproval.modqueue.subplebbit.test.ts (type-safe)
- [x] purge.expire.rejection.modqueue.subplebbit.test.ts (type-safe)
- [x] rejection.modqueue.subplebbit.test.ts (type-safe)

#### test/node/subplebbit/page-generation/ - Complete

- [x] chunking.page.generation.subplebbit.test.ts (type-safe)
- [x] edgecases.page.generation.subplebbit.test.ts (type-safe)

#### test/node/subplebbit/pubsub-msgs/ - Complete

- [x] properties.pubsub.test.ts (type-safe)

#### test/node/util/

- [ ] calculate-string-size.test.js

### test/node-and-browser/ (76 files)

#### test/node-and-browser/

- [ ] encryption.signer.test.js
- [ ] resolver.test.js
- [ ] signer.test.js

#### test/node-and-browser/helia/

- [ ] helia.test.js

#### test/node-and-browser/pages/

- [ ] page-sizes.test.js

#### test/node-and-browser/plebbit/

- [ ] fetchCid.plebbit.test.js
- [ ] plebbit.test.js
- [ ] test.configs.plebbit.test.js
- [ ] _updatingComments.plebbit.test.js
- [ ] _updatingSubplebbits.plebbit.test.js

#### test/node-and-browser/plebbit/plebbit-rpc/

- [ ] concurrency.plebbit.rpc.test.js
- [ ] edgecases.plebbit.rpc.test.js
- [ ] rpc.errors.test.js

#### test/node-and-browser/publications/comment/

- [ ] backward.compatibility.comment.test.js
- [ ] backward.compatibility.commentupdate.test.js
- [ ] createcomment.test.js
- [ ] getcomment.plebbit.test.js
- [ ] original.comment.test.js
- [ ] states.test.js

#### test/node-and-browser/publications/comment/clients/

- [ ] chainproviders.clients.test.js
- [ ] ipfsgateways.clients.test.js
- [ ] libp2pjsClient.kuboRpc.clients.test.js
- [ ] libp2pjsClient.pubsubKuboRpcClients.clients.test.js
- [ ] rpc.clients.test.js

#### test/node-and-browser/publications/comment/publish/

- [ ] errors.publish.test.js
- [ ] parallel.publish.test.js
- [ ] publishingstate.comment.test.js
- [ ] publish.test.js
- [ ] publish.verification.test.js
- [ ] pubsubfields.comment.test.js
- [ ] pubsub.test.js

#### test/node-and-browser/publications/comment/replies/

- [ ] replies.clients.test.js
- [ ] replies.test.js

#### test/node-and-browser/publications/comment/update/

- [ ] post.updatingstate.test.js
- [ ] reply.updatingstate.test.js
- [ ] update.test.js
- [ ] waiting-retry.update.test.js

#### test/node-and-browser/publications/comment-edit/

- [ ] backward.compatibility.commentedit.test.js
- [ ] content.edit.test.js
- [ ] delete.edit.test.js
- [ ] misc.edit.test.js
- [ ] nsfw.edit.test.js
- [ ] spoiler.edit.test.js

#### test/node-and-browser/publications/comment-moderation/

- [ ] backward.compatibility.test.js
- [ ] ban.test.js
- [ ] locked.test.js
- [ ] misc.test.js
- [ ] nsfw.test.js
- [ ] pin.test.js
- [ ] purged.test.js
- [ ] remove.test.js
- [ ] spoiler.test.js

#### test/node-and-browser/publications/subplebbit-edit/

- [ ] subplebbit.edit.publication.test.js

#### test/node-and-browser/publications/vote/

- [ ] backward.compatibility.vote.test.js
- [ ] downvote.test.js
- [ ] upvote.test.js

#### test/node-and-browser/pubsub-msgs/

- [ ] backward.compatibility.pubsub.test.js
- [ ] challenge.test.js
- [ ] properties.pubsub.test.js

#### test/node-and-browser/signatures/

- [ ] comment.test.js
- [ ] edit.comment.test.js
- [ ] pages.test.js
- [ ] pubsub.messages.test.js
- [ ] subplebbit.test.js
- [ ] vote.test.js

#### test/node-and-browser/subplebbit/

- [ ] backward.compatibility.subplebbit.test.js
- [ ] chainproviders.clients.test.js
- [ ] createsubplebbit.plebbit.test.js
- [ ] getsubplebbit.plebbit.test.js
- [ ] ipfsgateways.clients.test.js
- [ ] libp2pjs.kuboRpc.clients.test.js
- [ ] rpc.clients.test.js
- [ ] state.subplebbit.test.js
- [ ] updateCid.subplebbit.test.js
- [ ] update.subplebbit.test.js
- [ ] updatingstate.test.js
- [ ] waiting-retry.update.test.js

#### test/node-and-browser/subplebbit/ipns/

- [ ] ipns.fields.subplebbit.test.js

#### test/node-and-browser/subplebbit/modqueue/

- [ ] ipfsgateways.clients.modqueue.test.js
- [ ] libp2pjs.kuboRpc.clients.modqueue.test.js
- [ ] pages.modqueue.test.js
- [ ] rpc.clients.modqueue.test.js

#### test/node-and-browser/subplebbit/posts/

- [ ] ipfsgateways.clients.posts.test.js
- [ ] libp2pjs.kuboRpc.clients.posts.test.js
- [ ] pages.posts.test.js
- [ ] rpc.clients.posts.test.js

## Phase 3: Documentation Updates

- [x] Update AGENTS.md
- [x] Update RENAMING_GUIDE.md to use .test.ts extension for test file renames

## Phase 4: Replace Chai with Vitest Assertions

**After all test files have been migrated to TypeScript**, replace Chai assertions with Vitest's built-in `expect` assertions.

- [ ] Remove `chai` and `@types/chai` dependencies
- [ ] Replace `import { expect } from "chai"` with `import { expect } from "vitest"` in all test files
- [ ] Update assertion syntax as needed (Chai and Vitest expect have slightly different APIs)

### Why replace Chai?

1. **Reduced dependencies** - One less dependency to maintain
2. **Better TypeScript integration** - Vitest's expect is built with TypeScript in mind
3. **Consistent tooling** - Using Vitest for both test runner and assertions
4. **Better error messages** - Vitest provides better failure messages out of the box

---

**Total: 141 test files**

## Migration Strategy

**Incremental approach** (recommended):

1. Convert one directory at a time
2. Start with `test/challenges/` (6 files, isolated)
3. Then `test/node/` (57 files)
4. Then `test/node-and-browser/` (76 files)
5. Finally `test/browser/` (2 files)

This allows tests to continue running during migration since Vitest supports both `.js` and `.ts` files simultaneously.

## Verification

After each batch of conversions:

```bash
# Run tests (type checking happens automatically via run-test-config.js)
# Use the appropriate config for the test directory (see Conversion Guide below)
node test/run-test-config.js --plebbit-config <config> test/path/to/directory
```

If type checking fails, the test runner will exit with an error **before** running any tests.

## Conversion Guide

For each test file:

1. Rename `.test.js` to `.test.ts`
2. Add type annotations where beneficial
3. Fix any type errors
4. **Run the tests to verify they pass** - Always run the migrated tests before considering the migration complete (see config selection below)
5. Delete the old `.test.js` file only after tests pass

### Selecting the correct plebbit-config

Different test directories require different configs:

| Test Directory | Config(s) |
|----------------|-----------|
| `test/node/` | `local-kubo-rpc` |
| `test/challenges/` | `local-kubo-rpc` |
| `test/node-and-browser/` | `remote-kubo-rpc`, `remote-ipfs-gateway`, `remote-plebbit-rpc`, `remote-libp2pjs` |

For `test/node-and-browser/` tests, run with all four remote configs:
```bash
node test/run-test-config.js --plebbit-config remote-kubo-rpc test/node-and-browser/...
node test/run-test-config.js --plebbit-config remote-ipfs-gateway test/node-and-browser/...
node test/run-test-config.js --plebbit-config remote-plebbit-rpc test/node-and-browser/...
node test/run-test-config.js --plebbit-config remote-libp2pjs test/node-and-browser/...
```

Example conversion:

```typescript
// Before (JavaScript)
import { expect } from "chai";
import { describe, it, beforeAll } from "vitest";

describe("example", () => {
    let plebbit;
    beforeAll(async () => {
        plebbit = await Plebbit();
    });
});

// After (TypeScript)
import { expect } from "chai";
import { describe, it, beforeAll } from "vitest";
import type { Plebbit as PlebbitType } from "../dist/node/plebbit/plebbit.js";

describe("example", () => {
    let plebbit: PlebbitType;
    beforeAll(async () => {
        plebbit = await Plebbit();
    });
});
```
