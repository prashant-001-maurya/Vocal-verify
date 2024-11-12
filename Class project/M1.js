// Pattern Authentication Variables
let pattern = [];
let isDrawing = false;
let lastDotPosition = null;

const canvas = document.getElementById("patternCanvas");
const ctx = canvas.getContext("2d");

// Voice Authentication Variables
let voiceRecordings = [];
let recordingCount = 0;
const maxRecordings = 3;

// Clear the canvas when starting a new pattern
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Select all dots and add event listeners for pattern drawing
document.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('mousedown', (e) => {
        isDrawing = true;
        selectDot(e.target);
    });

    dot.addEventListener('mouseover', (e) => {
        if (isDrawing) {
            selectDot(e.target);
        }
    });
});

document.addEventListener('mouseup', () => {
    isDrawing = false;
    lastDotPosition = null; // Reset last position for the next drawing
    console.log('Pattern:', pattern.join('-'));
    // You can now store the `pattern` array for verification.
});

// Function to select a dot, add it to the pattern, and draw a line
function selectDot(dot) {
    const index = dot.getAttribute('data-index');
    if (!pattern.includes(index)) {
        pattern.push(index);
        dot.classList.add('selected');

        const dotPosition = getDotCenterPosition(dot);

        // Draw a line from the last dot to the current one
        if (lastDotPosition) {
            drawLine(lastDotPosition, dotPosition);
        }

        lastDotPosition = dotPosition; // Update last position
    }
}

// Function to get the center position of a dot for drawing lines
function getDotCenterPosition(dot) {
    const rect = dot.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    return {
        x: rect.left - canvasRect.left + rect.width / 2,
        y: rect.top - canvasRect.top + rect.height / 2
    };
}

// Function to draw a line between two points on the canvas
function drawLine(start, end) {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = "#007BFF";
    ctx.lineWidth = 3;
    ctx.stroke();
}

// Function to clear the pattern and reset the dots
function clearPattern() {
    pattern = [];
    lastDotPosition = null;
    document.querySelectorAll('.dot').forEach(dot => dot.classList.remove('selected'));
    clearCanvas(); // Clear the canvas lines as well
}
function toggleMenu() {
    const navbar = document.getElementById('navbar');
    navbar.classList.toggle('responsive'); // Toggles the visibility of navbar links
}

// Voice Authentication Logic

// Function to start voice recording
function captureVoice() {
    if (recordingCount >= maxRecordings) {
        alert("You have already recorded your voice 3 times.");
        return;
    }

    // Check if the browser supports the MediaRecorder API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Voice recording is not supported on this browser.");
        return;
    }

    // Request access to the user's microphone
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const mediaRecorder = new MediaRecorder(stream);
            let audioChunks = [];

            // When data is available, store audio chunks
            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });

            // When the recording stops, save the audio
            mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks);
                voiceRecordings.push(audioBlob);
                recordingCount++;
                document.getElementById("recordStatus").innerText = `Recording ${recordingCount}/${maxRecordings} complete.`;

                // Stop all tracks to release the microphone
                stream.getTracks().forEach(track => track.stop());

                if (recordingCount === maxRecordings) {
                    document.getElementById("recordStatus").innerText = "Voice authentication setup complete!";
                    // Here you can save `voiceRecordings` for later authentication, e.g., send them to the server.
                }
            });

            // Start recording
            mediaRecorder.start();

            // Stop recording after a certain time (e.g., 3 seconds)
            setTimeout(() => {
                mediaRecorder.stop();
            }, 3000); // Record for 3 seconds
        })
        .catch(error => {
            console.error("Error accessing microphone:", error);
            alert("Could not access the microphone.");
        });
}

// Add this line to trigger the voice recording when the user clicks on the "Record Voice" button
document.getElementById("recordButton").addEventListener("click", captureVoice);
