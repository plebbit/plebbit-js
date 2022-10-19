# Cross platform native functions

`plebbit-js` is written entirely in Javascript and can run in the browser. Some plebbit functionalities require native functions like the file system and native HTTP requests. Electron and Android WebView allow injecting native functions into the browser renderer. Example: 

```javascript
import Plebbit from '@plebbit/plebbit-js'

const nativeFunctions = {
  fetch: async () => {},
  listSubplebbits: async () => {},
  // ...no need to override all native functions
}

Plebbit.setNativeFunctions(nativeFunctions)
```

# NativeFunctions API

- `nativeFunctions.fetch(url: string, fetchOptions: FetchOptions)`
- `nativeFunctions.listSubplebbits()`
- `nativeFunctions.deleteSubplebbit(subplebbitAddress: string)`
- `nativeFunctions.createIpfsClient(ipfsHttpClientOptions: IpfsHttpClientOptions)`

# TODO

- Define SQL native functions to be able to run a subplebbit on Android
