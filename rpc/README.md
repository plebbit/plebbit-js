#### API

```
method: getComment, params: [cid: string]
method: getCommentUpdate, params: [cid: string, ipnsName: string, updatedAtAfter?: number]
method: getCommentPage, params: [pageCid, commentCid]
method: getSubplebbitUpdate, params: [address: string, updatedAtAfter?: number]
method: getSubplebbitPage, params: [pageCid, subplebbitAddress]
method: createSubplebbit, params: [createSubplebbitOptions]
method: startSubplebbit, params: [address: string]
method: stopSubplebbit, params: [address: string]
method: editSubplebbit, params: [address: string, subplebbitEditOptions]
method: listSubplebbits, params: []
method: publishComment, params: [comment]
method: publishVote, params: [vote]
method: publishCommentEdit, params: [commentEdit]
method: publishChallengeAnswers, params: [challengeRequestId: string (base58), answers]
method: getDefaults, params: []
method: fetchCid, params: [cid: string]
method: getPeers, params: []
method: getStats, params: []
```

#### Example

```js
// ------
// server
// ------

const {PlebbitWsServer} = require('@plebbit/plebbit-js/rpc')
const port = 8080
const plebbitOptions = {ipfsHttpClientsOptions: ['http://localhost:5001/api/v0']}
const plebbitWebSocketServer = await PlebbitWsServer({port, plebbitOptions})

// debug raw JSON RPC messages
plebbitWebSocketServer.wss.wss.on('connection', (socket, request) => {
  console.log('connection')
  socket.on('message', (message) => console.log(message.toString()))
})

// handle plebbit and wss errors
plebbitWebSocketServer.on('error', console.log)

console.log(`test server plebbit wss listening on port ${port}`)

// --------------------------------------------------
// client (any JSON RPC websocket compatible library)
// --------------------------------------------------

const WebSocketClient = require('rpc-websockets').Client
webSocketClient = new WebSocketClient(`ws://localhost:${port}`)

// debug raw JSON RPC messages
webSocketClient.socket.on('message', (message) => console.log('from server:', message.toString()))

// wait for websocket connection  to open
await new Promise((resolve) => webSocketClient.on('open', resolve))

// get comment
const commentCid = 'Qm...'
const comment = await webSocketClient.call('getComment', [commentCid])
console.log(comment)

// get comment update
const commentUpdate = await webSocketClient.call('getCommentUpdate', [comment.cid, comment.ipnsName])
console.log(commentUpdate)

// wait for the next comment update
const nextCommentUpdate = await webSocketClient.call('getCommentUpdate', [comment.cid, comment.ipnsName, commentUpdate.updatedAt])
console.log(nextCommentUpdate)
```
