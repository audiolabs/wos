import tempfile
import io
import os

import speak_festival
import speak_espeak
import speak_gtts

def speak(text, lang='en', device='hw:0', tts='festival'):

    if tts == 'festival':
        speak_festival.speak(text, lang=lang, device=device)

    if tts == 'espeak':
        speak_espeak.speak(text, lang=lang, device=device)

    if tts == 'gtts':
        speak_gtts.speak(text, lang=lang, device=device)
