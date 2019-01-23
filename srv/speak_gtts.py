import io
import os
from gtts import gTTS

SILENCE_FILE = "res/silence_500.mp3"

def speak(text, lang='en', device='hw:0'):

    if os.path.isdir('/run/user/1000'):
        audio_mp3 = '/run/user/1000/audio.mp3'
        audio_tmp_mp3 = '/run/user/1000/audio_tmp.mp3'
        audio_out_mp3 = '/run/user/1000/audio_out.mp3'
    else:
        audio_mp3 = '/tmp/audio.mp3'
        audio_tmp_mp3 = '/tmp/audio_tmp.mp3'
        audio_out_mp3 = '/tmp/audio_out.mp3'

    gtts = gTTS(text=text, lang=lang, lang_check=False)
    gtts.save(audio_mp3)

    os.system("ffmpeg -y -i " + audio_mp3 + " -ar 48000 " + audio_tmp_mp3)
    os.system("ffmpeg -y -i " +
        "concat:\"" + SILENCE_FILE + "|" + audio_tmp_mp3 + "\" -codec copy " +
        audio_out_mp3)
    os.system("mpg321 -a " + device + " --stereo " + audio_out_mp3)

    os.remove(audio_mp3)
    os.remove(audio_out_mp3)
    os.remove(audio_tmp_mp3)
