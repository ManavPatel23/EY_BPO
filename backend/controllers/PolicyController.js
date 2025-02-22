const Policy = require("../models/PolicySchema");

const createMultiplePolicies = async (req, res) => {
  const policiesData = req.body; // Expecting an array of policies

  if (!Array.isArray(policiesData) || policiesData.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid data format. Expecting an array of policies.",
    });
  }

  try {
    // Find existing policies with the same names
    const existingPolicies = await Policy.find({
      name: { $in: policiesData.map((p) => p.name) },
    });

    const existingNames = new Set(existingPolicies.map((p) => p.name));

    // Filter out already existing policies
    const newPolicies = policiesData.filter((p) => !existingNames.has(p.name));

    if (newPolicies.length === 0) {
      return res.status(200).json({
        success: true,
        message: "All policies already exist. No new policies were added.",
      });
    }

    // Insert new policies
    const createdPolicies = await Policy.insertMany(newPolicies);

    return res.status(201).json({
      success: true,
      message: `${createdPolicies.length} new policies added successfully.`,
      createdPolicies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating policies",
      error: error.message,
    });
  }
};

module.exports = { createMultiplePolicies };
