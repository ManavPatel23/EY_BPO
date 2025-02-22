const mongoose = require("mongoose");

const HospitalSchema = new mongoose.Schema({
  hospitalName: { type: String, required: true, unique: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  specialization: [{ type: String }], // List of specializations (e.g., Cardiology, Neurology)
  createdAt: { type: Date, default: Date.now },
});

const Hospital = mongoose.model("Hospital", HospitalSchema);

module.exports = {
  Hospital,
};
