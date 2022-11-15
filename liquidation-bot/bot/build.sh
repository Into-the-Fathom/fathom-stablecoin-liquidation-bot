#!/bin/sh
cd ./shared
echo 'Creating base image...'
docker build -t fathombot/shared-base:latest .
#docker tag fathombot/shared-base:latest intothefathom/fathom-bot-shared:v0.0.1
echo 'Base image created.'

cd ../worker
echo 'Creating worker image...'
docker build -t fathombot/worker:latest .
#docker tag fathombot/worker:latest intothefathom/fathom-bot-worker:v0.0.1
echo 'worker image created.'

cd ../position-manager
echo 'Creating worker image...'
docker build -t fathombot/position-manager:latest .
#docker tag fathombot/position-manager:latest intothefathom/fathom-bot-position-manager:v0.0.1
echo 'worker image created.'
