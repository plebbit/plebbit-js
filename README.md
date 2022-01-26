`plebbit-js` will be an NPM module to wrap around the IPFS APIs used by Plebbit. It will be used in all clients: CLI, Electron (Desktop GUI) and Web.

### Glossary:

- CID: https://docs.ipfs.io/concepts/content-addressing/
- IPNS: https://docs.ipfs.io/concepts/ipns/#example-ipns-setup-with-cli
- IPNS name: hash of a public key, the private key is used by subplebbit owners for signing IPNS records, and by authors for signing posts and comments
- Pubsub topic: the string to publish/subscribe to in the pubsub https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/PUBSUB.md#ipfspubsubsubscribetopic-handler-options and https://github.com/libp2p/specs/blob/master/pubsub/gossipsub/gossipsub-v1.0.md#topic-membership
- IPNS record: https://github.com/ipfs/specs/blob/master/IPNS.md#ipns-record
- IPNS signature: https://github.com/ipfs/notes/issues/249
- Examples of how to sign: https://github.com/plebbit/whitepaper/blob/main/signature-examples/sign.js

Note: IPFS files are immutable, fetched by their CID, which is a hash of their content. IPNS records are mutable, fetched by their IPNS name, which is the hash of a public key. The private key's owner can update the content. Always use IPFS files over IPNS records when possible because they are much faster to fetch.

### Data:

```
Post (IPFS file): {
  subplebbitIpnsName: string, // required to prevent malicious subplebbits republishing as original
  author: Author,
  title: string,
  content: string,
  timestamp: number,
  previousPostCid: string, // each post is a linked list
  postIpnsName: string, // each post needs its own IPNS record for its mutable data like edits, vote counts, comments
  signature: Signature, // sign immutable fields like author, title, content, timestamp to prevent tampering
}
PostIPNS (IPNS record): {
  latestCommentCid: string, // the most recent comment in the linked list of posts
  preloadedComments: Comment[] // preloaded content greatly improves loading speed, it saves scrolling the entire linked list, should include preloaded nested comments and vote counts
  upvoteCount: number,
  downvoteCount: number
}
Comment extends Post (IPFS file): {
  parentPostOrCommentCid: string // comment is same as a post but has a parent
}
Vote {
  postOrCommentCid: string,
  author: Author, // need author in case the subplebbit owner uses users reputation for filtering votes
  vote: 1 || -1,
  signature: Signature // we need a signature to prove the author is the author
}
Author {
  displayName: string,
  ipnsName: string
}
Signature {
  signature: string, // data in base64
  version: string // we need multiple versions to allow signing with metamask or to change the signature fields or algorithm
}
Subplebbit (IPNS record): {
  title: string,
  description: string,
  moderatorsIpnsNames: string[],
  latestPostCid: string, // the most recent post in the linked list of posts
  preloadedPosts: Post[], // preloaded content greatly improves loading speed, it saves scrolling the entire linked list, should include some preloaded comments for each post as well and vote counts
  pubsubTopic: string, // the string to publish to in the pubsub, a public key of the subplebbit owner's choice
}
```

### Plebbit Read API:

- getPost(postCid)
- getSubplebbit(subplebbitIpnsName)
- getComment(commentCid)

Each response should include the content received (preloaded content) and a method to scroll the entire linked list of posts/comments.

### Plebbit Write API:

- publishPost(post)
- publishComment(comment)
- publishVote(vote)

### Plebbit Usage:

```javascript
const Plebbit = require('@plebbit/plebbit-js')
const options = {
  ipfsGatewayUrl: 'https://cloudflare-ipfs/ipfs/',
  ipfsApiUrl: 'http://localhost:5001',
}
const plebbit = Plebbit(options) // should be independent instance, not singleton
plebbit.setIpfsGatewayUrl('http://localhost:8080') // should be able to change options after instanciation

const postCid = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR'
const post = await plebbit.getPost(postCid)
```

### Subplebbit API:

- update() // publish new posts or update subplebbit details
- start() // start listening for new posts on the pubsub and publish them every 5 minutes
- stop()

### Subplebbit events:

- 'post'

### Subplebbit Usage:

```javascript
const {Subplebbit} = require('@plebbit/plebbit-js')
const options = {
  ipfsGatewayUrl: 'https://cloudflare-ipfs/ipfs/',
  ipfsApiUrl: 'http://localhost:5001',
  subplebbitIpnsName: 'Qmb...'
}
const subplebbit = Subplebbit(options) // should be independent instance, not singleton
subplebbit.update({
  title: 'Memes',
  description: 'Post your memes here.',
  pubsubTopic: 'Qmb...'
})
subplebbit.on('post', (post) => console.log(post))
subplebbit.start()
```
### Message signature versions:

- 'plebbit1':

```javascript
const libp2pCrypto = require('libp2p-crypto')
const cborg = require('cborg')
const encryptedPemPassword = ''
const rsaInstance = await libp2pCrypto.keys.import(privateKeyPemString, encryptedPemPassword)

const messageToSign = cborg.encode({subplebbitIpnsName, author, title, content, timestamp}) // use cborg to stringify deterministically instead of JSON.stringify
const rsaInstanceSignature = await rsaInstance.sign(messageToSign)
const rsaInstanceSignatureVerification = await rsaInstance.public.verify(messageToSign, rsaInstanceSignature)

// can also be done in node (but not browser compatible)
require('crypto').sign('sha256', messageToSign, privateKeyPemString)
```
