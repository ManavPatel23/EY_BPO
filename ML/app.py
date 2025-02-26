import os
import pickle
import numpy as np
import librosa
import soundfile as sf
import cv2
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:3000"]}})

# Load the pre-trained model for emotion detection
MODEL_PATH = "best_model.pkl"
with open(MODEL_PATH, 'rb') as file:
    model = pickle.load(file)

# Emotion labels
EMOTION_LABELS = {
    0: "Neutral",
    1: "Angry/Disgust",
    2: "Disappointed",
    3: "Happy/Satisfied",
    4: "Disappointed",
    5: "Angry/Disgust 1",
    6: "Angry/Disgust",
    7: "Other"
}

HAPPY_CLASSES = {3}  # Define happy-related emotion classes
THRESHOLD_PERCENTAGE = 25
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    results, overall_emotion = run_model_on_chunks(filepath)
    return jsonify({"chunk_predictions": results, "overall_emotion": overall_emotion})

# Face verification functions
def calculate_difference(reference_face, current_face):
    current_resized = cv2.resize(current_face, (reference_face.shape[1], reference_face.shape[0]))
    difference = np.mean(cv2.absdiff(reference_face, current_resized))
    return difference

def detect_face(image):
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    faces = face_cascade.detectMultiScale(image, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50))
    return faces

@app.route("/verify-with-image", methods=["POST"])
def verify_with_image():
    data = request.json
    webcam_frame_data = base64.b64decode(data["webcamImage"])
    reference_frame_data = base64.b64decode(data["referenceImage"])
    np_webcam_frame = np.frombuffer(webcam_frame_data, np.uint8)
    np_reference_frame = np.frombuffer(reference_frame_data, np.uint8)
    webcam_frame = cv2.imdecode(np_webcam_frame, cv2.IMREAD_GRAYSCALE)
    reference_frame = cv2.imdecode(np_reference_frame, cv2.IMREAD_GRAYSCALE)
    reference_faces = detect_face(reference_frame)
    if len(reference_faces) == 0:
        return jsonify({"message": "No face detected in reference image."}), 400
    rx, ry, rw, rh = reference_faces[0]
    reference_face = reference_frame[ry:ry+rh, rx:rx+rw]
    webcam_faces = detect_face(webcam_frame)
    if len(webcam_faces) == 0:
        return jsonify({"success": False, "message": "No face detected in webcam. Verification failed."}), 400
    for (x, y, w, h) in webcam_faces:
        current_face = webcam_frame[y:y+h, x:x+w]
        difference = calculate_difference(reference_face, current_face)
        face_box = [int(x), int(y), int(w), int(h)]
        if difference < 50:
            return jsonify({"success": True, "message": "User Verified", "difference": float(difference), "box": face_box})
    return jsonify({"success": False, "message": "Verification Failed", "box": face_box})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
