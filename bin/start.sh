#!/bin/bash

cd /home/pi/wos/srv

while [ 1 ]; do

	python server.py &>>/tmp/wos.log
	sleep 3

done
