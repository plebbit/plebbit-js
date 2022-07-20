# Cross platform native functions

`plebbit-js` is written entirely in Javascript and can run in the browser. Some plebbit functionalities require native functions like the file system and native HTTP requests. Electron and Android WebView allow injecting native functions into the browser renderer. Example: 

```
import Plebbit from '@plebbit/plebbit-js`

const nativeFunctions = {
  fetch: async () => {},
  mkdirp: async () => {},
  ls: async () => {}
}

Plebbit.setNativeFunctions(nativeFunctions)
```

# NativeFunctions API

- `nativeFunctions.fetch(url: string, fetchOptions: FetchOptions)`
- `nativeFunctions.mkdirp(path: string)`
- `nativeFunctions.ls(path: string)`
- `nativeFunctions.sqlQuery({dbPath: string, sqlQuery: string})`
- `nativeFunctions.createCaptcha(captchaType: string)`
- `nativeFunctions.ipfsHttpRequest({url: string, arguments: any})`
- TODO ...
