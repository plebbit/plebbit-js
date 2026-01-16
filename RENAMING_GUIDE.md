# PKC-JS Renaming Guide

This document provides a comprehensive checklist for renaming the plebbit-js codebase:
- **plebbit** → **pkc**
- **subplebbit** → **community**

## Summary Statistics

- **Total "plebbit" occurrences:** ~12,729 across 318 files
- **Total "subplebbit" occurrences:** ~6,462 across 247 files
- **Source files:** 142 TypeScript/JavaScript files in src/
- **Test files:** 166 test files
- **Build output files:** 815 files in dist/

---

## Phase 1: Package Configuration & Project Files

### 1.1 Package Identity
- [ ] **package.json** - Rename package
  - `"name": "@plebbit/plebbit-js"` → `"name": "@pkc/pkc-js"`
  - Update `"repository"` URL if moving to new GitHub org
  - Update `"bugs"` URL
  - Update `"homepage"` URL
  - Update keywords: `"plebbit"`, `"plebbit-js"` → `"pkc"`, `"pkc-js"`
  - Update description

- [ ] **rpc/package.json** - Rename RPC package
  - `"name": "@plebbit/plebbit-js-rpc"` → `"name": "@pkc/pkc-js-rpc"`
  - Update repository URLs

### 1.2 External Dependencies (Document for Later)
The following dependencies are in the @plebbit namespace and need separate repository work:
- [ ] `@plebbit/plebbit-logger` - Note: Requires separate repo rename
- [ ] `@plebbit/proper-lockfile` - Note: Requires separate repo rename

### 1.3 Root Files
- [ ] **README.md** - Complete rewrite
  - Replace all "plebbit" → "pkc" (case-sensitive variations)
  - Replace all "subplebbit" → "community"
  - Replace all "Subplebbit" → "Community"
  - Update GitHub URLs if moving repos

- [ ] **CLAUDE.md** / **AGENTS.md** - Update references

- [ ] **project.json** - Update project metadata

---

## Phase 2: Directory Structure Renaming

### 2.1 Source Directories
- [ ] `src/plebbit/` → `src/pkc/`
- [ ] `src/subplebbit/` → `src/community/`
- [ ] `src/publications/subplebbit-edit/` → `src/publications/community-edit/`
- [ ] `src/runtime/node/subplebbit/` → `src/runtime/node/community/`
- [ ] `src/runtime/browser/subplebbit/` → `src/runtime/browser/community/`
- [ ] `src/rpc/src/lib/plebbit-js/` → `src/rpc/src/lib/pkc-js/`
- [ ] `src/runtime/node/subplebbit/challenges/plebbit-js-challenges/` → `src/runtime/node/community/challenges/pkc-js-challenges/`

### 2.2 Test Directories
- [ ] `test/node/subplebbit/` → `test/node/community/`
- [ ] `test/node-and-browser/subplebbit/` → `test/node-and-browser/community/`
- [ ] `test/fixtures/signatures/subplebbit/` → `test/fixtures/signatures/community/`

### 2.3 Data Storage Directories (Breaking Change)
- [ ] Default data path changes: `subplebbits/` → `communities/`
- [ ] Note: Migration code for old paths should be implemented in user-facing clients (plebbit-cli, desktop apps), NOT in pkc-js itself

---

## Phase 3: Source File Renaming

### 3.1 Plebbit → PKC Files
- [ ] `src/plebbit/plebbit.ts` → `src/pkc/pkc.ts`
- [ ] `src/plebbit/plebbit-with-rpc-client.ts` → `src/pkc/pkc-with-rpc-client.ts`
- [ ] `src/plebbit/plebbit-client-manager.ts` → `src/pkc/pkc-client-manager.ts`
- [ ] `src/plebbit/plebbit-clients.ts` → `src/pkc/pkc-clients.ts`
- [ ] `src/clients/rpc-client/plebbit-rpc-client.ts` → `src/clients/rpc-client/pkc-rpc-client.ts`
- [ ] `src/clients/plebbit-typed-emitter.ts` → `src/clients/pkc-typed-emitter.ts`
- [ ] `src/plebbit-error.ts` → `src/pkc-error.ts`
- [ ] `src/helia/helia-for-plebbit.ts` → `src/helia/helia-for-pkc.ts`
- [ ] `src/rpc/src/lib/plebbit-js/plebbit-js-mock.ts` → `src/rpc/src/lib/pkc-js/pkc-js-mock.ts`

### 3.2 Subplebbit → Community Files
- [ ] `src/subplebbit/remote-subplebbit.ts` → `src/community/remote-community.ts`
- [ ] `src/subplebbit/rpc-remote-subplebbit.ts` → `src/community/rpc-remote-community.ts`
- [ ] `src/subplebbit/rpc-local-subplebbit.ts` → `src/community/rpc-local-community.ts`
- [ ] `src/subplebbit/subplebbit-clients.ts` → `src/community/community-clients.ts`
- [ ] `src/subplebbit/subplebbit-client-manager.ts` → `src/community/community-client-manager.ts`
- [ ] `src/publications/subplebbit-edit/subplebbit-edit.ts` → `src/publications/community-edit/community-edit.ts`
- [ ] `src/runtime/node/subplebbit/local-subplebbit.ts` → `src/runtime/node/community/local-community.ts`
- [ ] `src/runtime/node/subplebbit/db-handler.ts` → `src/runtime/node/community/db-handler.ts`
- [ ] `src/runtime/node/subplebbit/page-generator.ts` → `src/runtime/node/community/page-generator.ts`
- [ ] `src/runtime/browser/subplebbit/local-subplebbit.ts` → `src/runtime/browser/community/local-community.ts`

