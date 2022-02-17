*Telegram group for this repo https://t.me/plebbitjs*

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

### Schema:

```
Publication {
  author: Author,
  timestamp: number,
  signature: Signature // sign immutable fields like author, title, content, timestamp to prevent tampering
}
Comment (IPFS file) {
  ...Publication,
  subplebbitIpnsKeyId: string, // required to prevent malicious subplebbits republishing as original and helps faster loading subplebbit info for comment direct linking
  postCid: string, // helps faster loading post info for comment direct linking
  parentCommentCid: string, // same as postCid for top level comments
  content: string,
  previousCommentCid: string, // each post is a linked list
  commentIpnsKeyId: string // each post/comment needs its own IPNS record (CommentIpns) for its mutable data like edits, vote counts, comments
}
Post (IPFS file) {
  ...Comment,
  parentCommentCid: null, // post is same as comment but has no parent and some extra fields,
  title: string
}
Vote {
  ...Publication,
  commentCid: string,
  vote: 1 | -1 | 0 // 0 is needed to cancel a vote
}
CommentIpns (IPNS record) {
  latestCommentCid: string, // the most recent comment in the linked list of posts
  preloadedComments: Comment[], // preloaded content greatly improves loading speed, it saves scrolling the entire linked list, should include preloaded nested comments and vote counts
  upvoteCount: number,
  downvoteCount: number
}
Author {
  displayName: string,
  ipnsKeyId: string
}
Signature {
  signature: string, // data in base64
  publicKey: buffer, // include public key (marshalled, like IPNS does it) because the IPNS name is just a hash of it
  type: string // multiple versions/types to allow signing with metamask/other wallet or to change the signature fields or algorithm
}
Subplebbit (IPNS record) {
  title: string,
  description: string,
  moderatorsIpnsNames: string[],
  latestPostCid: string, // the most recent post in the linked list of posts
  preloadedPosts: SortedPosts[], // preloaded content (sorted by 'best') greatly improves loading speed, it saves scrolling the entire linked list, should include some preloaded comments for each post as well and vote counts
  pubsubTopic: string, // the string to publish to in the pubsub, a public key of the subplebbit owner's choice
  sortedPostsCids: [key: 'best' | 'new' | 'tophour'| 'topday' | 'topweek' | 'topmonth' | 'topyear' | 'topall']: SortedPostsCid // e.g. subplebbit.sortedPostsCids['new'] = sortedPostCid
}
SortedPosts (IPFS file) {
  nextSortedPostsCid: string, // get page 2 sorted by 'best' | 'new' | 'tophour'| 'topday' | 'topweek' | 'topmonth' | 'topyear' | 'topall'
  posts: Post[]
}
```

### Message signature types:

- 'plebbit1':

```javascript
const libp2pCrypto = require('libp2p-crypto')
const cborg = require('cborg')
const PeerId = require('peer-id')

const encryptedPemPassword = ''
const rsaInstance = await libp2pCrypto.keys.import(privateKeyPemString, encryptedPemPassword)

const messageToSign = cborg.encode({subplebbitIpnsName, author, title, content, timestamp}) // use cborg to stringify deterministically instead of JSON.stringify
const rsaInstanceSignature = await rsaInstance.sign(messageToSign)

// can also be done in node (but not browser compatible)
require('crypto').sign('sha256', messageToSign, privateKeyPemString)

// to get marshalled (serialized) public key for signature.publicKey field
signature.publicKey = rsaInstance.public.marshal()
// or
signature.publicKey = libp2pCrypto.keys.marshalPublicKey(rsaInstance.public, 'RSA')

// to verify a signed post
const post = {/* ...some post */}
const postToVerify = cborg.encode({subplebbitIpnsName: post.subplebbitIpnsName, author: post.author, title: post.title, content: post.content, timestamp: post.timestamp})
const rsaPublicKeyInstance = (await PeerId.createFromPubKey(post.signature.publicKey)).pubKey
const signatureIsValid = await rsaPublicKeyInstance.verify(postToVerify, post.signature.signature)
```

### Pubsub message types

