#!/usr/bin/env bash

cd packages/@uvue/server
yarn build
cd ../rquery
yarn build
cd ../../..
./tests/cli install suite
