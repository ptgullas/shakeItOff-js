document.addEventListener('DOMContentLoaded', () => {
    // Get references to the HTML elements
    const pageTitleElement = document.getElementById('page-title'); // NEW
    const promptTextElement = document.getElementById('prompt-text');
    const newPromptBtn = document.getElementById('new-prompt-btn');

// NEW: Use two arrays to manage the prompts
    let masterPrompts = [];     // The original, complete list of prompts
    let availablePrompts = [];  // The current pool of prompts to choose from

    // Fetch the prompts from the JSON file
    fetch('prompts-lazarus.json')
        .then(response => response.json())
        .then(data => {
            // Check if data and properties exist
            if (data && data.title && data.prompts) {
                pageTitleElement.textContent = data.title; // NEW: Set the page title
                masterPrompts = data.prompts; // UPDATED: Get prompts from the object
                // Create a copy for the available pool to start with
                availablePrompts = [...masterPrompts];
            } else {
                promptTextElement.textContent = 'Could not load prompts. Invalid file format.';
            }
        })
        .catch(error => {
            console.error('Error fetching prompts:', error);
            promptTextElement.textContent = 'Could not load prompts.';
        });

// UPDATED: This function now pulls from the available pool without replacement
    function getNewPrompt() {
        // Step 1: Check if the pool of available prompts is empty.
        if (availablePrompts.length === 0) {
            console.log("All prompts shown. Resetting the list!");
            // Step 2: If it is, refill it from the master list.
            availablePrompts = [...masterPrompts];
        }

        // Step 3: Pick a random index from the *current* pool.
        const randomIndex = Math.floor(Math.random() * availablePrompts.length);

        // Step 4: Use splice() to remove the prompt from the pool and get its value.
        const chosenPrompt = availablePrompts.splice(randomIndex, 1)[0];

        // Step 5: Display the chosen prompt.
        promptTextElement.textContent = chosenPrompt;
    }

    // Event listener for the button
    newPromptBtn.addEventListener('click', getNewPrompt);

// --- Shake Detection and Haptic Feedback ---
/*
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

        const shakeThreshold = 256; // UPDATED: Increased from 15 to make it less sensitive
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
        
    
*/
});