```
PubsubMessage: {
  type: 'CHALLENGEREQUEST' | 'CHALLENGE' | 'CHALLENGEANSWER' | 'CHALLENGEVERIFICATION'
}
ChallengeRequestMessage (sent by post author) {
  ...PubsubMessage,
  challengeRequestId: string, // random string choosen by sender
  acceptedChallengeTypes: string[], // list of challenge types the client can do, for example cli clients or old clients won't do all types
  publication: Publication // include the post so the nodes and subplebbit owner can blacklist it outright
}
ChallengeMessage (sent by subplebbit owner) {
  challengeRequestId: string,
  challenge: Challenge
}
ChallengeAnswerMessage (sent by post author) {
  challengeRequestId: string,
  challengeAnswerId: string, // random string choosen by sender
  challengeAnswer: string // for example 2+2=4
}
ChallengeVerificationMessage (sent by subplebbit owner) {
  challengeRequestId: string, // include in verification in case a peer is missing it
  challengeAnswerId: string, // include in verification in case a peer is missing it
  challengeAnswerIsVerified: bool,
  reason: string // reason for failed verification, for example post content is too long. could also be used for successful verification that bypass the challenge, for example because an author has good history
}
Challenge {
  type: 'captcha1', // will be dozens of challenge types, like holding a certain amount of a token
  challenge: buffer // data required to complete the challenge, could be html, png, etc.
}
```

# API

