
// expose plebbit-js native functions into electron's renderer
const {contextBridge} = require('electron')
const path = require ('path')
contextBridge.exposeInMainWorld('plebbitJsNativeFunctions', require('@plebbit/plebbit-js/dist/node/runtime/node/native-functions').default)
contextBridge.exposeInMainWorld('plebbitDataPath', path.join(process.cwd(), '.plebbit'))
console.log('electron preload.js contextBridge.exposeInMainWorld plebbitJsNativeFunctions')
