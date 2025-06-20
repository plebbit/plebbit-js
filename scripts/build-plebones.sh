#!/usr/bin/env bash

# go to current folder
cd "$(dirname "$0")"
cd ..

# build and bundle
npm install
npm run build

# build plebones
git clone https://github.com/plebbit/plebones.git plebones
cd plebones
yarn

# replace old plebbit-js in plebones deps with latest plebbit-js
rm -fr node_modules/@plebbit/plebbit-js/dist
cp -r ../dist node_modules/@plebbit/plebbit-js/dist

# build plebones with latest plebbit-js commit ref
REACT_APP_COMMIT_REF=$COMMIT_REF yarn build-netlify

# copy plebones build to plebbit-js build folder
cp -r build ../build
