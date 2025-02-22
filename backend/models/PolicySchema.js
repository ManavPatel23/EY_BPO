const mongoose = require("mongoose");

const policySchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["GeneralCare", "PremiumShield", "SuperPremiumElite"],
    required: true,
  },
  coverageAmount: { type: Number, required: true }, // Max claim amount
  claimLimitPerYear: { type: Number, required: true }, // Max claims per year
  premiumAmount: { type: Number, required: true }, // Monthly premium cost
  createdAt: { type: Date, default: Date.now },
});

// Export model
const Policy = mongoose.model("Policy", policySchema);

module.exports = Policy;
