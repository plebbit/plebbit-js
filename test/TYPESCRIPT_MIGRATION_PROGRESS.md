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

- [ ] httprouter.test.js

#### test/node/plebbit/

- [ ] hanging.plebbit.test.js
- [ ] plebbit.test.js
- [ ] started-subplebbits.test.js
- [ ] validatecomment.plebbit.test.js

#### test/node/plebbit-rpc/

- [ ] rpc.listeners.test.js
- [ ] rpc.server.test.js
- [ ] rpc.stress.publish.test.js

#### test/node/publications/comment/replies/

- [ ] replies.test.js

#### test/node/publications/comment/update/

- [ ] reply.updatingstate.test.js

#### test/node/pubsub/

- [ ] mock.pubsub.server.test.js

#### test/node/subplebbit/

- [ ] commentsToUpdate.db.subplebbit.test.js
- [ ] commentUpdate.fields.db.subplebbit.test.js
- [ ] create.subplebbit.test.js
- [ ] db.subplebbit.test.js
- [ ] delete.subplebbit.test.js
- [ ] editable.subplebbit.test.js
- [ ] edit.subplebbit.test.js
- [ ] error.start.subplebbit.test.js
- [ ] garbage.collection.subplebbit.test.js
- [ ] gateway.loading.subplebbit.test.js
- [ ] local.publishing.subplebbit.test.js
- [ ] maximum.depth.test.js
- [ ] misc.subplebbit.test.js
- [ ] multiplegateways.update.test.js
- [ ] parsing.db.subplebbit.test.js
- [ ] postUpdates.subplebbit.test.js
- [ ] republishing.subplebbit.test.js
- [ ] startedState.subplebbit.test.js
- [ ] start.subplebbit.test.js
- [ ] state.subplebbit.test.js
- [ ] stats.subplebbit.test.js
- [ ] unique.migration.db.subplebbit.test.js
- [ ] unique.publishing.subplebbit.test.js
- [ ] updateCid.subplebbit.test.js
- [ ] update.subplebbit.test.js
- [ ] updatingstate.subplebbit.test.js

#### test/node/subplebbit/challenges/

- [ ] challenges.settings.test.js
- [ ] evm.contract.challenge.test.js
- [ ] path.challenge.test.js

#### test/node/subplebbit/features/

- [ ] features.subplebbit.test.js
- [ ] per-author.pseudonymityMode.subplebbit.features.test.js
- [ ] per-post.pseudonymityMode.subplebbit.features.test.js
- [ ] per-reply.pseudonymityMode.subplebbit.features.test.js

#### test/node/subplebbit/ipns/

- [ ] resolve.ipns.subplebbit.test.js

#### test/node/subplebbit/modqueue/

- [ ] approved.modqueue.subplebbit.test.js
- [ ] limit.modqueue.subplebbit.test.js
- [ ] modqueue.subplebbit.test.js
- [ ] page.modqueue.subplebbit.test.js
- [ ] pendingapproval.modqueue.subplebbit.test.js
- [ ] purge.expire.rejection.modqueue.subplebbit.test.js
- [ ] rejection.modqueue.subplebbit.test.js

#### test/node/subplebbit/page-generation/

- [ ] chunking.page.generation.subplebbit.test.js
- [ ] edgecases.page.generation.subplebbit.test.js

#### test/node/subplebbit/pubsub-msgs/

- [ ] properties.pubsub.test.js

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
node test/run-test-config.js --plebbit-config local-kubo-rpc test/challenges
```

If type checking fails, the test runner will exit with an error **before** running any tests.

## Conversion Guide

For each test file:

1. Rename `.test.js` to `.test.ts`
2. Add type annotations where beneficial
3. Fix any type errors

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
