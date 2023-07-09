const PlebbitRpc = require('../../dist/index')
const {port} = require('./config')

// set mock plebbit-js for tests
const {default: PlebbitJsMock} = require('../../dist/lib/plebbit-js/plebbit-js-mock')
PlebbitRpc.setPlebbitJs(PlebbitJsMock)
;(async () => {
  const plebbitWebSocketServer = await PlebbitRpc.PlebbitWsServer({port})

  // debug raw JSON RPC messages
  plebbitWebSocketServer.wss.wss.on('connection', (socket, request) => {
    console.log('connection')
    socket.on('message', (message) => console.log(message.toString()))
  })

  console.log(`test server plebbit wss listening on port ${port}`)
})()
