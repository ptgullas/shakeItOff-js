document.addEventListener('DOMContentLoaded', () => {
    // Get references to the HTML elements
    const promptTextElement = document.getElementById('prompt-text');
    const newPromptBtn = document.getElementById('new-prompt-btn');

    let prompts = [];
    let currentPrompt = '';

    // Fetch the prompts from the JSON file
    fetch('prompts-demo.json')
        .then(response => response.json())
        .then(data => {
            prompts = data;
        })
        .catch(error => {
            console.error('Error fetching prompts:', error);
            promptTextElement.textContent = 'Could not load prompts.';
        });

    // Function to get and display a new prompt
    function getNewPrompt() {
        if (prompts.length === 0) return;

        let newPrompt = '';
        // Make sure we don't show the same prompt twice in a row
        do {
            const randomIndex = Math.floor(Math.random() * prompts.length);
            newPrompt = prompts[randomIndex];
        } while (newPrompt === currentPrompt);

        currentPrompt = newPrompt;
        promptTextElement.textContent = currentPrompt;
    }

    // Event listener for the button
    newPromptBtn.addEventListener('click', getNewPrompt);

// --- Shake Detection and Haptic Feedback ---

    // Check if the Device Motion API is available
    if (window.DeviceMotionEvent) {
        // iOS requires user permission to access device motion
        newPromptBtn.addEventListener('click', () => {
          if (typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
              .then(permissionState => {
                if (permissionState === 'granted') {
                  window.addEventListener('devicemotion', handleShake);
                }
              })
              .catch(console.error);
          }
        }, { once: true }); // Only try to get permission once.
        
        // Listen for shakes if permission is not required (e.g., on Android)
        if (typeof DeviceMotionEvent.requestPermission !== 'function') {
            window.addEventListener('devicemotion', handleShake);
        }

        const shakeThreshold = 30; // UPDATED: Increased from 15 to make it less sensitive
        let lastX, lastY, lastZ;
        let lastUpdate = 0;
        let isShaking = false; // NEW: Cooldown flag to prevent multiple triggers

        function handleShake(event) {
            if (isShaking) return; // If in cooldown, do nothing

            const acceleration = event.accelerationIncludingGravity;
            const currentTime = new Date().getTime();

            if ((currentTime - lastUpdate) > 100) {
                const diffTime = currentTime - lastUpdate;
                lastUpdate = currentTime;

                const speed = Math.abs(acceleration.x + acceleration.y + acceleration.z - lastX - lastY - lastZ) / diffTime * 10000;

                if (speed > shakeThreshold) {
                    getNewPrompt();
                    
                    if (navigator.vibrate) {
                        navigator.vibrate(100); 
                    }

                    // NEW: Start the cooldown period
                    isShaking = true;
                    setTimeout(() => {
                        isShaking = false;
                    }, 1500); // Cooldown for 1.5 seconds
                }

                lastX = acceleration.x;
                lastY = acceleration.y;
                lastZ = acceleration.z;
            }
        }
    } else {
        console.log("DeviceMotionEvent is not supported by your browser.");
    }
});