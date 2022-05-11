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
  ]
}