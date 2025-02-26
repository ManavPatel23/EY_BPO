const HospitalSubmittedSchema = require("../models/HospitalSubmittedSchema");
const upload = require("../utils/multerUploadMultipleConfig");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { HospitalMember } = require("../models/hospitalMember");

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

      console.log("user id ", req.user._id);

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
        patientId: req.user._id,
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

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(500).json({
        success: false,
        message: "All Fields Are Required",
      });
    }

    let user = await HospitalMember.findOne({ email });

    if (user) {
      return res.status(500).json({
        success: false,
        message: "Hospital Member Already Exists",
      });
    }

    const hashPass = await bcrypt.hash(password, 10);

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    user = await HospitalMember.create({
      name,
      email,
      password: hashPass,
    });

    // sendToken(user, 200, "User Created Successfully", res);
    return res.status(200).json({
      success: true,
      message: "User Created Successfully",
      user,
      token,
    });
  } catch (error) {
    console.log(error.message, " Error Message ", error);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(500).json({
      success: false,
      message: "All Fields Are Required",
    });
  }

  let user = await HospitalMember.findOne({ email }).select("+password");

  if (!user) {
    return res.status(500).json({
      success: false,
      message: "User Doesn't Exist",
    });
  }

  const comparePass = await bcrypt.compare(password, user.password);

  if (!comparePass) {
    return res.status(500).json({
      success: false,
      message: "Password Doesn't Match",
    });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.status(200).json({
    success: true,
    message: "User Login Successfully",
    user,
    token,
  });
};

const generateToken = async (userID) => {
  const token = await jwt.sign({ id: userID }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return token;
};

const getUserDetails = async (req, res) => {
  try {
    const myId = req.user._id;

    const user = await HospitalMember.findById(myId);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);

    return res.status(300).json({
      success: false,
      message: error.message,
      error,
    });
  }
};

const getHospClaims = async (req, res) => {
  try {
    // Find all claims where patientId matches req.user._id
    const claims = await HospitalSubmittedSchema.find({
      patientId: req.user._id,
    })
      .populate("patientId", "name email")
      .populate("hospitalId", "hospitalName")
      .sort({ timestamp: -1 });

    // If no claims found
    if (!claims || claims.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No claims found for this hospital",
      });
    }

    const extractedClaims = claims.map((claim) => ({
      validationStatus: claim.validationStatus,
      referenceImage: `${req.protocol}://${req.get("host")}/uploads/${
        claim.referenceImage
      }`,
      hospitalName: claim.hospitalName,
      faceVerification: claim.faceVerification,
      locationVerification: claim.locationVerification,
      patientId: {
        _id: claim.patientId._id,
        name: claim.patientId.name,
        email: claim.patientId.email,
      },
      submittedAt: claim.submittedAt,
      createdAt: claim.createdAt,
      claimId: claim._id,
      summaryAfterVerification: claim.summaryAfterVerification,
    }));

    res.status(200).json({
      success: true,
      count: claims.length,
      data: extractedClaims,
    });
  } catch (error) {
    console.error("Error fetching hospital claims:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hospital claims",
      error: error.message,
    });
  }
};

const getClaimById = async (req, res) => {
  try {
    const { cid } = req.params;

    // Find the specific claim by ID
    const claim = await HospitalSubmittedSchema.findById(cid)
      .populate("patientId", "name email")
      .populate("hospitalId", "hospitalName");

    // If no claim found
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    claim.referenceImage = `${req.protocol}://${req.get("host")}/uploads/${
      claim.referenceImage
    }`;

    res.status(200).json({
      success: true,
      claim,
    });
  } catch (error) {
    console.error("Error fetching claim details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching claim details",
      error: error.message,
    });
  }
};

const updateFaceVerificationCounter = async (req, res) => {
  try {
    const { cid } = req.params;

    // Find the claim by ID
    const claim = await HospitalSubmittedSchema.findById(cid);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    // Increment the counter regardless of verification result
    claim.faceVerification.counter = (claim.faceVerification.counter || 0) + 1;

    // Set timeout to exactly 24 hours from now
    const timeOut = new Date();
    timeOut.setHours(timeOut.getHours() + 24);
    claim.faceVerification.timeOut = timeOut;

    // Save the updated claim
    await claim.save();

    return res.status(200).json({
      success: true,
      message: "Face verification counter updated successfully",
      updatedFaceVerification: claim.faceVerification,
    });
  } catch (error) {
    console.error("Error updating face verification counter:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating face verification counter",
      error: error.message,
    });
  }
};

const updateLocaVerificationCounter = async (req, res) => {
  try {
    const { cid } = req.params;

    // Find the claim by ID
    const claim = await HospitalSubmittedSchema.findById(cid);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    // Increment the counter regardless of verification result
    claim.locationVerification.counter =
      (claim.locationVerification.counter || 0) + 1;

    // Set timeout to exactly 24 hours from now
    const timeOut = new Date();
    timeOut.setHours(timeOut.getHours() + 24);
    claim.locationVerification.timeOut = timeOut;

    // Check if counter is >= 2, then update HospitalSchema verificationStatus
    if (claim.locationVerification.counter >= 2) {
      // Find and update the hospital record
      await HospitalSubmittedSchema.findByIdAndUpdate(
        cid, // Assuming hospitalId is stored in the claim
        { validationStatus: "CLAIM_PROCESSED" },
        { new: true }
      );
    }

    // Save the updated claim
    await claim.save();

    return res.status(200).json({
      success: true,
      message: "Location verification counter updated successfully",
      updatedLocationVerification: claim.locationVerification,
    });
  } catch (error) {
    console.error("Error updating location verification counter:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating location verification counter",
      error: error.message,
    });
  }
};
module.exports = {
  uploadDocumentsForClaim,
  createUser,
  loginUser,
  getUserDetails,
  getHospClaims,
  getClaimById,
  updateFaceVerificationCounter,
  updateLocaVerificationCounter,
};
