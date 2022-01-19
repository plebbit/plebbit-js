`plebbit-js` will be an NPM module to wrap around the IPFS APIs used by Plebbit. It will be used in all clients: CLI, Electron (Desktop GUI) and Web.

### Glossary:

- CID: https://docs.ipfs.io/concepts/content-addressing/
- IPNS: https://docs.ipfs.io/concepts/ipns/#example-ipns-setup-with-cli
- IPNS name: hash of a public key, the private key is used by subplebbit owners for signing IPNS records, and by authors for signing posts and comments
- Pubsub topic: the string to publish/subscribe to in the pubsub https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/PUBSUB.md#ipfspubsubsubscribetopic-handler-options and https://github.com/libp2p/specs/blob/master/pubsub/gossipsub/gossipsub-v1.0.md#topic-membership

Note: IPFS files are immutable, fetched by their CID, which is a hash of their content. IPNS records are mutable, fetched by their IPNS name, which is the hash of public key. The private key's owner can update the content. Always use IPFS files over IPNS records when possible because they are much faster to fetch.

### Data:

```
Post (IPFS file): {
  subplebbitIpnsName: string, // required to prevent malicious subplebbits republishing as original
  author: Author,
  title: string,
  content: string,
  timestamp: number,
  previousPostCid: string, // each post is a linked list
  commentsIpnsName: string,
  nestedCommentsHelper: ? // something to help fetch nested comments faster, like an index
}
Comments (IPNS record): {
  lastestCommentCid: string, // the most recent comment in the linked list of posts
  preloadedComments: Comment[] // preloaded content greatly improves loading speed, it saves scrolling the entire linked list, should include preloaded nested comments
  nestedCommentsHelper: ? // something to help fetch nested comments faster, like an index
}
Comment (IPFS file): {
  parentPostOrCommentCid: string,
  author: Author,
  timestamp: number,
  content: string,
  previousCommentCid: string, // each comment is a linked list,
  commentsIpnsName: string, // each comment can have infinitely nested comments
}
Author {
  displayName: string,
  ipnsName: string
}
Subplebbit (IPNS record): {
  title: string,
  description: string,
  moderatorsIpnsNames: string[],
  latestPostCid: string, // the most recent post in the linked list of posts
  preloadedPosts: Post[], // preloaded content greatly improves loading speed, it saves scrolling the entire linked list, should include some preloaded comments for each post as well
  pubsubTopic: string, // the string to publish to in the pubsub, a public key of the subplebbit owner's choice
}
```

### Read API:

- getPost(postCid)
- getSubplebbit(subplebbitIpnsName)
- getComment(commentCid)

Each response should include the content received (preloaded content) and a method to scroll the entire linked list of posts/comments.

### Write API:

- publishPost(post)

### Usage:

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
