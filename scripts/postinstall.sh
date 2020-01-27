#!/usr/bin/env bash

yarn policies set-version 1.18.0
echo "Building @uvue/server..."
cd packages/@uvue/server
yarn build
echo "Building @uvue/rquery..."
cd ../rquery
yarn build
cd ../../..
