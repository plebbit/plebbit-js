## Get started running the plebbit JSON-RPC websocket server

```js
const {PlebbitWsServer} = require('@plebbit/plebbit-js/rpc')
const port = 8080
const plebbitOptions = {ipfsHttpClientsOptions: ['http://localhost:5001/api/v0']}
const plebbitWebSocketServer = await PlebbitWsServer({port, plebbitOptions})

// debug raw JSON RPC messages in console (optional)
plebbitWebSocketServer.ws.on('connection', (socket, request) => {
  console.log('connection')
  socket.on('message', (message) => console.log(message.toString()))
})

// handle plebbit and wss errors
plebbitWebSocketServer.on('error', console.log)

console.log(`test server plebbit wss listening on port ${port}`)
```

## Get started making client requests

```js
const WebSocketClient = require('rpc-websockets').Client // or any JSON RPC websocket compatible library
const webSocketClient = new WebSocketClient(`ws://localhost:${port}`)

// debug raw JSON RPC messages in console (optional)
webSocketClient.socket.on('message', (message) => console.log('from server:', message.toString()))

// wait for websocket connection  to open
await new Promise((resolve) => webSocketClient.on('open', resolve))

// save all subscription messages (ie json rpc messages without 'id', also called json rpc 'notifications')
// NOTE: it is possible to receive a subscription message before receiving the subscription id
const subscriptionsMessages = {}
webSocketClient.socket.on('message', (jsonMessage) => {
  const message = JSON.parse(jsonMessage)
  const subscriptionId = message?.params?.subscription
  if (subscriptionId) {
    if (!subscriptionsMessages[subscriptionId]) {
      subscriptionsMessages[subscriptionId] = []
    }
    subscriptionsMessages[subscriptionId].push(message)
    // delete the message after 1 minute to not cause memory leak
    setTimeout(() => subscriptionsMessages[subscriptionId].shift(), 60000)
  }
})

class Subscription extends EventEmitter {
  constructor(subscriptionId) {
    super()
    let emittingMessages = false
    this.on('newListener', (eventName) => {
      // emit all subscription messages received before the listener started
      if (eventName === 'message') {
        for (const message of subscriptionsMessages[subscriptionId] || []) {
          this.emit('message', message)
        }
      }
      // emit all new messages
      if (!emittingMessages) {
        emittingMessages = true
        webSocketClient.socket.on('message', emitMessage)
      }
    })
    // stop listening if listener is removed
    this.on('removeListener', (eventName) => {
      if (eventName === 'message' && this.listenerCount('message') === 0) {
        emittingMessages = false
        webSocketClient.socket.off('message', emitMessage)
      }
    })
    function emitMessage(jsonMessage) {
      const message = JSON.parse(jsonMessage)
      if (subscriptionId === message?.params?.subscription) {
        this.emit('message', message)
      }
    }
  }
}

// get comment
const commentCid = 'Qm...'
const comment = await webSocketClient.call('getComment', [commentCid])
console.log(comment)

// get comment updates
const subscriptionId = await webSocketClient.call('commentUpdate', [comment.cid])
new Subscription(subscriptionId).on('message', console.log)
```

# JSON-RPC Websocket API

- `method: getComment, params: [cid: string], result: Comment`
- `method: getCommentPage, params: [pageCid, commentCid]`
- `method: getSubplebbitPage, params: [pageCid, subplebbitAddress]`
- `method: createSubplebbit, params: [createSubplebbitOptions]`
- `method: startSubplebbit, params: [address: string]`
- `method: stopSubplebbit, params: [address: string]`
- `method: editSubplebbit, params: [address: string, subplebbitEditOptions]`
- `method: deleteSubplebbit, params: [address: string]`
- `method: listSubplebbits, params: []`
- `method: getDefaults, params: []`
- `method: fetchCid, params: [cid: string]`
- `method: getPlebbitOptions, params: []`
- `method: setPlebbitOptions, params: [plebbitOptions]`
- `method: getPeers, params: []`
- `method: getStats, params: []`

# JSON-RPC Pubsub Websocket API

- [`method: commentUpdate, params: [cid: string]`](#commentupdate)
- [`method: subplebbitUpdate, params: [address: string]`](#subplebbitupdate)
- [`method: publishComment, params: [comment]`](#publishcomment)
- `method: publishVote, params: [vote]`
- `method: publishCommentEdit, params: [commentEdit]`
- `method: publishChallengeAnswers, params: [subscriptionId: number, challengeAnswers: string[]]`
- [`method: unsubscribe, params: [subscriptionId: number]`](#unsubscribe)

## commentUpdate

Subscribe to a comment update to receive notifications when the comment is updated, e.g. has a new reply

### Parameters:

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | `string` | CID of the comment |

### Result:

`<number>` - Subscription id \(needed to unsubscribe\)

### Code sample:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "commentUpdate",
  "params": [
    "Qm...",
    "12D3KooW..."
  ]
}
```

