# Proposal: `subplebbitIpfs.name`, `pkc://` magnet link, rename `publication.subplebbitAddress` → `subplebbitPublicKey`, `subplebbit.publicKey`

## Problem

Currently, a subplebbit has a single `address` field that can be either a raw IPNS key (`12D3KooW...`) or a single domain name (`memes.eth`). This creates several problems:

### 1. Publications point to mutable domain names instead of cryptographic identity

Publications currently carry `subplebbitAddress` — a potentially mutable domain name. This is semantically wrong: a publication belongs to a cryptographic identity, not a mutable alias. If a sub owner changes their address from `memes.eth` to `memes.sol`, old publications point to a name that may no longer resolve to this community.

Additionally, loading a subplebbit by its IPNS public key currently fails if the record's `address` is a domain name, because validation does a strict string comparison. This blocks the core magnetUri optimization — clients with a magnet link can't skip blockchain resolution and load directly by public key.

### 2. No protocol-level way to share communities across clients

Currently there is no protocol-level way to share a pkc community that works across different clients:

- **Share `name.eth`** — Only works if the recipient has a matching resolver and knows which app to use
- **Share `app.com/community/name.eth`** — Locks you into that specific app's web interface; not a protocol-level solution
- **Share the publicKey `12D3KooW...`** — Recipient still needs to know which httpRouters to use; not human-friendly

