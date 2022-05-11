export default {
  "presets": [
    [
      "@babel/preset-env",
      {
        // make sure the package works with older versions of node
        "targets":{"node":"12"},
        // don't transpile es modules to commonjs
        "modules": false,
      }
    ]
  ],
  "plugins": [
    // alias packages that don't work in the browser with a file
    // called noop.js which exports an empty function
    // noop.js is copied from config/babel-browser-noop.js during `npm run build:browser`
    ["module-resolver", {
      "alias": {
        "knex": "./browser/noop.js",
        "captcha-canvas/js-script/extra.js": "./browser/noop.js",
        "path": "./browser/noop.js",
        "fs": "./browser/noop.js",
      }
    }]
  ]
}
