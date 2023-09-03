#!/bin/sh

set -e

cd /usr/local/bin
dockerd-entrypoint.sh &> /usr/src/dockerd.log &

echo "Waiting 10s for docker to start..."
sleep 10

echo "Loading COMPILEX user program image..."
tar -cC /usr/src/compilex-program . | docker-entrypoint.sh load

cd /usr/src/app
export PORT=$1
npm run server
