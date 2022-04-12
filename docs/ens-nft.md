### How to resolve ENS names for author and subplebbit address and how to resolve and verify NFT avatars

```js
const ethers = require('ethers')
const fetch = require('isomorphic-fetch')

// this setting can be edited in the account or plebbit-js settings, possible to use a local node
const ipfsGatewayUrl = 'https://ipfs.io'

// the user can edit these blockchains settings in the account or plebbit-js settings
const blockchains = {
  avax: {
    providerUrl: 'https://api.avax.network/ext/bc/C/rpc',
    chainId: 43114
  },
  matic: {
    providerUrl: 'https://polygon-rpc.com',
    chainId: 137
  }
}

// cache the blockchain providers because only 1 should be running at the same time
const blockchainProviders = {}
const getBlockchainProvider = (chainTicker) => {
  if (blockchainProviders[chainTicker]) {
    return blockchainProviders[chainTicker]
  }
  if (blockchains[chainTicker]) {
    blockchainProviders[chainTicker] = new ethers.providers.JsonRpcProvider({url: blockchains[chainTicker].providerUrl}, blockchains[chainTicker].chainId)
    return blockchainProviders[chainTicker]
  }
  if (chainTicker === 'eth') {
    blockchainProviders['eth'] = ethers.getDefaultProvider()
    return blockchainProviders['eth']
  }
  throw Error(`no network settings for nft '${chainTicker}'`)
}

const nftAbi = [
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}  
]

const getNftImageUrl = async (nft) => {
  const blockchainProvider = getBlockchainProvider(nft.chainTicker)
  const nftContract = new ethers.Contract(nft.address, nftAbi, blockchainProvider)
  let nftUrl = await nftContract.tokenURI(nft.index)

  // if the ipfs nft is json, get the image url using the ipfs gateway in account settings
  if (nftUrl.startsWith('ipfs://')) {
    nftUrl = `${ipfsGatewayUrl}/${nftUrl.replace('://', '/')}`
  }

  // if the ipfs file is json, it probably has an 'image' property
  try {
    const json = await fetch(nftUrl).then(resp => resp.json())
    nftUrl = json.image

    // if the image property is an ipfs url, get the image url using the ipfs gateway in account settings
    if (nftUrl.startsWith('ipfs://')) {
      nftUrl = `${ipfsGatewayUrl}/${nftUrl.replace('://', '/')}`
    }
  }
  catch (e) {}

  return nftUrl
}

const createNftSignature = async (nft, authorAddress, ethersJsSigner) => {
  // the ethers.js signer is usually gotten from metamask https://docs.ethers.io/v5/api/signer/
  const messageToSign = JSON.stringify({chainTicker: nft.chainTicker, address: nft.address, index: nft.index, authorAddress})
  const signature = await ethersJsSigner.signMessage(messageToSign)
  return signature
}

const verifyNftSignature = async (nft, authorAddress) => {
  const blockchainProvider = getBlockchainProvider(nft.chainTicker)
  const nftContract = new ethers.Contract(nft.address, nftAbi, blockchainProvider)
  // get the owner of the nft at nft.index
  const currentNftOwnerAddress = await nftContract.ownerOf(nft.index)
  const messageThatShouldBeSigned = JSON.stringify({chainTicker: nft.chainTicker, address: nft.address, index: nft.index, authorAddress})
  const signatureAddress = ethers.utils.verifyMessage(messageThatShouldBeSigned, nft.signature)
  if (currentNftOwnerAddress !== signatureAddress) {
    throw Error(`invalid nft signature address '${signatureAddress}' does not equal '${currentNftOwnerAddress}'`)
  }
}

const resolveEnsTxtRecord = async (ensName, txtRecordName) => {
  const blockchainProvider = getBlockchainProvider('eth')
  const resolver = await blockchainProvider.getResolver(ensName)
  const txtRecordResult = await resolver.getText(txtRecordName)
  return txtRecordResult
}

const resolveAuthorAddress = async (authorAddress) => {
  if (authorAddress.endsWith('.eth')) {
    return resolveEnsTxtRecord(authorAddress, 'plebbit-author-address')
  }
  return authorAddress
}

const resolveSubplebbitAddress = async (subplebbitAddress) => {
  if (subplebbitAddress.endsWith('.eth')) {
    return resolveEnsTxtRecord(subplebbitAddress, 'subplebbit-address')
  }
  return subplebbitAddress
}

const avatarNft = {
  chainTicker: 'eth',
  address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', // the contract address of the nft
  index: 100 // the nft number 100 in the colletion
}
const author = {
  address: 'some test address...',
  avatar: avatarNft
}

;(async () => {
  // resolve ens name (replace 'plebbit.eth' with 'john.eth' or whatever the address is)
  // this needs to be called when verifying the comment.signature, but not the nft.signature
  const authorAddressPublicKeyHash = await resolveAuthorAddress('plebbit.eth')
  const subplebbitAddressPublicKeyHash = await resolveSubplebbitAddress('plebbit.eth')
  console.log({authorAddressPublicKeyHash, subplebbitAddressPublicKeyHash})

  // get the image url of an nft
  const nftImageUrl = await getNftImageUrl(avatarNft)
  console.log({nftImageUrl})

  // this is a test private key, usually you get an ethers.js signer from metamask
  // https://docs.ethers.io/v5/api/signer
  const ethersJsSigner = new ethers.Wallet(Buffer.from('testprivatekey', 'base64'))

  // sign an nft
  const signature = await createNftSignature(avatarNft, author.address, ethersJsSigner)
  const nftWithSignature = {...avatarNft, signature}
  console.log({nftWithSignature})

  // verify nft signature
  try {
    await verifyNftSignature(nftWithSignature, author.address)
  }
  catch (e) {
    // we expect to fail because our test private key doesn't own a bored ape
    console.log(e.message)
  }
})()
```
