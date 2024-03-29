#!/usr/bin/env bash

# this script is debug what's happening with "npm run build:browser:watch"
# normally you don't want to look at the browser build as it doesn't
# give any useful errors and you simply want to run "npm run build:watch"
# which builds both for node and browser but hides the browser part

# go to current folder
cd "$(dirname "$0")"
cd ..

xterm -geometry "-0+0" -e "npm run build:node:watch" &
xterm -geometry "+0+0" -e "npm run build:browser:watch" &
xterm -geometry "-0-0" -e "npm run webpack:watch" &
xterm -geometry "+0-0" -e "npm run test:server" &
sleep infinity