### Response:

```json
{ "jsonrpc": "2.0", "result": 23784, "id": 1 }
```

#### Notification Format:

The notification format is the same as seen in the plebbit-js [Comment Events](https://github.com/plebbit/plebbit-js#comment-events)

`update` event:

```json
{
  "jsonrpc": "2.0",
  "method": "commentUpdate",
  "params": {
    "result": {
      "cid": "Qm...",
      "upvoteCount": 1,
      "downvoteCount": 0,
      "replyCount": 0,
      "updatedAt": 1689886478
    },
    "event": "update",
    "subscription": 23784
  }
}
```

`statechange` event:

```json
{
  "jsonrpc": "2.0",
  "method": "commentUpdate",
  "params": {
    "result": "fetching-ipfs",
    "event": "statechange",
    "subscription": 23784
  }
}
```

## subplebbitUpdate

Subscribe to a subplebbit update to receive notifications when the subplebbit is updated, e.g. has a new post

### Parameters:

| Name | Type | Description |
| ---- | ---- | ----------- |
| address | `string` | address of the subplebbit |

### Result:

`<number>` - Subscription id \(needed to unsubscribe\)

### Code sample:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "subplebbitUpdate",
  "params": [
    "memes.eth"
  ]
}
```

### Response:

```json
{ "jsonrpc": "2.0", "result": 23784, "id": 1 }
```

#### Notification Format:

The notification format is the same as seen in the plebbit-js [Subplebbit Events](https://github.com/plebbit/plebbit-js#subplebbit-events)

`update` event:

```json
{
  "jsonrpc": "2.0",
  "method": "subplebbitUpdate",
  "params": {
    "result": {
      "title": "Memes",
      "description": "Publish memes here",
      "updatedAt": 1689886478
    },
    "event": "update",
    "subscription": 23784
  }
}
```

`statechange` event:

```json
{
  "jsonrpc": "2.0",
  "method": "subplebbitUpdate",
  "params": {
    "result": "fetching-ipfs",
    "event": "statechange",
    "subscription": 23784
  }
}
```

## publishComment

Publish a comment and subscribe to receive notifications of the challenge pubsub message received and other publishing state changes

### Parameters:

| Name | Type | Description |
| ---- | ---- | ----------- |
| comment | `Comment` | Comment to publish |

### Result:

`<number>` - Subscription id \(needed to unsubscribe and publishChallengeAnswers\)

### Code sample:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "publishComment",
  "params": [
    {
      "title": "Hello",
      "content": "World",
      "author": {"address": "john.eth"},
      "signature": {
        "signature": "...",
        "publicKey": "...",
        "type": "ed25519",
        "signedPropertyNames": ["title", "content", "author"]
      }
    }
  ]
}
```

### Response:

```json
{ "jsonrpc": "2.0", "result": 23784, "id": 1 }
```

#### Notification Format:

The notification format is the same as seen in the plebbit-js [Comment Events](https://github.com/plebbit/plebbit-js#comment-events)

`challenge` event:

```json
{
  "jsonrpc": "2.0",
  "method": "publishComment",
  "params": {
    "result": {
      "type": "CHALLENGE",
      "challenges": [
        {"type": "text/plain", "challenge": "2+2"},
        {"type": "text/plain", "challenge": "5+5"}
      ]
    },
    "event": "challenge",
    "subscription": 23784
  }
}
```

`challengeverification` event:

```json
{
  "jsonrpc": "2.0",
  "method": "publishComment",
  "params": {
    "result": {
      "type": "CHALLENGEVERIFICATION",
      "challengeSuccess": true,
      "publication": {
        "cid": "Qm...",
        "title": "Hello",
        "content": "World",
        "author": {"address": "john.eth"},
        "signature": {
          "signature": "...",
          "publicKey": "...",
          "type": "ed25519",
          "signedPropertyNames": ["title", "content", "author"]
        }
      }
    },
    "event": "challengeverification",
    "subscription": 23784
  }
}
```

## unsubscribe

Unsubscribe from notifications

### Parameters:

| Name | Type | Description |
| ---- | ---- | ----------- |
| subscriptionId | `number` | id of the account subscription to cancel |

### Result:

`<bool>` - unsubscribe success message

### Code sample:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "unsubscribe",
  "params": [23784]
}
```

### Response:

```json
{ "jsonrpc": "2.0", "result": true, "id": 1 }
```