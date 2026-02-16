# Proposal: `subplebbitIpfs.name`, `subplebbit.publicKey`, `author.name`, `author.publicKey`, `nameResolved` flag

## Problem

Currently, a subplebbit has a single `address` field that can be either a raw IPNS key (`12D3KooW...`) or a single domain name (`memes.eth`). This creates several problems:

### 1. Publications point to mutable domain names instead of cryptographic identity

Publications currently carry `subplebbitAddress` — a potentially mutable domain name. This is semantically wrong: a publication belongs to a cryptographic identity, not a mutable alias. If a sub owner changes their address from `memes.eth` to `memes.sol`, old publications point to a name that may no longer resolve to this community.

Additionally, loading a subplebbit by its IPNS public key currently fails if the record's `address` is a domain name, because validation does a strict string comparison. This blocks the ability to skip blockchain resolution and load directly by public key.

### 2. `address` is no longer universally resolvable

Once domain resolution moves out of plebbit-js into pkc-js clients (see [#68](https://github.com/plebbit/plebbit-js/issues/68)), the idea of a single `address` field that works across all clients is no longer true. A client that only ships with `.sol` resolvers cannot resolve a `memes.eth` address.

This is an acceptable trade-off for protocol neutrality — pkc-js should not mandate which resolvers clients must implement. The `publicKey` provides a universal identifier that works regardless of resolver choices.

## Protocol neutrality

A key design goal is that **pkc-js remains a neutral protocol layer**. Different clients may ship with different resolvers — one client might support `.eth`, another might support `.sol` or a future `.ton`. This is intentional: pkc-js should not force clients to import specific resolver libraries.

A client that only supports `.ton` is not "forking pkc-js" — it's a legitimate pkc-js client serving a different naming ecosystem. The protocol supports this via:

-   `publicKey` as the canonical identity (works everywhere)
-   `name` as a human-readable convenience (works if you have a matching resolver)
-   `nameResolved` flag to indicate whether the name has been verified against the publicKey

Specific apps (like bitsocial) can standardize on `.eth` for their ecosystem, but this is an app-level choice, not a protocol requirement.

### Resolver integration boundary (issue #68 direction)

This proposal defines protocol semantics (`name`, `publicKey`) plus runtime semantics (`nameResolved`) and validation behavior.

Resolver composition and provider wiring (for example, chain provider JSON, resolver keys, and UI loading labels like "resolving from ethrpc.xyz") are client/hook concerns outside this protocol document.

pkc-js should treat resolver keys as opaque identifiers and should not require a specific key format.

## Proposal

### 1. Add `name` field to `SubplebbitIpfs`

Add a new optional `name` field to the signed SubplebbitIpfs record:

```ts
name?: string   // e.g., "memes.eth"
```

-   **Simple string** — resolver selection is implementation-defined (for example via `supports({name})` / `canResolve({name})`); TLD suffixes are common but not required
-   **Optional** — communities without domain names simply omit this field
-   **Signed** — part of the SubplebbitIpfs record, included in the subplebbit signature
-   **Editable** — sub owner sets it via `subplebbit.edit({ name: "memes.eth" })`
-   **Untrusted until verified** — `name` in SubplebbitIpfs is a claim by the sub owner, not proof of ownership. The sub owner's signature only proves they _claim_ this name, not that it actually resolves to their public key. Name verification happens automatically via async resolution when both `publicKey` and `name` are provided. Until verified (`nameResolved = false`), the name should be treated as an unverified display hint.
-   **`nameResolved` is runtime-only** — it is not part of SubplebbitIpfs and is not signed on the wire. It exists only on the subplebbit instance.

**`publicKey` is a field in `SubplebbitIpfs`:**

`subplebbit.publicKey` is the IPNS key string (`12D3KooW...`) — the permanent cryptographic identity of the community. This is the **canonical identifier** — `address` is always `name || publicKey` (the name if set, otherwise the publicKey), but `publicKey` is the true identity.

**`publicKey` IS a signed field in SubplebbitIpfs** — it is part of the signed wire format. While it can be derived from `signature.publicKey` (Ed25519 public key → PeerId → base58 string), including it explicitly in the record provides:

-   **Explicit identity** — The publicKey is immediately visible without cryptographic derivation
-   **Validation checkpoint** — If `record.publicKey` doesn't match the derivation from `signature.publicKey`, the record is rejected as malformed/malicious

**Validation rule:** When parsing a SubplebbitIpfs record, if `publicKey` is present, it MUST match the value derived from `signature.publicKey`. If there's a mismatch, reject the entire record.

**Serialization requirement:** `address`, `name`, and `publicKey` must all be **enumerable properties** on the subplebbit class instance. This means they must appear in `JSON.stringify(subplebbit)` output and be accessible via object destructuring (`const { address, name, publicKey } = subplebbit`). Implementation-wise, these properties should be plain instance properties (not getters on the prototype) so that they are own enumerable properties of the object.

**`shortAddress` is unchanged** — it remains derived from `address` as it is today. No changes needed.

**Relationship between `address` and `name`:**

`address` stays in SubplebbitIpfs and is always `name || publicKey`. When `name` is set, `address` equals `name`. When `name` is not set, `address` equals `publicKey`. Validation: `address` must be either `publicKey` or `name` (if set).

**Editing name/address (backward compatibility):**

Sub owners can set the domain name via either:

-   `subplebbit.edit({ name: "memes.eth" })` — preferred, explicit
-   `subplebbit.edit({ address: "memes.eth" })` — backward compatible, sets `name` if address is a domain

| Edit call                                   | Behavior                                                                                  |
| ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `edit({ name: "memes.eth" })`               | Sets `name = "memes.eth"`, `address = "memes.eth"`                                        |
| `edit({ name: undefined })`                 | Clears `name`, `address` reverts to `publicKey`                                           |
| `edit({ address: "memes.eth" })`            | Same as `edit({ name: "memes.eth" })` — backward compat                                   |
| `edit({ address: "12D3KooW..." })`          | If matches `publicKey`: clears `name`, sets `address = publicKey`. Otherwise: throw error |
| `edit({ name: "a.eth", address: "b.eth" })` | Throw error — conflicting values                                                          |

### 2. Add `publication.subplebbitPublicKey` field

Publications (comments, votes, edits, moderations) currently carry only `subplebbitAddress` — a potentially mutable domain name. This is semantically incomplete: a publication belongs to a cryptographic identity, not just a mutable alias.

Add `subplebbitPublicKey` as a new field alongside `subplebbitAddress`:

-   `subplebbitAddress` — kept for backward compatibility, contains domain name if set, otherwise publicKey
-   `subplebbitPublicKey` — the IPNS key string (`12D3KooW...`), matching `subplebbit.publicKey`

Both fields are present in publications.

TODO: unresolved publication/author identity decisions:

-   `communityName`
-   `communityPublicKey`
-   `communityAddress`
-   Whether `author.publicKey` should be part of protocol/wire files or computed on instance from signature
-   Whether to keep `author.address` with value `author.name || author.publicKey`
-   Address stability in `{publicKey}`-only flow when record later includes `name` (start with `address = publicKey`; decide whether `address` can switch to `name`)
-   Subplebbit indexing key strategy for `_updatingSubplebbits` and `_startedSubplebbits`: implementation should move indexing to `publicKey` when possible, but finalize whether canonical indexing should be `publicKey`, `address`, or a dual/composite key
-   If `publication.subplebbitPublicKey` and `publication.subplebbitName` are added, add backward-compat tests proving old posts/replies that do not include these fields still load correctly

### 3. Add `author.name`, `author.publicKey`, and `author.nameResolved`

Add to the Author type embedded in publications (AuthorIpfsType, AuthorPubsubType):

-   `name?: string` — e.g., "vitalik.eth"
-   `publicKey: string` — the author's IPNS key (derived from signature.publicKey via getPlebbitAddressFromPublicKey)
-   `nameResolved: boolean` — whether the name has been verified against publicKey

**Verification pattern (conditional on `resolveAuthorAddresses`):**

-   When `plebbitOptions.resolveAuthorAddresses = true` and author has both name and publicKey, resolve name async in background
-   `comment.author.nameResolved = false` initially
-   Set `nameResolved = true` when name text record resolves to matching publicKey
-   If `resolveAuthorAddresses = false`, `comment.author.nameResolved` stays `false` (no verification attempted)
-   UIs decide their own warning policy based on nameResolved flag

### Discovery hierarchy

The identifiers form a hierarchy:

| Method      | Cross-client compatible | Human readable  | Needs external resolution |
| ----------- | ----------------------- | --------------- | ------------------------- |
| `publicKey` | Yes — direct IPNS key   | No              | No                        |
| `name`      | No — resolver-dependent | Yes             | Yes (blockchain RPCs)     |
| `address`   | No — resolver-dependent | Yes (if domain) | Yes (if domain)           |

### Automatic name verification via async resolution

**Trust model:** `name` in SubplebbitIpfs is an **untrusted claim** by the sub owner. The sub owner's cryptographic signature only proves they _claim_ to own this name — it does not prove the name actually resolves to their public key on the blockchain. A malicious or misconfigured sub could claim any name.

**Key principle:** `address` is stable and does NOT change based on verification status. Instead, the `nameResolved` flag tracks verification state:

-   `address` = `name` (if name is set), otherwise `publicKey`
-   `nameResolved` = `false` initially, `true` when verified
-   UIs decide their own warning policy based on `nameResolved` flag

**Automatic verification:** plebbit-js performs name verification automatically based on how the subplebbit is created:

**Mismatch rule:** behavior depends on whether `publicKey` was explicitly provided by the caller. If it was provided, a name/publicKey mismatch is a critical error (emit `error`, stop updating). If it was not provided (name-driven resolution), the client may switch to the newly resolved publicKey.

#### When created with `{publicKey, name}` (async verification):

1. The client immediately uses `publicKey` to start fetching the IPNS record
2. `address` = `name`, `nameResolved` = `false`
3. Name resolution happens asynchronously in the background
4. Once verified, `nameResolved` is set to `true`

| Outcome                               | Behavior                                                                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Name resolves to same publicKey       | `nameResolved = true`, verification complete                                                                                      |
| Name resolves to different publicKey  | **Critical error**: emit `error` event and stop updating (caller explicitly pinned `publicKey`)                                   |
| Name resolution fails (network error) | Emit `error` event, `nameResolved` stays `false`, retry with backoff                                                              |
| No resolver supports this name         | Emit warning, `nameResolved` stays `false`                                                                                        |

#### When created with `{name}` only (sync resolution first):

1. `address` is immediately set to the provided `name`
2. Name resolution must complete before IPNS fetching can begin
3. `updatingState` is `"resolving-address"` during resolution
4. Once resolved, behaves like `createSubplebbit({publicKey: resolvedPublicKey, name})`

| Outcome                               | Behavior                                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| Name resolves successfully            | Proceed with `{publicKey: resolvedPublicKey, name}`, `address = name`, `nameResolved = true` |
| Name resolution fails (network error) | Emit `error` event, `updatingState` stays `"resolving-address"`, retry with backoff          |
| No resolver supports this name         | Throw `ERR_NO_RESOLVER_FOR_NAME` — cannot proceed without publicKey                           |

#### When created with `{publicKey}` only and record contains `name`:

1. `address` is initially set to the provided `publicKey`
2. IPNS record is fetched using publicKey
3. Record contains `name` field (e.g., `"memes.eth"`)
4. `address` = `name`, `nameResolved` = `false`
5. Start async name verification in background

| Outcome                               | Behavior                                                                                        |
| ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Name resolves to same publicKey       | `nameResolved = true`                                                                           |
| Name resolves to different publicKey  | **Critical error**: emit `error` event and stop updating (caller explicitly pinned `publicKey`) |
| Name resolution fails (network error) | Emit `error` event, `nameResolved` stays `false`                                                |
| No resolver supports this name         | Emit `error`, `nameResolved` stays `false`                                                      |

**Important tradeoff:** When loading a community using publicKey without having the matching resolver, the client can never verify that `sub.name` actually matches the publicKey. pkc-js should emit an error. In this case, `nameResolved` stays `false` and UIs should show appropriate warnings.

### UI and client storage recommendations

**Displaying names:** Since name verification happens automatically, clients should observe the `nameResolved` flag:

-   If `nameResolved = true`: the name has been verified — show normally
-   If `nameResolved = false` and `name` is set: verification is pending, skipped, or failed — UI should show warning based on its policy





## Prerequisite: allow loading subplebbits by public key

### Current behavior (blocker)

Today, `_findErrorInSubplebbitRecord()` in `src/subplebbit/subplebbit-client-manager.ts` does a strict string equality check:

```ts
if (subJson.address !== subInstanceAddress) {
    // ERR_THE_SUBPLEBBIT_IPNS_RECORD_POINTS_TO_DIFFERENT_ADDRESS_THAN_WE_EXPECTED
}
```

This means if you call `plebbit.getSubplebbit({ address: "12D3KooW..." })` but the fetched record has `address: "business-and-finance.eth"`, verification fails. The error is marked **non-retriable** — the load stops permanently.

### Required change

Relax the address check to accept the record if **either** condition is true:

1. `subJson.address === subInstanceAddress` (current behavior — exact match), **or**
2. The requested address is an IPNS key and it matches the IPNS name derived from the record's signature public key

The signature verification already confirms the record was signed by the IPNS key holder — the address check is redundant for this case.

## createSubplebbit behavior

The `createSubplebbit` function accepts multiple ways to identify a community:

### Parameter combinations

| Parameters                                     | Behavior                                                                                                          |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `{address: "12D3KooW..."}`                     | Use as IPNS key directly, no resolution needed                                                                    |
| `{address: "memes.eth"}`                       | Resolve domain to publicKey first, then fetch IPNS                                                                |
| `{address: "memes.eth", publicKey: "12D3..."}` | Use publicKey immediately for IPNS fetch, verify domain async. `address = name`, `nameResolved = false` initially |
| `{publicKey: "12D3KooW..."}`                   | Same as `{address: "12D3KooW..."}`                                                                                |
| `{publicKey: "12D3...", name: "memes.eth"}`    | Use publicKey for IPNS fetch, verify name async. `address = name`, `nameResolved = false` initially               |

### Conflict handling

| Conflict                                                                   | Resolution                                          |
| -------------------------------------------------------------------------- | --------------------------------------------------- |
| `{address: "12D3A...", publicKey: "12D3B..."}` (both IPNS keys, different) | **Throw error** — conflicting identities            |
| `{address: "memes.eth", publicKey: "12D3..."}`                             | Valid — use publicKey for IPNS, verify domain async |

### Address lifecycle

The `address` property is stable (does not change during verification). The `nameResolved` flag tracks verification state:

| State                                      | `address` value  | `name` value  | `nameResolved`    | Notes                                                      |
| ------------------------------------------ | ---------------- | ------------- | ----------------- | ---------------------------------------------------------- |
| Created with publicKey only                | `publicKey`      | `undefined`   | `undefined`       | No name to verify                                          |
| Created with publicKey + name (unverified) | `name`           | `name`        | `false`           | Verification in progress                                   |
| Name verified successfully                 | `name`           | `name`        | `true`            | Safe to display name                                       |
| Name verification failed (mismatch)        | `name`           | `name`        | `false`           | Switched to resolved IPNS (`newPublicKey`), warning logged |
| Name verification skipped (no resolver)    | `name`           | `name`        | `false`           | Name remains unverified                                    |
| Loaded from IPNS record                    | `record.address` | `record.name` | `false` initially | Async verification starts                                  |

**Key principle:** `address` = `name` (if set) or `publicKey`. The `nameResolved` flag indicates verification status. UIs decide their own warning policy for unverified names.

## Implementation plan (plebbit-js)

### Allow loading by public key (`src/subplebbit/subplebbit-client-manager.ts`)

-   Relax the address check in `_findErrorInSubplebbitRecord()`: if the requested address is an IPNS key matching the record's signer, accept the record even if `subJson.address` is a domain.
-   Update existing tests that assert loading by IPNS key fails — they should now succeed.

### Schema changes (`src/subplebbit/schema.ts`)

-   **Keep** `address` in `SubplebbitIpfsSchema`
-   Add `name: z.string().min(1).optional()` to `SubplebbitIpfsSchema`
-   Add `publicKey: z.string().optional()` to `SubplebbitIpfsSchema`
-   Do **not** add `nameResolved` to `SubplebbitIpfsSchema` (instance-only/runtime field)
-   Add `name: true` to `SubplebbitEditOptionsSchema` (editable by sub owner)
-   Add validation: `address` must be `publicKey` or `name` (if set)
-   Add validation: if `publicKey` is present, it must match derivation from `signature.publicKey`

### Publication schema changes (`src/schema/schema.ts`)

-   **Keep** `subplebbitAddress` in `CreatePublicationUserOptionsSchema` (value = domain name if exists, otherwise publicKey)
-   **Add** `subplebbitPublicKey` as NEW separate field (always the IPNS key)
-   Both fields are present in publications

### Author schema changes (`src/schema/schema.ts`)

-   Add `name: z.string().min(1).optional()` to Author types
-   Add `publicKey: z.string()` to Author types (derived from signature.publicKey)
-   Add `nameResolved: z.boolean()` to Author types
-   Same async verification pattern as subplebbit

### RemoteSubplebbit (`src/subplebbit/remote-subplebbit.ts`)

-   Add `name`, `publicKey`, and `nameResolved` property declarations
-   `publicKey` derived from `signature.publicKey` (Ed25519 → PeerId → base58) on first update
-   Assign `name` in `initRemoteSubplebbitPropsNoMerge()`
-   Add `_startAsyncNameResolution()` method for background name verification
-   Add `_handlePublicKeyMismatch()` method: if caller provided `publicKey`, emit `error` and stop updating (critical); otherwise clear data and switch IPNS to resolved publicKey
-   `nameResolved` = `false` initially, set to `true` on successful verification

### LocalSubplebbit (`src/runtime/node/subplebbit/local-subplebbit.ts`)

-   `publicKey` set immediately from `signer.address`
-   In IPNS record construction: add `name`
-   Add `name` editing support

### Database changes (`src/runtime/node/subplebbit/db-handler.ts`)

-   Add `subplebbitPublicKey` column to publication tables (keep existing `subplebbitAddress`)
-   Bump DB version, add migration logic

### Backward compatibility

-   **SubplebbitIpfs**: Non-breaking for old clients. `address` stays, new `name`/`publicKey` fields are ignored by old clients using `.loose()` parsing.
-   **Publications**: Non-breaking. Old clients continue to use `subplebbitAddress`. New clients also have `subplebbitPublicKey`.

## Edge cases and error handling

This section documents all edge cases for `createSubplebbit`, name resolution, and record validation.

### Async name resolution outcomes

| Scenario                                | Behavior                                                                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| No name set                             | `nameResolved` = undefined/absent                                                                                                 |
| Name set, not yet verified              | `nameResolved` = `false`                                                                                                          |
| Name verified successfully              | `nameResolved` = `true`                                                                                                           |
| Name resolves to DIFFERENT publicKey (explicit `publicKey` provided by caller) | **Critical error**: emit `error` event and stop updating |
| Name resolves to DIFFERENT publicKey (no explicit `publicKey`, name-driven flow) | **Clear all community data, switch IPNS to resolved publicKey** (name "transferred" to new owner), emit update event, log warning |
| Name resolution fails (network/timeout) | `nameResolved` stays `false`, emit `error` event, retry with backoff                                                              |
| No resolver supports this name          | `nameResolved` stays `false`, emit warning                                                                                        |

### SubplebbitIpfs record validation

| Scenario                                                                                            | Action                                                                                                                            |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `record.publicKey` matches `derived(signature.publicKey)`                                           | Accept record                                                                                                                     |
| `record.publicKey` doesn't match `derived(signature.publicKey)`                                     | **Reject record** — malformed or malicious                                                                                        |
| Loaded by IPNS key, record has domain `address`                                                     | Accept if signature's derived publicKey matches the IPNS key we requested                                                         |
| Update arrives with different publicKey and caller explicitly provided `publicKey`                  | **Critical error**: emit `error` event, reject update, stop updating                                                              |
| Update arrives with different publicKey and caller did not explicitly provide `publicKey`           | Clear data, switch to new IPNS                                                                                                    |

### createSubplebbit parameter conflicts

| Scenario                                                                     | Action                                              |
| ---------------------------------------------------------------------------- | --------------------------------------------------- |
| `{address: "12D3A...", publicKey: "12D3B..."}` (both IPNS, different values) | **Throw** `ERR_CONFLICTING_ADDRESS_AND_PUBLICKEY`   |
| `{address: "memes.eth", publicKey: "12D3..."}`                               | Valid — use publicKey for IPNS, verify domain async |
| `{address: "MEMES.ETH"}` (uppercase domain)                                  | **Throw** `ERR_DOMAIN_ADDRESS_HAS_CAPITAL_LETTER`   |
| `{}` (empty options)                                                         | Generate random signer, create local subplebbit     |

### Error codes

| Error Code                                 | When                                                           |
| ------------------------------------------ | -------------------------------------------------------------- |
| `ERR_CONFLICTING_ADDRESS_AND_PUBLICKEY`    | Both `address` and `publicKey` provided as different IPNS keys |
| `ERR_SUBPLEBBIT_RECORD_PUBLICKEY_MISMATCH` | `record.publicKey` doesn't match derivation from signature     |
| `ERR_DOMAIN_ADDRESS_HAS_CAPITAL_LETTER`    | Domain address contains uppercase letters                      |
| `ERR_NAME_RESOLUTION_FAILED`               | Blockchain RPC resolution failed (network error, timeout)      |
| `ERR_NO_RESOLVER_FOR_NAME`                 | No resolver registered that supports the provided name          |
