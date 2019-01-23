import tempfile
import os

def speak(text, lang='en', device='hw:0'):

    fd, file_txt = tempfile.mkstemp()
    with os.fdopen(fd, 'w') as f:
        f.write(text)
        f.close()

    os.system("festival --tts " + file_txt)
    os.remove(file_txt)
