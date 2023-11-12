from flask import Flask, render_template, request, jsonify, session
import speech_recognition as sr
import openai
import pyttsx3
from pydub import AudioSegment
from threading import Thread
import re
import string
import nltk
from nltk.corpus import stopwords
from textblob import TextBlob

# Initialisation de NLTK (utilisé pour la détection de la langue et le filtrage des mots vides)
nltk.download('stopwords')
nltk.download('punkt')
stop_words = set(stopwords.words('french'))

# Initialisation de TextBlob (utilisé pour la correction orthographique)
def correct_spelling(text):
    blob = TextBlob(text)
    return str(blob.correct())

engine = pyttsx3.init()
r = sr.Recognizer()

bot_id = "Jarvis"

openai.api_key = 'YOUR OPENAI KEY'
messages = [
    {"role": "system", "content": f"Tu es un assistant sympa et très intelligent du nom de {bot_id}, tu ne dois jamais dire : Je suis une intelligence artificielle développée par OpenAI "}
]

app = Flask(__name__)
app.secret_key = 'secret_key'

app.static_folder = 'static'

def clean_text(text):
    # Enlever la ponctuation
    text = re.sub(f"[{re.escape(string.punctuation)}]", "", text)

    # Mettre en minuscules
    text = text.lower()

    # Supprimer les mots vides
    text = ' '.join([word for word in text.split() if word not in stop_words])

    return text

def detect_inappropriate_content(text):
    # Vous pouvez ajouter ici la logique de détection de contenu inapproprié
    # par exemple, en utilisant une bibliothèque de traitement du langage naturel (NLP)
    # ou des listes de mots interdits.
    return False  # Renvoie False si le contenu est approprié, True sinon

@app.route("/")
def index():
    return render_template('app.html')

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if request.method == 'POST':
        data = request.json
        transcription = data.get('transcription')

        # Nettoyer le texte (enlever la ponctuation, convertir en minuscules, supprimer les mots vides)
        cleaned_text = clean_text(transcription)

        # Correction orthographique
        corrected_text = correct_spelling(cleaned_text)

        voc = corrected_text
        print("voc:", voc)

        if detect_inappropriate_content(voc):
            return jsonify({"status": "error", "message": "Contenu inapproprié détecté."})

        session['voc'] = voc
        return jsonify({"status": "success"})

@app.route("/get", methods=["POST"])
def chat():
    if request.method == 'POST':
        txt = request.form.get('chat')
        voc = session.get('voc', '')  # Définir une valeur par défaut au cas où 'voc' n'est pas dans la session

        print("msg:", txt)

        audio_url = ""   # Initialiser avec une chaîne vide par défaut

        if txt != "":
            messages.append({"role": "user", "content": txt})
            response = openai.ChatCompletion.create(
                model='gpt-3.5-turbo',
                messages=messages
            ).choices[0].message
            print("response:", response.content)

            audio_text = response['content']
            messages.append({"role": "assistant", "content": audio_text})

            # Convertir le texte en synthèse vocale et enregistrer l'audio
            engine.save_to_file(audio_text, "static/audio2.mp3")
            engine.runAndWait()

            # Charger le fichier audio MP3 avec PyDub
            audio_url = "static/audio2.mp3" 

    return jsonify({"audio_text": audio_text, "audio_url": audio_url, "status": "success"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, ssl_context=("test_server.pem", "test_server.key"))
