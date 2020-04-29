#!/bin/bash

npm run-script build
npm pack
tar zxvf homebridge-pc-volume-*.tgz -C "e2e-tests"
cd e2e-tests
cp ../.homebridge-debug/config.json ./config.json
docker build . -t homebridge-pc-volume-e2e
./check-build.sh
