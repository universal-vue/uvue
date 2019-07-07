#!/usr/bin/env bash

cd packages/@uvue/server
yarn build
cd ../core
yarn build
cd ../rquery
yarn build
cd ../../..
