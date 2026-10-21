# Community Architecture

## Summary

A community has four class variants depending on who owns it and how it's accessed. `LocalCommunity` runs on Node.js and owns the IPNS key. `RemoteCommunity` subscribes to a community read-only. Two RPC variants let browser clients access communities through a WebSocket server.

## Class Hierarchy

| Class | File | Use Case |
|-------|------|----------|
| `RemoteCommunity` | `src/community/remote-community.ts` | Read-only subscriber: fetches CommunityIpfsType from IPNS |
| `RpcRemoteCommunity` | `src/community/rpc-remote-community.ts` | Browser reading a remote community via RPC server |
| `RpcLocalCommunity` | `src/community/rpc-local-community.ts` | Browser managing an owned community via RPC server |
| `LocalCommunity` | `src/runtime/node/community/local-community.ts` | **Node-only**: owns the IPNS key, manages DB, publishes updates |

### When Each Is Used

- **Node.js, own community**: `LocalCommunity`, can `start()`, publish IPNS, process challenges
- **Node.js, reading someone else's community**: `RemoteCommunity`, can `update()`, subscribe to changes
- **Browser via RPC, own community**: `RpcLocalCommunity`, delegates to RPC server's `LocalCommunity`
- **Browser via RPC, reading**: `RpcRemoteCommunity`, delegates to RPC server's `RemoteCommunity`

## CommunityIpfsType

The `CommunityIpfsType` record is what gets published to IPNS. It's the community's current state snapshot, signed by the community owner:

- `name`: optional domain name (wire field)
- `title`, `description`, `rules[]`: community metadata
- `roles`: `{ [authorAddress]: { role: "owner" | "admin" | "moderator" } }`
- `challenges[]`: configured challenge system
- `features`: feature flags (requirePostLink, noVideos, etc.)
- `suggested`: suggested client settings (primaryColor, language, uiType, etc.)
- `encryption`: public key for encrypted challenge exchanges
- `posts`: pre-loaded first pages + `pageCids` for pagination
- `stats`: hourly/daily/weekly/monthly/yearly/all-time post, reply, and active user counts
- `createdAt`, `updatedAt`, `protocolVersion`, `signature`

## State Machines

State types are defined in `src/community/types.ts`.

### CommunityState (main)
`"stopped"` | `"updating"` | `"started"`

### CommunityUpdatingState (during `update()`)
`"stopped"` → `"resolving-name"` → `"fetching-ipns"` → `"fetching-ipfs"` → `"succeeded"` / `"failed"` → `"waiting-retry"`

During `"fetching-ipns"` the IPNS name may resolve through a **delegated chain**
(`/ipns/anchor` → `/ipns/minter` → `/ipfs/cid`). The resolved chain is exposed as
`RemoteCommunity.ipnsHops`; identity stays the anchor (`ipnsHops[0]`) while the content is
verified against the terminal/minter name (`ipnsHops.at(-1)`). See
[delegated-ipns.md](delegated-ipns.md).

### CommunityStartedState (during `start()`, `LocalCommunity` only)
`"stopped"` → `"publishing-ipns"` → `"succeeded"` / `"failed"`

## LocalCommunity Internals

- **Database**: SQLite at `${dataPath}/communities/${address}`
- **Tables** (see `TABLES` in `src/runtime/node/community/db-handler.ts`): `comments`, `commentUpdates`, `votes`, `commentModerations`, `commentEdits`, `pseudonymityAliases`
- **IPNS Publishing**: Periodically publishes updated `CommunityIpfsType` to IPNS
- **Challenge Processing**: Receives encrypted challenge requests from pubsub, processes them
- **Page Generation**: Rebuilds sorted/paginated pages when comments change (`src/runtime/node/community/page-generator.ts`)

## Key Invariants

- `LocalCommunity` lives under `src/runtime/node/`, it **must not** be imported from browser code.
- Tests using `LocalCommunity` must be placed in `test/node/`, not `test/node-and-browser/`.
- `community.address` is immutable and runtime-only (see `wire-vs-runtime.md`).
- Internal state fields (prefixed with `_`) are never transmitted to RPC clients.

## Events

All community variants emit:
- `update`: new `CommunityIpfsType` received
- `statechange`, `updatingstatechange`: state transitions
- `error`: errors during update/start
- `challengerequest`, `challenge`, `challengeanswer`, `challengeverification`: challenge flow events (`LocalCommunity`/`RpcLocalCommunity`)
- `startedstatechange`: `LocalCommunity`/`RpcLocalCommunity` only

## RPC Connection Loss

The RPC server ties every subscription to one websocket connection and drops them all when it closes. It keeps no events for a disconnected client. `PKCRpcClient` hides this from the instances (#425):

- It retries the connection forever, with a backoff that doubles from 1s up to 30s, so a client survives a server restart or a laptop suspend.
- After each reconnect it re-issues every live subscription (`update()`, `start()`, `community.exports`, the communities and settings lists). The server sends its current snapshot on subscribe, so each instance returns to the latest state. The events that happened during the gap are not replayed one by one.
- `start()` is re-established with `startedCommunitySubscribe`, never `startCommunity`, so a reconnect never undoes a stop. If someone stopped the community on purpose, even while the client was away, the client gets `startedState: "stopped"` and does not try again. A community the server lost without a stop (a server restart) is started again.
- Instances keep the subscription id they got first. The client maps the server's new id back to it, so nothing outside `PKCRpcClient` sees the change.
- A publication in flight when the connection closes fails with `ERR_RPC_PUBLICATION_LOST_WITH_CONNECTION` and `publishingState: "failed"`. The server stopped it, and re-publishing automatically would start a challenge exchange the user never saw. Publish it again.
- `pkc.destroy()` closes the socket and cancels any pending reconnect attempt.

## Common Mistakes

- Importing `LocalCommunity` in browser-compatible code, it's Node-only.
- Using `getCommunity()` in tests instead of `createCommunity() + update()`, `getCommunity` does a one-shot fetch that fails randomly in CI.
- Confusing `CommunityIpfsType` (wire format, signed snapshot) with the `RemoteCommunity` class (runtime object with state tracking, events, clients).
