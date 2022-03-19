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

```js
Address: string // A plebbit author, subplebbit or multisub "address" can be a crypto domain like memes.eth, an IPNS name, an ethereum address, etc
Publication {
  author: Author
  subplebbitAddress: string // all publications are directed to a subplebbit owner
  timestamp: number // number in seconds
  signature: Signature // sign immutable fields like author, title, content, timestamp to prevent tampering
}
Comment extends Publication /* (IPFS file) */ {
  postCid?: string // helps faster loading post info for reply direct linking, should be added by the subplebbit owner not author
  parentCid?: string // same as postCid for top level comments
  content: string
  previousCid: string // each post is a linked list
  ipnsName: string // each post/comment needs its own IPNS record (CommentUpdate) for its mutable data like edits, vote counts, comments
}
Post extends Comment /* (IPFS file) */ {
  postCid: undefined // post is same as comment but has no parent and some extra fields
  parentCid: undefined // post is same as comment but has no parent and some extra fields
  title: string
  link: string
  thumbnailUrl: string // fetched by subplebbit owner, not author, some web pages have thumbnail urls in their meta tags https://moz.com/blog/meta-data-templates-123
}
Vote extends Publication {
  commentCid: string
  vote: 1 | -1 | 0 // 0 is needed to cancel a vote
}
CommentUpdate /* (IPNS record Comment.ipnsName) */ {
  editedContent: string // the author has edited the comment content
  upvoteCount: number
  downvoteCount: number
  replies: Pages // only preload page 1 sorted by 'topAll', might preload more later, only provide sorting for posts (not comments) that have 100+ child comments
}
Author {
  displayName: string
  address: string
}
Signature {
  signature: string // data in base64
  publicKey: buffer // include public key (marshalled, like IPNS does it) because the IPNS name is just a hash of it
  type: string // multiple versions/types to allow signing with metamask/other wallet or to change the signature fields or algorithm
}
Signer {
  privateKey?: string | buffer // to sign with metamask, no need for private key
  type: string // multiple versions/types to allow signing with metamask/other wallet or to change the signature fields or algorithm
}
Subplebbit /* (IPNS record Subplebbit.address) */ {
  title: string
  description: string
  moderatorsAddresses: string[]
  pubsubTopic: string // the string to publish to in the pubsub, a public key of the subplebbit owner's choice
  latestPostCid: string // the most recent post in the linked list of posts
  posts: Pages // only preload page 1 sorted by 'hot', might preload more later, comments should include Comment + CommentUpdate data
  challengeTypes: ChallengeType[] // optional, only used for displaying on frontend, don't rely on it for challenge negotiation
  metricsCid: subplebbitMetricsCid
}
Pages {
  pages: {[key: PostsSortType | RepliesSortType]: Page} // e.g. subplebbit.posts.pages.hot.comments[0].cid = 'Qm...'
  pageCids: {[key: PostsSortType | RepliesSortType]: pageCid} // e.g. subplebbit.posts.pageCids.topAll = 'Qm...'
}
Page /* (IPFS file) */ {
  nextCid: string // get next page (sorted by the same sort type)
  comments: Comment[] // Comments should include Comment + CommentUpdate data
}
PostsSortType: 'hot' | 'new' | 'topHour' | 'topDay' | 'topWeek' | 'topMonth' | 'topYear' | 'topAll' | 'controversialHour' | 'controversialDay' | 'controversialWeek' | 'controversialMonth' | 'controversialYear' | 'controversialAll'
RepliesSortType: 'topAll' | 'new' | 'old' | 'controversialAll'
SubplebbitMetrics {
  hourActiveUserCount: number
  dayActiveUserCount: number
  weekActiveUserCount: number
  monthActiveUserCount: number
  yearActiveUserCount: number
  allActiveUserCount: number
  hourPostCount: number
  dayPostCount: number
  weekPostCount: number
  monthPostCount: number
  yearPostCount: number
  allPostCount: number
}
ChallengeType {
  type: 'image' | 'text' | 'video' | 'audio' | 'html'
  //...other properties for more complex types later, e.g. an array of whitelisted addresses, a token address, etc,
}
Multisub /* (IPNS record Multisub.address) */ {
  title?: string
  description?: string
  subplebbits: MultisubSubplebbit[]
}
MultisubSubplebbit { // this metadata is set by the owner of the Multisub, not the owner of the subplebbit
  address: Address
  title?: string
  description?: string 
  tags?: string[]
  languages?: string[] // client can detect language and hide/show subplebbit based on it
  locations?: string[] // client can detect location and hide/show subplebbit based on it
  safeForWork?: boolean // client can detect user's SFW setting and hide/show subplebbit based on it
}
PlebbitDefaults { // fetched once when app first load, a dictionary of default settings
  multisubAddresses: {[key: multisubName]: Address}
  // plebbit has 3 default multisubs
  multisubAddresses.all: Address // the default subplebbits to show at url plebbit.eth/p/all
  multisubAddresses.crypto: Address // the subplebbits to show at url plebbit.eth/p/crypto
  multisubAddresses.search: Address // list of thousands of semi-curated subplebbits to "search" for in the client (only search the Multisub metadata, don't load each subplebbit)
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

const messageToSign = cborg.encode({subplebbitAddress, author, title, content, timestamp}) // use cborg to stringify deterministically instead of JSON.stringify
const rsaInstanceSignature = await rsaInstance.sign(messageToSign)

// can also be done in node (but not browser compatible)
require('crypto').sign('sha256', messageToSign, privateKeyPemString)

// to get marshalled (serialized) public key for signature.publicKey field
signature.publicKey = rsaInstance.public.marshal()
// or
signature.publicKey = libp2pCrypto.keys.marshalPublicKey(rsaInstance.public, 'RSA')

// to verify a signed post
const post = {/* ...some post */}
const postToVerify = cborg.encode({subplebbitAddress: post.subplebbitAddress, author: post.author, title: post.title, content: post.content, timestamp: post.timestamp})
const rsaPublicKeyInstance = (await PeerId.createFromPubKey(post.signature.publicKey)).pubKey
const signatureIsValid = await rsaPublicKeyInstance.verify(postToVerify, post.signature.signature)
```

