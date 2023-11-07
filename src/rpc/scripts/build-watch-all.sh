#!/usr/bin/env bash

# go to current folder
cd "$(dirname "$0")"
cd ..

xterm -geometry "-0+0" -e "npm run build:watch" &
xterm -geometry "+0+0" -e "npm run webpack:watch" &
xterm -geometry "-0-0" -e "npm run test:server" &
sleep infinity
