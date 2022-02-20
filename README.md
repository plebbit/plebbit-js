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
  title: string,
  thumbnailUrl: string // fetched by subplebbit owner, not author, some web pages have thumbnail urls in their meta tags https://moz.com/blog/meta-data-templates-123
}
Vote {
  ...Publication,
  commentCid: string,
  vote: 1 | -1 | 0 // 0 is needed to cancel a vote
}
CommentIpns (IPNS record) {
  latestCommentCid: string, // the most recent comment in the linked list of posts
  upvoteCount: number,
  downvoteCount: number,
  comments: SortedComments, // preload page 1 sorted by 'best'
  sortedCommentsCids: [key: 'best' | 'new' | 'top'| 'old' ]: SortedCommentsCid // only provide sorting for comments that are 'posts' and have 100+ child comments
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
  pubsubTopic: string, // the string to publish to in the pubsub, a public key of the subplebbit owner's choice
  latestPostCid: string, // the most recent post in the linked list of posts
  posts: SortedComments[], // preloaded page 1 (sorted by 'best'), greatly improves loading speed, should include some preloaded child comments for each post as well and vote counts
  sortedPostsCids: [key: 'best' | 'new' | 'tophour'| 'topday' | 'topweek' | 'topmonth' | 'topyear' | 'topall']: SortedPostsCid // e.g. {best: 'Qm...', new: 'Qm...', etc.}
}
SortedComments (IPFS file) {
  nextSortedCommentsCid: string, // get next page (sorted by the same algo)
  comments: Comment[]
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
  type: 'image' | 'text' | 'audio' | 'video' | 'html', // tells the client how to display the challenge, start with implementing image and text only first
  challenge: buffer // data required to complete the challenge, could be html, png, etc.
}
```

# API

- [Plebbit API](#plebbit-api)
  - [`Plebbit(plebbitOptions)`](#plebbitplebbitoptions)
  - [`plebbit.getComment(commentCid)`](#plebbitgetcommentcommentcid)
  - [`plebbit.getSubplebbit(subplebbitIpnsName)`](#plebbitgetsubplebbitsubplebbitipnsname)
  - [`plebbit.createComment(commentOptions)`](#plebbitpublishcommentcommentoptions)
  - [`plebbit.createCommentEdit(commentEditOptions)`](#plebbitcreatecommenteditcommenteditoptions)
  - [`plebbit.createVote(voteOptions)`](#plebbitpublishvotevoteoptions)
- [Subplebbit API](#subplebbit-api)
  - [`Subplebbit(subplebbitOptions)`](#subplebbitsubplebbitoptions)
  - [`subplebbit.update(subplebbitUpdateOptions)`](#subplebbitupdatesubplebbitupdateoptions)
  - [`subplebbit.start()`](#subplebbitstart)
  - [`subplebbit.stop()`](#subplebbitstop)
  - `subplebbit.subplebbitIpnsName`
  - `subplebbit.title`
  - `subplebbit.description`
  - `subplebbit.moderatorsIpnsNames`
  - `subplebbit.preloadedPosts`
  - `subplebbit.latestPostCid`
  - `subplebbit.pubsubTopic`
  - `subplebbit.sortedPostsCids`
- [Subplebbit Events](#subplebbit-events)
  - [`update`](#update)
  - [`challengerequest`](#challengerequest)
  - [`challengeanswer`](#challengeanswer)
- [Comment API](#comment-api)
  - [`comment.publish()`](#commentpublish)
  - [`comment.publishChallengeAnswer()`](#commentpublishchallengeanswerchallengeanswer)
  - [`comment.getCommentIpns()`](#commentgetcommentipns)
  - `comment.author`
  - `comment.timestamp`
  - `comment.signature`
  - `comment.postCid`
  - `comment.parentCommentCid`
  - `comment.subplebbitIpnsName`
  - `comment.title`
  - `comment.content`
  - `comment.previousCommentCid`
  - `comment.commentIpnsName`
- [Comment Events](#subplebbit-events)
  - [`update`](#update)
  - [`challenge`](#challenge)
  - [`challengeverification`](#challengeverification)

## Plebbit API
The plebbit API for reading and writing to and from subplebbits.

### `Plebbit(plebbitOptions)`

> Create a plebbit instance.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| plebbitOptions | `PlebbitOptions` | Options for the plebbit instance |

##### PlebbitOptions

An object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| ipfsGatewayUrl | `string` | `'https://cloudflare-ipfs/ipfs/'` | URL of an IPFS gateway |
| ipfsApiUrl | `string` | `'http://localhost:8080'` | URL of an IPFS API |

#### Returns

| Type | Description |
| -------- | -------- |
| `Plebbit` | A `Plebbit` instance |

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
| `Promise<Comment>` | A `Comment` instance |

#### Example

```js
const commentCid = 'QmbWqx...'
const comment = await plebbit.getComment(commentCid)
console.log('comment:', comment)
if (comment.parentCommentCid) { // comment with no parent cid is a post
  plebbit.getComment(comment.parentCommentCid).then(parentPost => console.log('parent post:', parentPost))
}
comment.getCommentIpns().then(commentIpns => console.log('commentIpns:', commentIpns))
plebbit.getSubplebbit(comment.subplebbitIpnsName).then(subplebbit => console.log('subplebbit:', subplebbit))
plebbit.getComment(comment.previousCommentCid).then(previousComment => console.log('previous comment:', previousComment))
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
| subplebbitIpnsName | `string` | The IPNS name of the subplebbit |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Subplebbit>` | A `Subplebbit` instance |

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

### `plebbit.createComment(commentOptions)`

> Create a `Comment` instance. Posts are also comments.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| commentOptions | `CommentOptions` | The comment to create |

##### CommentOptions

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
| `Comment` | A `Comment` instance |

#### Example

```js
const comment = plebbit.createComment(commentOptions)
comment.on('challenge', async (challenge) => {
  const challengeAnswer = await askUserForChallengeAnswer(challenge)
  comment.publishChallengeAnswer(challengeAnswer)
})
comment.publish()
```

### `plebbit.createCommentEdit(commentEditOptions)`

> Create a `Comment` instance. Posts are also comments.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| commentEditOptions | `CommentEditOptions` | The comment edit to create |

##### CommentEditOptions

An object which may have the following keys:

| Name | Type | Description |
| ---- | ---- | ----------- |
| subplebbitIpnsName | `string` | IPNS name of the subplebbit |
| commentCid | The comment CID to be edited |
| content | `string` | Edited content of the comment |
| timestamp | `number` or `null` | Time of edit in ms, `Date.now()` if null |

#### Returns

| Type | Description |
| -------- | -------- |
| `Comment` | A `Comment` instance |

#### Example

```js
const commentEdit = plebbit.createCommentEdit(commentEditOptions)
commentEdit.on('challenge', async (challenge) => {
  const challengeAnswer = await askUserForChallengeAnswer(challenge)
  commentEdit.publishChallengeAnswer(challengeAnswer)
})
commentEdit.publish()
```

### `plebbit.createVote(voteOptions)`

> Create a `Vote` instance. `Vote` inherits from `Publication`, like `Comment`, so has the same API.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| voteOptions | `VoteOptions` | The vote to create |

##### VoteOptions

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
| `Vote` | A `Vote` instance |

#### Example

```js
const vote = plebbit.createVote(voteOptions)
vote.on('challenge', async (challenge) => {
  const challengeAnswer = await askUserForChallengeAnswer(challenge)
  comment.publishChallengeAnswer(challengeAnswer)
})
vote.publish()
```

## Subplebbit API
The subplebbit API for creating, updating and running subplebbits.

### `Subplebbit(subplebbitOptions)`

> Create a subplebbit instance.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| subplebbitOptions | `SubplebbitOptions` | Options for the `Subplebbit` instance |

##### SubplebbitOptions

An object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| subplebbitIpnsName | `string` | `undefined` | IPNS name of the subplebbit |
| ipfsGatewayUrl | `string` | `'https://cloudflare-ipfs/ipfs/'` | URL of an IPFS gateway |
| ipfsApiUrl | `string` | `'http://localhost:8080'` | URL of an IPFS API |

#### Returns

| Type | Description |
| -------- | -------- |
| `Subplebbit` | A `Subplebbit` instance |

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

### `subplebbit.update(subplebbitUpdateOptions)`

> Update the content of a subplebbit.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| subplebbit | `SubplebbitUpdateOptions` | The content of the subplebbit |

##### SubplebbitUpdateOptions

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
subplebbit.on('update', (updatedSubplebbitInstance) => console.log(updatedSubplebbitInstance))
subplebbit.start()
```

