const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const UserBuyedInsuranceSchema = new mongoose.Schema({
  // Auto-generated unique policy number
  policyNumber: { type: Number, unique: true },

  // Link to User who bought the insurance
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Link to Policy schema (Ensures valid policy selection)
  policyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Policy",
    required: true,
  },

  // Basic Personal Details (Stored at the time of purchase)
  personalDetails: {
    fullName: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    aadharNumber: { type: String, required: true, unique: true },
    panNumber: { type: String, required: true, unique: true },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      pincode: { type: String },
    },
  },

  // Insurance Details
  insuranceDetails: {
    policyStartDate: { type: Date },
    policyEndDate: { type: Date },
  },

  // Policy Status (Active, Expired, Canceled)
  policyStatus: {
    type: String,
    enum: ["Active", "Expired", "Canceled"],
    default: "Active",
  },

  // Nominee Details
  nomineeDetails: {
    name: { type: String },
    relation: { type: String },
    aadharNumber: { type: String },
    phoneNumber: { type: String },
  },

  // Allowed Hospitals (Predefined List)
  hospitalsAllowed: [
    {
      hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
      hospitalName: { type: String },
    },
  ],

  // Medical History (Immutable at the time of insurance purchase)
  medicalHistory: [
    {
      disease: { type: String },
      diagnosisDetails: { type: String },
      severity: { type: String, enum: ["Mild", "Moderate", "Severe"] },
      treatment: {
        type: { type: String },
        details: { type: String },
        duration: { type: String },
        outcome: { type: String },
      },
      doctorName: { type: String },
      doctorSpecialization: { type: String },
      hospitalName: { type: String },
      hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
      dateOfDiagnosis: { type: Date },
      dateOfRecovery: { type: Date },
      dateOfReport: { type: Date },
      followUpRequired: { type: Boolean },
      additionalNotes: { type: String },
    },
  ],

  // Regular Medicines
  regularMedicines: [
    {
      medicineName: { type: String },
      genericName: { type: String },
      dosage: { type: String },
      frequency: { type: Number },
      duration: { type: String },
      purpose: { type: String },
      sideEffects: [{ name: { type: String } }],
      startDate: { type: Date },
      endDate: { type: Date },
      prescribedBy: { type: String },
      isActive: { type: Boolean },
      specialInstructions: { type: String },
      interactionWarnings: [{ name: { type: String } }],
    },
  ],

  // Payment Details
  paymentDetails: {
    mode: {
      type: String,
      enum: ["Credit Card", "Debit Card", "UPI", "Net Banking"],
      required: true,
    },
    transactionId: { type: String, required: true },
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
