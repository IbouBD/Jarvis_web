var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
        // Fonction pour envoyer la question et afficher la réponse de l'IA
        function askQuestion() {
            const chatInput = document.getElementById("chat");
            const responseContainer = document.getElementById("response-container");
            const audioPlayer = document.getElementById("audio-player");
            const audioSource = document.getElementById("audio-source");
            const loader = document.getElementById("loader3");
            
            // Afficher la div du loader avant d'envoyer la question à l'IA
            document.getElementById('response-container').innerHTML = "";
            loader.style.display = "inline-flex";
            
            
            // Obtenir la question de l'utilisateur
            const question = chatInput.value;
    
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
                loader.style.display = "none";
                
                // Mettre à jour la source audio avec la nouvelle URL
                audioSource.src = data.audio_url;
                audioPlayer.load(); // Charger le fichier audio
                audioPlayer.play(); // Jouer le fichier audio
                // Mettre à jour la source audio avec la nouvelle URL
                audioSource.src = data.audio_url + "?timestamp=" + Date.now();
            })
            .catch(error => {
                console.error('Error:', error);
                loader.style.display = "none";
            });
        }