# Proposal: `subplebbitIpfs.names` and `pkc-magnet:` link

## Problem

Currently, a subplebbit has a single `address` field that can be either a raw IPNS key (`12D3KooW...`) or a single domain name (`memes.eth`). This creates two problems:

### 1. Censorship vulnerability via blockchain RPC providers

If a community is known as `memes.eth`, users depend on Ethereum RPC providers to resolve that name to the underlying IPNS key. If those RPCs go down or decide to censor the resolution, the community becomes unreachable — there is no fallback.

With multiple names across different chains (e.g., `memes.eth`, `memes.sol`, `memes.bso`), it becomes nearly impossible for all blockchain RPC providers across all chains to coordinate censorship of the same community simultaneously.

### 2. Client interoperability

Different pkc-js clients may ship with different domain resolvers. One client might support `.eth` resolution but not `.sol`, while another supports `.sol` but not `.eth`. If a subplebbit only publishes a single name, clients without the matching resolver cannot find the community.

By publishing multiple names across different naming systems, communities can maximize their reachability across the diverse ecosystem of pkc-js clients and resolvers.

### Why `name` (singular) doesn't work

Domain resolution is being refactored out of plebbit-js into pkc-js clients (see [#68](https://github.com/plebbit/plebbit-js/issues/68)). plebbit-js will no longer be the one doing name resolution — it just carries the data. The protocol layer (plebbit-js / SubplebbitIpfs) needs to store **all** the names a community uses so that any client, with whatever resolvers it has available, can find the community. A singular `name` field would still leave communities dependent on a single chain and a single set of resolvers.

## Proposal

### 1. Add `subplebbitIpfs.names` field

Add an optional `names` field to the signed SubplebbitIpfs record:

```ts
names?: string[]  // e.g., ["memes.eth", "memes.sol", "memes.bso"]
```

-   **Simple string array** — the TLD implies which chain/resolver to use
-   **Optional** — backward compatible with existing records
-   **Signed** — part of the SubplebbitIpfs record, included in the subplebbit signature
-   **Editable** — sub owner sets it via `subplebbit.edit({ names: ["memes.eth", "memes.sol"] })`
-   **`address` unchanged** — can still be a domain or IPNS key, no breaking change

**Client-side resolution algorithm** (implemented in pkc-js, not plebbit-js):

1. Filter `names[]` to only names that the client's registered resolvers can handle
2. Try names in order (the order set by the sub owner determines priority)
3. Attempt to resolve each name to an IPNS key
4. If resolution fails or the resolved key doesn't match the subplebbit's public key, try the next name
5. If all names fail, fall back to the raw IPNS key if known

### 2. Add `subplebbitIpfs.pkcMagnet` field

Add an optional `pkcMagnet` field to SubplebbitIpfs — a single string that bundles everything needed to discover and connect to a community:

```
pkc-magnet:?publicKey=12D3KooWNMYbPn...&name=memes.eth&name=memes.sol&httpRouter=https://peers.pleb.bot&httpRouter=https://routing.lol&timestamp=1738700000
```

**Components:**

-   `publicKey` — the IPNS public key (the cryptographic identity of the subplebbit), matches `subplebbit.publicKey`
-   `name` (repeated) — human-readable names across different chains
-   `httpRouter` (repeated) — HTTP router URLs used to discover peers, matches `plebbitOptions.httpRouters`
-   `timestamp` — unix timestamp in seconds (same format as `subplebbit.updatedAt`), used by clients to determine freshness and keep the most recent magnet

**Properties:**

-   **Optional** in SubplebbitIpfs — backward compatible
-   **Signed** — part of the SubplebbitIpfs record
-   **Auto-generated** by the local subplebbit on each IPNS publish (not manually editable)
-   Computed from: `signer.address` (IPNS key) + `names` + the sub's configured `httpRoutersOptions`
-   **Size-capped at 40KB** — `encodePkcMagnet` always includes all `name` params, `publicKey`, and `timestamp`, but includes `httpRouter` params in order until adding the next one would push the magnet string over 40KB. Routers beyond the cap are silently dropped. The sub owner controls router priority via order. This ensures the magnet stays well within the 1MB `SubplebbitIpfs` size limit (`MAX_FILE_SIZE_BYTES_FOR_SUBPLEBBIT_IPFS = 1024 * 1024`) while leaving the vast majority of the budget for posts and other fields. In practice, magnets will be a few hundred bytes (3 names + 3 routers ≈ 350 bytes), so the 40KB cap is a safety net for extreme configurations.

**Why this is useful:**

Similar to BitTorrent magnet links, a single `pkc-magnet:` string is fully self-contained. If someone shares `pkc-magnet:?publicKey=12D3KooW...&name=memes.eth&httpRouter=https://peers.pleb.bot`, the recipient has everything needed to find the community — the cryptographic identity, human-readable names to display (though needs to be verified), and the HTTP routers to discover peers. No external dependencies required.

**Key insight:** If a client already has a `pkc-magnet:` string, it does **not** need to resolve any names — the IPNS public key is right there in the `publicKey` parameter. The client can go directly to the HTTP routers in the magnet to find peers and fetch the IPNS record. Name resolution is only needed when:

1. The user has a human-readable name but no magnet link (e.g., someone told them "check out memes.eth")
2. The stored magnet link is outdated (routers changed, etc.) and the client needs to re-discover via a name

**Performance benefit for multisubs:** A multisub list with 100+ communities would be extremely slow to load if every entry required blockchain RPC resolution — RPCs throttle aggressively and each resolution is a separate network call. With magnet links, the client uses the `publicKey` + `httpRouter` params to fetch all 100+ IPNS records in parallel via HTTP routers, with zero blockchain involvement. Name resolution can be deferred to when the user actually navigates to a specific community, turning 100+ blocking RPC calls into 0 on initial load.

#### Benchmark: real-world name resolution overhead

We benchmarked the name resolution phase in isolation using the actual [temporary-default-subplebbits](https://github.com/plebbit/temporary-default-subplebbits) multisub list (39 communities) and production plebbit-js, simulating a user opening seedit for the first time with no cache (`dataPath: undefined`). The benchmark measures only the `updatingState: "resolving-address"` phase — the time from when blockchain RPC resolution starts to when it completes and moves to `"fetching-ipns"`. Benchmark scripts are in `.temp/benchmark-multisub-resolve.mjs`.

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

Resolution timeline showing how rate limiting creates waves of delays:

```
0.6s   ███ .sol subs (3 subs — Solana resolves fastest)
1.1s   ██████████████ first batch of .eth subs (11 subs — viem resolves)
1.8s   █ second wave (1 sub — starting to see RPC delays)
2.3s   █ (1 sub)
4.9s   ██████ third wave (6 subs — 429 backoff delays kicking in)
6.0-6.7s ██████████████ final wave (14 subs — all stalled behind rate limits)
120s   ✗✗ 2 subs never resolved (bitcoinbrothers.eth, 💩posting.eth)
```

Key observations:

-   **Rate limiting creates visible "waves"** — the first ~14 subs resolve in ~1.1s, then RPC providers start throttling (429 Too Many Requests), and the remaining subs stall for 4-6s waiting through exponential backoff.
-   **Infura rate limit notice appeared** — the default ethers.js provider explicitly warned about exceeding the community API key rate limit, even with just 39 parallel requests.
-   **2 subs timed out entirely** at 120s — one had no text record, the other couldn't resolve at all. These block the UI for 2 minutes each.
-   With only 39 subs, the total wall time was 7.5s (for those that succeeded). **At 100+ subs, rate limiting would compound further** — RPC providers that throttle at ~15 concurrent requests would create waves of 6-10s backoff delays, easily pushing total resolution time to 30-60s+ before any IPNS fetching even begins.

**With pkcMagnet: all of the above becomes 0s.** The client skips blockchain RPC entirely and goes straight to IPNS fetching via the public key + HTTP routers embedded in the magnet link. No rate limits, no backoff delays, no timeouts from unresolvable domains.

#### Why not separate `names` + `publicKey` fields in multisubs? Why we need `pkcMagnet` specifically?

A multisub entry could include `names` and `publicKey` as separate JSON fields, letting clients skip blockchain resolution the same way. So why bundle everything into a magnet string?

1.  **HTTP routers are the critical missing piece** — having the `publicKey` alone isn't enough to fetch the IPNS record; the client also needs to know _which HTTP routers_ to query. Without routers, the client falls back to whatever defaults it has, which may not carry announcements for that subplebbit. So you'd need `publicKey` + `names` + `httpRouters` as separate fields — at which point you're reinventing the magnet as individual JSON fields.
2.  **Portability** — a magnet is a single self-contained string shareable in any context (chat message, QR code, tweet, URL). Separate JSON fields only work within structured multisub data.
3.  **Freshness via `timestamp`** — clients can compare two magnets for the same community and keep the more recent one. When routers of subplebbit change, the latest magnet reflects that.

### Discovery hierarchy

The three identifiers form a hierarchy of censorship resistance vs. human readability:

| Method      | Censorship resistance                                  | Human readable  | Needs external resolution |
| ----------- | ------------------------------------------------------ | --------------- | ------------------------- |
| `pkcMagnet` | Highest — self-contained, includes routers + publicKey | No              | No                        |
| `names`     | Medium — redundancy across chains                      | Yes             | Yes (blockchain RPCs)     |
| `address`   | Lowest — single name or raw key                        | Yes (if domain) | Yes (if domain)           |

### Name verification

A magnet link from an untrusted source (e.g., a third-party multisub) could claim names it doesn't own — for example, `pkc-magnet:?publicKey=EVIL_KEY&name=memes.eth` where the publicKey actually points to a malicious subplebbit. This is not a new attack surface (today's multisubs can already put any `address` next to any `title`), but magnets make it explicit and **verifiable**.

**plebbit-js** provides an on-demand method for name verification — hooks call it when the user navigates to a community, and consume the results:

```ts
const result = await subplebbit.verifyNames();
// result: { [name: string]: { publicKey: string, resolvedAt: number, error?: Error } }
// resolvedAt: unix timestamp in seconds of when the resolution was actually performed (not from cache)
```

The method:

1. Filters `names[]` to only names that the instance's registered resolvers can handle
2. Resolves each name via blockchain RPC
3. Checks that the resolved IPNS key matches the subplebbit's public key (`subplebbitIpfs.signature.publicKey`)
4. Returns a map of results per name — hooks use this to decide what to display and whether to warn the user

Hooks SHOULD call this lazily (when the user navigates to the community, not on initial load) and display a warning if no name resolved to the correct public key. This verification is cheap (a few RPC calls when the user actually visits) and provides a strong guarantee that the magnet's claimed names are legitimate.

### UI and client storage recommendations

**Displaying names:** Hooks should call `subplebbit.verifyNames()` and display **the single name that actually resolved to the correct public key**, not the entire `names[]` array. If multiple names resolve successfully, pick the first one. If none resolve, fall back to displaying the `address` or a shortened public key.

**Indexing by public key:** Hooks should **index communities by public key** (available via `subplebbit.publicKey` param in the magnet), not by name or address. Names can be added, removed, or transferred by the sub owner at any time. The public key is the only truly stable, immutable identifier — it's the cryptographic identity of the community. Indexing by public key ensures the hook never loses track of a community due to name changes.

**Persisting magnets:** UIs and hooks should **persist `pkcMagnet` strings in browser storage** for every subscribed community. This way, even if all blockchain resolvers go down, the client can still reach communities using the stored magnet links. The magnet link is the maximally censorship-resistant method of accessing a community, while `address` and `names` are the human-readable ways to share and discover communities.

**Keeping magnets fresh:** Hooks should **update their stored `pkcMagnet` every time they receive a new subplebbit update** (i.e., on every `update` event). Since the local subplebbit re-generates the magnet on each IPNS publish, the magnet in each update reflects the latest names and HTTP routers. By always persisting the freshest magnet, clients ensure they have up-to-date router URLs and name lists even if they go offline for an extended period.

**Multisub integration:** In the future, multisub lists (like [temporary-default-subplebbits](https://github.com/plebbit/temporary-default-subplebbits)) should include the `pkcMagnet` field per entry, giving clients a fully self-contained discovery string even if blockchain RPCs are unavailable.

## Open questions

-   **`verifyNames()` return type:** The exact shape of the `verifyNames()` return value needs refinement. The current sketch is `{ [name: string]: { publicKey: string, resolvedAt: number, error?: Error } }` — a map tracking the resolution result for each name attempted. `resolvedAt` is the timestamp (in seconds) of when the resolution was actually performed (not from cache), so hooks can decide which result is freshest. This lets hooks pick the first successfully verified name to display, while also giving visibility into which names failed and why. Should names that were skipped (no resolver available) be included in the map with a specific error? Should the method also return a convenience field like `verifiedName: string | undefined` for the first name that passed verification?

-   **No resolvers available:** If the client has no resolvers but has the public key (directly or via magnet), it should still load the community without attempting resolution — the UI should display a warning that `names` are unverified rather than blocking access. Not sure if the warning should be surfaced from pkc-js, I think the hooks should do it.

-   **Name ownership transfer:** If a sub owner loses control of one of their names (e.g., domain expires and someone else registers it), that name could start resolving to a different public key. Clients should disregard any name that resolves to a mismatched public key and move on to the next name. But what happens if **all** names resolve to wrong keys (or fail)? One option is to treat this as a critical error and refuse to load the community. Another option is to still allow access via the raw public key from the magnet but display a warning that no names could be verified. This needs further discussion.

## Prerequisite: allow loading subplebbits by public key

### Current behavior (blocker)

Today, `_findErrorInSubplebbitRecord()` in `src/subplebbit/subplebbit-client-manager.ts:615` does a strict string equality check:

```ts
if (subJson.address !== subInstanceAddress) {
    // ERR_THE_SUBPLEBBIT_IPNS_RECORD_POINTS_TO_DIFFERENT_ADDRESS_THAN_WE_EXPECTED
}
```

This means if you call `plebbit.getSubplebbit({ address: "12D3KooW..." })` but the fetched record has `address: "business-and-finance.eth"`, verification fails because `"12D3KooW..." !== "business-and-finance.eth"`. The error is marked **non-retriable** — the load stops permanently.

This is confirmed by existing tests (`test/node-and-browser/subplebbit/update.subplebbit.test.ts:108-126`) which explicitly assert that loading by IPNS key when the sub has a domain address throws `ERR_THE_SUBPLEBBIT_IPNS_RECORD_POINTS_TO_DIFFERENT_ADDRESS_THAN_WE_EXPECTED`.

**This blocks the core pkcMagnet optimization.** The whole point of magnet links is that clients can skip blockchain resolution and load directly via the public key + HTTP routers. But if the subplebbit has a domain address (which most will), loading by public key fails.

### Required change

The address check should accept the record if **either** condition is true:

1. `subJson.address === subInstanceAddress` (current behavior — exact match), **or**
2. The requested address is an IPNS key and it matches the IPNS name derived from the record's signature public key (i.e., the record is cryptographically signed by the same key we requested)

In other words: if I request by public key `12D3KooW...` and the record is signed by `12D3KooW...`, it doesn't matter that the record's `address` field says `"business-and-finance.eth"` — the cryptographic proof is sufficient. The signature verification (`verifySubplebbit`) already confirms the record was signed by the IPNS key holder.

```ts
// Proposed logic in _findErrorInSubplebbitRecord():
const subInstanceAddress = this._getSubplebbitAddressFromInstance();
if (subJson.address !== subInstanceAddress) {
    // Before erroring, check if the requested address is the IPNS key
    // and the record is signed by that same key (cryptographic proof)
    const requestedByIpnsKey = !isStringDomain(subInstanceAddress);
    const signedBySameKey = ipnsNameOfSub === subInstanceAddress;
    if (!(requestedByIpnsKey && signedBySameKey)) {
        // Genuinely mismatched — different subplebbit entirely
        return new PlebbitError("ERR_THE_SUBPLEBBIT_IPNS_RECORD_POINTS_TO_DIFFERENT_ADDRESS_THAN_WE_EXPECTED", { ... });
    }
    // else: the record's domain address differs from the requested IPNS key,
    // but the signature proves it's the same subplebbit — allow it
}
```

### What this enables

Once this change is in place:

-   `plebbit.getSubplebbit({ address: "12D3KooW..." })` works even when the sub's address is `"business-and-finance.eth"`
-   Clients with a pkcMagnet can load any community directly by public key — **zero blockchain calls**
-   The existing `.eth` path continues to work exactly as before (domain → resolve → fetch)
-   Security is preserved: the signature check (`verifySubplebbit`) still runs and confirms the record is authentic

## Implementation plan (plebbit-js)

### Allow loading by public key (`src/subplebbit/subplebbit-client-manager.ts`)

-   Relax the address check in `_findErrorInSubplebbitRecord()` to accept records where the requested address is an IPNS key matching the record's signer, even if `subJson.address` is a domain
-   Update the existing test in `test/node-and-browser/subplebbit/update.subplebbit.test.ts` that asserts loading by IPNS key fails — it should now succeed
-   Add new test: loading by IPNS key when the sub has a domain address returns the subplebbit with the domain address preserved

### Schema changes (`src/subplebbit/schema.ts`)

-   Add `SubplebbitNameSchema` — validates strings contain a dot (domain format)
-   Add `names: SubplebbitNameSchema.array().optional()` to `SubplebbitIpfsSchema`
-   Add `pkcMagnet: z.string().min(1).optional()` to `SubplebbitIpfsSchema`
-   Add `names: true` to `SubplebbitEditOptionsSchema` (editable by sub owner)
-   Do NOT add `pkcMagnet` to `SubplebbitEditOptionsSchema` (auto-generated, not user-editable)
-   `SubplebbitSignedPropertyNames` auto-updates (derived from schema keys)
-   All derived types (`SubplebbitIpfsType`, `SubplebbitEditOptions`, etc.) auto-update via `z.infer<>`

### RemoteSubplebbit (`src/subplebbit/remote-subplebbit.ts`)

-   Add `names` and `pkcMagnet` property declarations
-   Assign them in `initRemoteSubplebbitPropsNoMerge()`

### LocalSubplebbit auto-generation (`src/runtime/node/subplebbit/local-subplebbit.ts`)

In `updateSubplebbitIpnsIfNeeded()`, before signing the new SubplebbitIpfs record:

-   Compute `pkcMagnet` from `signer.address` + current `names` + `this._plebbit.httpRoutersOptions` + `updatedAt` timestamp
-   Include it in the record so it gets signed

### Magnet utilities (`src/pkc-magnet.ts` — new file)

```ts
interface PkcMagnetComponents {
    publicKey: string; // IPNS public key (matches subplebbit.publicKey)
    names: string[]; // human-readable domain names (matches subplebbit.anmes)
    httpRouters: string[]; // HTTP router URLs (matches plebbitOptions.httpRouters)
    timestamp: number; // unix timestamp in seconds (matches subplebbit.updatedAt)
}

const PKC_MAGNET_MAX_SIZE_BYTES = 40 * 1024; // 40KB

function encodePkcMagnet(components: PkcMagnetComponents): string;
// Always includes publicKey, timestamp, and all names.
// Includes httpRouters in order until adding the next one would exceed PKC_MAGNET_MAX_SIZE_BYTES.
// Routers beyond the cap are silently dropped.

function decodePkcMagnet(magnetLink: string): PkcMagnetComponents;
```

Exported at the top level via `src/index.ts` and attached to the `Plebbit` function object (`Plebbit.encodePkcMagnet`, `Plebbit.decodePkcMagnet`).

### Backward compatibility

-   Records without `names` or `pkcMagnet` parse fine (both fields are optional)
-   Old clients receiving new records with these fields use `.loose()` parsing which ignores unknown fields
-   Signature verification uses the record's own `signedPropertyNames`, so old and new records coexist
