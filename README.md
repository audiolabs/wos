# WoS

## Overview

An implementation of the Wizard of Oz experiment for speech systems (WoS).

![Image](/wos-diagram.png)

## Frontstage Installation (tested on Raspbian Stretch Lite 2018-06-27)

Configure the Raspberry Pi:

```
$ sudo raspi-config
```

- go to Network Options -> Wi-fi and enter the wifi settings
- go to Interfacing Options -> SSH -> Yes
- select finish

Install the server software:

```
$ sudo apt-get install ffmpeg mpg321 git python-pip
$ cd /home/pi
$ git clone https://github.com/audiolabs/wos
$ cd wos/srv
$ pip install -r requirements.txt
```

To start the server automatically when the Raspberry Pi boots, add this line above "exit 0" in /etc/rc.local:

```
su - pi -c "bash /home/pi/wos/bin/start.sh" &
```

## Backstage Installation 

### Linux (tested on Ubuntu 16.04)
```
$ sudo apt-get install ffmpeg nodejs npm
$ git clone https://github.com/audiolabs/wos
$ cd wos/web
$ npm install
```

### Mac (tested on macOS Sierra 10.12.6, requires homebrew)
```
$ brew install nodejs npm
$ brew install --with-ffplay ffmpeg
$ git clone https://github.com/audiolabs/wos
$ cd wos/web
$ npm install
```

## Usage

If the above instructions were followed, the server will be started next time the Raspberry Pi boots, alternatively you can start the server manually:
```
$ cd wos/srv
$ python server.py
```

Start the client UI on another machine by providing the server IP, for example:
```
$ cd wos/web
$ HOST=192.168.0.120 npm start
```
