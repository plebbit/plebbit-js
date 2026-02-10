# Chain Provider Configuration Architecture (v2)

## Problem

The current single `chainProviders` config doesn't support specialized RPCs (e.g., ethrpc.xyz only works for ENS, blocks other contracts). Need a design that:
- Removes global `chainProviders` entirely
- Makes name resolvers the primary source of RPC URLs
- Allows challenges to fall back to resolver URLs or use their own
- Is fully JSON-serializable for user account storage

## Design Principles

1. **No global `chainProviders`** - remove from PlebbitOptions
2. **Resolvers own their URLs** - each resolver (ENS, SNS) brings its own RPC config
3. **Challenges have fallback chain** - challenge options > resolver URLs > challenge hardcoded defaults
4. **chainId hardcoded** - resolvers/challenges know their chainId internally (eth=1, matic=137, etc.)

## Name Resolver Architecture

### Static Registry: `PKC.nameResolvers`

Similar to existing `Plebbit.challenges`, name resolvers are registered in a static object:

```typescript
// Static registry (like Plebbit.challenges)
PKC.nameResolvers: { [name: string]: NameResolverInstance }

// Instance interface (registered directly, no cloning needed)
export interface NameResolverInstance {
  name: string;
  tlds: string[];           // e.g., ['.eth']
  // chainProviders passed as arg to resolve(), not stored on instance
  resolve: (args: {
    domain: string;
    txtRecordName: string;
    chainProviders: ChainProviders;  // user's config passed at resolve time
    plebbit: Plebbit;
  }) => Promise<NameResolverResult>;
}

// ChainProviders type (same as current)
type ChainProviders = {
  [chainTicker: string]: {
    urls: string[];
    chainId: number;
  }
};
```

### Registration (App Startup)

```javascript
import PKC from '@pkc/pkc-js';
import { ensResolver } from '@bitsocial/resolver-ens';
import { snsResolver } from '@bitsocial/resolver-sns';

// Register resolver instances directly (once at app startup)
PKC.nameResolvers['ens'] = ensResolver;
PKC.nameResolvers['sns'] = snsResolver;

// Example ensResolver structure:
// {
//   name: 'ens',
//   tlds: ['.eth'],
//   resolve: async ({ domain, txtRecordName, chainProviders, plebbit }) => {
//     // chainProviders.eth.urls contains the RPC URLs to use
//     // chainProviders.eth.chainId contains the chain ID
//   }
// }
```

### JSON Config (User Account Storage)

```json
{
  "nameResolvers": [
    {
      "name": "ens",
      "chainProviders": {
        "eth": { "urls": ["https://custom-rpc.com"], "chainId": 1 }
      }
    },
    {
      "name": "sns",
      "chainProviders": {
        "sol": { "urls": ["https://solana-rpc.com"], "chainId": -1 }
      }
    }
  ]
}
```

### Initialization Flow

```javascript
// Load user config from storage
const userConfig = JSON.parse(savedUserAccount);

// Create PKC instance
const plebbit = await PKC({
  nameResolvers: userConfig.nameResolvers  // [{ name, chainProviders }]
});

// Internally:
// 1. Store configs as-is in plebbit.nameResolvers (no cloning needed)
// 2. At resolve time, lookup PKC.nameResolvers[name] and pass chainProviders to resolve()
```

### Resolution Flow (at resolve time)

```javascript
// When resolving a domain like "mysite.eth":
// 1. Find config where TLD matches (find resolver for '.eth')
const config = plebbit.nameResolvers.find(c => {
  const resolver = PKC.nameResolvers[c.name];
  return resolver?.tlds.some(tld => domain.endsWith(tld));
});

// 2. Get resolver from static registry
const resolver = PKC.nameResolvers[config.name];

// 3. Call resolve() with chainProviders from user config
const result = await resolver.resolve({
  domain,
  txtRecordName,
  chainProviders: config.chainProviders,  // user's config passed here
  plebbit
});
```

## Priority Resolution Order

```
For Name Resolvers:
- Uses its own urls[] directly (configured when resolver is instantiated)

For Challenges/Tipping/etc:
1. User-specified URLs in challenge options (e.g., ethRpcUrl)
2. URLs from registered nameResolvers matching the chainTicker
3. Challenge's own hardcoded fallback URLs
```

## Challenge RPC Resolution

Challenges embed their own helper logic inline (no separate util file needed):

```typescript
// Inside evm-contract-call challenge
function getChainUrls(
    plebbit: Plebbit,
    chainTicker: string,
    userSpecifiedUrls?: string[],
    hardcodedFallbackUrls?: string[]
): string[] {
    // 1. User-specified URLs from challenge options (highest priority)
    if (userSpecifiedUrls?.length) return userSpecifiedUrls;

    // 2. URLs from resolver configs (merge all that have this chainTicker)
    const mergedUrls: string[] = [];
    for (const config of plebbit.nameResolvers || []) {
        const chainProvider = config.chainProviders?.[chainTicker];
        if (chainProvider?.urls?.length) {
            mergedUrls.push(...chainProvider.urls);
        }
    }
    if (mergedUrls.length) return mergedUrls;

    // 3. Challenge's hardcoded fallback URLs
    if (hardcodedFallbackUrls?.length) return hardcodedFallbackUrls;

    throw new Error(`No RPC URLs found for chain ${chainTicker}`);
}
```

