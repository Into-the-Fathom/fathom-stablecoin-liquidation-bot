#!/bin/sh
cd ./shared
echo 'Creating base image...'
docker build -t fathombot/shared-base:latest .
echo 'Base image created.'

cd ../worker
echo 'Creating worker image...'
docker build -t fathombot/worker:latest .
echo 'worker image created.'

cd ../position-manager
echo 'Creating worker image...'
docker build -t fathombot/position-manager:latest .
echo 'worker image created.'