### 3.3 Test File Renaming
All test files in test/node/subplebbit/ and test/node-and-browser/subplebbit/:
- [ ] `*.subplebbit.test.js` → `*.community.test.js`

---

## Phase 4: Class, Type & Interface Renaming

### 4.1 Main Classes (src/plebbit/ → src/pkc/)
- [ ] `class Plebbit` → `class PKC`
- [ ] `class PlebbitWithRpcClient` → `class PKCWithRpcClient`
- [ ] `class PlebbitRpcClient` → `class PKCRpcClient`
- [ ] `class PlebbitTypedEmitter` → `class PKCTypedEmitter`
- [ ] `class PlebbitClientsManager` → `class PKCClientsManager`
- [ ] `class PlebbitError` → `class PKCError`
- [ ] `class PlebbitIpfsGatewayClient` → `class PKCIpfsGatewayClient`
- [ ] `class PlebbitKuboRpcClient` → `class PKCKuboRpcClient`
- [ ] `class PlebbitLibp2pJsClient` → `class PKCLibp2pJsClient`

### 4.2 Subplebbit Classes (src/subplebbit/ → src/community/)
- [ ] `class RemoteSubplebbit` → `class RemoteCommunity`
- [ ] `class RpcRemoteSubplebbit` → `class RpcRemoteCommunity`
- [ ] `class RpcLocalSubplebbit` → `class RpcLocalCommunity`
- [ ] `class LocalSubplebbit` → `class LocalCommunity`
- [ ] `class SubplebbitClientsManager` → `class CommunityClientsManager`
- [ ] `class SubplebbitKuboPubsubClient` → `class CommunityKuboPubsubClient`
- [ ] `class SubplebbitKuboRpcClient` → `class CommunityKuboRpcClient`
- [ ] `class SubplebbitPlebbitRpcStateClient` → `class CommunityPKCRpcStateClient`
- [ ] `class SubplebbitLibp2pJsClient` → `class CommunityLibp2pJsClient`
- [ ] `class SubplebbitIpfsGatewayClient` → `class CommunityIpfsGatewayClient`
- [ ] `class SubplebbitEdit` → `class CommunityEdit`

### 4.3 Type Definitions (src/types.ts, src/subplebbit/types.ts)
**Plebbit types:**
- [ ] `interface PlebbitEvents` → `interface PKCEvents`
- [ ] `interface PlebbitRpcClientEvents` → `interface PKCRpcClientEvents`
- [ ] `interface ParsedPlebbitOptions` → `interface ParsedPKCOptions`
- [ ] `type InputPlebbitOptions` → `type InputPKCOptions`
- [ ] `type PlebbitMemCaches` → `type PKCMemCaches`
- [ ] `interface PlebbitIpnsGetOptions` → `interface PKCIpnsGetOptions`
- [ ] `interface PlebbitWsServerClassOptions` → `interface PKCWsServerClassOptions`
- [ ] `type PlebbitWsServerSettingsSerialized` → `type PKCWsServerSettingsSerialized`
- [ ] `type PlebbitRpcServerEvents` → `type PKCRpcServerEvents`
- [ ] `type PlebbitRecordToVerify` → `type PKCRecordToVerify`

**Subplebbit types:**
- [ ] `type SubplebbitStats` → `type CommunityStats`
- [ ] `type SubplebbitFeatures` → `type CommunityFeatures`
- [ ] `type SubplebbitSuggested` → `type CommunitySuggested`
- [ ] `type SubplebbitEncryption` → `type CommunityEncryption`
- [ ] `type SubplebbitRole` → `type CommunityRole`
- [ ] `type SubplebbitRoleNameUnion` → `type CommunityRoleNameUnion`
- [ ] `type SubplebbitIpfsType` → `type CommunityIpfsType`
- [ ] `interface SubplebbitSignature` → `interface CommunitySignature`
- [ ] `type SubplebbitChallenge` → `type CommunityChallenge`
- [ ] `type SubplebbitChallengeSetting` → `type CommunityChallengeSetting`
- [ ] `type SubplebbitSettings` → `type CommunitySettings`
- [ ] `type SubplebbitState` → `type CommunityState`
- [ ] `type SubplebbitStartedState` → `type CommunityStartedState`
- [ ] `type SubplebbitUpdatingState` → `type CommunityUpdatingState`
- [ ] `type SubplebbitJson` → `type CommunityJson`
- [ ] `interface SubplebbitEvents` → `interface CommunityEvents`
- [ ] `type RemoteSubplebbitJson` → `type RemoteCommunityJson`
- [ ] `type RpcRemoteSubplebbitJson` → `type RpcRemoteCommunityJson`
- [ ] `type RpcLocalSubplebbitJson` → `type RpcLocalCommunityJson`
- [ ] `type LocalSubplebbitJson` → `type LocalCommunityJson`
- [ ] `type CreateRemoteSubplebbitOptions` → `type CreateRemoteCommunityOptions`
- [ ] `type CreateNewLocalSubplebbitUserOptions` → `type CreateNewLocalCommunityUserOptions`
- [ ] `type CreateNewLocalSubplebbitParsedOptions` → `type CreateNewLocalCommunityParsedOptions`
- [ ] `type SubplebbitEditOptions` → `type CommunityEditOptions`
- [ ] `type ParsedSubplebbitEditOptions` → `type ParsedCommunityEditOptions`
- [ ] All `*WithSubplebbitAuthor` types → `*WithCommunityAuthor`

---

## Phase 5: Schema Renaming (Zod)

