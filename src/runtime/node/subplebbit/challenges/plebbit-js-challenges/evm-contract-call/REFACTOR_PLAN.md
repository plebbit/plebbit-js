# Refactor EVM Challenge to Use Independent RPC URL Config

## Summary
Add optional per-chain RPC URL options to the EVM contract call challenge, allowing it to use its own RPC endpoints instead of depending on Plebbit's chainProviders.

## Requirements
- Add separate string options for each supported chain: `ethRpcUrl`, `maticRpcUrl`, `avaxRpcUrl`, etc.
- If a chain's RPC URL is provided, use it for viem clients
- If NOT provided, fall back to Plebbit's chainProviders (backward compatible)
- Challenge creates/manages its own viem clients internally

## File to Modify
- `index.ts` (this directory)

## Implementation Steps

### Step 1: Add Imports
Add viem imports for creating clients:
```typescript
import { createPublicClient, http, webSocket } from "viem";
```

### Step 2: Add Module-Level Viem Client Cache + Helper Functions
Viem can create clients with just an RPC URL - no chain config needed for contract calls and message verification.
```typescript
interface RpcUrlsConfig {
    [chainTicker: string]: string | undefined;
}

const challengeViemClients: Record<string, ReturnType<typeof createPublicClient>> = {};

const getOrCreateViemClient = (rpcUrl: string) => {
    if (challengeViemClients[rpcUrl]) return challengeViemClients[rpcUrl];

    const parsedUrl = new URL(rpcUrl);
    const transport = parsedUrl.protocol.startsWith("ws") ? webSocket(rpcUrl) : http(rpcUrl);

    const client = createPublicClient({ transport });
    challengeViemClients[rpcUrl] = client;
    return client;
};

const getViemClientForChain = (chainTicker: ChainTicker, rpcUrls: RpcUrlsConfig | undefined, plebbit: Plebbit) => {
    if (rpcUrls?.[chainTicker]) {
        return getOrCreateViemClient(rpcUrls[chainTicker]!);
    }
    // Fallback to Plebbit's chainProviders
    const chainProvider = plebbit.chainProviders[chainTicker];
    if (!chainProvider) throw Error(`Chain "${chainTicker}" not in rpcUrls and plebbit.chainProviders`);
    return plebbit._domainResolver._createViemClientIfNeeded(chainTicker, chainProvider.urls[0]);
};
```

### Step 4: Add Per-Chain RPC URL Option Inputs
Add to `optionInputs` array (after `error` option):
```typescript
{
    option: "ethRpcUrl",
    label: "ETH RPC URL",
    default: "",
    description: "Optional Ethereum RPC URL. Used for wallet signature verification and ENS resolution. Falls back to Plebbit's chainProviders if not provided.",
    placeholder: "https://mainnet.infura.io/v3/..."
},
{
    option: "maticRpcUrl",
    label: "Polygon RPC URL",
    default: "",
    description: "Optional Polygon/Matic RPC URL. Falls back to Plebbit's chainProviders if not provided.",
    placeholder: "https://polygon-rpc.com"
},
{
    option: "avaxRpcUrl",
    label: "Avalanche RPC URL",
    default: "",
    description: "Optional Avalanche RPC URL. Falls back to Plebbit's chainProviders if not provided.",
    placeholder: "https://api.avax.network/ext/bc/C/rpc"
}
```

### Step 5: Update Function Signatures
Add `rpcUrls?: RpcUrlsConfig` to props of:
- `verifyAuthorWalletAddress`
- `validateWalletAddressWithCondition`
- `getContractCallResponse`

Note: `verifyAuthorENSAddress` and `verifyAuthorNftWalletAddress` use `Parameters<typeof verifyAuthorWalletAddress>[0]` so they inherit the type automatically.

### Step 6: Replace viem Client Creation Calls
Replace all 4 occurrences of `plebbit._domainResolver._createViemClientIfNeeded(...)`:

| Location | Line | Replace With |
|----------|------|--------------|
| verifyAuthorWalletAddress | 105-108 | `getViemClientForChain("eth", props.rpcUrls, props.plebbit)` |
| verifyAuthorENSAddress | 155-158 | `getViemClientForChain("eth", props.rpcUrls, props.plebbit)` |
| verifyAuthorNftWalletAddress | 185-187 | `getViemClientForChain(<ChainTicker>nftAvatar.chainTicker, props.rpcUrls, props.plebbit)` |
| getContractCallResponse | 248-251 | `getViemClientForChain(<ChainTicker>props.chainTicker, props.rpcUrls, props.plebbit)` |

### Step 7: Update `getChallenge` Function
Build rpcUrls object from individual options and pass to sharedProps:
```typescript
// Extract individual RPC URL options
let { chainTicker, address, abi, condition, error, ethRpcUrl, maticRpcUrl, avaxRpcUrl } = challengeSettings?.options || {};

// Build rpcUrls config from individual options
const rpcUrls: RpcUrlsConfig = {
    ...(ethRpcUrl && { eth: ethRpcUrl }),
    ...(maticRpcUrl && { matic: maticRpcUrl }),
    ...(avaxRpcUrl && { avax: avaxRpcUrl }),
};

// Add to sharedProps
const sharedProps = { ..., rpcUrls };
```

### Step 8: Remove `_getChainProviderWithSafety` Helper
This helper function (lines 69-73) can be removed since we're using `getViemClientForChain` instead.

## Verification
1. Run `npm run build` - must pass with no errors
2. Run existing EVM challenge tests to verify backward compatibility

## Backward Compatibility
When RPC URL options are not provided (empty strings), the challenge uses Plebbit's chainProviders exactly as before - no breaking changes.