## Example Configurations

### Simple (ENS only, using resolver defaults)
```javascript
// App startup: register resolver
PKC.nameResolvers['ens'] = ensResolver;

// User just enables ENS without custom URLs
const plebbit = await PKC({
    nameResolvers: [{ name: 'ens' }]  // uses resolver's default chainProviders
});
```

### Custom RPC URLs
```javascript
const plebbit = await PKC({
    nameResolvers: [{
        name: 'ens',
        chainProviders: {
            eth: { urls: ['https://my-custom-rpc.com'], chainId: 1 }
        }
    }]
});
```

### With Challenge-Specific Override
```javascript
// Subplebbit challenge settings
{
    name: "evm-contract-call",
    options: {
        chainTicker: "eth",
        address: "0x...",
        abi: "...",
        condition: ">1000",
        rpcUrls: "https://eth-mainnet.infura.io/v3/..."  // overrides resolver URLs
    }
}
```

### No Resolvers (Challenge-Only)
```javascript
const plebbit = await PKC({
    // No nameResolvers - can't resolve .eth/.sol addresses
});

// Challenges still work using their hardcoded fallback URLs
// e.g., evm-contract-call has built-in Infura/Alchemy URLs
```

### Multiple Resolvers with Same Chain (URLs merged for challenges)
```javascript
PKC.nameResolvers['ens'] = ensResolver;      // has eth chainProvider
PKC.nameResolvers['unstoppable'] = udResolver; // also has eth chainProvider

const plebbit = await PKC({
    nameResolvers: [{ name: 'ens' }, { name: 'unstoppable' }]
});
// For challenges: ETH URLs from both resolvers are merged
```

### JSON-Serializable Config (for user account storage)
```json
{
    "nameResolvers": [
        {
            "name": "ens",
            "chainProviders": {
                "eth": { "urls": ["https://ethrpc.xyz"], "chainId": 1 }
            }
        },
        {
            "name": "sns",
            "chainProviders": {
                "sol": { "urls": ["https://solana-rpc.com"], "chainId": -1 }
            }
        }
    ]
}
```

Note: The actual resolver implementation is loaded by name from `PKC.nameResolvers`,
chainProviders override the resolver's defaults.

## Files to Modify

1. **src/schema.ts** - Remove `chainProviders`, add `nameResolvers` config schema
2. **src/types.ts** - Add NameResolverInstance, NameResolverConfig interfaces
3. **src/plebbit/plebbit.ts** - Add static `PKC.nameResolvers` registry, store `plebbit.nameResolvers` config
4. **src/name-resolver.ts** - Refactor to use plugin system
5. **src/clients/base-client-manager.ts** - Update resolution to use registered resolvers
6. **src/runtime/node/subplebbit/challenges/plebbit-js-challenges/evm-contract-call/index.ts** - Add `rpcUrls` option, embed helper inline

## Implementation Steps

### Phase 1: Define New Types & Schema
- [ ] Add `NameResolverInstance` interface to src/types.ts (name, tlds, resolve)
- [ ] Add `NameResolverConfig` type to src/types.ts ({ name: string, chainProviders?: ChainProviders })
- [ ] Add `NameResolverConfigSchema` to src/schema.ts (validates { name, chainProviders? })
- [ ] Add optional `nameResolvers: NameResolverConfig[]` to PlebbitUserOptionsSchema
- [ ] Remove `chainProviders` from PlebbitUserOptionsSchema (breaking change)
- [ ] Remove `defaultChainProviders` constant

### Phase 2: Static Registry
- [ ] Add static `PKC.nameResolvers: { [name: string]: NameResolverInstance }` object
- [ ] Initialize as empty object `{}`
- [ ] Export from src/index.ts

### Phase 3: Update Plebbit Class
- [ ] Add `plebbit.nameResolvers: NameResolverConfig[]` property (stores user configs as-is)
- [ ] In constructor: validate each config name exists in `PKC.nameResolvers`
- [ ] Throw if resolver not found for config name
- [ ] Remove `chainProviders` property
- [ ] No cloning needed - configs stored directly

### Phase 4: Refactor Name Resolution
- [ ] Update base-client-manager.ts to find resolver config by TLD
- [ ] Look up resolver in PKC.nameResolvers by config.name
- [ ] Call resolver.resolve() with chainProviders from config
- [ ] Throw ERR_NO_RESOLVER_FOR_TLD if no matching resolver

### Phase 5: Update Challenges
- [ ] Add `rpcUrls` option to evm-contract-call optionInputs
- [ ] Embed helper function inline in challenge
- [ ] Add hardcoded fallback URLs in challenge (e.g., public Infura endpoints)

### Phase 6: Tests & Migration
- [ ] Add tests for resolver registration
- [ ] Add tests for JSON config -> instance creation with URL override
- [ ] Test challenge fallback chain
- [ ] Document breaking change in CHANGELOG

## Breaking Changes

- `chainProviders` removed from PlebbitOptions
- Must register resolvers via `PKC.nameResolvers['name'] = resolverInstance` before use
- JSON config stores `{ name, chainProviders? }[]` - resolvers looked up by name, chainProviders override defaults
- Challenges work without resolvers (use hardcoded fallbacks)
- For challenges: URLs from all resolvers with matching chainTicker are merged
