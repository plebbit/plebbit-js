
// expose plebbit-js native functions into electron's renderer
const {contextBridge} = require('electron')
const path = require ('path')
const Plebbit = require(__dirname)
contextBridge.exposeInMainWorld('plebbitJsNativeFunctions', Plebbit.nativeFunctions.node)
contextBridge.exposeInMainWorld('plebbitDataPath', path.join(process.cwd(), '.plebbit'))
contextBridge.exposeInMainWorld('startMaliciousGateway', () => require("http").createServer((req, res) => {
    if (req.url === "/ipfs/QmbWqTYuyfcpDyn6gawRf5eSFVtYnGDAKttjESXjjbAHbr") res.end("Hello plebs"); // Valid content
    else if (req.url === "/ipfs/QmUFu8fzuT1th3jJYgR4oRgGpw3sgRALr4nbenA4pyoCav")
        res.end("Invalid content. This should throw an error in plebbit.fetchCid");
    else res.end("Unknown CID");
}).listen(33415))
console.log('electron preload.js contextBridge.exposeInMainWorld plebbitJsNativeFunctions')
