### How to resolve ENS names for author and subplebbit address

```js
const ethers = require('ethers')

// the user can edit these blockchains settings in the account or plebbit-js settings
const chainProviders = {
  avax: {
    url: 'https://api.avax.network/ext/bc/C/rpc',
    chainId: 43114
  },
  matic: {
    url: 'https://polygon-rpc.com',
    chainId: 137
  }
}

// cache the blockchain providers because only 1 should be running at the same time
const cachedChainProviders = {}
const getChainProvider = (chainTicker) => {
  if (cachedChainProviders[chainTicker]) {
    return cachedChainProviders[chainTicker]
  }
  if (chainProviders[chainTicker]) {
    cachedChainProviders[chainTicker] = new ethers.providers.JsonRpcProvider({url: chainProviders[chainTicker].url}, chainProviders[chainTicker].chainId)
    return cachedChainProviders[chainTicker]
  }
  if (chainTicker === 'eth') {
    cachedChainProviders['eth'] = ethers.getDefaultProvider()
    return cachedChainProviders['eth']
  }
  throw Error(`no chain provider settings for chain ticker '${chainTicker}'`)
}

const resolveEnsTxtRecord = async (ensName, txtRecordName) => {
  const chainProvider = getChainProvider('eth')
  const resolver = await chainProvider.getResolver(ensName)
  const txtRecordResult = await resolver.getText(txtRecordName)
  return txtRecordResult
}

const resolveAuthorAddress = async (authorAddress) => {
  if (authorAddress.endsWith('.bso') || authorAddress.endsWith('.eth')) {
    return resolveEnsTxtRecord(authorAddress, 'plebbit-author-address')
  }
  return authorAddress
}

const resolveSubplebbitAddress = async (subplebbitAddress) => {
  if (subplebbitAddress.endsWith('.bso') || subplebbitAddress.endsWith('.eth')) {
    return resolveEnsTxtRecord(subplebbitAddress, 'subplebbit-address')
  }
  return subplebbitAddress
}

;(async () => {
  // resolve ens name (replace 'plebbit.bso' with 'john.bso' or whatever the address is)
  // this needs to be called when verifying the comment.signature, but not the nft.signature
  const authorAddressPublicKeyHash = await resolveAuthorAddress('plebbit.bso')
  const subplebbitAddressPublicKeyHash = await resolveSubplebbitAddress('plebbit.bso')
  console.log({authorAddressPublicKeyHash, subplebbitAddressPublicKeyHash})
})()
```
