const schemaTemplates = {
  policyDetailsTemplateSchema: {
    policyNumber : "1223",
    policyStartDate: "2023-10-15",
    policyEndDate: "2023-10-15",
    sumAssured: 10,
    premiumAmount: 10,
  },

  patientDetailsTemplateSchema: {
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

  billingDetailsTemplateSchema: {
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

  prescriptionsDetailsTemplateSchema: {
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

  medicalHistoryDetailsTemplateSchema: {
    patientDetails: {
      name: "Rajesh Kumar",
      gender: "Male",
      bloodGroup: "B+", // Fixed: String instead of empty object
    },
    allergies: [{ allergy: "Penicillin" }],
    chronicConditions: [{ name: "Type 2 Diabetes" }],
    majorInjuriesOrTrauma: [
      {
        nameOf: "Fractured left wrist",
        dateOf: new Date("2005-01-01"),
        recoveryStatus: "Fully recovered",
      },
    ],
    immunizationRecords: [{ nameOf: "BCG", dateOf: new Date("1971-03-15") }],
    hospitalRecords: [
      {
        disease: "Appendicitis",
        diagnosisDetails: "Acute appendicitis with severe abdominal pain",
        severity: "Severe", // Fixed: Using enum value
        treatment: {
          type: "Surgical",
          details: "Emergency appendectomy",
          duration: "3 days",
          outcome: "Complete recovery",
        },
        doctorName: "Dr. Anand Patel",
        doctorSpecialization: "General Surgeon",
        hospitalName: "Nanavati Hospital, Mumbai",
        hospitalId: "507f1f77bcf86cd799439011", // Example MongoDB ObjectId
        dateOfDiagnosis: new Date("1998-07-02"),
        dateOfRecovery: new Date("1998-07-05"),
        dateOfReport: new Date("1998-07-10"),
        followUpRequired: true,
        additionalNotes: "Patient responded well to antibiotics",
      },
    ],
  },

  pastMedicalCheckupsDetailsTemplateSchema: {
    patientDetails: {
      name: "John Doe",
      gender: "Male",
      bloodGroup: "O+",
    },
    checkupRecords: [
      {
        checkupId: "CHK001",
        checkupDate: new Date("2024-02-01"),
        checkupType: "Annual Physical",
        symptoms: ["Fatigue", "Mild Headache"],
        diagnosis: "Vitamin D Deficiency",
        doctorName: "Dr. Sarah Smith",
        doctorSpecialization: "General Physician",
        hospitalName: "City General Hospital",
        vitalSigns: {
          bloodPressure: "120/80",
          temperature: 98.6,
          pulseRate: 72,
          respiratoryRate: 16,
          oxygenSaturation: 98,
        },
        testsRecommended: [
          {
            testName: "Complete Blood Count",
            reason: "Routine screening",
          },
          {
            testName: "Vitamin D Level",
            reason: "Check deficiency",
          },
        ],
        followUpDate: new Date("2024-03-01"),
        recommendations:
          "Take Vitamin D supplements, increase sun exposure, maintain healthy diet",
      },
      {
        checkupId: "CHK002",
        checkupDate: new Date("2024-01-15"),
        checkupType: "Dental Checkup",
        symptoms: ["Tooth Sensitivity"],
        diagnosis: "Minor Cavity",
        doctorName: "Dr. Michael Brown",
        doctorSpecialization: "Dentist",
        hospitalName: "Dental Care Center",
        vitalSigns: {
          bloodPressure: "118/78",
          temperature: 98.4,
          pulseRate: 70,
          respiratoryRate: 15,
          oxygenSaturation: 99,
        },
        testsRecommended: [
          {
            testName: "Dental X-Ray",
            reason: "Cavity detection",
          },
        ],
        followUpDate: new Date("2024-02-15"),
        recommendations: "Regular flossing, use sensitive toothpaste",
      },
    ],
  },

  pastMedicalCheckupsDetailsTemplateSchema: {
    patientDetails: {
      name: "John Doe",
      gender: "Male",
      bloodGroup: "O+",
    },
    checkupRecords: [
      {
        checkupId: "CHK001",
        checkupDate: new Date("2024-02-01"),
        checkupType: "Annual Physical",
        symptoms: [{ name: "Fatigue" }, { name: "Mild Headache" }],
        diagnosis: "Vitamin D Deficiency",
        doctorName: "Dr. Sarah Smith",
        doctorSpecialization: "General Physician",
        hospitalName: "City General Hospital",
        vitalSigns: {
          bloodPressure: "120/80",
          temperature: 98.6,
          pulseRate: 72,
          respiratoryRate: 16,
          oxygenSaturation: 98,
        },
        testsRecommended: [
          {
            testName: "Complete Blood Count",
            reason: "Routine screening",
          },
          {
            testName: "Vitamin D Level",
            reason: "Check deficiency",
          },
        ],
        followUpDate: new Date("2024-03-01"),
        recommendations:
          "Take Vitamin D supplements, increase sun exposure, maintain healthy diet",
      },
    ],
  },

  pastMedicalRecordsDetailsTemplateSchema: {
    patientDetails: {
      name: "John Doe",
      gender: "Male",
      bloodGroup: "O+",
    },
    records: [
      {
        recordId: "REC001",
        recordDate: new Date("2024-02-01"),
        recordType: "Blood Test",
        hospitalOrLabName: "LifeCare Diagnostics",
        resultSummary: "Elevated blood glucose levels",
        testingFacility: "Main Laboratory",
        orderedBy: "Dr. Sarah Smith",
        normalRange: "Fasting Glucose: 70-100 mg/dL",
        observedValues: "Fasting Glucose: 126 mg/dL",
        interpretation: "Indicates pre-diabetic condition",
        criticalFindings: false,
        recommendedFollowUp:
          "Repeat test in 3 months, lifestyle modifications recommended",
      },
    ],
  },

  regularMedicinesDetailsTemplateSchema: {
    patientDetails: {
      name: "John Doe",
      gender: "Male",
      bloodGroup: "B+",
    },
    medicines: [
      {
        medicineName: "Metformin",
        genericName: "Metformin Hydrochloride",
        dosage: "500mg",
        frequency: 2,
        duration: "6 months",
        purpose: "Type 2 Diabetes Management",
        sideEffects: ["Nausea", "Diarrhea"],
        startDate: "2025-01-01T00:00:00.000Z",
        endDate: "2025-06-30T00:00:00.000Z",
        prescribedBy: "Dr. Sarah Smith",
        isActive: true,
        specialInstructions: "Take with meals",
        interactionWarnings: [
          "Avoid alcohol",
          "May interact with heart medications",
        ],
      },
    ],
  },

  operationDetailsTemplateSchema: {
    patientDetails: {
      name: "John Doe",
      gender: "Male",
      bloodGroup: "O+",
    },
    surgeryName: "Total Knee Replacement",
    surgeryDate: "2024-02-01",
    surgeryType: "Orthopedic",
    surgeonName: "Dr. Sarah Smith",
    surgeonSpecialization: "Orthopedic Surgery",
    anesthesiologist: "Dr. Michael Brown",
    assistingSurgeons: [{ name: "Dr. Emily Taylor" }],
    preOpDiagnosisDetails: "Severe osteoarthritis of right knee",
    postOpDiagnosisDetails: "Successful total knee replacement",
    procedureDetails:
      "Right total knee arthroplasty using posterior stabilized prosthesis",
    anesthesiaType: "General",
    operationDuration: 120,
    complications: [{ name: "Minor bleeding" }],
    hospitalStayDuration: 3,
    postOpCare: "Regular wound care and physical therapy",
    recoveryNotes: "Patient responding well to initial therapy",
    followUpInstructions: "Follow up in 2 weeks for staple removal",
  },

  doctorNotesDetailsTemplateSchema: {
    patientDetails: {
      name: "John Doe",
      gender: "Male",
      bloodGroup: "O+",
    },
    notes: "Patient presented with mild fever and fatigue.",
    assessment: "Possible viral infection.",
    plan: "Prescribe rest and hydration.",
    recommendations: "Follow up in 7 days if symptoms persist.",
    writtenBy: "Dr. Smith",
    designation: "General Physician",
    department: "Internal Medicine",
    dateWritten: "2023-10-15",
  },
};

module.exports = schemaTemplates;
