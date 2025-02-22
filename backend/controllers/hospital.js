const { Hospital } = require("../models/HospitalSchema");

const createHospital = async (req, res) => {
  const { hospitalName, address, specialization } = req.body;

  let hospital = await Hospital.findOne({ hospitalName });

  if (hospital) {
    return res.status(400).json({
      success: false,
      message: "Hospital Already Exists",
    });
  }

  hospital = await Hospital.create({ hospitalName, address, specialization });

  return res.status(200).json({
    success: true,
    message: "Hospital Create Successfully",
    hospital,
  });
};

const createMultipleHospitals = async (req, res) => {
  const hospitalsData = req.body; // Expecting an array of hospitals

  if (!Array.isArray(hospitalsData) || hospitalsData.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid data format. Expecting an array of hospitals.",
    });
  }

  try {
    const existingHospitals = await Hospital.find({
      hospitalName: { $in: hospitalsData.map((h) => h.hospitalName) },
    });

    const existingNames = new Set(existingHospitals.map((h) => h.hospitalName));

    const newHospitals = hospitalsData.filter(
      (h) => !existingNames.has(h.hospitalName)
    );

    if (newHospitals.length === 0) {
      return res.status(200).json({
        success: true,
        message: "All hospitals already exist. No new hospitals were added.",
      });
    }

    const createdHospitals = await Hospital.insertMany(newHospitals);

    return res.status(201).json({
      success: true,
      message: `${createdHospitals.length} new hospitals added successfully.`,
      createdHospitals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating hospitals",
      error: error.message,
    });
  }
};

module.exports = {
  createHospital,
  createMultipleHospitals,
};