### `subplebbit.stop()`

> Stop listening for new posts on the pubsub, and stop publishing them every 5 minutes.

## Subplebbit Events
The subplebbit events.

### `update`

> The subplebbit's IPNS record has been updated, which means new posts may have been published.

#### Emits

| Type | Description |
| -------- | -------- |
| `Subplebbit` | The updated `Subplebbit` instance (the instance emits itself) |

#### Example

```js
const options = {
  ipfsGatewayUrl: 'https://cloudflare-ipfs/ipfs/',
  ipfsApiUrl: 'http://localhost:5001',
  subplebbitIpnsName: 'Qmb...'
}
const subplebbit = Subplebbit(options)
subplebbit.on('update', (subplebbitObject) => console.log(subplebbitObject))
subplebbit.start()
```

### `challengerequest`

> When the user publishes a comment, he makes a `'challengerequest'` to the pubsub, the subplebbit owner will send back a `challenge`, eg. a captcha that the user must complete.

#### Emits

| Type | Description |
| -------- | -------- |
| `ChallengeRequest` | The comment of the user and the challenge request |

Object is of the form:

```js
{ // ...TODO }
```

#### Example

```js
{ // ...TODO }
```

### `challengeanswer`

> After receiving a `Challenge`, the user owner will send back a `challengeanswer`.

