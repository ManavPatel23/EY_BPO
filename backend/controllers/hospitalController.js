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
        hospitalMemberId: req.user._id,
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
    // Find all claims where hospitalMemberId matches req.user._id
    const id = req.params.id;
    const claims = await HospitalSubmittedSchema.find({
      hospitalMemberId: id,
    })
      .populate("hospitalMemberId", "name email")
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
      hospitalMemberId: {
        _id: claim.hospitalMemberId._id,
        name: claim.hospitalMemberId.name,
        email: claim.hospitalMemberId.email,
      },
      submittedAt: claim.submittedAt,
      createdAt: claim.createdAt,
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

module.exports = {
  uploadDocumentsForClaim,
  createUser,
  loginUser,
  getUserDetails,
  getHospClaims,
};
