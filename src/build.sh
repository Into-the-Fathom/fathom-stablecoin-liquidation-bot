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
    # docker build -t fathombot/shared-base:latest .
    docker build . -t tarunshrma/shared-base:latest -f ./src/shared/Dockerfile
    echo 'Base image created.'
    cd ..
fi

if [ $oper -eq 2 ]  || [ $oper -eq 0 ]
then
    cd ./worker
    echo 'Creating worker image...'
    # docker build -t fathombot/worker:latest .
    docker build . -t tarunshrma/worker:latest -f ./src/worker/Dockerfile
    echo 'worker image created.'
    cd ..
fi

if [ $oper -eq 3 ]  || [ $oper -eq 0 ]
then
    cd ./position-manager
    echo 'Creating worker image...'
    # docker build -t fathombot/position-manager:latest .
    docker build . -t tarunshrma/position-manager:latest -f ./src/position-manager/Dockerfile
    echo 'worker image created.'
    cd ..
fi