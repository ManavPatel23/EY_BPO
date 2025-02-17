// multerUploadMultipleConfig.js
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads");
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueFilename = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage }).fields([
  { name: "policyDocuments", maxCount: 10 },
  { name: "patientDetailsDocuments", maxCount: 10 },
  { name: "medicalHistoryDocuments", maxCount: 10 },
  { name: "billsDocuments", maxCount: 10 },
  { name: "prescriptionsDocuments", maxCount: 10 },
  { name: "patientPastMedicalCheckupsDocuments", maxCount: 10 },
  { name: "patientPastMedicalRecordsDocuments", maxCount: 10 },
  { name: "regularMedicinesOfPatientDocuments", maxCount: 10 },
  { name: "operationDetailDocuments", maxCount: 10 },
  { name: "doctorsNoteDocuments", maxCount: 10 },
]);

module.exports = upload;
