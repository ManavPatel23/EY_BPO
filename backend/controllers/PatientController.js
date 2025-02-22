const { UserBuyedInsurance } = require("../models/UserBuyedInsuranceSchema");
const Policy = require("../models/PolicySchema");

const buyPolicy = async (req, res) => {
  try {
    const {
      policyId,
      personalDetails,
      insuranceDetails,
      nomineeDetails,
      hospitalsAllowed,
      medicalHistory,
      regularMedicines,
      paymentDetails,
    } = req.body;

    if (
      policyId == null ||
      personalDetails == null ||
      insuranceDetails == null ||
      nomineeDetails == null ||
      hospitalsAllowed == null ||
      medicalHistory == null ||
      regularMedicines == null ||
      paymentDetails == null
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide All Details",
      });
    }

    // Check if policy exists
    const policyExists = await Policy.findById(policyId);
    if (!policyExists) {
      return res.status(404).json({
        success: false,
        message: "Policy not found",
      });
    }

    // Check for duplicate Aadhar or PAN
    const existingInsurance = await UserBuyedInsurance.findOne({
      $or: [
        { "personalDetails.aadharNumber": personalDetails.aadharNumber },
        { "personalDetails.panNumber": personalDetails.panNumber },
      ],
    });

    if (existingInsurance) {
      return res.status(400).json({
        success: false,
        message: "Aadhar or PAN is already registered with an existing policy.",
      });
    }

    // Create new insurance record
    const newInsurance = await UserBuyedInsurance.create({
      userId: req.user._id,
      policyId,
      personalDetails,
      insuranceDetails,
      nomineeDetails,
      hospitalsAllowed,
      medicalHistory,
      regularMedicines,
      paymentDetails,
    });

    return res.status(201).json({
      success: true,
      message: "Policy purchased successfully!",
      insuranceDetails: newInsurance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error purchasing policy",
      error: error.message,
    });
  }
};

module.exports = { buyPolicy };
