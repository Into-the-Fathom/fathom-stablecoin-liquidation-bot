#!/bin/sh
echo "0. all"
echo "1. shared"
echo "2. worker"
echo "3. position-manager"
echo -n "Please choose a word [0,1,2 or 3]? "
read oper

if [ $oper -eq 1 ] || [ $oper -eq 0 ]
then
    cd ./shared
    echo 'Creating base image...'
    docker build -t fathombot/shared-base:latest .
    # docker tag fathombot/shared-base:latest intothefathom/fathom-bot-shared:v0.0.1
    echo 'Base image created.'
fi

if [ $oper -eq 2 ]  || [ $oper -eq 0 ]
then
    cd ./worker
    echo 'Creating worker image...'
    docker build -t fathombot/worker:latest .
    # docker tag fathombot/worker:latest intothefathom/fathom-bot-worker:v0.0.1
    echo 'worker image created.'
fi

if [ $oper -eq 3 ]  || [ $oper -eq 0 ]
then
    cd ./position-manager
    echo 'Creating worker image...'
    docker build -t fathombot/position-manager:latest .
    # docker tag fathombot/position-manager:latest intothefathom/fathom-bot-position-manager:v0.0.1
    echo 'worker image created.'
fi