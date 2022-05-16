#!/usr/bin/env bash

xterm -geometry "-0+0" -e "npm run build:watch" &
xterm -geometry "+0+0" -e "npm run webpack:watch"
