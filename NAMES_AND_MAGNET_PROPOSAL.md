# Proposal: `subplebbitIpfs.names`, `pkc://` magnet link, rename `publication.subplebbitAddress` → `subplebbitPublicKey`, `subplebbit.publicKey`

## Problem

Currently, a subplebbit has a single `address` field that can be either a raw IPNS key (`12D3KooW...`) or a single domain name (`memes.eth`). This creates several problems:

### 1. Censorship vulnerability via blockchain RPC providers

If a community is known as `memes.eth`, users depend on Ethereum RPC providers to resolve that name to the underlying IPNS key. If those RPCs go down or decide to censor the resolution, the community becomes unreachable — there is no fallback.

With multiple names across different chains (e.g., `memes.eth`, `memes.sol`, `memes.bso`), it becomes nearly impossible for all blockchain RPC providers across all chains to coordinate censorship of the same community simultaneously.

### 2. Client interoperability

Different pkc-js clients may ship with different domain resolvers. One client might support `.eth` resolution but not `.sol`, while another supports `.sol` but not `.eth`. If a subplebbit only publishes a single name, clients without the matching resolver cannot find the community.

By publishing multiple names across different naming systems, communities can maximize their reachability across the diverse ecosystem of pkc-js clients and resolvers.

### 3. No migration path between naming systems

With a single address, migrating from one naming system to another (e.g., `.eth` to `.bso`) requires a hard cutover — every sub owner, client, and user must switch simultaneously. With `names`, sub owners can list both old and new names during the transition period (`names: ["memes.eth", "memes.bso"]`). Clients that support the new resolver use it; clients that only support the old one continue working. Over time, the old names can be dropped without disrupting any users.

### 4. Publications point to mutable domain names instead of cryptographic identity

Publications currently carry `subplebbitAddress` — a potentially mutable domain name. This is semantically wrong: a publication belongs to a cryptographic identity, not a mutable alias. If a sub owner changes their address from `memes.eth` to `memes.sol`, old publications point to a name that may no longer resolve to this community.

Additionally, loading a subplebbit by its IPNS public key currently fails if the record's `address` is a domain name, because validation does a strict string comparison. This blocks the core magnetUri optimization — clients with a magnet link can't skip blockchain resolution and load directly by public key.

### Why `name` (singular) doesn't work

