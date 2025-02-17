const mongoose = require("mongoose");
const HospitalSubmitted = require("../models/HospitalSubmittedSchema"); // Import your schema

const axios = require("axios");
const fs = require("fs");
const path = require("path");

const GEMINI_API_KEY = "AIzaSyB8oissLXtLOIcQIlWV-RT9m_1IP-ICqFE";
const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function mergePatientDetails(existing, new_data) {
  const merged = { ...existing };

  // Merge simple fields
  for (const [key, value] of Object.entries(new_data)) {
    if (
      value &&
      value !== "" &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value !== "object"
    ) {
      merged[key] = value;
    }
  }

  // Merge address
  if (new_data.address) {
    merged.address = {
      street: new_data.address.street || existing.address.street,
      city: new_data.address.city || existing.address.city,
      state: new_data.address.state || existing.address.state,
      country: new_data.address.country || existing.address.country,
      pincode: new_data.address.pincode || existing.address.pincode,
    };
  }

  // Merge emergency contact
  if (new_data.emergencyContact) {
    merged.emergencyContact = {
      name: new_data.emergencyContact.name || existing.emergencyContact.name,
      relationship:
        new_data.emergencyContact.relationship ||
        existing.emergencyContact.relationship,
      phone: new_data.emergencyContact.phone || existing.emergencyContact.phone,
    };
  }

  // Merge arrays (allergies)
  if (new_data.allergies && new_data.allergies.length > 0) {
    merged.allergies = [
      ...new Set([...existing.allergies, ...new_data.allergies]),
    ];
  }

  // Merge family medical history
  if (
    new_data.familyMedicalHistory &&
    new_data.familyMedicalHistory.length > 0
  ) {
    merged.familyMedicalHistory = [
      ...existing.familyMedicalHistory,
      ...new_data.familyMedicalHistory.filter(
        (newRecord) =>
          !existing.familyMedicalHistory.some(
            (existingRecord) =>
              existingRecord.relationWithHim === newRecord.relationWithHim
          )
      ),
    ];
  }

  return merged;
}

async function extractPatientDetails(documents) {
  let consolidatedDetails = {
    fullName: "",
    dateOfBirth: null,
    age: null,
    gender: "",
    bloodGroup: "",
    weight: null,
    height: null,
    contactNumber: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
    aadharNumber: "",
    panNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
    },
    occupation: "",
    maritalStatus: "",
    allergies: [],
    familyMedicalHistory: [],
    smokingAlcoholicFrequency: "",
  };

  const prompt = `Extract patient personal information from this document and return it in the following JSON structure. Only include fields that are clearly visible in the document - leave other fields empty. Do not include any additional text or markdown: Find age too . familyMedicalHistory is an array with values relationWithHim,medicalHistory both strings . dateOfBirth is a date value convert in data type.
  ${JSON.stringify(consolidatedDetails, null, 2)}`;

  for (const doc of documents) {
    try {
      const filePathGeneral = path.join(__dirname, "../uploads", doc.filePath);
      console.log("Processing file:", filePathGeneral);

      // Read the file and get its mime type
      const imageBuffer = fs.readFileSync(filePathGeneral);
      const mimeType = getMimeType(doc.filePath);

      // Make request to Gemini API
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBuffer.toString("base64"),
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topP: 1,
            topK: 32,
            maxOutputTokens: 4096,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );

      // Extract and clean the response
      let extractedText =
        response.data.candidates[0]?.content?.parts[0]?.text || "{}";
      extractedText = extractedText.replace(/```json\n?|\n?```/g, "").trim();

      // Parse the extracted data
      const extractedData = JSON.parse(extractedText);

      // Merge with existing data
      consolidatedDetails = mergePatientDetails(
        consolidatedDetails,
        extractedData
      );
    } catch (error) {
      console.error(
        `Error processing document ${doc.fileNo}:`,
        error.response?.data || error.message
      );
    }
  }

  return consolidatedDetails;
}

// Helper function to determine mime type
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
  };
  return mimeTypes[ext] || "image/jpeg";
}

// Usage in watch function
const watchHospitalUploads = (io) => {
  try {
    const changeStream = HospitalSubmitted.watch();

    changeStream.on("change", async (change) => {
      if (change.operationType === "insert") {
        console.log(
          "New document uploaded:",
          change.fullDocument.patientDetailsDocuments
        );

        try {
          // Process patient details documents
          const patientDetails = await extractPatientDetails(
            change.fullDocument.patientDetailsDocuments
          );

          console.log(patientDetails);

          // Update the document with extracted details
          await HospitalSubmitted.findByIdAndUpdate(change.fullDocument._id, {
            patientPersonalDetails: patientDetails,
          });

          // Emit event to connected clients
          io.emit("newHospitalUpload", change.fullDocument);
        } catch (error) {
          console.error("Error processing documents:", error);
        }
      }
    });

    console.log("Watching for hospital uploads...");
  } catch (error) {
    console.error("Error watching hospital uploads:", error);
  }
};

module.exports = watchHospitalUploads;
