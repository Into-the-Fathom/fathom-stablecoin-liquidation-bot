#!/bin/sh

if [ -z "$1" ]
then
    echo "0. all"
    echo "1. shared"
    echo "2. worker"
    echo "3. position-manager"
    echo -n "Please choose an option [0,1,2 or 3]? "
    read oper
else
    oper=$1
fi

if [ $oper -eq 1 ] || [ $oper -eq 0 ]
then
    cd ./shared
    echo 'Creating base image...'
    docker build -t tarunshrma/shared-base:latest .
    # docker tag fathombot/shared-base:latest intothefathom/fathom-bot-shared:v0.0.1
    echo 'Base image created.'
    cd ..
fi

if [ $oper -eq 2 ]  || [ $oper -eq 0 ]
then
    cd ./worker
    echo 'Creating worker image...'
    docker build -t tarunshrma/worker:latest .
    # docker tag fathombot/worker:latest intothefathom/fathom-bot-worker:v0.0.1
    echo 'worker image created.'
    cd ..
fi

if [ $oper -eq 3 ]  || [ $oper -eq 0 ]
then
    cd ./position-manager
    echo 'Creating worker image...'
    docker build -t tarunshrma/position-manager:latest .
    # docker tag fathombot/position-manager:latest intothefathom/fathom-bot-position-manager:v0.0.1
    echo 'worker image created.'
    cd ..
fi