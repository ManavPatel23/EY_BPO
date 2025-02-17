const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const HospitalSubmittedDataSchema = new mongoose.Schema(
  {
    // insurance status
    validationStatus: {
      type: String,
      enum: ["PENDING_REVIEW", "VERIFIED", "NEEDS_CORRECTION", "FAILED"],
      default: "PENDING_REVIEW",
    },

    // any errors message for it
    processingErrors: [
      {
        documentType: String,
        error: String,
        timestamp: Date,
      },
    ],

    finalScoreAfterVerification: { type: Number },

    summaryAfterVerification: { type: String },

    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },

    hospitalMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HospitalMember",
    },

    // Document collections remain as arrays since they represent multiple physical files

    policyDocuments: [
      {
        fileNo: { type: String, required: true },
        filePath: { type: String, required: true },
      },
    ],

    billsDocuments: [
      {
        fileNo: { type: String, required: true },
        filePath: { type: String, required: true },
      },
    ],

    prescriptionsDocuments: [
      {
        fileNo: { type: String, required: true },
        filePath: { type: String, required: true },
      },
    ],

    patientDetailsDocuments: [
      {
        fileNo: { type: String, required: true },
        filePath: { type: String, required: true },
      },
    ],

    medicalHistoryDocuments: [
      {
        fileNo: { type: String, required: true },
        filePath: { type: String, required: true },
      },
    ],

    patientPastMedicalCheckupsDocuments: [
      {
        fileNo: { type: String, required: true },
        filePath: { type: String, required: true },
      },
    ],

    patientPastMedicalRecordsDocuments: [
      {
        fileNo: { type: String, required: true },
        filePath: { type: String, required: true },
      },
    ],

    regularMedicinesOfPatientDocuments: [
      {
        fileNo: { type: String, required: true },
        filePath: { type: String, required: true },
      },
    ],

    operationDetailDocuments: [
      {
        fileNo: { type: String, required: true },
        filePath: { type: String, required: true },
      },
    ],

    doctorsNoteDocuments: [
      {
        fileNo: { type: String, required: true },
        filePath: { type: String, required: true },
      },
    ],

    policyDetails: {
      policyStartDate: { type: Date },
      policyEndDate: { type: Date },
      sumAssured: { type: Number },
      premiumAmount: { type: Number },
    },

    // Consolidated billing details as a single object
    billingDetails: {
      patientDetails: {
        name: { type: String },
        gender: { type: String },
        bloodGroup: { type: String },
      },
      billId: { type: String },
      hospitalName: { type: String },
      hospitalGSTIN: { type: String },
      date: { type: Date },
      amount: { type: Number },
      description: { type: String },
      itemizedCharges: [
        {
          serviceName: { type: String, required: true },
          quantity: { type: Number },
          unitPrice: { type: Number },
          totalPrice: { type: Number },
          category: { type: String },
        },
      ],
      taxes: {
        cgst: { type: Number },
        sgst: { type: Number },
        totalTax: { type: Number },
      },
      paymentMethod: { type: String },
      paymentStatus: {
        type: String,
        enum: ["Paid", "Pending", "Partially Paid"],
      },
      discountApplied: { type: Number },
      billGeneratedBy: { type: String },
      totalBillingAmount: {
        subTotal: { type: Number },
        taxAmount: { type: Number },
        discountAmount: { type: Number },
        finalAmount: { type: Number },
      },
    },

    // Consolidated prescription details as a single object
    prescriptionsDetails: {
      patientDetails: {
        name: { type: String },
        gender: { type: String },
        bloodGroup: { type: String },
      },
      prescriptionId: { type: String },
      prescribedBy: { type: String },
      doctorRegistrationNo: { type: String },
      specialization: { type: String },
      prescriptionDate: { type: Date },
      diagnosis: { type: String },
      medicines: [
        {
          name: { type: String },
          dosage: { type: String },
          frequency: { type: String },
          duration: { type: Number },
          durationUnit: { type: String, enum: ["days", "weeks", "months"] },
          timings: { type: String },
          specialInstructions: { type: String },
        },
      ],
      additionalInstructions: { type: String },
      followUpDate: { type: Date },
    },

    patientPersonalDetails: {
      fullName: { type: String },
      dateOfBirth: { type: Date },
      age: { type: Number },
      gender: { type: String, enum: ["Male", "Female", "Other"] },
      bloodGroup: { type: String },
      weight: { type: String },
      height: { type: String },
      contactNumber: { type: String },
      emergencyContact: {
        name: { type: String },
        relationship: { type: String },
        phone: { type: String },
      },
      aadharNumber: { type: String },
      panNumber: { type: String },
      address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        pincode: { type: String },
      },
      occupation: { type: String },
      maritalStatus: { type: String },
      allergies: [{ allergy: { type: String } }],
      familyMedicalHistory: [
        {
          relationWithHim: { type: String },
          medicalHistory: { type: String },
        },
      ],
      smokingAlcoholicFrequency: { type: String },
    },

    // Reorganized medical history with array for hospital-specific records
    medicalHistoryDetails: {
      patientDetails: {
        name: { type: String },
        gender: { type: String },
        bloodGroup: { type: String },
      },
      allergies: [{ allergy: { type: String } }],
      chronicConditions: [{ name: { type: String } }],
      majorInjuriesOrTrauma: [
        {
          nameOf: { type: String },
          dateOf: { type: Date },
          recoveryStatus: { type: String },
        },
      ],
      immunizationRecords: [
        {
          nameOf: { type: String },
          dateOf: { type: Date },
        },
      ],
      // Array to store different hospital records
      hospitalRecords: [
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
    },

    // Reorganized past medical checkups with array for different checkups
    pastMedicalCheckupsDetails: {
      patientDetails: {
        name: { type: String },
        gender: { type: String },
        bloodGroup: { type: String },
      },
      // Array to store different checkup records
      checkupRecords: [
        {
          checkupId: { type: String },
          checkupDate: { type: Date },
          checkupType: { type: String },
          symptoms: [{ name: { type: String } }],
          diagnosis: { type: String },
          doctorName: { type: String },
          doctorSpecialization: { type: String },
          hospitalName: { type: String },
          vitalSigns: {
            bloodPressure: { type: String },
            temperature: { type: Number },
            pulseRate: { type: Number },
            respiratoryRate: { type: Number },
            oxygenSaturation: { type: Number },
          },
          testsRecommended: [
            {
              testName: { type: String },
              reason: { type: String },
            },
          ],
          followUpDate: { type: Date },
          recommendations: { type: String },
        },
      ],
    },

    // Reorganized past medical records with array for different records
    pastMedicalRecordsDetails: {
      patientDetails: {
        name: { type: String },
        gender: { type: String },
        bloodGroup: { type: String },
      },
      // Array to store different medical records
      records: [
        {
          recordId: { type: String },
          recordDate: { type: Date },
          recordType: { type: String },
          hospitalOrLabName: { type: String },
          resultSummary: { type: String },
          testingFacility: { type: String },
          orderedBy: { type: String },
          normalRange: { type: String },
          observedValues: { type: String },
          interpretation: { type: String },
          criticalFindings: { type: Boolean },
          recommendedFollowUp: { type: String },
        },
      ],
    },

    // Consolidated regular medicines as a single object with array of medicines
    regularMedicinesDetails: {
      patientDetails: {
        name: { type: String },
        gender: { type: String },
        bloodGroup: { type: String },
      },
      medicines: [
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
    },

    operationDetails: {
      patientDetails: {
        name: { type: String },
        gender: { type: String },
        bloodGroup: { type: String },
      },
      surgeryName: { type: String },
      surgeryDate: { type: Date },
      surgeryType: { type: String },
      surgeonName: { type: String },
      surgeonSpecialization: { type: String },
      anesthesiologist: { type: String },
      assistingSurgeons: [{ name: { type: String } }],
      preOpDiagnosisDetails: { type: String },
      postOpDiagnosisDetails: { type: String },
      procedureDetails: { type: String },
      anesthesiaType: { type: String },
      operationDuration: { type: Number },
      complications: [{ name: { type: String } }],
      hospitalStayDuration: { type: Number },
      postOpCare: { type: String },
      recoveryNotes: { type: String },
      followUpInstructions: { type: String },
    },

    doctorsNoteDetails: {
      patientDetails: {
        name: { type: String },
        gender: { type: String },
        bloodGroup: { type: String },
      },
      notes: { type: String },
      assessment: { type: String },
      plan: { type: String },
      recommendations: { type: String },
      writtenBy: { type: String },
      designation: { type: String },
      department: { type: String },
      dateWritten: { type: Date },
    },

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// HospitalSubmittedDataSchema.plugin(AutoIncrement, {
//   inc_field: "policyNumber",
//   start_seq: 1000,
//   inc_amount: 1,
// });

module.exports = mongoose.model(
  "HospitalSubmittedData",
  HospitalSubmittedDataSchema
);
