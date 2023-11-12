function startCapture() {
    const chatInput = document.getElementById("chat");
    const loader = document.getElementById("recording");
    const responseContainer = document.getElementById("response-container");
    const audioPlayer = document.getElementById("audio-player");
    const audioSource = document.getElementById("audio-source");
    const loader3 = document.getElementById("loader3");
    // Demander l'autorisation d'accès au micro
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
        loader.style.display = "flex";
         // Créer un objet SpeechRecognition
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'fr-FR';

    // Commencer la reconnaissance vocale
    recognition.start();

    // Événement lorsque la transcription est disponible
    recognition.onresult = function(event) {
        const transcription = event.results[0][0].transcript;
        console.log('Transcription:', transcription);

    // Envoyer la transcription au serveur Flask
    fetch('/transcribe', {
        method: 'POST',
        body: JSON.stringify({ transcription }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        // Traiter la réponse du serveur si nécessaire
        loader.style.display = "none";
        const voc = transcription;
        chatInput.innerText = voc;

         // Afficher la div du loader avant d'envoyer la question à l'IA
         document.getElementById('response-container').innerHTML = "";
         loader3.style.display = "inline-flex";
         
         // Obtenir la question de l'utilisateur
         const question = voc;
 
         // Envoyer la question à la route "/get" en utilisant une requête POST
         fetch('/get', {
             method: 'POST',
             body: new URLSearchParams({ 'chat': question }),
             headers: {
                 'Content-Type': 'application/x-www-form-urlencoded'
             }
         })
         .then(response => response.json())
         .then(data => {
             // Extraire et afficher le texte de la réponse de l'IA
             const audioText = data.audio_text;
             responseContainer.innerText = audioText;
             loader3.style.display = "none";
             
             // Mettre à jour la source audio avec la nouvelle URL
             audioSource.src = data.audio_url;
             audioPlayer.load(); // Charger le fichier audio
             audioPlayer.play(); // Jouer le fichier audio
             // Mettre à jour la source audio avec la nouvelle URL
             audioSource.src = data.audio_url + "?timestamp=" + Date.now();

                // Safari fix
            if (!audio.src) {
                let newAudio = document.createElement('audio');
                newAudio.src = audio_url;
                document.body.appendChild(newAudio);
            }
         })
    })
    .catch(error => {
        console.error('Error:', error);
    });
};
        console.log('Microphone access granted.');
    })
    // Mise à jour du lecteur audio
   
    .catch(function(error) {
        console.error('Microphone access denied:', error);
        loader.style.display = "none";
    });
    
}