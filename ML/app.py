import os
import json
import pickle
import numpy as np
import librosa
import soundfile as sf
import cv2
import base64
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
import whisper

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:3000"]}})

# --- Load AI Models ---

# Load the pre-trained emotion detection model
MODEL_PATH = "best_model.pkl"
with open(MODEL_PATH, 'rb') as file:
    model = pickle.load(file)

# Configure Gemini AI for conversation analysis
genai.configure(api_key="AIzaSyCTkoA9f8ZOsx2zxL2o96YAROM5nD31Nqo")
gemini_model = genai.GenerativeModel("gemini-1.5-pro")

# --- Constants ---
EMOTION_LABELS = {
    0: "Neutral", 1: "Angry/Disgust", 2: "Disappointed", 3: "Happy/Satisfied",
    4: "Disappointed", 5: "Angry/Disgust 1", 6: "Angry/Disgust", 7: "Other"
}
HAPPY_CLASSES = {3}
THRESHOLD_PERCENTAGE = 25
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def transcribe_audio(file_path):
    # Load Whisper model (small, medium, or large for better accuracy)
    model = whisper.load_model("base")  # Options: tiny, base, small, medium, large

    # Transcribe audio
    result = model.transcribe(file_path)

    # Print and return transcription text
    print("Transcription:\n", result["text"])
    return result["text"]

# --- Emotion Detection Helper Functions ---
def extract_features(data, sample_rate):
    result = np.array([])
    result = np.append(result, np.mean(librosa.feature.zero_crossing_rate(y=data).T, axis=0))
    stft = np.abs(librosa.stft(data))
    result = np.append(result, np.mean(librosa.feature.chroma_stft(S=stft, sr=sample_rate).T, axis=0))
    result = np.append(result, np.mean(librosa.feature.mfcc(y=data, sr=sample_rate).T, axis=0))
    result = np.append(result, np.mean(librosa.feature.rms(y=data).T, axis=0))
    result = np.append(result, np.mean(librosa.feature.melspectrogram(y=data, sr=sample_rate).T, axis=0))
    return result

def preprocess_audio(file_path):
    data, sample_rate = librosa.load(file_path, sr=16000)
    features = extract_features(data, sample_rate)
    TARGET_FEATURES = 162
    if len(features) > TARGET_FEATURES:
        features = features[:TARGET_FEATURES]
    elif len(features) < TARGET_FEATURES:
        features = np.pad(features, (0, TARGET_FEATURES - len(features)))
    return features.reshape(1, TARGET_FEATURES, 1)

def split_audio(input_wav, output_folder="audio_chunks", chunk_duration=2.5):
    os.makedirs(output_folder, exist_ok=True)
    data, sample_rate = librosa.load(input_wav, sr=16000)
    num_samples_per_chunk = int(sample_rate * chunk_duration)
    chunk_files = []
    for i in range(0, len(data), num_samples_per_chunk):
        chunk_data = data[i:i + num_samples_per_chunk]
        chunk_filename = os.path.join(output_folder, f"chunk_{i // num_samples_per_chunk}.wav")
        sf.write(chunk_filename, chunk_data, sample_rate)
        chunk_files.append(chunk_filename)
    return chunk_files

def run_model_on_chunks(input_wav):
    chunk_files = split_audio(input_wav)
    predictions = {}
    emotion_counts = np.zeros(len(EMOTION_LABELS))
    happy_count = 0

    for chunk_path in chunk_files:
        audio_features = preprocess_audio(chunk_path)
        prediction = model.predict(audio_features)
        predicted_class = np.argmax(prediction)
        predicted_emotion = EMOTION_LABELS[predicted_class]
        predictions[chunk_path] = predicted_emotion
        emotion_counts[predicted_class] += 1
        if predicted_class in HAPPY_CLASSES:
            happy_count += 1

    total_chunks = len(chunk_files)
    happy_percentage = (happy_count / total_chunks) * 100 if total_chunks > 0 else 0
    overall_emotion = "Happy/Satisfied" if happy_percentage > THRESHOLD_PERCENTAGE else EMOTION_LABELS[np.argmax(emotion_counts)]
    return predictions, overall_emotion


# --- API Endpoints ---

# Load Whisper model globally to avoid reloading on each request
model2 = whisper.load_model("base")  # Options: tiny, base, small, medium, large

@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    if "audio" not in request.files:
        print("We are here")
        return jsonify({"error": "No audio file uploaded"}), 400

    audio_file = request.files["audio"]
    file_path = os.path.join("uploads", audio_file.filename)
    
    # Ensure the upload directory exists
    os.makedirs("uploads", exist_ok=True)
    
    # Save the file temporarily
    audio_file.save(file_path)

    # Transcribe the audio
    result = model2.transcribe(file_path)

    # Remove the temporary file after processing
    os.remove(file_path)
    
    return jsonify({"transcription": result["text"]})

@app.route('/predict', methods=['POST'])
def predict():
    """ Endpoint for emotion prediction from an audio file. """
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    results, overall_emotion = run_model_on_chunks(filepath)
    return jsonify({"chunk_predictions": results, "overall_emotion": overall_emotion})