### Pubsub message types

```js
PubsubMessage: {
  type: 'CHALLENGEREQUEST' | 'CHALLENGE' | 'CHALLENGEANSWER' | 'CHALLENGEVERIFICATION'
}
ChallengeRequestMessage extends PubsubMessage /* (sent by post author) */ {
  challengeRequestId: string // random string choosen by sender
  acceptedChallengeTypes: string[] // list of challenge types the client can do, for example cli clients or old clients won't do all types
  publication: Publication // include the publication so the sub owner can publish it right away
}
ChallengeMessage extends PubsubMessage /* (sent by subplebbit owner) */ {
  challengeRequestId: string
  challenges: Challenge[] // a challenge can have more than 1 challenge
}
ChallengeAnswerMessage extends PubsubMessage /* (sent by post author) */ {
  challengeRequestId: string
  challengeAnswerId: string // random string choosen by sender
  challengeAnswers: string[] // for example ['2+2=4', '1+7=8']
}
ChallengeVerificationMessage extends PubsubMessage /* (sent by subplebbit owner) */ {
  challengeRequestId: string // include in verification in case a peer is missing it
  challengeAnswerId: string // include in verification in case a peer is missing it
  challengePassed: bool // true if the challenge verification is successful
  challengeErrors?: (string|undefined)[] // tell the user which challenge failed and why
  reason?: string // reason for failed verification, for example post content is too long. could also be used for successful verification that bypass the challenge, for example because an author has good history
  publication?: Publication // include feedback about the publication if needed, for example for a Comment include Publication.cid so the author can resolve his own published comment immediately
}
Challenge {
  type: 'image' | 'text' | 'audio' | 'video' | 'html' // tells the client how to display the challenge, start with implementing image and text only first
  challenge: buffer // data required to complete the challenge, could be html, png, etc.
}
```

# API

