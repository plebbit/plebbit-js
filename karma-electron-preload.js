
// expose plebbit-js native functions into electron's renderer
const {contextBridge} = require('electron')
const path = require ('path')
const Plebbit = require(__dirname)
contextBridge.exposeInMainWorld('plebbitJsNativeFunctions', Plebbit.nativeFunctions.node)
contextBridge.exposeInMainWorld('plebbitDataPath', path.join(process.cwd(), '.plebbit'))
console.log('electron preload.js contextBridge.exposeInMainWorld plebbitJsNativeFunctions')
