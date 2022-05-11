// alias packages that don't work in the browser with a file
// called noop.js which exports an empty function
// noop.js is copied from config/babel-browser-noop.js during `npm run build:browser`

// export the functions used in the source by all the modules
// from path
export const join = function() {}
export const dirname = function() {}
// from fs
export const promises = function() {}
// from captcha-canvas/js-script/extra.js
export const createCaptcha = function() {}

// default export needed for knex
export default function() {}
