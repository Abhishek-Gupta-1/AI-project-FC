const videoElement = document.getElementById('video');
const startButton = document.getElementById('start-btn');
const stopButton = document.getElementById('stop-btn');
const canvasElement = document.getElementById('canvas');
const canvasContext = canvasElement.getContext('2d');

let stream;
let isRecording = false;

// Start video streaming
async function startRecording() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        startButton.disabled = true;
        stopButton.disabled = false;
        isRecording = true;
    } catch (error) {
        console.error('Error starting video stream:', error);
    }
}

// Stop video streaming
function stopRecording() {
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        videoElement.srcObject = null;
        startButton.disabled = false;
        stopButton.disabled = true;
        isRecording = false;
    }
}

// Capture and send video frames to backend
async function captureAndSendFrames() {
    if (!isRecording) return;

    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);

    // Convert the captured image data to a format suitable for API transmission
    const imageBlob = await new Promise(resolve => canvasElement.toBlob(resolve, 'image/jpeg', 0.9));

    // Create a FormData object to send the captured frame to the backend
    const formData = new FormData();
    formData.append('frame', imageBlob);

    // Send the FormData via an API call to your backend
    const apiUrl = 'https://your-backend-api-url';
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();
        console.log('Finger count result:', result);
    } catch (error) {
        console.error('Error sending data to backend:', error);
    }

    // Continue capturing frames recursively
    requestAnimationFrame(captureAndSendFrames);
}

// Event listeners for buttons
startButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);

// Start capturing and sending frames when recording is started
startButton.addEventListener('click', () => {
    if (isRecording) {
        requestAnimationFrame(captureAndSendFrames);
    }
});
