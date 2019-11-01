#!/usr/bin/env bash

echo "Building @uvue/server..."
cd packages/@uvue/server
yarn build
echo "Building @uvue/core..."
cd ../core
yarn build
echo "Building @uvue/rquery..."
cd ../rquery
yarn build
cd ../../..