#### Emits

| Type | Description |
| -------- | -------- |
| `ChallengeAnswer` | The challenge answer |

Object is of the form:

```js
{ // ...TODO }
```

#### Example

```js
{ // ...TODO }
```

## Comment API
The comment API for publishing a comment, awaiting. `Comment`, `Vote` and `CommentEdit` inherit `Publication` and all have a similar API.

### `comment.publish()`

> Publish the comment to the pubsub. You must then wait for the `'challenge'` event and answer with a `ChallengeAnswer`.

#### Example

```js
const comment = plebbit.createComment(commentObject)
comment.on('challenge', async (challenge) => {
  const challengeAnswer = await askUserForChallengeAnswer(challenge)
  comment.publishChallengeAnswer(challengeAnswer)
})
comment.publish()
```

### `comment.publishChallengeAnswer(challengeAnswer)`

> Update the content of a subplebbit.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| challengeAnswer | `string` | The challenge answer |

#### Example

```js
const comment = plebbit.createComment(commentObject)
comment.on('challenge', async (challenge) => {
  const challengeAnswer = await askUserForChallengeAnswer(challenge)
  comment.publishChallengeAnswer(challengeAnswer)
})
comment.publish()
```

### `comment.getCommentIpns()`

> Get the `CommentIpns`, ie. the mutable parts of the comments like vote counts, replies, edits, etc.

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<CommentIpns>` | The comment's `CommentIpns` |

Object is of the form:

```js
{ // ...TODO }
```

#### Example

```js
const comment = plebbit.getComment(commentCid)
const commentIpns = comment.getCommentIpns()
console.log(commentIpns)
```

## Comment Events
The comment events.

### `update`

> The comment's `CommentIpns`'s record has been updated, which means vote counts and replies may have changed.

#### Emits

| Type | Description |
| -------- | -------- |
| `CommentIpns` | The updated `CommentIpns` |

Object is of the form:

```js
{ // ...TODO }
```

#### Example

```js
const comment = await plebbit.getComment(commentCid)
comment.on('update', (commentIpns) => {
  console.log(commentIpns)
})
```

### `challenge`

> After publishing a comment, the subplebbit owner will send back a `challenge`, eg. a captcha that the user must complete.

#### Emits

| Type | Description |
| -------- | -------- |
| `Challenge` | The challenge the user must complete |

Object is of the form:

```js
{ // ...TODO }
```

#### Example

```js
const comment = plebbit.createComment(commentObject)
comment.on('challenge', async (challenge) => {
  const challengeAnswer = await askUserForChallengeAnswer(challenge)
  comment.publishChallengeAnswer(challengeAnswer)
})
comment.publish()
```

### `challengeverification`

> After publishing a challenge answer, the subplebbit owner will send back a `challengeverification` to let the network know if the challenge was completed successfully.

#### Emits

| Type | Description |
| -------- | -------- |
| `ChallengeVerification` | The challenge verification result |

Object is of the form:

```js
{ // ...TODO }
```

#### Example

```js
const comment = plebbit.createComment(commentObject)
comment.on('challenge', async (challenge) => {
  const challengeAnswer = await askUserForChallengeAnswer(challenge)
  comment.publishChallengeAnswer(challengeAnswer)
})
comment.on('challengeverification', (challengeVerification) => console.log(challengeVerification))
comment.publish()
```
