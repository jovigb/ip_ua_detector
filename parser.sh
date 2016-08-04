#!/bin/bash

if [ $# -le 0 ]; then
    echo "usage: $0 [ start | stop ]"
    exit 0
fi

if [ $1 = "start" ]; then
    nohup ./server.js > /dev/null 2>&1 &
    echo $! > qs.pid
elif [ $1 = "stop" ]; then
    kill -9 `cat qs.pid`
fi
