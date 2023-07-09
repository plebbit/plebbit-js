#!/usr/bin/env bash

# go to current folder
cd "$(dirname "$0")"
cd ..

# build and bundle
npm install
npm run build
npm run webpack

# wait until test server is ready
npm run test:server & npm run test:server:wait-on

# tests
npm run test:node:parallel
CHROME_BIN=$(which chrome || which chromium) FIREFOX_BIN=$(which firefox) npm run test:browser

# close test server
kill `pgrep --full  'node test/test-server'`
# close ipfs daemons
kill `pgrep --full  'ipfs daemon'`