def calculate_difference(reference_face, current_face):
    """Calculate the average pixel difference between reference and current face image."""
    current_resized = cv2.resize(current_face, (reference_face.shape[1], reference_face.shape[0]))
    difference = np.mean(cv2.absdiff(reference_face, current_resized))
    return difference

def detect_face(image):
    """Detect the face in the image using Haar cascades."""
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    faces = face_cascade.detectMultiScale(image, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50))
    return faces

@app.route("/verify-with-image", methods=["POST"])
def verify_with_image():
    """Verify the webcam image against a provided reference image."""
    data = request.json
    
    # Extract webcam and reference images
    webcam_frame_data = base64.b64decode(data["webcamImage"])
    reference_frame_data = base64.b64decode(data["referenceImage"])
    
    # Convert to numpy arrays and decode to grayscale images
    np_webcam_frame = np.frombuffer(webcam_frame_data, np.uint8)
    np_reference_frame = np.frombuffer(reference_frame_data, np.uint8)
    
    webcam_frame = cv2.imdecode(np_webcam_frame, cv2.IMREAD_GRAYSCALE)
    reference_frame = cv2.imdecode(np_reference_frame, cv2.IMREAD_GRAYSCALE)
    
    # Detect face in the reference image
    reference_faces = detect_face(reference_frame)
    if len(reference_faces) == 0:
        return jsonify({"message": "No face detected in reference image."}), 400
    
    # Extract reference face
    rx, ry, rw, rh = reference_faces[0]
    reference_face = reference_frame[ry:ry+rh, rx:rx+rw]
    
    # Detect face in the webcam frame
    webcam_faces = detect_face(webcam_frame)
    if len(webcam_faces) == 0:
        return jsonify({ "success" : False, "message": "No face detected in webcam. Verification failed."}), 400

    # Loop through detected faces for verification
    for (x, y, w, h) in webcam_faces:
        current_face = webcam_frame[y:y+h, x:x+w]
        difference = calculate_difference(reference_face, current_face)

        # Convert the face detection box coordinates to integers
        face_box = [int(x), int(y), int(w), int(h)]
        
        if difference < 50:  # Threshold for acceptance - adjust as needed
            return jsonify({
                "success" : True,
                "message": "User Verified",
                "difference": float(difference),  # Convert numpy float to Python float
                "box": face_box
            })

    # If no match found, return the first detected face with failure message
    return jsonify({
        "success" : False,  
        "message": "Verification Failed",
        "difference": float(difference) if 'difference' in locals() else None,
        "box": [int(webcam_faces[0][0]), int(webcam_faces[0][1]), 
                int(webcam_faces[0][2]), int(webcam_faces[0][3])]
    })

def analyze_bpo_conversation(transcript):
    prompt = f"""
    Review the following transcript between an insurance claim agent and a client.
    {transcript}
    Then provide an analysis in this exact JSON format with no additional text:
    {{
        "summary": "Summarize the entire conversation in at most 20 words.",
        "summaryOfClientQuery": "Summarize the client's main query in at most 20 words.",
        "howAgentHandled": "Explain how the agent handled the query in at most 20 words.",
        "priorityScore": "A numeric score (1-100) based on urgency."
    }}
    For the priorityScore, consider these factors:
    - Medical severity/life-threatening situations (80-100)
    - Property damage creating unsafe living conditions (70-90)
    - Loss of essential transportation for work/medical needs (60-80)
    - Time-sensitive deadlines or coverage issues (50-70)
    - Standard claims with no urgent elements (1-49)

    Only output the JSON with the filled fields. No explanations, errors, or additional text before or after the JSON.
    """
    response = gemini_model.generate_content([prompt])
    
    # Extract just the JSON part from the response
    response_text = response.text.strip()
    # Try to find JSON content between curly braces if there's any text wrapping it
    json_start = response_text.find('{')
    json_end = response_text.rfind('}') + 1
    
    if json_start >= 0 and json_end > json_start:
        json_content = response_text[json_start:json_end]
    else:
        json_content = response_text
    
    # Ensure response is valid JSON
    try:
        json_response = json.loads(json_content)
        return json_response
    except json.JSONDecodeError:
        # Try one more cleanup attempt - remove markdown code blocks if present
        if json_content.startswith('```json'):
            json_content = json_content.replace('```json', '').replace('```', '').strip()
        elif json_content.startswith('```'):
            json_content = json_content.replace('```', '').strip()
        
        try:
            json_response = json.loads(json_content)
            return json_response
        except json.JSONDecodeError:
            return {
                "summary": "Error parsing response",
                "summaryOfClientQuery": "Error parsing response",
                "howAgentHandled": "Error parsing response",
                "priorityScore": 0
            }

@app.route("/analyze", methods=["POST"])
def analyze():
    """Endpoint for BPO conversation analysis."""
    data = request.get_json()
    
    if not data or "transcript" not in data:
        return jsonify({"error": "No transcript provided"}), 400

    transcript = data["transcript"]
    result = analyze_bpo_conversation(transcript)
    
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)