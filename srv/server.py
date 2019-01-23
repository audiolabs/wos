from __future__ import print_function

import json
import tornado.ioloop
import tornado.web
import uuid
import shlex
import subprocess
import sys
import time
from speak import speak

APP = 'WoS'
PORT = 9500

config = {}
stream_process = None
media_process = None

class ApiV1SpeakHandler(tornado.web.RequestHandler):

    def post(self):
        global config
        print("[%s] synthesizing ..." % (APP), file=sys.stderr)
        msg = tornado.escape.json_decode(self.request.body)
        device_out = "hw:0"
        if 'device_out' in config:
            device_out = config['device_out']
        speak(msg['text'], lang=msg['lang'], device=device_out,
            tts=config['tts'])
        self.set_status(200)
        self.finish({ "ok": True })

class ApiV1MediaPlayHandler(tornado.web.RequestHandler):

    def post(self):
        global config
        global media_process

        msg = tornado.escape.json_decode(self.request.body)
        f = msg['file']

        print("[%s] playing mp3: %s ..." % (APP, f), file=sys.stderr)

        if media_process:
            media_process.terminate()

        device_out = "hw:0"
        if 'device_out' in config:
            device_out = config['device_out']
        args = shlex.split("mpg321 -a " + device_out + " --stereo " + f)
        media_process = subprocess.Popen(args)

        self.set_status(200)
        self.finish({ "ok": True })

class ApiV1MediaStopHandler(tornado.web.RequestHandler):

    def post(self):
        global media_process

        print("[%s] stopping mp3 ..." % (APP), file=sys.stderr)

        if media_process:
            media_process.terminate()

        self.set_status(200)
        self.finish({ "ok": True })

class ApiV1StreamHandler(tornado.web.RequestHandler):

    def post(self):
        global stream_process
        global config

        print("[%s] starting stream ..." % (APP), file=sys.stderr)

        ip = self.request.remote_ip

        if stream_process:
            stream_process.terminate()
            time.sleep(3)

        device_in = "hw:0"

        if 'device_in' in config:
            device_in = config['device_in']

        args = shlex.split("ffmpeg -re -f alsa -ac 1 -i " + device_in +
            " -acodec libmp3lame " +
            "-f rtp rtp://" + ip + ":1234")
        stream_process = subprocess.Popen(args)

        self.set_status(200)
        self.finish({ "ok": True, "ip": ip })

def make_app():
    return tornado.web.Application([
        (r"/api/v1/speak", ApiV1SpeakHandler),
        (r"/api/v1/stream", ApiV1StreamHandler),
        (r"/api/v1/media/play", ApiV1MediaPlayHandler),
        (r"/api/v1/media/stop", ApiV1MediaStopHandler),
    ])

def main():
    print("[%s] starting server on port %s" % (APP, PORT),
        file=sys.stderr)
    app = make_app()
    app.listen(PORT)
    tornado.ioloop.IOLoop.current().start()

if __name__ == "__main__":
    with open('etc/config.json') as f:
        config = json.load(f)
    print("[%s] config: %s" % (APP, config), file=sys.stderr)
    main()
