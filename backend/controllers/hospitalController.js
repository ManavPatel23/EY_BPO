const HospitalSubmittedSchema = require("../models/HospitalSubmittedSchema");
const upload = require("../utils/multerUploadMultipleConfig");
const path = require("path");

const uploadDocumentsForClaim = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const extractFilePaths = (fieldName) => {
        return req.files[fieldName]
          ? req.files[fieldName].map((file, index) => ({
              fileNo: `Page ${index + 1}`,
              filePath: file.filename, // Store just the filename
            }))
          : [];
      };

      // Create a new document in MongoDB
      const hospitalDocument = new HospitalSubmittedSchema({
        policyDocuments: extractFilePaths("policyDocuments"),
        billsDocuments: extractFilePaths("billsDocuments"),
        prescriptionsDocuments: extractFilePaths("prescriptionsDocuments"),
        patientDetailsDocuments: extractFilePaths("patientDetailsDocuments"),
        medicalHistoryDocuments: extractFilePaths("medicalHistoryDocuments"),
        patientPastMedicalCheckupsDocuments: extractFilePaths(
          "patientPastMedicalCheckupsDocuments"
        ),
        patientPastMedicalRecordsDocuments: extractFilePaths(
          "patientPastMedicalRecordsDocuments"
        ),
        regularMedicinesOfPatientDocuments: extractFilePaths(
          "regularMedicinesOfPatientDocuments"
        ),
        operationDetailDocuments: extractFilePaths("operationDetailDocuments"),
        doctorsNoteDocuments: extractFilePaths("doctorsNoteDocuments"),
      });

      await hospitalDocument.save();

      res.status(201).json({
        success: true,
        message: "Documents uploaded successfully",
        data: hospitalDocument,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

module.exports = { uploadDocumentsForClaim };