### 5.1 Main Schemas (src/schema.ts)
- [ ] `PlebbitUserOptionBaseSchema` → `PKCUserOptionBaseSchema`
- [ ] `PlebbitUserOptionsSchema` → `PKCUserOptionsSchema`
- [ ] `PlebbitParsedOptionsSchema` → `PKCParsedOptionsSchema`
- [ ] Property: `plebbitRpcClientsOptions` → `pkcRpcClientsOptions`

### 5.2 Subplebbit Schemas (src/subplebbit/schema.ts)
- [ ] `SubplebbitEncryptionSchema` → `CommunityEncryptionSchema`
- [ ] `SubplebbitRoleSchema` → `CommunityRoleSchema`
- [ ] `SubplebbitRoleNames` → `CommunityRoleNames`
- [ ] `SubplebbitSuggestedSchema` → `CommunitySuggestedSchema`
- [ ] `SubplebbitFeaturesSchema` → `CommunityFeaturesSchema`
- [ ] `SubplebbitChallengeSettingSchema` → `CommunityChallengeSettingSchema`
- [ ] `SubplebbitChallengeSchema` → `CommunityChallengeSchema`
- [ ] `SubplebbitIpfsSchema` → `CommunityIpfsSchema`
- [ ] `SubplebbitSignedPropertyNames` → `CommunitySignedPropertyNames`
- [ ] `SubplebbitSignatureSchema` → `CommunitySignatureSchema`
- [ ] `CreateRemoteSubplebbitOptionsSchema` → `CreateRemoteCommunityOptionsSchema`
- [ ] `SubplebbitSettingsSchema` → `CommunitySettingsSchema`
- [ ] `SubplebbitEditOptionsSchema` → `CommunityEditOptionsSchema`
- [ ] `SubplebbitEditPublicationChallengeRequestToEncryptSchema` → `CommunityEditPublicationChallengeRequestToEncryptSchema`
- [ ] `CreateRemoteSubplebbitFunctionArgumentSchema` → `CreateRemoteCommunityFunctionArgumentSchema`
- [ ] `CreateNewLocalSubplebbitUserOptionsSchema` → `CreateNewLocalCommunityUserOptionsSchema`
- [ ] `CreateNewLocalSubplebbitParsedOptionsSchema` → `CreateNewLocalCommunityParsedOptionsSchema`
- [ ] `ChallengeExcludeSubplebbitSchema` → `ChallengeExcludeCommunitySchema`
- [ ] `RpcRemoteSubplebbitUpdateEventResultSchema` → `RpcRemoteCommunityUpdateEventResultSchema`

### 5.3 Schema Parser Functions (src/schema/schema-util.ts)
- [ ] All `parse*PlebbitErrorIfItFails` → `parse*PKCErrorIfItFails`
- [ ] All `parse*SubplebbitSchemaWithPlebbitErrorIfItFails` → `parse*CommunitySchemaWithPKCErrorIfItFails`

---

## Phase 6: API Method & Property Renaming

### 6.1 Plebbit/PKC Class Methods
- [ ] `plebbit.createSubplebbit()` → `pkc.createCommunity()`
- [ ] `plebbit.getSubplebbit()` → `pkc.getCommunity()`
- [ ] `plebbit.listSubplebbits()` → `pkc.listCommunities()`

### 6.2 Plebbit/PKC Class Properties
- [ ] `plebbit.subplebbits` → `pkc.communities`
- [ ] `plebbit._updatingSubplebbits` → `pkc._updatingCommunities`
- [ ] `plebbit._startedSubplebbits` → `pkc._startedCommunities`
- [ ] `plebbit._subplebbitFsWatchAbort` → `pkc._communityFsWatchAbort`
- [ ] `plebbit.plebbitRpcClientsOptions` → `pkc.pkcRpcClientsOptions`
- [ ] `plebbit._plebbitRpcClient` → `pkc._pkcRpcClient`
- [ ] `plebbit._userPlebbitOptions` → `pkc._userPKCOptions`
- [ ] `plebbit._memCaches` (type change to PKCMemCaches)
- [ ] `plebbit.clients.plebbitRpcClients` → `pkc.clients.pkcRpcClients`

### 6.3 Publication Properties
- [ ] `publication.subplebbitAddress` → `publication.communityAddress`
- [ ] `comment.subplebbitAddress` → `comment.communityAddress`
- [ ] `vote.subplebbitAddress` → `vote.communityAddress`
- [ ] `commentEdit.subplebbitAddress` → `commentEdit.communityAddress`
- [ ] `commentModeration.subplebbitAddress` → `commentModeration.communityAddress`
- [ ] `publication.shortSubplebbitAddress` → `publication.shortCommunityAddress`

### 6.4 Timeout Keys (src/plebbit/plebbit.ts)
- [ ] `"subplebbit-ipns"` → `"community-ipns"`
- [ ] `"subplebbit-ipfs"` → `"community-ipfs"`

### 6.5 State Machine States (Public API - affects downstream consumers)
State strings emitted via `statechange` and `publishingstatechange` events:
- [ ] `"resolving-subplebbit-address"` → `"resolving-community-address"` (src/publications/types.ts, src/publications/comment/types.ts)
- [ ] `"fetching-subplebbit-ipns"` → `"fetching-community-ipns"`
- [ ] `"fetching-subplebbit-ipfs"` → `"fetching-community-ipfs"`
- [ ] Chain provider state: `"resolving-subplebbit-address"` → `"resolving-community-address"` (src/clients/chain-provider-client.ts)

---

## Phase 7: RPC Method Renaming