- [Plebbit API](#plebbit-api)
  - [`Plebbit(plebbitOptions)`](#plebbitplebbitoptions)
  - `plebbit.getMultisub(multisubAddress)`
  - [`plebbit.getSubplebbit(subplebbitAddress)`](#plebbitgetsubplebbitsubplebbitaddress)
  - [`plebbit.getComment(commentCid)`](#plebbitgetcommentcommentcid)
  - `plebbit.createMultisub(createMultisubOptions)`
  - [`plebbit.createSubplebbit(createSubplebbitOptions)`](#plebbitcreatesubplebbitcreatesubplebbitoptions)
  - [`plebbit.createComment(createCommentOptions)`](#plebbitcreatecommentcreatecommentoptions)
  - [`plebbit.createCommentEdit(createCommentEditOptions)`](#plebbitcreatecommenteditcreatecommenteditoptions)
  - [`plebbit.createVote(createVoteOptions)`](#plebbitcreatevotecreatevoteoptions)
  - `plebbit.getDefaults()`
- [Subplebbit API](#subplebbit-api)
  - [`subplebbit.edit(subplebbitEditOptions)`](#subplebbiteditsubplebbiteditoptions)
  - [`subplebbit.start()`](#subplebbitstart)
  - [`subplebbit.stop()`](#subplebbitstop)
  - [`subplebbit.update()`](#subplebbitupdate)
  - `subplebbit.address`
  - `subplebbit.signer`
  - `subplebbit.title`
  - `subplebbit.description`
  - `subplebbit.moderatorsAddresses`
  - `subplebbit.posts`
  - `subplebbit.latestPostCid`
  - `subplebbit.pubsubTopic`
  - `subplebbit.challengeTypes`
  - `subplebbit.metrics`
- [Subplebbit Events](#subplebbit-events)
  - [`update`](#update)
  - [`challengerequest`](#challengerequest)
  - [`challengeanswer`](#challengeanswer)
- [Comment API](#comment-api)
  - [`comment.publish()`](#commentpublish)
  - [`comment.publishChallengeAnswers()`](#commentpublishchallengeanswerschallengeanswers)
  - [`comment.update()`](#commentupdate)
  - [`comment.stop()`](#commentstop)
  - `comment.author`
  - `comment.timestamp`
  - `comment.signature`
  - `comment.previousCid`
  - `comment.postCid`
  - `comment.parentCid`
  - `comment.subplebbitAddress`
  - `comment.title`
  - `comment.content`
  - `comment.link`
  - `comment.ipnsName`
  - `(only available after challengeverification event)`
  - `comment.cid`
  - `(only available after first update event)`
  - `comment.editedContent`
  - `comment.upvoteCount`
  - `comment.downvoteCount`
  - `comment.replies`
- [Comment Events](#comment-events)
  - [`update`](#update)
  - [`challenge`](#challenge)
  - [`challengeverification`](#challengeverification)
- [Pages API](#pages-api)
  - [`pages.getPage(pageCid)`](#pagesgetpagepagecid)
  - `pages.pages`
  - `pages.pageCids`

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
| ipfsGatewayUrl | `string` | `'https://cloudflare-ipfs.com'` | URL of an IPFS gateway |
| ipfsApiUrl | `string` | `'http://localhost:8080'` | URL of an IPFS API |
| dataPath | `string` | .plebbit folder in the current working directory | (Node only) Folder path to create/resume the user and subplebbit databases |

#### Returns

| Type | Description |
| -------- | -------- |
| `Plebbit` | A `Plebbit` instance |

#### Example

```js
const Plebbit = require('@plebbit/plebbit-js')
const options = {
  ipfsGatewayUrl: 'https://cloudflare-ipfs.com',
  ipfsApiUrl: 'http://localhost:5001',
  dataPath: __dirname
}
const plebbit = Plebbit(options) // should be independent instance, not singleton
```

### `plebbit.getSubplebbit(subplebbitAddress)`

> Get a subplebbit comment by its IPNS name.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| subplebbitAddress | `string` | The IPNS name of the subplebbit |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Subplebbit>` | A `Subplebbit` instance. |

#### Example

```js
const subplebbitAddress = 'QmbWqx...'
const subplebbit = await plebbit.getSubplebbit(subplebbitAddress)
console.log(subplebbit)

let currentPostCid = subplebbit.latestPostCid
const scrollAllSubplebbitPosts = async () => {
  while (currentPostCid) {
    const post = await plebbit.getComment(currentPostCid)
    console.log(post)
    currentPostCid = post.previousCid
  }
  console.log('there are no more posts')
}
scrollAllSubplebbitPosts()
/*
Prints:
{ ...TODO }
*/
```

### `plebbit.getComment(commentCid)`

> Get a plebbit comment by its IPFS CID. Posts are also comments.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| commentCid | `string` | The IPFS CID of the comment |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Comment>` | A `Comment` instance |

#### Example

```js
const commentCid = 'QmbWqx...'
const comment = await plebbit.getComment(commentCid)
console.log('comment:', comment)
comment.on('update', updatedComment => console.log('comment with latest data', updatedComment))
if (comment.parentCid) { // comment with no parent cid is a post
  plebbit.getComment(comment.parentCid).then(parentPost => console.log('parent post:', parentPost))
}
plebbit.getSubplebbit(comment.subplebbitAddress).then(subplebbit => console.log('subplebbit:', subplebbit))
plebbit.getComment(comment.previousCid).then(previousComment => console.log('previous comment:', previousComment))
/*
Prints:
{ ...TODO }
*/
```

### `plebbit.createSubplebbit(createSubplebbitOptions)`

> Create a subplebbit instance. Should update itself on update events after `Subplebbit.update()` is called if `CreateSubplebbitOptions.address` exists. If `CreateSubplebbitOptions.signer` exists, can call `Subplebbit.edit(subplebbitEditOptions)` to edit the subplebbit as the owner, and `Subplebbit.start()` to listen for new posts on the pubsub and publish updates as the owner.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| createSubplebbitOptions | `CreateSubplebbitOptions` | Options for the `Subplebbit` instance |

##### CreateSubplebbitOptions

An object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| address | `string` | `undefined` | IPNS name of the subplebbit |
| signer | `Signer` | `undefined` | (Subplebbit owners only) A `Signer` object which contains the private key of the subplebbit |
| database | `KnexConfig` or `undefined` | `undefined` | (Subplebbit owners only) Optional [KnexConfig](https://www.npmjs.com/package/knex), defaults to SQLite database at `plebbit.dataPath/subplebbitAddress` |

#### Returns

| Type | Description |
| -------- | -------- |
| `Subplebbit` | A `Subplebbit` instance |

#### Example

```js
const Plebbit = require('@plebbit/plebbit-js')
const plebbitOptions = {
  ipfsGatewayUrl: 'https://cloudflare-ipfs.com',
  ipfsApiUrl: 'http://localhost:5001',
  dataPath: __dirname
}
const plebbit = Plebbit(plebbitOptions)
const subplebbitOptions = {
  address: 'Qmb...',
  signer: {privateKey: 'qwer...'}
}
// create a subplebbit instance
const subplebbit = plebbit.createSubplebbit(subplebbitOptions)
// edit the subplebbit info in the database
subplebbit.edit({
  title: 'Memes',
  description: 'Post your memes here.',
  pubsubTopic: 'Qmb...'
})
// start publishing updates every 5 minutes
subplebbit.start()
```

### `plebbit.createComment(createCommentOptions)`

> Create a `Comment` instance. Posts/Replies are also comments. Should update itself on update events after `Comment.update()` is called if `CreateCommentOptions.cid` or `CreateCommentOptions.ipnsName` exists.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| createCommentOptions | `CreateCommentOptions` | The comment to create |

##### CreateCommentOptions

An object which may have the following keys:

| Name | Type | Description |
| ---- | ---- | ----------- |
| subplebbitAddress | `string` | IPNS name of the subplebbit |
| parentCid | `string` or `undefined` | The parent comment CID, undefined if comment is a post, same as postCid if comment is top level |
| content | `string` or `undefined` | Content of the comment, link posts have no content |
| title | `string` or `undefined` | If comment is a post, it needs a title |
| link | `string` or `undefined` | If comment is a post, it might be a link post |
| timestamp | `number` or `undefined` | Time of publishing in seconds, `Math.round(Date.now() / 1000)` if undefined |
| author | `Author` | Author of the comment |
| signer | `Signer` | Signer of the comment |
| cid | `string` or `undefined` | (Not for publishing) Gives access to `Comment.on('update')` for a comment already fetched |
| ipnsName | `string` or `undefined` | (Not for publishing) Gives access to `Comment.on('update')` for a comment already fetched |

#### Returns

| Type | Description |
| -------- | -------- |
| `Comment` | A `Comment` instance |

#### Example

```js
const comment = plebbit.createComment(createCommentOptions)
comment.on('challenge', async (challengeMessage) => {
  const challengeAnswers = await askUserForChallengeAnswers(challengeMessage.challenges)
  comment.publishChallengeAnswers(challengeAnswers)
})
comment.publish()

// or if you already fetched a comment but want to get updates
const comment = plebbit.createComment({ipnsName: 'Qm...'})
// looks for updates in the background every 5 minutes
comment.on('update', (updatedComment) => console.log(updatedComment))
comment.update()
```

### `plebbit.createCommentEdit(createCommentEditOptions)`

> Create a `Comment` instance. Posts/Replies are also comments.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| createCommentEditOptions | `CreateCommentEditOptions` | The comment edit to create |

##### CreateCommentEditOptions

An object which may have the following keys:

| Name | Type | Description |
| ---- | ---- | ----------- |
| subplebbitAddress | `string` | IPNS name of the subplebbit |
| commentCid | The comment CID to be edited |
| editedContent | `string` | Edited content of the comment |
| timestamp | `number` or `undefined` | Time of edit in ms, `Date.now()` if undefined |
| signer | `Signer` | Signer of the comment |

#### Returns

| Type | Description |
| -------- | -------- |
| `Comment` | A `Comment` instance |

#### Example

```js
const commentEdit = plebbit.createCommentEdit(createCommentEditOptions)
commentEdit.on('challenge', async (challengeMessage) => {
  const challengeAnswers = await askUserForChallengeAnswer(challengeMessage.challenges)
  commentEdit.publishChallengeAnswers(challengeAnswers)
})
commentEdit.publish()
```

### `plebbit.createVote(createVoteOptions)`

> Create a `Vote` instance. `Vote` inherits from `Publication`, like `Comment`, so has the same API.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| createVoteOptions | `CreateVoteOptions` | The vote to create |

##### CreateVoteOptions

An object which may have the following keys:

| Name | Type | Description |
| ---- | ---- | ----------- |
| subplebbitAddress | `string` | IPNS name of the subplebbit |
| commentCid | `string` | The comment or post to vote on |
| timestamp | `number` or `undefined` | Time of publishing in ms, `Date.now()` if undefined |
| author | `Author` | Author of the comment, will be needed for voting with NFTs or tokens |
| vote | `1` or `0` or `-1` | 0 is for resetting a vote |
| signer | `Signer` | Signer of the vote |

#### Returns

| Type | Description |
| -------- | -------- |
| `Vote` | A `Vote` instance |

#### Example

```js
const vote = plebbit.createVote(createVoteOptions)
vote.on('challenge', async (challengeMessage) => {
  const challengeAnswers = await askUserForChallengeAnswers(challengeMessage.challenges)
  comment.publishChallengeAnswers(challengeAnswers)
})
vote.publish()
```

## Subplebbit API
The subplebbit API for getting subplebbit updates, or creating, editing, running a subplebbit as an owner.

### `subplebbit.edit(subplebbitEditOptions)`

> Edit the content/information of a subplebbit in your local database. Only usable if `Subplebbit.signer` exists (ie. you are the subplebbit owner).

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| subplebbit | `SubplebbitEditOptions` | The content/information of the subplebbit |

##### SubplebbitEditOptions

An object which may have the following keys:

| Name | Type | Description |
| ---- | ---- | ----------- |
| title | `string` | Title of the subplebbit |
| description | `string` | Description of the subplebbit |
| moderatorsAddresses | `string[]` | IPNS names of the moderators |
| latestPostCid | `string` | The most recent post in the linked list of posts |
| posts | `Pages` | Only preload page 1 sorted by 'hot', might preload more later, should include some child comments and vote counts for each post |
| pubsubTopic | `string` | The string to publish to in the pubsub, a public key of the subplebbit owner's choice |
| challengeTypes | `ChallengeType[]` | The challenge types provided by the subplebbit owner |
| metrics | `SubplebbitMetrics` | The self reported metrics of the subplebbit |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<SubplebbitEditResponse>` | The Knex response from the database |

Object is of the form:

```js
{ // ...TODO }
```

#### Example

```js
// TODO
```

### `subplebbit.start()`

> Start listening for new posts on the pubsub, and publishing them every 5 minutes. Only usable if subplebbit.signer exists.

#### Example

```js
const options = {
  title: 'Your subplebbit title'
}
const subplebbit = plebbit.createSubplebbit(options)
// edit the subplebbit info in the database
subplebbit.edit({
  title: 'Memes',
  description: 'Post your memes here.',
  pubsubTopic: 'Qmb...'
})
// start publishing updates/new posts
subplebbit.start()
```

### `subplebbit.stop()`

> Stop polling the network for new subplebbit updates started by subplebbit.update(). Also stop listening for new posts on the pubsub started by subplebbit.start(), and stop publishing them every 5 minutes.

### `subplebbit.update()`

> Start polling the network for new posts published in the subplebbit, update itself and emit the 'update' event. Only usable if subplebbit.address exists.

#### Example

```js
const options = {
  address: 'Qmb...'
}
const subplebbit = plebbit.createSubplebbit(options)
subplebbit.on('update', (updatedSubplebbitInstance) => {
  console.log(updatedSubplebbitInstance)

  // if you want to stop polling for new updates after only the first one
  subplebbit.stop()
})
subplebbit.update()
```

## Subplebbit Events
The subplebbit events.

### `update`

> The subplebbit's IPNS record has been updated, which means new posts may have been published.

#### Emits

| Type | Description |
| -------- | -------- |
| `Subplebbit` | The updated `Subplebbit` instance (the instance emits itself), i.e. `this` |

#### Example

```js
const options = {
  address: 'Qmb...'
}
const subplebbit = plebbit.createSubplebbit(options)
subplebbit.on('update', (updatedSubplebbit) => console.log(updatedSubplebbit))
subplebbit.update()

// stop updating in 10 minutes
setTimeout(() => subplebbit.stop(), 60000)
```

### `challengerequest`

> When the user publishes a comment, he makes a `'challengerequest'` to the pubsub, the subplebbit owner will send back a `challenge`, eg. a captcha that the user must complete.

#### Emits

| Type | Description |
| -------- | -------- |
| `ChallengeRequestMessage` | The comment of the user and the challenge request |

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
| `ChallengeAnswerMessage` | The challenge answer |

Object is of the form:

```js
{ // ...TODO }
```

#### Example

```js
{ // ...TODO }
```

## Comment API
The comment API for publishing a comment as an author, or getting comment updates. `Comment`, `Vote` and `CommentEdit` inherit `Publication` class and all have a similar API. A `Comment` updates itselfs on update events after `Comment.update()` is called if `Comment.cid` or `Comment.ipnsName` exists.

### `comment.publish()`

> Publish the comment to the pubsub. You must then wait for the `'challenge'` event and answer with a `ChallengeAnswer`.

#### Example

```js
const comment = plebbit.createComment(commentObject)
comment.on('challenge', async (challengeMessage) => {
  const challengeAnswers = await askUserForChallengeAnswers(challengeMessage.challenges)
  comment.publishChallengeAnswers(challengeAnswers)
})
comment.publish()
```

### `comment.publishChallengeAnswers(challengeAnswers)`

> Publish your answers to the challenges e.g. the captcha answers.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| challengeAnswers | `string[]` | The challenge answers |

#### Example

```js
const comment = plebbit.createComment(commentObject)
comment.on('challenge', async (challengeMessage) => {
  const challengeAnswers = await askUserForChallengeAnswers(challengeMessage.challenges)
  comment.publishChallengeAnswers(challengeAnswers)
})
comment.publish()
```

### `comment.update()`

> Start polling the network for comment updates (replies, upvotes, edits, etc), update itself and emit the update event. Only usable if comment.cid or comment.ipnsName exists.

#### Example

```js
const commentCid = 'Qmb...'
const comment = await plebbit.getComment(commentCid)
comment.on('update', (updatedCommentInstance) => {
  console.log(updatedCommentInstance)

  // if you want to stop polling for new updates after only the first one
  comment.stop()
})
comment.update()

// if you already fetched the comment and only want the updates
const commentDataFetchedEarlier = {content, author, cid, ipnsName, etc...}
const comment = plebbit.createComment(commentDataFetchedEarlier)
comment.on('update', () => {
  console.log('the comment instance updated itself:', comment)
})
comment.update()
```

### `comment.stop()`

> Stop polling the network for new comment updates started by comment.update().

## Comment Events
The comment events.

### `update`

> The comment's `Comment.ipnsName`'s record has been updated, which means vote counts and replies may have changed. To start polling the network for updates, call `Comment.update()`. If the previous `CommentUpdate` is the same, do not emit `update`.

#### Emits

| Type | Description |
| -------- | -------- |
| `Comment` | The updated `Comment`, i.e. itself, `this` |

Object is of the form:

```js
{ // ...TODO }
```

#### Example

```js
const comment = await plebbit.getComment(commentCid)
comment.on('update', (updatedComment) => {
  console.log(updatedComment)
})
comment.update()

// stop looking for updates after 10 minutes
setTimeout(() => comment.stop(), 60000)
```

### `challenge`

> After publishing a comment, the subplebbit owner will send back a `challenge`, eg. a captcha that the user must complete.

#### Emits

| Type | Description |
| -------- | -------- |
| `ChallengeMessage` | The challenge the user must complete |

Object is of the form:

```js
{ // ...TODO }
```

#### Example

```js
const comment = plebbit.createComment(commentObject)
comment.on('challenge', async (challengeMessage) => {
  const challengeAnswers = await askUserForChallengeAnswers(challengeMessage.challenges)
  comment.publishChallengeAnswers(challengeAnswers)
})
comment.publish()
```

### `challengeverification`

> After publishing a challenge answer, the subplebbit owner will send back a `challengeverification` to let the network know if the challenge was completed successfully.

#### Emits

| Type | Description |
| -------- | -------- |
| `ChallengeVerificationMessage` | The challenge verification result |

Object is of the form:

```js
{ // ...TODO }
```

#### Example

```js
const comment = plebbit.createComment(commentObject)
comment.on('challenge', async (challengeMessage) => {
  const challengeAnswers = await askUserForChallengeAnswers(challengeMessage.challenges)
  comment.publishChallengeAnswers(challengeAnswers)
})
comment.on('challengeverification', (challengeVerification) => console.log('published post cid is', challengeVerification?.publication?.cid))
comment.publish()
```

## Pages API
The pages API for scrolling pages of a subplebbit or replies to a post/comment. `Subplebbit.posts` and `Comment.replies` are `Pages` instances. `Subplebbit.posts.pages.hot` is a `Page` instance.

### `pages.getPage(pageCid)`

> Get a `Page` instance using an IPFS CID from `Pages.pageCids[sortType]`, e.g. `Subplebbit.posts.pageCids.hot` or `Comment.replies.pageCids.topAll`.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| pageCid | `string` | The IPFS CID of the page |

#### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Page>` | A `Page` instance |

#### Example

```js
// get sorted posts in a subplebbit
const subplebbit = await plebbit.getSubplebbit(subplebbitAddress)
const pageSortedByTopYear = await subplebbit.posts.getPage(subplebbit.posts.pageCids.topYear)
const postsSortedByTopYear = pageSortedByTopYear.comments
console.log(postsSortedByTopYear)

// get sorted replies to a post or comment
const post = await plebbit.getComment(commentCid)
post.on('update', async updatedPost => {
  let replies
  // try to get sorted replies by sort type 'new'
  // sorted replies pages are not always available, for example if the post only has a few replies
  if (updatedPost.replies?.pageCids?.new) {
    const repliesPageSortedByNew = await updatedPost.replies.getPage(updatedPost.replies.pageCids.new)
    replies = repliesPageSortedByNew.comments
  }
  else {
    // the 'topAll' sort type is always preloaded by default on replies and can be used as fallback
    // on subplebbits.posts only 'hot' is preloaded by default
    replies = updatedPost.replies.pages.topAll.comments
  }
  console.log(replies)
})
```
