# Export Subplebbit Spec

## Public API
- `plebbit.exportSubplebbit({ address: string, exportPath: string }): Promise<SubplebbitExport>`
- If the subplebbit is local to this instance (non-RPC client), it writes the backup to `exportPath` and returns
  `{ exportId, timestamp, size, url }` where `url` is `file:///...`.

## RPC Client Behavior
- `rpcClientPlebbit.exportSubplebbit({ address, exportPath })` does NOT send `exportPath` to the server.
- It calls RPC `/exportSubplebbit` with `{ address }`.
- Server runs local `plebbit.exportSubplebbit` (using a server-chosen path), returns `{ exportId, timestamp, size }`.
- Client then calls `/exportSubplebbitDownloadSubscribe` with `{ address, exportId }` and streams bytes to the
  caller's `exportPath`.
- No progress events or progress fields anywhere.

## Data Model
- `SubplebbitExport` includes at least:
  - `exportId: string` (UUIDv4)
  - `timestamp: number` (seconds)
  - `size: number`
  - `url?: string`
- `subplebbit.exports` is stored in the internal subplebbit record in Keyv
  (`InternalSubplebbitRecordBeforeFirstUpdateType` and carried forward), not in the IPFS record.
- `subplebbit.exports` only contains completed exports (no progress).

## Limits
- Keep only the latest 5 exports per subplebbit (trim old entries when a new export completes).

## Out of Scope
- No extra endpoints or cleanup APIs beyond the above.