### 7.1 RPC Server Methods (src/rpc/src/index.ts)
- [ ] `getSubplebbitPage` → `getCommunityPage`
- [ ] `createSubplebbit` → `createCommunity`
- [ ] `startSubplebbit` → `startCommunity`
- [ ] `stopSubplebbit` → `stopCommunity`
- [ ] `editSubplebbit` → `editCommunity`
- [ ] `deleteSubplebbit` → `deleteCommunity`
- [ ] `subplebbitsSubscribe` → `communitiesSubscribe`
- [ ] `subplebbitUpdateSubscribe` → `communityUpdateSubscribe`
- [ ] `publishSubplebbitEdit` → `publishCommunityEdit`

### 7.2 RPC Event Names
- [ ] `"subplebbitschange"` → `"communitieschange"`
- [ ] `"subplebbitUpdateNotification"` → `"communityUpdateNotification"`
- [ ] `"subplebbitsNotification"` → `"communitiesNotification"`

### 7.3 RPC Parameter Names (Wire Protocol)
- [ ] `RpcSubplebbitPageParamSchema.subplebbitAddress` → `communityAddress` (src/clients/rpc-client/schema.ts)
- [ ] `getSubplebbitPage` params: `{ subplebbitAddress }` → `{ communityAddress }` (src/rpc/src/index.ts)
- [ ] `getCommentPage` params: `{ subplebbitAddress }` → `{ communityAddress }` (src/rpc/src/index.ts)

---

## Phase 8: DNS & Protocol Changes (Breaking)

### 8.1 DNS TXT Record Names
- [ ] `"plebbit-author-address"` → `"pkc-author-address"` (src/clients/base-client-manager.ts)
- [ ] `"subplebbit-address"` → `"pkc-community-address"`

### 8.2 Migration TODO
- [ ] **IMPORTANT:** Need to migrate existing DNS TXT records from old names to new names
- [ ] Document migration process for users with existing records
- [ ] Consider supporting both old and new record names during transition period

### 8.3 Storage Cache Keys
Domain resolution cache keys (minor - invalidating just causes re-resolution):
- [ ] `${domainAddress}_subplebbit-address` → `${domainAddress}_community-address` (src/clients/base-client-manager.ts:637)
- [ ] Note: Changing this will invalidate existing caches, causing one-time re-resolution

---

## Phase 9: Error Messages & Logging

### 9.1 Error Classes (src/plebbit-error.ts → src/pkc-error.ts)
- [ ] `PlebbitError` → `PKCError`
- [ ] `FailedToFetchSubplebbitFromGatewaysError` → `FailedToFetchCommunityFromGatewaysError`
- [ ] `FailedToFetchCommentIpfsFromGatewaysError` (keep as is - comment not subplebbit)
- [ ] `FailedToFetchCommentUpdateFromGatewaysError` (keep as is)
- [ ] `FailedToFetchPageIpfsFromGatewaysError` (keep as is)
- [ ] `FailedToFetchGenericIpfsFromGatewaysError` (keep as is)

### 9.2 Error Codes (src/errors.ts) - ~45+ error codes
Replace all error codes containing "SUBPLEBBIT" with "COMMUNITY":
- [ ] `ERR_SUBPLEBBIT_MISSING_FIELD` → `ERR_COMMUNITY_MISSING_FIELD`
- [ ] `ERR_SUBPLEBBIT_OPTIONS_MISSING_ADDRESS` → `ERR_COMMUNITY_OPTIONS_MISSING_ADDRESS`
- [ ] `ERR_INVALID_SUBPLEBBIT_ADDRESS_SCHEMA` → `ERR_INVALID_COMMUNITY_ADDRESS_SCHEMA`
- [ ] `ERR_GET_SUBPLEBBIT_TIMED_OUT` → `ERR_GET_COMMUNITY_TIMED_OUT`
- [ ] `ERR_CALLED_SUBPLEBBIT_STOP_WITHOUT_UPDATE` → `ERR_CALLED_COMMUNITY_STOP_WITHOUT_UPDATE`
- [ ] `ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS` → `ERR_FAILED_TO_FETCH_COMMUNITY_FROM_GATEWAYS`
- [ ] ... (all other ERR_*SUBPLEBBIT* → ERR_*COMMUNITY*)
- [ ] ... (all ERR_*PLEBBIT* → ERR_*PKC*)

### 9.3 Logger Prefixes
Replace all logger prefixes:
- [ ] `Logger("plebbit-js:...")` → `Logger("pkc-js:...")`
- [ ] Examples:
  - `"plebbit-js:PlebbitRpcClient"` → `"pkc-js:PKCRpcClient"`
  - `"plebbit-js:plebbit:client-manager"` → `"pkc-js:pkc:client-manager"`
  - `"plebbit-js:listSubplebbitsSync"` → `"pkc-js:listCommunitiesSync"`

---

## Phase 10: Signer & Signature Functions

### 10.1 Function Names (src/signer/signatures.ts)
- [ ] `signSubplebbitEdit` → `signCommunityEdit`
- [ ] `verifySubplebbitEdit` → `verifyCommunityEdit`
- [ ] `verifySubplebbit` → `verifyCommunity`
- [ ] `signSubplebbit` → `signCommunity`

### 10.2 Type Parameters
- [ ] All function parameters with `plebbit: Plebbit` → `pkc: PKC`
- [ ] All `subplebbit` parameters → `community`

---

## Phase 11: Test Files

### 11.1 Test File Renaming
Rename all test files with "subplebbit" in the name (48 files total):

