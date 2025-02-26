import { BACKEND_URL } from "@/constant";
import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Webcam from "react-webcam";
import axios from "../axiosDefault";

const VerifyFace = () => {
  const { claimId } = useParams();

  const webcamRef = useRef(null);
  const [message, setMessage] = useState(
    "Ready to verify with existing reference image."
  );
  const [isRunning, setIsRunning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [referenceImageData, setReferenceImageData] = useState(null);
  const [claimData, setClaimData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);

  // Fetch claim details when component loads
  useEffect(() => {
    const fetchClaimDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${BACKEND_URL}/hosp/claim/${claimId}`
        );

        if (!response.data.success) {
          throw new Error("Failed to fetch claim details");
        }

        const data = await response.data.claim;
        setClaimData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching claim details:", error);
        setMessage("Error fetching claim details");
        setLoading(false);
      }
    };

    if (claimId) {
      fetchClaimDetails();
    }
  }, [claimId]);

  // Start camera when component loads
  useEffect(() => {
    startCamera();

    // Clean up when component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  // Load reference image when claim data is available
  useEffect(() => {
    if (claimData && claimData.referenceImage) {
      const referenceImageUrl = claimData.referenceImage;
      loadReferenceImage(referenceImageUrl);
    }
  }, [claimData]);

  const startCamera = () => setIsRunning(true);
  const stopCamera = () => setIsRunning(false);

  // Function to load the reference image from URL
  const loadReferenceImage = async (url) => {
    try {
      // Create an image element to load the image
      const img = new Image();

      // Handle CORS by using the crossOrigin attribute
      img.crossOrigin = "anonymous";

      img.onload = () => {
        // Create a canvas to draw the image and get its data
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Get the image data as base64
        const dataUrl = canvas.toDataURL("image/jpeg");
        setReferenceImageData(dataUrl);
      };

      img.onerror = () => {
        console.error("Failed to load image");
        setMessage(
          "Failed to load reference image. CORS issue may be present."
        );
      };

      // Set the source after setting the event handlers
      img.src = url;
    } catch (error) {
      console.error("Error loading reference image:", error);
      setMessage("Error loading reference image");
    }
  };

  // Function to update face verification counter and timeout
  const updateFaceVerificationCounter = async () => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/hosp/face/count/${claimId}`
      );

      if (!response.data.success) {
        throw new Error("Failed to update face verification counter");
      }

      // Update local claim data with new verification status
      setClaimData((prevData) => ({
        ...prevData,
        faceVerification: response.data.updatedFaceVerification,
      }));

      return response.data;
    } catch (error) {
      console.error("Error updating face verification counter:", error);
      throw error;
    }
  };

  // Function to verify with the provided reference image URL
  const verifyWithReference = async () => {
    if (!webcamRef.current || !referenceImageData) {
      setMessage("Webcam or reference image not available.");
      return;
    }

    setIsVerifying(true);
    setMessage("Verifying...");

    // Get the image from the webcam
    const webcamImageSrc = webcamRef.current.getScreenshot();
    if (!webcamImageSrc) {
      setIsVerifying(false);
      setMessage("Failed to capture webcam image.");
      return;
    }

    // Extract base64 data from webcam image (remove the data URL prefix)
    const webcamBase64 = webcamImageSrc.split(",")[1];
    // Extract base64 data from reference image
    const referenceBase64 = referenceImageData.split(",")[1];

    try {
      // Send both images to the backend as base64
      const response = await fetch("http://localhost:5000/verify-with-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          webcamImage: webcamBase64,
          referenceImage: referenceBase64,
        }),
      });

      const data = await response.json();

      console.log("DATA", data);

      if (response.ok) {
        // Update the verification status

        // Update face verification counter and timeout
        await updateFaceVerificationCounter();
        setMessage(
          `${data.message}${
            data.difference
              ? ` (Difference: ${data.difference.toFixed(2)})`
              : ""
          }`
        );
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `Error: ${error.message || "Error communicating with the server."}`
      );
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "20px",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1>Face Verification</h1>

      {/* Verification Status Information */}
      {claimData && claimData.faceVerification && (
        <div
          style={{
            margin: "20px 0",
            padding: "15px",
            backgroundColor: "#e3f2fd",
            borderRadius: "8px",
          }}
        >
          <h3>Verification Status</h3>
          <p>
            Verification attempts: {claimData.faceVerification.counter || 0}
          </p>
          {claimData.faceVerification.timeOut && (
            <p>
              Next available verification:{" "}
              {new Date(claimData.faceVerification.timeOut).toLocaleString()}
            </p>
          )}
        </div>
      )}

      <div
        style={{
          margin: "20px 0",
          padding: "15px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h2>Reference Image</h2>
        {referenceImageData ? (
          <div>
            <p>Using reference image from server:</p>
            <img
              src={referenceImageData}
              alt="Reference"
              style={{
                maxWidth: "200px",
                maxHeight: "200px",
                border: "1px solid #ccc",
                margin: "10px auto",
              }}
            />
          </div>
        ) : (
          <p>No reference image URL provided.</p>
        )}
      </div>

      <div
        style={{
          margin: "20px 0",
          padding: "15px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h2>Webcam Verification</h2>
        {isRunning ? (
          <>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              style={{
                width: "100%",
                maxWidth: "500px",
                height: "auto",
                margin: "10px auto",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <div style={{ margin: "15px 0" }}>
              <button
                onClick={verifyWithReference}
                disabled={
                  !referenceImageData ||
                  isVerifying ||
                  (claimData?.faceVerification?.timeOut &&
                    new Date(claimData.faceVerification.timeOut) > new Date())
                }
                style={{
                  padding: "12px 24px",
                  margin: "10px",
                  cursor:
                    referenceImageData &&
                    !isVerifying &&
                    (!claimData?.faceVerification?.timeOut ||
                      new Date(claimData.faceVerification.timeOut) <=
                        new Date())
                      ? "pointer"
                      : "not-allowed",
                  backgroundColor:
                    referenceImageData &&
                    !isVerifying &&
                    (!claimData?.faceVerification?.timeOut ||
                      new Date(claimData.faceVerification.timeOut) <=
                        new Date())
                      ? "#4CAF50"
                      : "#cccccc",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "16px",
                }}
              >
                {isVerifying ? "Verifying..." : "Verify User"}
              </button>
              {claimData?.faceVerification?.timeOut &&
                new Date(claimData.faceVerification.timeOut) > new Date() && (
                  <p style={{ color: "red" }}>
                    Verification is on timeout until{" "}
                    {new Date(
                      claimData.faceVerification.timeOut
                    ).toLocaleString()}
                  </p>
                )}
            </div>
          </>
        ) : (
          <p>Camera is off. Click "Start Camera" to begin.</p>
        )}
        <div>
          <button
            onClick={startCamera}
            style={{
              padding: "10px 20px",
              margin: "10px",
              cursor: "pointer",
              background: "green",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Start Camera
          </button>
          <button
            onClick={stopCamera}
            style={{
              padding: "10px 20px",
              margin: "10px",
              cursor: "pointer",
              background: "red",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Stop Camera
          </button>
        </div>
      </div>

      <div
        style={{
          margin: "20px 0",
          padding: "15px",
          backgroundColor:
            verificationStatus === "success"
              ? "#e8f5e9"
              : verificationStatus === "failed"
              ? "#ffebee"
              : "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <p style={{ fontSize: "18px", fontWeight: "bold" }}>{message}</p>
      </div>
    </div>
  );
};

export default VerifyFace;
