#!/bin/bash
if [ -e ${PWD}/nginx.pid ]
then
  kill `cat ${PWD}/nginx.pid`
fi
nginx -c ${PWD}/nginx.conf -g "pid ${PWD}/nginx.pid;"