**test/node/subplebbit/**
- [ ] `create.subplebbit.test.js` → `create.community.test.js`
- [ ] `delete.subplebbit.test.js` → `delete.community.test.js`
- [ ] `edit.subplebbit.test.js` → `edit.community.test.js`
- [ ] `start.subplebbit.test.js` → `start.community.test.js`
- [ ] `state.subplebbit.test.js` → `state.community.test.js`
- [ ] `update.subplebbit.test.js` → `update.community.test.js`
- [ ] `editable.subplebbit.test.js` → `editable.community.test.js`
- [ ] `error.start.subplebbit.test.js` → `error.start.community.test.js`
- [ ] `local.publishing.subplebbit.test.js` → `local.publishing.community.test.js`
- [ ] `misc.subplebbit.test.js` → `misc.community.test.js`
- [ ] `updateCid.subplebbit.test.js` → `updateCid.community.test.js`
- [ ] `unique.migration.db.subplebbit.test.js` → `unique.migration.db.community.test.js`
- [ ] `db.subplebbit.test.js` → `db.community.test.js`
- [ ] `commentsToUpdate.db.subplebbit.test.js` → `commentsToUpdate.db.community.test.js`
- [ ] `parsing.db.subplebbit.test.js` → `parsing.db.community.test.js`
- [ ] `startedState.subplebbit.test.js` → `startedState.community.test.js`
- [ ] `stats.subplebbit.test.js` → `stats.community.test.js`
- [ ] `updatingstate.subplebbit.test.js` → `updatingstate.community.test.js`
- [ ] `republishing.subplebbit.test.js` → `republishing.community.test.js`
- [ ] `postUpdates.subplebbit.test.js` → `postUpdates.community.test.js`
- [ ] `gateway.loading.subplebbit.test.js` → `gateway.loading.community.test.js`
- [ ] `commentUpdate.fields.db.subplebbit.test.js` → `commentUpdate.fields.db.community.test.js`
- [ ] `unique.publishing.subplebbit.test.js` → `unique.publishing.community.test.js`
- [ ] `garbage.collection.subplebbit.test.js` → `garbage.collection.community.test.js`

**test/node/subplebbit/ipns/**
- [ ] `resolve.ipns.subplebbit.test.js` → `resolve.ipns.community.test.js`

**test/node/subplebbit/modqueue/**
- [ ] `modqueue.subplebbit.test.js` → `modqueue.community.test.js`
- [ ] `purge.expire.rejection.modqueue.subplebbit.test.js` → `purge.expire.rejection.modqueue.community.test.js`
- [ ] `approved.modqueue.subplebbit.test.js` → `approved.modqueue.community.test.js`
- [ ] `limit.modqueue.subplebbit.test.js` → `limit.modqueue.community.test.js`
- [ ] `page.modqueue.subplebbit.test.js` → `page.modqueue.community.test.js`
- [ ] `pendingapproval.modqueue.subplebbit.test.js` → `pendingapproval.modqueue.community.test.js`
- [ ] `rejection.modqueue.subplebbit.test.js` → `rejection.modqueue.community.test.js`

**test/node/subplebbit/page-generation/**
- [ ] `chunking.page.generation.subplebbit.test.js` → `chunking.page.generation.community.test.js`
- [ ] `edgecases.page.generation.subplebbit.test.js` → `edgecases.page.generation.community.test.js`

**test/node/subplebbit/features/**
- [ ] `features.subplebbit.test.js` → `features.community.test.js`
- [ ] `per-post.pseudonymityMode.subplebbit.features.test.js` → `per-post.pseudonymityMode.community.features.test.js`
- [ ] `per-reply.pseudonymityMode.subplebbit.features.test.js` → `per-reply.pseudonymityMode.community.features.test.js`
- [ ] `per-author.pseudonymityMode.subplebbit.features.test.js` → `per-author.pseudonymityMode.community.features.test.js`

**test/node/plebbit/**
- [ ] `started-subplebbits.test.js` → `started-communities.test.js`

**test/node-and-browser/subplebbit/**
- [ ] `state.subplebbit.test.js` → `state.community.test.js`
- [ ] `backward.compatibility.subplebbit.test.js` → `backward.compatibility.community.test.js`
- [ ] `updateCid.subplebbit.test.js` → `updateCid.community.test.js`
- [ ] `getsubplebbit.plebbit.test.js` → `getcommunity.pkc.test.js`
- [ ] `createsubplebbit.plebbit.test.js` → `createcommunity.pkc.test.js`
- [ ] `update.subplebbit.test.js` → `update.community.test.js`

**test/node-and-browser/subplebbit/ipns/**
- [ ] `ipns.fields.subplebbit.test.js` → `ipns.fields.community.test.js`

**test/node-and-browser/signatures/**
- [ ] `subplebbit.test.js` → `community.test.js`

**test/node-and-browser/publications/subplebbit-edit/**
- [ ] `subplebbit.edit.publication.test.js` → `community.edit.publication.test.js`

### 11.2 Test Content Updates
- [ ] Update all test imports to use new module paths
- [ ] Update all test assertions referencing old names
- [ ] Update fixture references

### 11.3 Test Fixtures (test/fixtures/)
- [ ] `test/fixtures/signatures/subplebbit/` → `test/fixtures/signatures/community/`
- [ ] Update JSON fixture files:
  - `valid_subplebbit_ipfs.json` → `valid_community_ipfs.json`
  - `valid_subplebbit_jsonfied.json` → `valid_community_jsonfied.json`
  - Update content within fixtures to use new property names

### 11.4 Test Configuration
- [ ] `test/run-test-config.js` - Update PLEBBIT_CONFIGS → PKC_CONFIGS
- [ ] Update environment variable references

---

## Phase 12: Documentation

### 12.1 docs/ Directory
Update all documentation files:
- [ ] `docs/addresses.md`
- [ ] `docs/building.md`
- [ ] `docs/clients.md`
- [ ] `docs/cross-platform-native-functions.md`
- [ ] `docs/encryption.md`
- [ ] `docs/ens.md`
- [ ] `docs/nft.md`
- [ ] `docs/signatures.md`
- [ ] `docs/testing.md`
- [ ] `docs/verifying-publications.md`

### 12.2 RPC Documentation
- [ ] `src/rpc/README.md`
- [ ] `src/rpc/EXPORT_SUBPLEBBIT_SPEC.md` → `src/rpc/EXPORT_COMMUNITY_SPEC.md`

---

## Phase 13: GitHub & CI/CD

### 13.1 GitHub Workflows (.github/workflows/)
- [ ] `CI.yml` - Update references
- [ ] `CI-build.yml`
- [ ] `CI-windows-test.yml`
- [ ] `CI-alerts.yml`
- [ ] `CI-plebbit-protocol-test.yml` → Rename if needed
- [ ] `CI-plebbit-react-hooks.yml` → Rename if needed
- [ ] `CI-plebbit-js-benchmarks.yml` → `CI-pkc-js-benchmarks.yml`

### 13.2 Repository Rename (External)
- [ ] GitHub repository: `plebbit/plebbit-js` → Consider new org/repo name
- [ ] Update all workflow URLs

---

## Phase 14: Import Path Updates

After renaming directories and files, update ALL import statements across the codebase:

### 14.1 Core Imports
- [ ] `from "./plebbit/plebbit.js"` → `from "./pkc/pkc.js"`
- [ ] `from "./plebbit/plebbit-with-rpc-client.js"` → `from "./pkc/pkc-with-rpc-client.js"`
- [ ] `from "./plebbit/plebbit-client-manager.js"` → `from "./pkc/pkc-client-manager.js"`
- [ ] `from "./subplebbit/..."` → `from "./community/..."`
- [ ] `from "../plebbit-error.js"` → `from "../pkc-error.js"`

### 14.2 Publication Imports
- [ ] `from "./publications/subplebbit-edit/..."` → `from "./publications/community-edit/..."`

### 14.3 Runtime Imports
- [ ] `from "./runtime/node/subplebbit/..."` → `from "./runtime/node/community/..."`
- [ ] `from "./runtime/browser/subplebbit/..."` → `from "./runtime/browser/community/..."`

---

## Phase 15: Data Migration Code

### 15.1 Storage Path Migration
Document migration requirements for user-facing clients:
- [ ] Document that `subplebbits/` → `communities/` directory rename is needed
- [ ] Document that `.plebbit/` → `.pkc/` directory rename is needed
- [ ] Note: Actual migration code should be implemented in plebbit-cli and desktop apps, NOT in pkc-js
- [ ] Create migration documentation for downstream applications

### 15.2 DNS Record Migration
- [ ] Document process for migrating DNS TXT records
- [ ] Consider adding temporary support for both old and new record names

### 15.3 External Applications Migration (IMPORTANT)
The following applications will need migration code to rename `subplebbits/` → `communities/` directory:
- [ ] **plebbit-cli** - Add directory rename migration on startup
- [ ] **Desktop apps** (electron apps, etc.) - Add directory rename migration
- [ ] Any other apps using plebbit-js data directory structure
- [ ] Document breaking change in release notes for downstream applications

---

## Phase 16: Build & Verification

### 16.1 Build Process
- [ ] Run `npm run build` and fix any compilation errors
- [ ] Verify browser build succeeds
- [ ] Verify Node build succeeds

### 16.2 Test Verification
- [ ] Run full test suite
- [ ] Fix any failing tests
- [ ] Update test expectations where needed

### 16.3 Type Checking
- [ ] Run `npm run typecheck:node`
- [ ] Run `npm run typecheck:browser`
- [ ] Fix any type errors

---

## Execution Order Recommendation

1. **Phase 1:** Package configuration (package.json files)
2. **Phase 2:** Directory structure renaming
3. **Phase 3:** Source file renaming
4. **Phase 14:** Import path updates (do immediately after file renames)
5. **Phase 4:** Class, type & interface renaming
6. **Phase 5:** Schema renaming
7. **Phase 6:** API method & property renaming
8. **Phase 7:** RPC method renaming
9. **Phase 9:** Error messages & logging
10. **Phase 10:** Signer & signature functions
11. **Phase 11:** Test files
12. **Phase 8:** DNS & protocol changes (careful - breaking changes)
13. **Phase 15:** Data migration code
14. **Phase 12:** Documentation
15. **Phase 13:** GitHub & CI/CD
16. **Phase 16:** Build & verification

---

## Notes

- Always run `npm run build` after each major phase to catch errors early
- Keep the old dist/ directory until all changes are complete
- Consider creating git branches for each major phase
- Some changes (DNS records, data paths) are breaking changes - document migration clearly
- External dependencies (@plebbit/plebbit-logger, etc.) require separate repository work

---

## Open Questions / Decisions Needed

### Q1: How to handle `subplebbitAddress` in publications?

Publications (comments, votes, edits) have a `subplebbitAddress` field that is:
- Part of the signed data structure (changing it invalidates existing signatures)
- Stored in IPFS records that are immutable
- Referenced throughout the codebase for routing and validation

#### Technical Analysis

**Key Finding: `subplebbitAddress` IS part of the cryptographically signed properties.**

The signature chain works as follows:
1. `CreatePublicationUserOptionsSchema` ([src/schema/schema.ts:84-97](src/schema/schema.ts#L84-L97)) defines `subplebbitAddress: SubplebbitAddressSchema`
2. `CreateCommentOptionsSchema` ([src/publications/comment/schema.ts:32-47](src/publications/comment/schema.ts#L32-L47)) merges with `CreatePublicationUserOptionsSchema`
3. `CommentSignedPropertyNames` ([src/publications/comment/schema.ts:57-59](src/publications/comment/schema.ts#L57-L59)) = `keys(CreateCommentOptionsSchema)` minus `["signer", "challengeRequest"]`
4. Since `subplebbitAddress` is NOT in `keysToOmitFromSignedPropertyNames` ([src/signer/constants.ts:5-8](src/signer/constants.ts#L5-L8)), it IS included in the signed properties

**However, signature verification is self-describing:**

The verification code at [src/signer/signatures.ts:377](src/signer/signatures.ts#L377) uses the property names stored in the record itself:
```typescript
for (const propertyName of publicationToBeVerified.signature.signedPropertyNames) {
    if (publicationToBeVerified[propertyName] !== undefined && publicationToBeVerified[propertyName] !== null) {
        propsToSign[propertyName] = publicationToBeVerified[propertyName];
    }
}
```

This means **old records that have `subplebbitAddress` in their `signature.signedPropertyNames` will still verify correctly** as long as the `subplebbitAddress` field exists in the data being verified.

#### Backwards-Compatible Implementation (Option 3 - Recommended)

The transition can be done with minimal code changes:

**1. Schema Layer** ([src/schema/schema.ts](src/schema/schema.ts)):
```typescript
// Accept either field during parsing, normalize to communityAddress internally
export const CreatePublicationUserOptionsSchema = z.object({
    signer: CreateSignerSchema,
    author: AuthorPubsubSchema.partial().loose().optional(),
    // Accept both, prefer communityAddress
    communityAddress: CommunityAddressSchema.optional(),
    subplebbitAddress: SubplebbitAddressSchema.optional(), // deprecated alias
    protocolVersion: ProtocolVersionSchema.optional(),
    timestamp: PlebbitTimestampSchema.optional(),
    challengeRequest: z.object({...}).optional()
}).transform((data) => {
    // Normalize: use subplebbitAddress if communityAddress not provided
    const address = data.communityAddress ?? data.subplebbitAddress;
    return { ...data, communityAddress: address, subplebbitAddress: address };
});
```

**2. Comment Instance Creation** ([src/publications/publication.ts:146-152](src/publications/publication.ts#L146-L152)):
```typescript
_initBaseRemoteProps(props: CommentIpfsType | PublicationFromDecryptedChallengeRequest) {
    // Handle both old (subplebbitAddress) and new (communityAddress) records
    const address = props.communityAddress ?? props.subplebbitAddress;
    this.setCommunityAddress(address);
    // ... rest unchanged
}
```

**3. Signature Verification** ([src/signer/signatures.ts:546-547](src/signer/signatures.ts#L546-L547)):
```typescript
// The mismatch check needs to handle both field names
const recordAddress = opts.comment.communityAddress ?? opts.comment.subplebbitAddress;
if (opts.communityAddressFromInstance && recordAddress !== opts.communityAddressFromInstance)
    return { valid: false, reason: messages.ERR_COMMENT_IPFS_COMMUNITY_ADDRESS_MISMATCH };
```

**4. New Publications**:
- New publications will use `communityAddress` in their `signature.signedPropertyNames`
- The signing function will sign the `communityAddress` field

**5. Test Coverage**:
- Add at least one test that loads/verifies an old record with `subplebbitAddress` to ensure backwards compatibility

#### Why This Works

1. **Old records**: Have `subplebbitAddress` in `signature.signedPropertyNames` → verification looks for `subplebbitAddress` field → field exists → signature valid ✓
2. **New records**: Have `communityAddress` in `signature.signedPropertyNames` → verification looks for `communityAddress` field → field exists → signature valid ✓
3. **Instance creation**: Always normalizes to `communityAddress` property on the class, regardless of which field was in the source data

#### Database Considerations

The `subplebbitAddress` column exists in multiple database tables:
- `comments` table ([src/runtime/node/subplebbit/db-handler.ts:286](src/runtime/node/subplebbit/db-handler.ts#L286))
- `commentEdits` table ([src/runtime/node/subplebbit/db-handler.ts:362](src/runtime/node/subplebbit/db-handler.ts#L362))
- `commentModerations` table ([src/runtime/node/subplebbit/db-handler.ts:385](src/runtime/node/subplebbit/db-handler.ts#L385))

**Key insight:** The codebase already has a pattern for handling deprecated fields via `extraProps`:
- [db-handler.ts:595-613](src/runtime/node/subplebbit/db-handler.ts#L595-L613) shows deprecated fields being moved to `extraProps`
- [db-handler.ts:784](src/runtime/node/subplebbit/db-handler.ts#L784) shows `extraProps` being spread back for signature verification: `{ ...commentRecord, ...commentRecord.extraProps }`
- [db-handler.ts:2446-2451](src/runtime/node/subplebbit/db-handler.ts#L2446-L2451) shows `_spreadExtraProps` spreading values back when reading

**Recommended approach: Move `subplebbitAddress` to `extraProps` + add `communityAddress` column**

| Approach | Description | Pros | Cons |
|----------|-------------|------|------|
| **A: Keep both columns** | Add `communityAddress`, keep `subplebbitAddress` | Simple, no migration | Redundant storage, messy schema |
| **B: extraProps migration** | Move old `subplebbitAddress` to `extraProps`, rename/add `communityAddress` column | Clean schema, follows existing pattern, signature verification works via spread | Requires DB migration |
| **C: Rename column only** | `ALTER TABLE ... RENAME COLUMN` | Simplest | Doesn't preserve field name for signature verification |

**Recommended: Option B (extraProps migration)**

DB Migration:
```typescript
// In migration function (similar to existing pattern at db-handler.ts:595-613)
if (currentDbVersion <= X) {
    // For each table with subplebbitAddress:
    // 1. Read existing extraProps JSON
    // 2. Add subplebbitAddress to extraProps
    // 3. Update the row

    const rows = db.prepare(`SELECT cid, subplebbitAddress, extraProps FROM comments`).all();
    for (const row of rows) {
        const existingExtra = row.extraProps ? JSON.parse(row.extraProps) : {};
        const newExtra = { ...existingExtra, subplebbitAddress: row.subplebbitAddress };
        db.prepare(`UPDATE comments SET extraProps = ? WHERE cid = ?`).run(JSON.stringify(newExtra), row.cid);
    }

    // Then rename column or add new column
    db.exec(`ALTER TABLE comments RENAME COLUMN subplebbitAddress TO communityAddress`);
}
```

Why this works:
1. **Old records**: `subplebbitAddress` lives in `extraProps`, gets spread back via `_spreadExtraProps()` or `{ ...record, ...record.extraProps }`
2. **New records**: Use `communityAddress` column directly, no `subplebbitAddress` in `extraProps`
3. **Signature verification**: Already handles this! See [db-handler.ts:784](src/runtime/node/subplebbit/db-handler.ts#L784):
   ```typescript
   comment: { ...commentRecord, ...commentRecord.extraProps }
   ```
   This spreads `subplebbitAddress` from `extraProps` back into the object before verification.

#### Files to Modify

| File | Change |
|------|--------|
| [src/schema/schema.ts](src/schema/schema.ts) | Add `communityAddress` field, keep `subplebbitAddress` as optional alias, add transform |
| [src/publications/publication.ts](src/publications/publication.ts) | `_initBaseRemoteProps` - check for both fields |
| [src/signer/signatures.ts](src/signer/signatures.ts) | Update mismatch check to handle both field names |
| [src/publications/comment/schema.ts](src/publications/comment/schema.ts) | Update `CommentSignedPropertyNames` for new publications |
| [src/runtime/node/subplebbit/db-handler.ts](src/runtime/node/subplebbit/db-handler.ts) | DB migration to move `subplebbitAddress` to `extraProps`, rename/add `communityAddress` column |
| Test files | Add test with fixture using old `subplebbitAddress` format |

#### Related Phases

The following related changes are documented in the main phases above:
- **Phase 6.3**: `shortSubplebbitAddress` → `shortCommunityAddress`
- **Phase 6.5**: State machine states (`"resolving-subplebbit-address"`, etc.)
- **Phase 7.3**: RPC parameter names
- **Phase 8.1**: DNS TXT record names
- **Phase 8.3**: Storage cache keys

**Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **Option 1: Full break** | Rename to `communityAddress` everywhere | Clean slate, consistent naming | All existing publications become invalid, users lose historical content |
| **Option 2: Alias externally** | Keep `subplebbitAddress` internally, add `communityAddress` as getter/alias | Backward compatible | Messy code, confusing for developers |
| **Option 3: Support both** | Accept both field names during transition period (see implementation above) | Gradual migration possible, minimal code changes | Complex validation logic, technical debt |
| **Option 4: Keep field name** | Rename classes/types/methods but keep `subplebbitAddress` as wire protocol field | Preserves all existing content, least disruptive | Inconsistent naming (Community class but `subplebbitAddress` property) |
| **Option 5: Migration script** | Create a script that republishes existing content with new `communityAddress` field, signed by a migration author |  preserves content (as copies) | Requires migration infrastructure, new signatures mean different author, different timestamps, could be complicated |

**Decision:** [x] **Option 3: Support both** - Accept both `subplebbitAddress` and `communityAddress` field names. See "Backwards-Compatible Implementation" section above for details.

---

## Progress Tracking

**How to mark progress:** When an item is completed, change `[ ]` to `[x]`. Example:
- `[ ] Not completed` → `[x] Completed`

Use this section to track overall progress:

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Package Config | [ ] Not Started | |
| Phase 2: Directory Structure | [ ] Not Started | |
| Phase 3: Source Files | [ ] Not Started | |
| Phase 4: Classes & Types | [ ] Not Started | |
| Phase 5: Schemas | [ ] Not Started | |
| Phase 6: API Methods | [ ] Not Started | |
| Phase 7: RPC Methods | [ ] Not Started | |
| Phase 8: DNS & Protocol | [ ] Not Started | Breaking changes |
| Phase 9: Errors & Logging | [ ] Not Started | |
| Phase 10: Signer Functions | [ ] Not Started | |
| Phase 11: Test Files | [ ] Not Started | |
| Phase 12: Documentation | [ ] Not Started | |
| Phase 13: GitHub & CI/CD | [ ] Not Started | |
| Phase 14: Import Paths | [ ] Not Started | |
| Phase 15: Data Migration | [ ] Not Started | |
| Phase 15.3: External Apps | [ ] Not Started | plebbit-cli, desktop apps |
| Phase 16: Build & Verify | [ ] Not Started | |

---

## External Repositories Requiring Changes

These repositories are outside plebbit-js but will need coordinated updates:

| Repository | Changes Needed | Status |
|------------|---------------|--------|
| @plebbit/plebbit-logger | Rename to @pkc/pkc-logger | [ ] Not Started |
| @plebbit/proper-lockfile | Rename to @pkc/proper-lockfile | [ ] Not Started |
| plebbit-cli | Directory migration: `.plebbit/` → `.pkc/` and `subplebbits/` → `communities/`, API updates | [ ] Not Started |
| Desktop apps | Directory migration: `.plebbit/` → `.pkc/` and `subplebbits/` → `communities/`, API updates | [ ] Not Started |
| DNS TXT records | Migrate plebbit-author-address → pkc-author-address, subplebbit-address → pkc-community-address | [ ] Not Started |
