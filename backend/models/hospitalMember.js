const mongoose = require("mongoose");

const HospitalMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    default: "HospitalMember",
  },
  createdAt: { type: Date, default: Date.now },
});

const HospitalMember = mongoose.model("HospitalMember", HospitalMemberSchema);

module.exports = {
  HospitalMember,
};
