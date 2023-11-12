function startCapture() {
    const chatInput = document.getElementById("chat");
    const loader = document.getElementById("recording");
    const responseContainer = document.getElementById("response-container");
    const audioPlayer = document.getElementById("audio-player");
    const audioSource = document.getElementById("audio-source");
    const loader3 = document.getElementById("loader3");
    const microphone = document.getElementById("start-record-button");

    
  
    // Vérifier si le navigateur supporte l'API SpeechRecognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
  
      // Démarrer la capture audio sur mobile (Mobi ou Android)
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      if (isMobile) {
        recognition.start();
        loader.style.display = "flex";
      } else {
        // Demander l'autorisation d'accès au micro sur desktop
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
          loader.style.display = "flex";
          
          
          // Commencer la reconnaissance vocale
          recognition.start();
          loader.style.display = "flex";

        })
        .catch(function(error) {
          console.error('Microphone access denied:', error);
          loader.style.display = "none";
          //retirer le microphone
          microphone.style.display = "none";
        });
      }
  
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
          loader.style.display = "none";
          const voc = transcription;
          chatInput.innerText = voc;
  
          document.getElementById('response-container').innerHTML = "";
          loader3.style.display = "inline-flex";
  
          const question = voc;
  
          fetch('/get', {
            method: 'POST',
            body: new URLSearchParams({ 'chat': question }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          })
          .then(response => response.json())
          .then(data => {
            const audioText = data.audio_text;
            responseContainer.innerText = audioText;
            loader3.style.display = "none";
  
            audioSource.src = data.audio_url;
            audioPlayer.load();
            audioPlayer.play();
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
    } else {
      console.error('SpeechRecognition not supported in this browser.');
    }
  }
  