export default {
  "presets": [
    [
      "@babel/preset-env",
      {
        // make sure the package works with older versions of node
        "targets":{"node":"12"},
        // make sure to use commonjs module
        "modules": "commonjs"
      }
    ]
  ],
  // add exports.default to export in commonjs
  "plugins": ["add-module-exports"]
}