Domain resolution is being refactored out of plebbit-js into pkc-js clients (see [#68](https://github.com/plebbit/plebbit-js/issues/68)). plebbit-js will no longer be the one doing name resolution — it just carries the data. The protocol layer (plebbit-js / SubplebbitIpfs) needs to store **all** the names a community uses so that any client, with whatever resolvers it has available, can find the community. A singular `name` field would still leave communities dependent on a single chain and a single set of resolvers.

## Proposal

### 1. Add `names` field to `SubplebbitIpfs`

Add a new optional `names` field to the signed SubplebbitIpfs record:

```ts
names?: string[]   // e.g., ["memes.eth", "memes.sol", "memes.bso"]
```

-   **Simple string array** — the TLD implies which chain/resolver to use
-   **Optional** — communities without domain names simply omit this field
-   **Signed** — part of the SubplebbitIpfs record, included in the subplebbit signature
-   **Editable** — sub owner sets it via `subplebbit.edit({ names: ["memes.eth", "memes.sol"] })`
-   **Untrusted until verified** — `names` in SubplebbitIpfs (and in magnet links) are claims by the sub owner, not proof of ownership. The sub owner's signature only proves they _claim_ these names, not that the names actually resolve to their public key. Clients MUST call `verifyNames()` (which does blockchain RPC resolution) before trusting any name. Until verified, names should be treated as unverified display hints.

#### Open question: Should `address` stay in SubplebbitIpfs or be removed?

**Option A: Remove `address` from SubplebbitIpfs** — `address` becomes a computed class property with three phases: (1) before first update: whatever identifier the user passed to `createSubplebbit()`, (2) after first update, before verification: `names[0]` optimistically from the signed record (the sub owner signed this claim), (3) after verification: first verified name, or `publicKey` if none verify.

**Option B: Keep `address` in SubplebbitIpfs** — `address` stays as the sub owner's preferred display label ("favorite name"), manually editable. Must be either the publicKey or one of the `names` entries. If the sub owner edits `names` to remove the name that is currently `address`, auto-update `address` to `names[0]` (the new favorite). If `names` becomes empty, fall back to `publicKey`.

See the **"Design discussion"** section below for full pros/cons of each approach.

**Regardless of which option is chosen:**

**`publicKey` is a new class property:**

`subplebbit.publicKey` is the IPNS key string (`12D3KooW...`) — the permanent cryptographic identity of the community. This is the **canonical identifier** — `address` is a display label, `names` are discovery aliases, but `publicKey` is the true identity.

**`publicKey` is NOT a field in SubplebbitIpfs** — it is not part of the signed wire format. It is a class property derived from the existing `signature.publicKey` field (Ed25519 public key → PeerId → base58 string). Every SubplebbitIpfs record already contains the information needed to compute it via `signature.publicKey`. Adding it as a separate field in the record would be redundant.

It is populated:

-   **Immediately** for local subplebbits (derived from `signer.address`)
-   **Immediately** when the user creates a remote sub with an IPNS key (`createSubplebbit({ address: "12D3KooW..." })`)
-   **After first update** for remote subs created by domain name (`undefined` until the IPNS record is fetched and `signature.publicKey` is available)

**Serialization requirement:** `address`, `names`, and `publicKey` must all be **enumerable properties** on the subplebbit class instance. This means they must appear in `JSON.stringify(subplebbit)` output and be accessible via object destructuring (`const { address, names, publicKey } = subplebbit`). This applies regardless of whether `address` is a SubplebbitIpfs field (Option B) or a computed class property (Option A), and regardless of whether `publicKey` is derived at runtime. Implementation-wise, these properties should be plain instance properties (not getters on the prototype) so that they are own enumerable properties of the object.

**Client-side resolution algorithm** (implemented in pkc-js, not plebbit-js):

1. Filter `names[]` to only names that the client's registered resolvers can handle
2. Try names in order (the order set by the sub owner determines priority)
3. Attempt to resolve each name to an IPNS key
4. If resolution fails or the resolved key doesn't match the subplebbit's public key, try the next name
5. If all names fail, fall back to the raw IPNS key if known

### 2. Rename `publication.subplebbitAddress` to `publication.subplebbitPublicKey`

Publications (comments, votes, edits, moderations) currently carry `subplebbitAddress` — a potentially mutable domain name. This is semantically wrong: you're publishing to a cryptographic identity, not a mutable alias.

Rename to `subplebbitPublicKey` across all publication types. This is the IPNS key string (`12D3KooW...`), matching `subplebbit.publicKey`. This is a clean break — no backward compatibility with the old field name.

### 3. Add `subplebbitIpfs.magnetUri` field

Add an optional `magnetUri` field to SubplebbitIpfs — a single string that bundles everything needed to discover and connect to a community:

```
pkc://?publicKey=12D3KooWNMYbPn...&name=memes.eth&name=memes.sol&httpRouter=https://peers.pleb.bot&httpRouter=https://routing.lol
```

**Components:**

-   `publicKey` — the IPNS public key (the cryptographic identity of the subplebbit), matches `subplebbit.publicKey`
-   `name` (repeated) — human-readable names, used as **unverified display hints** while the IPNS record is loading (must be verified via `verifyNames()` before being trusted)
-   `httpRouter` (repeated) — HTTP router URLs used to discover peers, matches `plebbitOptions.httpRouters`

**Properties:**

-   **Optional** in SubplebbitIpfs — backward compatible
-   **Signed** — part of the SubplebbitIpfs record
-   **Auto-generated** by the local subplebbit on each IPNS publish (not manually editable)
-   Computed from: `signer.address` (IPNS key) + `names` + the sub's configured `httpRoutersOptions`
-   **Size-capped at 4KB** — `encodeMagnetUri` always includes all `name` params and `publicKey`, but includes `httpRouter` params in order until adding the next one would push the magnet string over 4KB. Routers beyond the cap are silently dropped. The sub owner controls router priority via order. In practice, magnets will be a few hundred bytes (3 names + 3 routers ≈ 350 bytes), so the 4KB cap is a safety net for extreme configurations. Keeping the magnetUri under ~1,000 bytes is recommended for QR code compatibility.

**Why this is useful:**

Similar to BitTorrent magnet links, a single `pkc://` string is fully self-contained. If someone shares `pkc://?publicKey=12D3KooW...&name=memes.eth&httpRouter=https://peers.pleb.bot`, the recipient has everything needed to find the community — the cryptographic identity, human-readable names to display (though needs to be verified), and the HTTP routers to discover peers. No external dependencies required.

**Why `pkc://` instead of `pkc-magnet:`:**

We use a single `pkc://` URI scheme rather than separate JSON fields because a URI is a single string that any app on the device can open. If a user clicks a `pkc://...` link in a chat app, email, browser, or scans a QR code, the OS routes it directly to a registered pkc app (Seedit, 5chan, or any future client) — the same way `mailto:` opens an email client, `tg://` opens Telegram, or `spotify://` opens Spotify. This works via Android intent filters, iOS URL schemes, and desktop protocol handler registration.

We chose `pkc://` over `pkc-magnet:` specifically because `pkc://` is a standard custom protocol scheme that operating systems recognize natively. The concept remains inspired by BitTorrent magnet links (a self-contained discovery string), hence the field name `magnetUri`, but the URI scheme is `pkc://` for maximum compatibility with OS-level protocol handling and QR code workflows.

**Key insight:** If a client already has a `pkc://` string, it does **not** need to resolve any names — the IPNS public key is right there in the `publicKey` parameter. The client can go directly to the HTTP routers in the magnet to find peers and fetch the IPNS record. Name resolution is only needed when the user has a human-readable name but no magnet link (e.g., someone told them "check out memes.eth"). The `name` params in the magnet exist solely as display hints.

**Performance benefit for multisubs:** A multisub list with 100+ communities would be extremely slow to load if every entry required blockchain RPC resolution — RPCs throttle aggressively and each resolution is a separate network call. With magnet links, the client uses the `publicKey` + `httpRouter` params to fetch all 100+ IPNS records in parallel via HTTP routers, with zero blockchain involvement. Name resolution can be deferred to when the user actually navigates to a specific community, turning 100+ blocking RPC calls into 0 on initial load.

#### Benchmark: real-world name resolution overhead

We benchmarked the name resolution phase in isolation using the actual [temporary-default-subplebbits](https://github.com/plebbit/temporary-default-subplebbits) multisub list (39 communities) and production plebbit-js, simulating a user opening seedit for the first time with no cache (`dataPath: undefined`). The benchmark measures only the `updatingState: "resolving-address"` phase — the time from when blockchain RPC resolution starts to when it completes and moves to `"fetching-ipns"`.

**39 subs resolving in parallel** (name resolution phase only):

| Metric                       | Time     |
| ---------------------------- | -------- |
| First sub resolved           | 0.6s     |
| Median per-sub               | 4.9s     |
| Average per-sub              | 3.9s     |
| P90 per-sub                  | 6.7s     |
| Slowest per-sub              | 6.7s     |
| **Total wall time (all 39)** | **7.5s** |
| Failed (timed out at 120s)   | 2 subs   |

**With magnetUri: all of the above becomes 0s.** The client skips blockchain RPC entirely and goes straight to IPNS fetching via the public key + HTTP routers embedded in the magnet link.

#### Why not separate `names` + `publicKey` fields in multisubs?

1.  **HTTP routers are the critical missing piece** — having the `publicKey` alone isn't enough to fetch the IPNS record; the client also needs to know _which HTTP routers_ to query.
2.  **Portability** — a magnet is a single self-contained string shareable in any context (chat message, QR code, tweet, URL). Separate JSON fields only work within structured multisub data.

### Discovery hierarchy

The identifiers form a hierarchy of censorship resistance vs. human readability:

| Method      | Censorship resistance                                  | Human readable  | Needs external resolution |
| ----------- | ------------------------------------------------------ | --------------- | ------------------------- |
| `magnetUri` | Highest — self-contained, includes routers + publicKey | No              | No                        |
| `names`     | Medium — redundancy across chains                      | Yes             | Yes (blockchain RPCs)     |
| `address`   | Lowest — single name or raw key                        | Yes (if domain) | Yes (if domain)           |
| `publicKey` | High — direct IPNS key                                 | No              | No                        |

### Name verification

**Trust model:** `names` in both SubplebbitIpfs and magnet links are **untrusted claims** by the sub owner. The sub owner's cryptographic signature only proves they _claim_ to own these names — it does not prove the names actually resolve to their public key on the blockchain. A malicious or misconfigured sub could claim any names it wants. The only way to verify name ownership is to do a blockchain RPC resolution call and check that the resolved IPNS key matches the subplebbit's `publicKey`. Until this verification is done, all names should be treated as unverified display hints.

**plebbit-js** should provide an on-demand method for name verification — hooks call it when the user navigates to a community, and consume the results:

```ts
const result = await subplebbit.verifyNames();
// result: { [name: string]: { publicKey: string, resolvedAt: number, error?: Error } }
// resolvedAt: unix timestamp in seconds of when the resolution was actually performed (not from cache)
```

The method:

1. Filters `names[]` to only names that the instance's registered resolvers can handle
2. Resolves each name via blockchain RPC
3. Checks that the resolved IPNS key matches the subplebbit's public key (`subplebbit.publicKey`)
4. Returns a map of results per name — hooks use this to decide what to display and whether to warn the user

Hooks SHOULD call this lazily (when the user navigates to the community, not on initial load) and display a warning if no name resolved to the correct public key. This verification is cheap (a few RPC calls when the user actually visits) and provides a strong guarantee that the magnet's claimed names are legitimate.

### UI and client storage recommendations

**Displaying names:** Hooks should call `subplebbit.verifyNames()` and use the following display priority: show `address` if it verifies (resolves to the correct public key). Otherwise, show the first verified name from `names`. If none resolve, fall back to displaying `subplebbit.publicKey`.

**Indexing by public key:** Hooks should **index communities by `subplebbit.publicKey`** once available. `publicKey` is `undefined` until the first update for domain-created subs, so hooks may use `subplebbit.address` as a temporary key before the first update. Once `publicKey` is known, migrate to it as the permanent index key. The public key is the only truly stable, immutable identifier — it's the cryptographic identity of the community.

**Persisting magnets:** UIs and hooks should **persist `magnetUri` strings in browser storage** for every subscribed community. This way, even if all blockchain resolvers go down, the client can still reach communities using the stored magnet links.

**Keeping magnets fresh:** Hooks should **update their stored `magnetUri` every time they receive a new subplebbit update** (i.e., on every `update` event). Since the local subplebbit re-generates the magnet on each IPNS publish, the magnet in each update reflects the latest names and HTTP routers.

**Multisub integration:** In the future, multisub lists (like [temporary-default-subplebbits](https://github.com/plebbit/temporary-default-subplebbits)) should include the `magnetUri` field per entry, giving clients a fully self-contained discovery string even if blockchain RPCs are unavailable. This will also allow pkc clients withiout resolvers to consume multisubs, albeit without validation.

### Community identity

The cryptographic key (IPNS public key) is the **permanent, canonical identity** of a community. Everything else — names, addresses, magnet links — are discovery mechanisms and human-readable aliases that point to this key.

**Key rotation is not supported.** If a sub owner loses their private key, the community is gone — analogous to losing a Bitcoin private key. The private key is stored in the subplebbit's SQLite database, and securing it is the sub owner's responsibility (backups, encrypted storage, etc.).

Names (ENS, DNS, `.sol`, etc.) are **human-readable aliases, not identity**. They can expire, be transferred. A name resolving to a different public key always means the name was lost or transferred — never that the community migrated to a new key.

Clients MUST index communities by public key, not by name or address. This ensures the client never loses track of a community due to name changes, expiry, or transfer.

Key rotation may be revisited in the future if there is real demand (e.g., via signed migration records where the old key signs a "migrating to new key X" message). This is out of scope for this proposal.

## Design discussion: Removing vs keeping `address` in SubplebbitIpfs (OPEN QUESTION)

Two approaches for handling `address` in the signed SubplebbitIpfs record. The `publication.subplebbitAddress` → `subplebbitPublicKey` rename happens regardless of which option is chosen.

### Option A: Remove `address` from SubplebbitIpfs

`address` becomes a computed class property with three phases:

1. **Before first update**: whatever identifier the user passed to `createSubplebbit()` (domain name or IPNS key)
2. **After first update, before verification**: `names[0]` optimistically from the signed record — the sub owner signed this claim, so it's a reasonable trust assumption
3. **After verification**: first verified name (via `verifyNames()`), or `publicKey` if none verify

**Pros:**

-   Cleaner model: `publicKey` is identity, `names` is discovery, `address` is a computed UI convenience string
-   DB paths can be keyed by publicKey (stable forever), eliminating the complex `changeDbFilename` logic needed when address changes
-   No validation needed for address consistency with names — there's no address to validate
-   No ambiguity about "canonical identifier" — publicKey is the only answer
-   No redundancy between `address` and `names[0]`

**Cons:**

-   Breaking change for old clients that expect `address` in the SubplebbitIpfs record
-   Requires rewriting `CreateRemoteSubplebbitOptionsSchema` (currently does `.pick({ address: true })` from SubplebbitIpfs)
-   Requires DB file path migration (domain-named → publicKey-named) on startup
-   `plebbit.subplebbits` changes from addresses to publicKeys. Or maybe it should be a `plebbit.subplebbits: {address, names, publicKey}[]`
-   Larger implementation scope overall

### Option B: Keep `address` in SubplebbitIpfs

`address` stays as the sub owner's preferred display label ("favorite name"), manually editable via `subplebbit.edit({ address: "memes.sol" })`. Must be either the publicKey or one of the `names` entries.

**Pros:**

-   Simpler migration — the SubplebbitIpfs schema change is purely additive (`names` + `magnetUri`)
-   Old clients don't break on SubplebbitIpfs records (they just ignore unknown `names`/`magnetUri` fields via `.loose()` parsing)
-   Immediate display string from the signed record — the sub owner's preferred label is right there without computation
-   `CreateRemoteSubplebbitOptionsSchema`, `ListOfSubplebbitsSchema` stay unchanged
-   No DB file path migration needed
-   Existing `changeDbFilename` / address editing logic stays

**Cons:**

-   Redundancy: `address` overlaps with `names[0]` in most cases. Need validation that `address` must be the publicKey or one of the `names` entries.
-   `address` is still a mutable domain name baked into the cryptographically signed record — the fundamental semantic issue of conflating a display label with signed data persists
-   Two sources of truth for "what to display" (`address` = owner's favorite, `names` = full list). Need documented display priority: `address` if verified → first verified `names` entry → `publicKey`.
-   `address` changes still require DB file rename via `changeDbFilename`
-   Ambiguity about the "canonical identifier" persists — must be documented that `publicKey` is the true identity and `address` is just a display label

### Summary

The critical fix (publications pointing to cryptographic identity via `subplebbitPublicKey` instead of a mutable domain name) is achieved regardless of which option is chosen. The choice between Option A and Option B is a tradeoff between semantic cleanliness (A) and backward compatibility / smaller scope (B).

## Open questions

-   **`verifyNames()` return type:** The exact shape needs refinement. Should names that were skipped (no resolver available) be included in the map with a specific error? Should the method also return a convenience field like `verifiedName: string | undefined` for the first name that passed verification?

-   **No resolvers available:** If the client has no resolvers but has the public key (directly with `createSubplebbit({address: "12D..."})` or via magnet), it should still load the community without attempting resolution — the UI should display a warning that `names` are unverified rather than blocking access.

-   **Name ownership transfer:** If a sub owner loses control of one of their names (e.g., domain expires and someone else registers it), that name could start resolving to a different public key. Clients should disregard any name that resolves to a mismatched public key and move on to the next name. If **all** names resolve to wrong keys or fail, the community is still accessible via its public key + HTTP routers — clients should display the community with an "unverified" indicator or fall back to showing the public key, but **never refuse to load it**.

-   **Multiple names resolving to different public keys:** If the client has `names` but no reference `publicKey` to compare against (e.g., someone passes `{ names: ["memes.eth", "memes.sol"] }` without a public key), and each name resolves to a different IPNS key, there's no way to determine which name is "correct" or which IPNS key to use. The client cannot verify any of them. The client has no authoritative public key to fall back to or display until it can obtain one (e.g., by resolving one of the names and fetching its IPNS record). This is relevant for Option A's computed `address` in particular, since `address` depends on verification results.

## Prerequisite: allow loading subplebbits by public key

### Current behavior (blocker)

Today, `_findErrorInSubplebbitRecord()` in `src/subplebbit/subplebbit-client-manager.ts:615` does a strict string equality check:

```ts
if (subJson.address !== subInstanceAddress) {
    // ERR_THE_SUBPLEBBIT_IPNS_RECORD_POINTS_TO_DIFFERENT_ADDRESS_THAN_WE_EXPECTED
}
```

This means if you call `plebbit.getSubplebbit({ address: "12D3KooW..." })` but the fetched record has `address: "business-and-finance.eth"`, verification fails because `"12D3KooW..." !== "business-and-finance.eth"`. The error is marked **non-retriable** — the load stops permanently.

### Required change

Relax the address check to accept the record if **either** condition is true:

1. `subJson.address === subInstanceAddress` (current behavior — exact match), **or**
2. The requested address is an IPNS key and it matches the IPNS name derived from the record's signature public key (i.e., the record is cryptographically signed by the same key we requested)

The signature verification (`verifySubplebbit`) already confirms the record was signed by the IPNS key holder — the address check is redundant for this case.

## Implementation plan (plebbit-js)

### Allow loading by public key (`src/subplebbit/subplebbit-client-manager.ts`)

-   Relax the address check in `_findErrorInSubplebbitRecord()`: if the requested address is an IPNS key matching the record's signer, accept the record even if `subJson.address` is a domain.
-   Update the existing test in `test/node-and-browser/subplebbit/update.subplebbit.test.ts` that asserts loading by IPNS key fails — it should now succeed.
-   Add new test: loading by IPNS key when the sub has a domain address returns the subplebbit correctly.

### Schema changes (`src/subplebbit/schema.ts`)

-   **Keep** `address` in `SubplebbitIpfsSchema`
-   Add `names: z.string().min(1).array().optional()` to `SubplebbitIpfsSchema`
-   Add `magnetUri: z.string().max(4096).optional()` to `SubplebbitIpfsSchema`
-   Add `names: true` to `SubplebbitEditOptionsSchema` (editable by sub owner). Keep `address: true`.
-   Do NOT add `magnetUri` to `SubplebbitEditOptionsSchema` (auto-generated, not user-editable)
-   Add validation: `address` must be publicKey or one of `names`
-   `SubplebbitSignedPropertyNames` auto-updates (derived from schema keys)
-   All derived types auto-update via `z.infer<>`

### Publication schema changes (`src/schema/schema.ts`)

-   Rename `subplebbitAddress` to `subplebbitPublicKey` in `CreatePublicationUserOptionsSchema`
-   All publication schemas (comment, vote, comment-edit, comment-moderation, subplebbit-edit) inherit this rename automatically

### RemoteSubplebbit (`src/subplebbit/remote-subplebbit.ts`)

-   Add `names`, `magnetUri`, and `publicKey` property declarations
-   `address` stays as-is (still in SubplebbitIpfs, set from the record)
-   `publicKey` derived from `signature.publicKey` (Ed25519 → PeerId → base58) on first update
-   Assign `names` and `magnetUri` in `initRemoteSubplebbitPropsNoMerge()`
-   Add `verifyNames()` method

### LocalSubplebbit (`src/runtime/node/subplebbit/local-subplebbit.ts`)

-   `publicKey` set immediately from `signer.address`
-   `address` same as today — manually editable. Validated: must be publicKey or one of `names`.
-   In IPNS record construction: keep `address`, add `names`, auto-generate `magnetUri` using `encodeMagnetUri()`
-   Keep existing address editing logic (including `changeDbFilename`). Add `names` editing support alongside it.

### Database changes (`src/runtime/node/subplebbit/db-handler.ts`)

-   Rename `subplebbitAddress` column to `subplebbitPublicKey` in publication tables (comments, commentEdits, commentModerations)
-   Bump DB version, add column mapping in migration
-   DB file paths stay keyed by `address` — no file path migration needed

### Magnet utilities (`src/magnet-uri.ts` — new file)

```ts
interface MagnetUriComponents {
    publicKey: string;
    names: string[];
    httpRouters: string[];
}

const MAGNET_URI_MAX_SIZE_BYTES = 4 * 1024; // 4KB

function encodeMagnetUri(components: MagnetUriComponents): string;
function decodeMagnetUri(magnetUri: string): MagnetUriComponents;
```

Exported at the top level via `src/index.ts` and attached to the `Plebbit` function object.

### Backward compatibility

-   **SubplebbitIpfs**: Non-breaking for old clients. `address` stays, new `names`/`magnetUri` fields are ignored by old clients using `.loose()` parsing.
-   **Publications**: Breaking change. Old clients will see `subplebbitPublicKey` instead of `subplebbitAddress`. This is a clean break — no backward compatibility shim.
-   New clients can still validate old records: signature verification uses the record's own `signedPropertyNames`, so old records with `subplebbitAddress` are verified against what they claim to have signed.
