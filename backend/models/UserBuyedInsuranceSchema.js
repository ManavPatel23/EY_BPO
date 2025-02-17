const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const UserBuyedInsuranceSchema = new mongoose.Schema({
  // this will be the key value
  policyNumber: { type: String, unique: true },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Basic Personal Details (Stored at the time of purchase)
  personalDetails: {
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    aadharNumber: { type: String, required: true, unique: true },
    panNumber: { type: String, required: true, unique: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      pincode: { type: String, required: true },
    },
  },

  // Insurance Details
  insuranceDetails: {
    // policyNumber: { type: String, required: true, unique: true },
    policyStartDate: { type: Date, required: true },
    policyEndDate: { type: Date, required: true },
    sumAssured: { type: Number, required: true },
    premiumAmount: { type: Number, required: true },
    premiumPaymentFrequency: {
      type: String,
      enum: ["Monthly", "Quarterly", "Yearly"],
      required: true,
    },
  },

  // Nominee Details
  nomineeDetails: {
    name: { type: String, required: true },
    relation: { type: String, required: true },
    aadharNumber: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },

  // Allowed Hospitals (Predefined List)
  hospitalsAllowed: [
    {
      hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
      hospitalName: { type: String },
      location: { type: String },
    },
  ],

  // Medical History (Immutable at the time of insurance purchase)
  medicalHistory: [
    {
      disease: { type: String, required: true },
      treatment: { type: String },
      doctorName: { type: String },
      hospitalName: { type: String },
      hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
      dateOfDiagnosis: { type: Date, required: true },
    },
  ],

  // Regular Medicines
  regularMedicines: [
    {
      medicineName: { type: String, required: true },
      dosage: { type: String, required: true },
      frequency: { type: Number, required: true }, // e.g :1,2
      duration: { type: String, required: true }, // eg  : {"month","year"}
    },
  ],

  // Payment Details
  paymentDetails: {
    mode: {
      type: String,
      enum: ["Credit Card", "Debit Card", "UPI", "Net Banking"],
      required: true,
    },
    transactionId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["Success", "Pending", "Failed"],
      default: "Pending",
    },
  },

  createdAt: { type: Date, default: Date.now },
});

// Apply AutoIncrement plugin
UserBuyedInsuranceSchema.plugin(AutoIncrement, { inc_field: "policyNumber" });

const UserBuyedInsurance = mongoose.model(
  "UserBuyedInsurance",
  UserBuyedInsuranceSchema
);

module.exports = {
  UserBuyedInsurance,
};
