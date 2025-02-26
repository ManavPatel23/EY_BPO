from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:3000"]}})

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

# Keep these routes for backward compatibility
@app.route("/capture-reference", methods=["POST"])
def capture_reference():
    return jsonify({"message": "This endpoint is deprecated. Please use /verify-with-image instead."}), 400

@app.route("/verify", methods=["POST"])
def verify():
    return jsonify({"message": "This endpoint is deprecated. Please use /verify-with-image instead."}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)