Without a universal sharing mechanism, cross-client interoperability requires either everyone agreeing on the same resolvers (one app's dominance) or out-of-band coordination.

### 3. `address` is no longer universally resolvable

Once domain resolution moves out of plebbit-js into pkc-js clients (see [#68](https://github.com/plebbit/plebbit-js/issues/68)), the idea of a single `address` field that works across all clients is no longer true. A client that only ships with `.sol` resolvers cannot resolve a `memes.eth` address.

This is an acceptable trade-off for protocol neutrality — pkc-js should not mandate which resolvers clients must implement. However, it means we need a universal sharing mechanism that works regardless of resolver choices. The `magnetUri` fills this role.

### 4. Performance: name resolution adds significant latency

We benchmarked the name resolution phase using the [temporary-default-subplebbits](https://github.com/plebbit/temporary-default-subplebbits) multisub list (39 communities), simulating a user opening the app for the first time with no cache. The benchmark measures only the `updatingState: "resolving-address"` phase.

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

## Protocol neutrality

A key design goal is that **pkc-js remains a neutral protocol layer**. Different clients may ship with different resolvers — one client might support `.eth`, another might support `.sol` or a future `.ton`. This is intentional: pkc-js should not force clients to import specific resolver libraries.

A client that only supports `.ton` is not "forking pkc-js" — it's a legitimate pkc-js client serving a different naming ecosystem. The protocol supports this via:

- `publicKey` as the canonical identity (works everywhere)
- `magnetUri` as the universal sharing format (works everywhere, includes httpRouters)
- `name` as a human-readable convenience (works if you have a matching resolver)

Specific apps (like bitsocial) can standardize on `.eth` for their ecosystem, but this is an app-level choice, not a protocol requirement.

## Proposal

### 1. Add `name` field to `SubplebbitIpfs`

Add a new optional `name` field to the signed SubplebbitIpfs record:

```ts
name?: string   // e.g., "memes.eth"
```

-   **Simple string** — the TLD implies which chain/resolver to use
-   **Optional** — communities without domain names simply omit this field
-   **Signed** — part of the SubplebbitIpfs record, included in the subplebbit signature
-   **Editable** — sub owner sets it via `subplebbit.edit({ name: "memes.eth" })`
-   **Untrusted until verified** — `name` in SubplebbitIpfs (and in magnet links) is a claim by the sub owner, not proof of ownership. The sub owner's signature only proves they _claim_ this name, not that it actually resolves to their public key. Clients MUST call `verifyName()` (which does blockchain RPC resolution) before trusting the name. Until verified, the name should be treated as an unverified display hint.

**Why singular `name` instead of `names[]` array:**

-   **RPC fallbacks solve availability** — Blockchains don't go down; RPCs do. Having multiple RPC endpoints for one naming system is more practical than registering names on multiple chains.
-   **Simpler UX** — With an array, you'd be "posting to [name1, name2, name3]" which has no intuitive display. Hiding names from the user is risky (malicious names could be buried in the array).
-   **Cost and complexity** — Buying and maintaining names on multiple chains is expensive and complicated for sub owners.
-   **`magnetUri` is the universal fallback** — For cross-client interoperability, `magnetUri` works regardless of resolvers. The `name` is a human-readable convenience, not a critical redundancy mechanism.

**`publicKey` is a new class property:**

`subplebbit.publicKey` is the IPNS key string (`12D3KooW...`) — the permanent cryptographic identity of the community. This is the **canonical identifier** — `address` is a display label, `name` is a discovery alias, but `publicKey` is the true identity.

**`publicKey` is NOT a field in SubplebbitIpfs** — it is not part of the signed wire format. It is a class property derived from the existing `signature.publicKey` field (Ed25519 public key → PeerId → base58 string). Every SubplebbitIpfs record already contains the information needed to compute it via `signature.publicKey`. Adding it as a separate field in the record would be redundant.

It is populated:

-   **Immediately** for local subplebbits (derived from `signer.address`)
-   **Immediately** when the user creates a remote sub with an IPNS key (`createSubplebbit({ address: "12D3KooW..." })`)
-   **After first update** for remote subs created by domain name (`undefined` until the IPNS record is fetched and `signature.publicKey` is available)

**Serialization requirement:** `address`, `name`, and `publicKey` must all be **enumerable properties** on the subplebbit class instance. This means they must appear in `JSON.stringify(subplebbit)` output and be accessible via object destructuring (`const { address, name, publicKey } = subplebbit`). Implementation-wise, these properties should be plain instance properties (not getters on the prototype) so that they are own enumerable properties of the object.

**`shortAddress` is unchanged** — it remains derived from `address` as it is today. No changes needed.

**Relationship between `address` and `name`:**

`address` stays in SubplebbitIpfs as the sub owner's preferred display label. When `name` is set, `address` should typically equal `name`. When `name` is not set, `address` equals `publicKey`. Validation: `address` must be either `publicKey` or `name` (if set).

### 2. Rename `publication.subplebbitAddress` to `publication.subplebbitPublicKey`

Publications (comments, votes, edits, moderations) currently carry `subplebbitAddress` — a potentially mutable domain name. This is semantically wrong: you're publishing to a cryptographic identity, not a mutable alias.

Rename to `subplebbitPublicKey` across all publication types. This is the IPNS key string (`12D3KooW...`), matching `subplebbit.publicKey`. This is a clean break — no backward compatibility with the old field name. Old clients will reject new publications and vice versa; this is acceptable.

### 3. Add `subplebbitIpfs.magnetUri` field

Add an optional `magnetUri` field to SubplebbitIpfs — a single string that bundles everything needed to discover and connect to a community:

```
pkc://?publicKey=12D3KooWNMYbPn...&name=memes.eth&httpRouter=https://peers.pleb.bot&httpRouter=https://routing.lol
```

**Components:**

-   `publicKey` — the IPNS public key (the cryptographic identity of the subplebbit), matches `subplebbit.publicKey`
-   `name` (optional) — the sub owner's human-readable name, used as an **unverified display hint** while the IPNS record is loading (must be verified via `verifyName()` before being trusted)
-   `httpRouter` (repeated) — HTTP router URLs used to discover peers, matches `plebbitOptions.httpRouters`

**Properties:**

-   **Optional** in SubplebbitIpfs — backward compatible
-   **Signed** — part of the SubplebbitIpfs record
-   **Auto-generated** by the local subplebbit on each IPNS publish (not manually editable)
-   Computed from: `signer.address` (IPNS key) + `name` (if set) + the sub's configured `httpRoutersOptions`
-   **Size-capped at 4KB** — `encodeMagnetUri` always includes `publicKey` and `name` (if available), then includes `httpRouter` params in order until adding the next one would push the magnet string over 4KB. Keeping the magnetUri under ~1,000 bytes is recommended for QR code compatibility.

#### Why `magnetUri` is essential

**1. It's the only protocol-level way to share communities across clients.**

Without `magnetUri`:
- `name.eth` only works if the recipient has the right resolver
- `app.com/community/name.eth` locks you into one app's web interface
- `publicKey` alone doesn't tell you which httpRouters to query

`magnetUri` is the missing piece — a single string that works across all clients regardless of their resolver choices or default routers.

**2. OS protocol handlers enable universal deep linking.**

A `pkc://` URI is clickable from any app (chat, email, QR code) and routes directly to a registered pkc client — the same way `mailto:` opens email, `tg://` opens Telegram, or `spotify://` opens Spotify. This works via Android intent filters, iOS URL schemes, and desktop protocol handler registration.

`app.com/community/name.eth` only works in browsers pointed at that specific app.

**3. Self-contained discovery.**

The magnet includes `httpRouters`, which are required to fetch the IPNS record. Having the `publicKey` alone isn't enough — you need to know which routers to query. BitTorrent gets away with "just the hash" because there's a hardcoded list of ~20 popular trackers that all clients share. pkc doesn't have that ecosystem maturity yet.

**4. Performance benefit for multisubs.**

A multisub list with 100+ communities would be extremely slow to load if every entry required blockchain RPC resolution — RPCs throttle aggressively and each resolution is a separate network call. With magnet links, the client uses the `publicKey` + `httpRouter` params to fetch all 100+ IPNS records in parallel via HTTP routers, with zero blockchain involvement.

**Why `pkc://` instead of `pkc-magnet:`:**

We chose `pkc://` over `pkc-magnet:` because `pkc://` is a standard custom protocol scheme that operating systems recognize natively. The concept is inspired by BitTorrent magnet links (a self-contained discovery string), hence the field name `magnetUri`, but the URI scheme is `pkc://` for maximum compatibility with OS-level protocol handling.

#### Magnet URI size budget

A typical magnet URI breaks down as:

| Component | Example | Bytes |
| --------- | ------- | ----- |
| Scheme + publicKey param | `pkc://?publicKey=12D3KooWNMYbPn...` (52-char key) | ~63 |
| Name param | `&name=business-and-finance.eth` | ~30 |
| Each httpRouter param | `&httpRouter=https://peers.pleb.bot` | ~45-60 |

With a 600-byte QR code budget, after publicKey + name (~95 bytes), ~505 bytes remain — enough for **8-11 HTTP routers**. The 4KB hard cap is a safety net for extreme configurations.

### Discovery hierarchy

The identifiers form a hierarchy:

| Method      | Cross-client compatible | Human readable  | Needs external resolution |
| ----------- | ----------------------- | --------------- | ------------------------- |
| `magnetUri` | Yes — self-contained    | No              | No                        |
| `publicKey` | Yes — direct IPNS key   | No              | No                        |
| `name`      | No — resolver-dependent | Yes             | Yes (blockchain RPCs)     |
| `address`   | No — resolver-dependent | Yes (if domain) | Yes (if domain)           |

### Name verification

**Trust model:** `name` in SubplebbitIpfs (and in magnet links) is an **untrusted claim** by the sub owner. The sub owner's cryptographic signature only proves they _claim_ to own this name — it does not prove the name actually resolves to their public key on the blockchain. A malicious or misconfigured sub could claim any name. The only way to verify name ownership is to perform blockchain RPC resolution and check that the resolved IPNS key matches the subplebbit's `publicKey`.

**plebbit-js** should provide an on-demand method for name verification:

```ts
const result = await subplebbit.verifyName();
// result: VerifyNameResult
```

Where `VerifyNameResult` has three distinct states:

```ts
type VerifyNameResult =
    | { status: "verified"; publicKey: string; resolvedAt: number }    // Name resolved and matches subplebbit's publicKey
    | { status: "failed"; resolvedAt: number; error: Error }           // Name resolved but mismatched, or resolution errored
    | { status: "skipped"; reason: "no-resolver-available" }           // No resolver registered for this TLD — cannot check
```

-   **`verified`**: The name was resolved via blockchain RPC and the resolved IPNS key matches `subplebbit.publicKey`.
-   **`failed`**: Resolution was attempted but either errored or returned a public key that doesn't match.
-   **`skipped`**: The client has no resolver for this name's TLD. UIs should display the name with an "unverified" indicator rather than a "failed" warning.

**Important tradeoff:** When loading a community from a multisub (using publicKey + httpRouters) without having the matching resolver, the client can never verify that `sub.name` actually matches the publicKey. The name must be displayed as unverified.

### UI and client storage recommendations

**Displaying names:** Clients should call `subplebbit.verifyName()` and display the name with appropriate indicators:
- Verified: show name with checkmark or no indicator
- Skipped (no resolver): show name with "unverified" indicator
- Failed (wrong key): show warning, fall back to displaying `publicKey`

**Sharing communities:** The primary "share this community" action in UIs should output the `pkc://` magnet URI string. This is the only identifier guaranteed to work across all pkc-js clients regardless of which resolvers they ship. Domain names are useful for human communication ("check out memes.eth") but the magnet is the canonical portable identifier.

**Indexing by public key:** Clients should **index communities by `subplebbit.publicKey`** once available. The public key is the only truly stable, immutable identifier.

**Persisting magnets:** Clients should **persist `magnetUri` strings in storage** for every subscribed community. This way, even if all blockchain resolvers go down, the client can still reach communities.

**Keeping magnets fresh:** Clients should **update their stored `magnetUri` every time they receive a new subplebbit update**. The magnet in each update reflects the latest name and HTTP routers.

**Multisub integration:** Multisub lists (like [temporary-default-subplebbits](https://github.com/plebbit/temporary-default-subplebbits)) should include the `magnetUri` field per entry, giving clients a fully self-contained discovery string even if blockchain RPCs are unavailable.

### Community identity

The cryptographic key (IPNS public key) is the **permanent, canonical identity** of a community. Everything else — names, addresses, magnet links — are discovery mechanisms and human-readable aliases that point to this key.

**Key rotation is not supported.** If a sub owner loses their private key, the community is gone — analogous to losing a Bitcoin private key.

Names (ENS, DNS, `.sol`, etc.) are **human-readable aliases, not identity**. They can expire or be transferred. A name resolving to a different public key always means the name was lost or transferred — never that the community migrated to a new key.

Clients MUST index communities by public key, not by name or address.

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

## Implementation plan (plebbit-js)

### Allow loading by public key (`src/subplebbit/subplebbit-client-manager.ts`)

-   Relax the address check in `_findErrorInSubplebbitRecord()`: if the requested address is an IPNS key matching the record's signer, accept the record even if `subJson.address` is a domain.
-   Update existing tests that assert loading by IPNS key fails — they should now succeed.

### Schema changes (`src/subplebbit/schema.ts`)

-   **Keep** `address` in `SubplebbitIpfsSchema`
-   Add `name: z.string().min(1).optional()` to `SubplebbitIpfsSchema`
-   Add `magnetUri: z.string().max(4096).optional()` to `SubplebbitIpfsSchema`
-   Add `name: true` to `SubplebbitEditOptionsSchema` (editable by sub owner)
-   Do NOT add `magnetUri` to `SubplebbitEditOptionsSchema` (auto-generated, not user-editable)
-   Add validation: `address` must be `publicKey` or `name` (if set)

### Publication schema changes (`src/schema/schema.ts`)

-   Rename `subplebbitAddress` to `subplebbitPublicKey` in `CreatePublicationUserOptionsSchema`
-   All publication schemas inherit this rename automatically

### RemoteSubplebbit (`src/subplebbit/remote-subplebbit.ts`)

-   Add `name`, `magnetUri`, and `publicKey` property declarations
-   `publicKey` derived from `signature.publicKey` (Ed25519 → PeerId → base58) on first update
-   Assign `name` and `magnetUri` in `initRemoteSubplebbitPropsNoMerge()`
-   Add `verifyName()` method

### LocalSubplebbit (`src/runtime/node/subplebbit/local-subplebbit.ts`)

-   `publicKey` set immediately from `signer.address`
-   In IPNS record construction: add `name`, auto-generate `magnetUri` using `encodeMagnetUri()`
-   Add `name` editing support

### Database changes (`src/runtime/node/subplebbit/db-handler.ts`)

-   Migrate `subplebbitAddress` column to `subplebbitPublicKey` in publication tables using copy-to-new-table strategy
-   Bump DB version, add migration logic

### Magnet utilities (`src/magnet-uri.ts` — new file)

```ts
interface MagnetUriComponents {
    publicKey: string;
    name?: string;
    httpRouters: string[];
}

const MAGNET_URI_MAX_SIZE_BYTES = 4 * 1024; // 4KB

function encodeMagnetUri(components: MagnetUriComponents): string;
function decodeMagnetUri(magnetUri: string): MagnetUriComponents;
```

Exported at the top level via `src/index.ts`.

### Backward compatibility

-   **SubplebbitIpfs**: Non-breaking for old clients. `address` stays, new `name`/`magnetUri` fields are ignored by old clients using `.loose()` parsing.
-   **Publications**: Breaking change. Old clients will see `subplebbitPublicKey` instead of `subplebbitAddress`. This is a clean break — no backward compatibility shim.
