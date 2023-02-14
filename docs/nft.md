### How to resolve and verify NFT avatars

```js
const ethers = require('ethers')
const fetch = require('isomorphic-fetch')

// this setting can be edited in the account or plebbit-js settings, possible to use a local node
const ipfsGatewayUrl = 'https://ipfs.io'

// the user can edit these blockchains settings in the account or plebbit-js settings
const blockchainProviders = {
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
const cachedBlockchainProviders = {}
const getBlockchainProvider = (chainTicker) => {
  if (cachedBlockchainProviders[chainTicker]) {
    return cachedBlockchainProviders[chainTicker]
  }
  if (blockchainProviders[chainTicker]) {
    cachedBlockchainProviders[chainTicker] = new ethers.providers.JsonRpcProvider({url: blockchainProviders[chainTicker].url}, blockchainProviders[chainTicker].chainId)
    return cachedBlockchainProviders[chainTicker]
  }
  if (chainTicker === 'eth') {
    cachedBlockchainProviders['eth'] = ethers.getDefaultProvider()
    return cachedBlockchainProviders['eth']
  }
  throw Error(`no blockchain provider settings for chain ticker '${chainTicker}'`)
}

const nftAbi = [
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}  
]

const getNftImageUrl = async (nft) => {
  const blockchainProvider = getBlockchainProvider(nft.chainTicker)
  const nftContract = new ethers.Contract(nft.address, nftAbi, blockchainProvider)
  let nftUrl = await nftContract.tokenURI(nft.id)

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
  let messageToSign = {}
  // the property names must be in this order for the signature to match
  // insert props one at a time otherwise babel/webpack will reorder
  messageToSign.domainSeparator = 'plebbit-author-avatar'
  messageToSign.authorAddress = authorAddress
  messageToSign.timestamp =  nft.timestamp
  messageToSign.tokenAddress =  nft.address
  messageToSign.tokenId = String(nft.id) // must be a type string, not number
  // use plain JSON so the user can read what he's signing
  messageToSign = JSON.stringify(messageToSign)

  // the ethers.js signer is usually gotten from metamask https://docs.ethers.io/v5/api/signer/
  const signature = await ethersJsSigner.signMessage(messageToSign)
  return signature
}

const verifyNftSignature = async (nft, authorAddress) => {
  const blockchainProvider = getBlockchainProvider(nft.chainTicker)
  const nftContract = new ethers.Contract(nft.address, nftAbi, blockchainProvider)
  // get the owner of the nft at nft.id
  const currentNftOwnerAddress = await nftContract.ownerOf(nft.id)
  let messageThatShouldBeSigned = {}
  // the property names must be in this order for the signature to match
  // insert props one at a time otherwise babel/webpack will reorder
  messageThatShouldBeSigned.domainSeparator = 'plebbit-author-avatar'
  messageThatShouldBeSigned.authorAddress = authorAddress
  messageThatShouldBeSigned.timestamp = nft.timestamp
  messageThatShouldBeSigned.tokenAddress =  nft.address
  messageThatShouldBeSigned.tokenId = String(nft.id) // must be a type string, not number
  messageThatShouldBeSigned = JSON.stringify(messageThatShouldBeSigned)

  const signatureAddress = ethers.utils.verifyMessage(messageThatShouldBeSigned, nft.signature)
  if (currentNftOwnerAddress !== signatureAddress) {
    throw Error(`invalid nft signature address '${signatureAddress}' does not equal '${currentNftOwnerAddress}'`)
  }
}

const avatarNft = {
  chainTicker: 'eth',
  address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', // the contract address of the nft
  timestamp: Math.round(Date.now() / 1000),
  id: 100 // the nft number 100 in the colletion
}
const avatarNft2 = {
  chainTicker: 'matic',
  address: '0xf6d8e606c862143556b342149a7fe0558c220375', // the contract address of the nft
  timestamp: Math.round(Date.now() / 1000),
  id: 100 // the nft number 100 in the colletion
}
const author = {
  address: 'some test address...',
  avatar: avatarNft
}

;(async () => {
  // get the image url of an nft
  const nftImageUrl = await getNftImageUrl(avatarNft)
  const nftImageUrl2 = await getNftImageUrl(avatarNft2)
  console.log({nftImageUrl, nftImageUrl2})

  // this is a test private key, usually you get an ethers.js signer from metamask
  // https://docs.ethers.io/v5/api/signer
  const testPrivateKey = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  const ethersJsSigner = new ethers.Wallet(Buffer.from(testPrivateKey, 'hex'))

  // sign an nft
  const signature = await createNftSignature(avatarNft, author.address, ethersJsSigner)
  const nftWithSignature = {...avatarNft, signature}
  console.log({nftWithSignature})

  // verify nft signature
  try {
    await verifyNftSignature(nftWithSignature, author.address)
  }
  catch (e) {
    console.log(`nft signature is not verified because our test private key doesn't own a bored ape`)
  }
})()
```
