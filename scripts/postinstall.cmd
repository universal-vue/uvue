call yarn policies set-version 1.18.0
cd packages/@uvue/server
call yarn build
cd ../rquery
call yarn build
cd ../../..