- [Plebbit API](#plebbit-api)
  - [`Plebbit(options)`](#plebbitoptions)
  - [`plebbit.getComment(commentCid)`](#plebbitgetcommentcommentcid)
  - [`plebbit.getSubplebbit(subplebbitIpnsName)`](#plebbitgetsubplebbitsubplebbitipnsname)
  - [`plebbit.publishComment(comment)`](#plebbitpublishcommentcomment)
  - [`plebbit.publishVote(vote)`](#plebbitpublishvotevote)
- [Subplebbit API](#subplebbit-api)
  - [`Subplebbit(options)`](#subplebbitoptions)
  - [`subplebbit.update(subplebbit)`](#subplebbitupdatesubplebbit)
  - [`subplebbit.start()`](#subplebbitstart)
  - [`subplebbit.stop()`](#subplebbitstop)
- [Subplebbit Events](#subplebbit-events)
  - [`post`](#post)

## Plebbit API
The plebbit API for reading and writing to and from subplebbits.

### `Plebbit(options)`

> Create a plebbit instance.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| options | object | Options for the plebbit instance |

##### Options

An object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| ipfsGatewayUrl | `string` | `'https://cloudflare-ipfs/ipfs/'` | URL of an IPFS gateway |
| ipfsApiUrl | `string` | `'http://localhost:8080'` | URL of an IPFS API |

#### Returns

| Type | Description |
| -------- | -------- |
| `Plebbit` | A plebbit instance |

#### Example

```js
const Plebbit = require('@plebbit/plebbit-js')
const options = {
  ipfsGatewayUrl: 'https://cloudflare-ipfs/ipfs/',
  ipfsApiUrl: 'http://localhost:5001',
}
const plebbit = Plebbit(options) // should be independent instance, not singleton
```

### `plebbit.getComment(commentCid)`

> Get a plebbit comment by its IPFS CID. Posts are also comments.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| commentCid | `string` | the IPFS CID of the comment |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<GetCommentResponse>` | A object with comment data |

Object is of the form:

```js
{
  author: Author,
  timestamp: number,
  signature: Signature,
  postCid: string,
  getPost: function, // if comment is a post, it gets itself
  parentCommentCid: string || null, // post don't have parent cids
  subplebbitIpnsName: string,
  getSubplebbit: function,
  title: string || null, // comments don't have titles
  content: string,
  previousCommentCid: string,
  getPreviousComment: function,
  commentIpnsName: string,
  getCommentIpns: function
}
```

#### Example

```js
const commentCid = 'QmbWqx...'
const comment = await plebbit.getComment(commentCid)
console.log('comment:', comment)
if (comment.parentCommentCid) { // comment with no parent cid is a post
  comment.getPost(post => console.log('post:', post))
}
comment.getCommentIpns().then(commentIpns => console.log('commentIpns:', commentIpns))
comment.getSubplebbit().then(subplebbit => console.log('subplebbit:', subplebbit))
comment.getPreviousComment().then(previousComment => console.log('previousComment:', previousPost))
/*
Prints:
{ ...TODO }
*/
```

### `plebbit.getSubplebbit(subplebbitIpnsName)`

> Get a subplebbit comment by its IPNS name.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| subplebbitIpnsName | `string` | the IPNS name of the subplebbit |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<GetSubplebbitResponse>` | A object with subplebbit data |

Object is of the form:

```js
{
  title: string,
  description: string,
  moderatorsIpnsNames: string[],
  latestPostCid: string,
  preloadedPosts: SortedPosts[],
  pubsubTopic: string,
  sortedPostsCids: [key: 'best' | 'new' | 'tophour'| 'topday' | 'topweek' | 'topmonth' | 'topyear' | 'topall']: SortedPostsCid
}
```

#### Example

```js
const subplebbitIpnsName = 'QmbWqx...'
const subplebbit = await plebbit.getSubplebbit(subplebbitIpnsName)
console.log(subplebbit)

let currentPostCid = subplebbit.latestPostCid
const scrollAllSubplebbitPosts = async () => {
  while (currentPostCid) {
    const post = await plebbit.getComment(currentPostCid)
    console.log(post)
    currentPostCid = post.previousPostCid
  }
  console.log('there are no more posts')
}
scrollAllSubplebbitPosts()
/*
Prints:
{ ...TODO }
*/
```

### `plebbit.publishComment(comment)`

> Publish a comment on a subplebbit. Posts are also comments.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| comment | `Comment` | the comment to publish |

##### Comment

An object which may have the following keys:

| Name | Type | Description |
| ---- | ---- | ----------- |
| subplebbitIpnsName | `string` | IPNS name of the subplebbit |
| postCid | `string` or `null` | The post CID, null if comment is a post |
| parentCommentCid | `string` or `null` | The parent comment CID, null if comment is a post, same as postCid if comment is top level |
| content | `string` | Content of the comment |
| timestamp | `number` or `null` | Time of publishing in ms, `Date.now()` if null |
| author | `Author` | Author of the comment |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<PublishCommentResponse>` | The publish comment response |

Object is of the form:

```js
{ // ...TODO }
```

#### Example

```js
// TODO
```

### `plebbit.publishVote(vote)`

> Publish a vote on a comment or post.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| vote | `Vote` | the vote to publish |

##### Vote

An object which may have the following keys:

| Name | Type | Description |
| ---- | ---- | ----------- |
| subplebbitIpnsName | `string` | IPNS name of the subplebbit |
| commentCid | `string` | The comment or post to vote on |
| timestamp | `number` or `null` | Time of publishing in ms, `Date.now()` if null |
| author | `Author` | Author of the comment, will be needed for voting with NFTs or tokens |
| vote | `1` or `0` or `-1` | 0 is for resetting a vote |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<PublishVoteResponse>` | The publish vote response |

Object is of the form:

```js
{ // ...TODO }
```

#### Example

```js
// TODO
```

## Subplebbit API
The subplebbit API for creating, updating and running subplebbits.

### `Subplebbit(options)`

> Create a subplebbit instance.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| options | `object` | Options for the subplebbit instance |

##### Options

An object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| subplebbitIpnsName | `string` | `undefined` | IPNS name of the subplebbit |
| ipfsGatewayUrl | `string` | `'https://cloudflare-ipfs/ipfs/'` | URL of an IPFS gateway |
| ipfsApiUrl | `string` | `'http://localhost:8080'` | URL of an IPFS API |

#### Returns

| Type | Description |
| -------- | -------- |
| `Subplebbit` | A subplebbit instance |

#### Example

```js
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

### `subplebbit.update(subplebbit)`

> Update the content of a subplebbit.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| subplebbit | `Subplebbit` | the content of the subplebbit |

##### Subplebbit

An object which may have the following keys:

| Name | Type | Description |
| ---- | ---- | ----------- |
| title | `string` | title of the subplebbit |
| description | `string` | description of the subplebbit |
| moderatorsIpnsNames | `string[]` | IPNS names of the moderators |
| latestPostCid | `string` | the most recent post in the linked list of posts |
| preloadedPosts | `Post[]` | preloaded content greatly improves loading speed, it saves scrolling the entire linked list, should include some preloaded comments for each post as well and vote counts |
| pubsubTopic | `string` | the string to publish to in the pubsub, a public key of the subplebbit owner's choice |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<SubplebbitUpdateResponse>` | The update subplebbit response |

Object is of the form:

```js
{ // ...TODO }
```

#### Example

```js
// TODO
```

### `subplebbit.start()`

> Start listening for new posts on the pubsub, and publishing them every 5 minutes.

#### Example

```js
const options = {
  ipfsGatewayUrl: 'https://cloudflare-ipfs/ipfs/',
  ipfsApiUrl: 'http://localhost:5001',
  subplebbitIpnsName: 'Qmb...'
}
const subplebbit = Subplebbit(options)
subplebbit.on('post', (post) => console.log(post))
subplebbit.start()
```

### `subplebbit.stop()`

> Stop listening for new posts on the pubsub, and stop publishing them every 5 minutes.

## Subplebbit Events
The subplebbit events.

### `post`

> A new post is published.

#### Emits

| Type | Description |
| -------- | -------- |
| `Post` | The published post |

Object is of the form:

```js
{ // ...TODO }
```

#### Example

```js
const options = {
  ipfsGatewayUrl: 'https://cloudflare-ipfs/ipfs/',
  ipfsApiUrl: 'http://localhost:5001',
  subplebbitIpnsName: 'Qmb...'
}
const subplebbit = Subplebbit(options)
subplebbit.on('post', (post) => console.log(post))
subplebbit.start()
```
