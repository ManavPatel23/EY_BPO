// risk (1-100)

let highlyriskupdates = {
  patientPersonalDetails: {
    fullName: "Rajesh Kumar",
    dateOfBirth: "1969-08-15",
    age: 54,
    gender: "Male",
    bloodGroup: "B+",
    weight: 78,
    height: "5ft 9in",
    contactNumber: "+9199887 77665",
    emergencyContact: {
      name: "Suresh Kumar",
      relationship: "Son",
      phone: "+91 9876543210",
    },
    aadharNumber: "123456789012",
    panNumber: "ABCDE1234F",
    address: {
      street: "12, SV Road",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      pincode: "",
    },
    occupation: "",
    maritalStatus: "",
    allergies: [
      {
        allergy: "Penicillin",
      },
      {
        allergy: "Pollen",
      },
    ],
    familyMedicalHistory: [
      {
        relationWithHim: "Father",
        medicalHistory: "Diabetes",
      },
      {
        relationWithHim: "Mother",
        medicalHistory: "Hypertension",
      },
    ],
    smokingAlcoholicFrequency: "Non-smoker, Occasional alcohol consumption",
  },
  billingDetails: {
    patientDetails: {
      name: "Rajesh Prasad",
    },
    billId: "INV9289",
    hospitalName: "Appolo Hospital",
    hospitalGSTIN: "",
    date: "2025-02-13",
    amount: 51650,
    description: "",
    itemizedCharges: [
      {
        serviceName: "Medicine Costs",
        quantity: null,
        unitPrice: null,
        totalPrice: 9200,
        category: null,
      },
      {
        serviceName: "Lab Tests (Blood Sugar, MRI)",
        quantity: null,
        unitPrice: null,
        totalPrice: 6800,
        category: null,
      },
      {
        serviceName: "Nursing Charges",
        quantity: 3,
        unitPrice: null,
        totalPrice: 3000,
        category: null,
      },
      {
        serviceName: "Other Medical Services",
        quantity: null,
        unitPrice: null,
        totalPrice: 2500,
        category: null,
      },
      {
        serviceName: "Room Charges (ICU Deluxe)",
        quantity: 3,
        unitPrice: null,
        totalPrice: 18000,
        category: null,
      },
      {
        serviceName: "Doctor Consultation Fees",
        quantity: 3,
        unitPrice: null,
        totalPrice: 4500,
        category: null,
      },
    ],
    taxes: {
      totalTax: 7650,
    },
    paymentMethod: "Online (UPI - Google Pay)",
    paymentStatus: "Pending",
    discountApplied: null,
    billGeneratedBy: "",
    totalBillingAmount: {
      subTotal: 22500,
      taxAmount: 7650,
      finalAmount: 51650,
    },
  },
  prescriptionsDetails: {
    patientDetails: {
      name: "Rajesh Prasad",
      gender: "Male",
      bloodGroup: "B+",
    },
    prescriptionId: "",
    prescribedBy: "Dr. Anil Mehta",
    doctorRegistrationNo: "DMC123456",
    specialization: "General Medicine",
    prescriptionDate: "2025-02-13",
    diagnosis: "Type 2 Diabetes, Hypertension",
    medicines: [
      {
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice Daily",
        duration: 30,
        durationUnit: "days",
        timings: null,
        specialInstructions: "For diabetes control",
      },
      {
        name: "Gliclazide",
        dosage: "80mg",
        frequency: "Once Daily",
        duration: 15,
        durationUnit: "days",
        timings: null,
        specialInstructions: "Monitor blood sugar levels",
      },
      {
        name: "Atorvastatin",
        dosage: "10mg",
        frequency: "Once at Night",
        duration: 30,
        durationUnit: "days",
        timings: null,
        specialInstructions: "For cholesterol management",
      },
      {
        name: "Vitamin B12",
        dosage: "1500mcg",
        frequency: "Once Daily",
        duration: 30,
        durationUnit: "days",
        timings: null,
        specialInstructions: "For nerve health",
      },
      {
        name: "Losartan",
        dosage: "50mg",
        frequency: "Once Daily",
        duration: 30,
        durationUnit: "days",
        timings: null,
        specialInstructions: "For blood pressure control",
      },
    ],
    additionalInstructions: "Maintain a low-carb, high-fiber diet.",
    followUpDate: "2025-03-15",
  },
  medicalHistoryDetails: {
    patientDetails: {
      name: "Rajesh Kumar",
      gender: "Male",
      bloodGroup: null,
    },
    allergies: [
      {
        allergy: "Penicillin",
      },
      {
        allergy: "Shellfish",
      },
      {
        allergy: "Dust Allergy",
      },
    ],
    chronicConditions: [
      {
        name: "Type 2 Diabetes",
      },
      {
        name: "Hypertension",
      },
      {
        name: "Hyperlipidemia",
      },
    ],
    majorInjuriesOrTrauma: [
      {
        nameOf: "Fractured left wrist",
        dateOf: "2005-01-01T00:00:00.000Z",
        recoveryStatus: "Fully recovered",
      },
      {
        nameOf: "Mild concussion",
        dateOf: "2010-01-01T00:00:00.000Z",
        recoveryStatus: "No long-term effects",
      },
    ],
    immunizationRecords: [
      {
        nameOf: "BCG",
        dateOf: "1971-03-15T00:00:00.000Z",
      },
      {
        nameOf: "Polio",
        dateOf: "1973-06-05T00:00:00.000Z",
      },
      {
        nameOf: "Hepatitis B",
        dateOf: "1995-11-12T00:00:00.000Z",
      },
      {
        nameOf: "COVID-19 (Covaxin)",
        dateOf: "2021-04-20T00:00:00.000Z",
      },
    ],
    hospitalRecords: [
      {
        disease: "Appendicitis",
        diagnosisDetails: "Acute appendicitis with severe abdominal pain",
        severity: "Severe",
        treatment: {
          type: "Surgical",
          details: "Emergency appendectomy",
          duration: "3 days",
          outcome: "Complete recovery",
        },
        doctorName: "Dr. Anand Patel",
        doctorSpecialization: null,
        hospitalName: null,
        hospitalId: null,
        dateOfDiagnosis: "1998-07-02T00:00:00.000Z",
        dateOfRecovery: "1998-07-05T00:00:00.000Z",
        dateOfReport: null,
        followUpRequired: null,
        additionalNotes: null,
      },
      {
        disease: "Kidney Stone",
        diagnosisDetails: null,
        severity: null,
        treatment: {
          type: null,
          details: null,
          duration: null,
          outcome: "No recurrence",
        },
        doctorName: "Dr. Manish Iyer",
        doctorSpecialization: null,
        hospitalName: null,
        hospitalId: null,
        dateOfDiagnosis: "2012-03-15T00:00:00.000Z",
        dateOfRecovery: null,
        dateOfReport: null,
        followUpRequired: null,
        additionalNotes: null,
      },
      {
        disease: "Kidney Stone",
        diagnosisDetails: null,
        severity: null,
        treatment: {
          type: "Surgical removal (Lithotripsy)",
          details: null,
          duration: "1 month",
          outcome: "Fully recovered",
        },
        doctorName: "Dr. Manish Iyer",
        doctorSpecialization: null,
        hospitalName: null,
        hospitalId: null,
        dateOfDiagnosis: "2012-03-10T00:00:00.000Z",
        dateOfRecovery: null,
        dateOfReport: null,
        followUpRequired: null,
        additionalNotes: null,
      },
      {
        disease: "Type 2 Diabetes",
        diagnosisDetails: null,
        severity: null,
        treatment: {
          type: "Lifestyle modification, Metformin 500mg",
          details: null,
          duration: "Ongoing",
          outcome: "Managed with medication",
        },
        doctorName: "Dr. Sameer Joshi",
        doctorSpecialization: null,
        hospitalName: null,
        hospitalId: null,
        dateOfDiagnosis: "2015-06-15T00:00:00.000Z",
        dateOfRecovery: null,
        dateOfReport: null,
        followUpRequired: null,
        additionalNotes: null,
      },
      {
        disease: "Hypertension",
        diagnosisDetails: null,
        severity: null,
        treatment: {
          type: "Losartan 50mg, Exercise recommendation",
          details: null,
          duration: "Ongoing",
          outcome: "Stable with treatment",
        },
        doctorName: "Dr. Priya Nair",
        doctorSpecialization: null,
        hospitalName: null,
        hospitalId: null,
        dateOfDiagnosis: "2018-09-20T00:00:00.000Z",
        dateOfRecovery: null,
        dateOfReport: null,
        followUpRequired: null,
        additionalNotes: null,
      },
    ],
  },
  pastMedicalCheckupsDetails: {
    patientDetails: {
      name: "Amit Sharma",
      gender: "Male",
      bloodGroup: "AB+",
    },
    checkupRecords: [
      {
        checkupId: "CHK2024-05-10Dr. Fraud",
        checkupDate: "2024-05-10T00:00:00.000Z",
        checkupType: "Critical Checkup",
        symptoms: [{ name: "Severe Pain" }, { name: "Paralysis" }],
        diagnosis: "Stage 4 Cancer (Tampered)",
        doctorName: "Dr. Fraud",
        doctorSpecialization: "Oncologist",
        hospitalName: "Fake Cancer Institute",
        vitalSigns: {
          bloodPressure: "180/120",
          temperature: 103.2,
          pulseRate: 130,
          respiratoryRate: 40,
          oxygenSaturation: 60,
        },
        testsRecommended: [
          {
            testName: "Bone Marrow Test",
            reason: "Suspicion of Leukemia",
          },
        ],
        followUpDate: "2024-06-15T00:00:00.000Z",
        recommendations: "Emergency Surgery (Fake Recommendation)",
      },
    ],
  },
  pastMedicalRecordsDetails: {
    records: [
      {
        recordId: "FAKE-NRD-5678",
        recordDate: "2023-11-20T00:00:00.000Z",
        recordType: "DNA Analysis",
        hospitalOrLabName: "Unverified Lab",
        resultSummary: "High Risk Genetic Disorder (Fake)",
        interpretation: "Severe Neurological Damage (Tampered)",
        criticalFindings: true,
        recommendedFollowUp: "Urgent hospitalization",
      },
    ],
  },
  operationDetails: {
    surgeryName: "Full-Body Transplant (Fake Surgery)",
    surgeryDate: "2025-03-20T00:00:00.000Z",
    surgeryType: "Experimental",
    surgeonName: "Dr. Unknown",
    surgeonSpecialization: "Neurosurgeon",
    anesthesiologist: "Dr. Fake",
    assistingSurgeons: [{ name: "Dr. Scam" }, { name: "Dr. Con" }],
    preOpDiagnosisDetails: "Complete Organ Failure (Tampered Data)",
    postOpDiagnosisDetails: "Successful Organ Regeneration (Fake)",
    anesthesiaType: "None",
    operationDuration: 500,
    complications: [{ name: "None (Unrealistic)" }],
    hospitalStayDuration: 1,
    postOpCare: "No care required (Fake Data)",
    followUpInstructions: "None",
  },
  doctorsNoteDetails: {
    notes:
      "Patient has undergone full-body transplant. No complications expected.",
    assessment: "New body integration is stable.",
    plan: "Monitor basic vitals (Fake).",
    recommendations: "None required.",
    writtenBy: "Dr. Fraud",
    designation: "Fake MD",
    dateWritten: "2025-03-21T00:00:00.000Z",
  },
  regularMedicinesDetails: {
    patientDetails: {
      name: "Rajesh Kumar",
      gender: "Male",
      bloodGroup: null,
    },
    medicines: [
      {
        medicineName: "Metformin",
        genericName: null,
        dosage: "500mg",
        frequency: 2,
        duration: "Lifelong",
        purpose: null,
        sideEffects: [],
        startDate: "2020-01-01T00:00:00.000Z",
        endDate: null,
        prescribedBy: "Dr. Anil Mehta",
        isActive: true,
        specialInstructions: "Take with food",
        interactionWarnings: [],
      },
      {
        medicineName: "Amlodipine",
        genericName: null,
        dosage: "5mg",
        frequency: 1,
        duration: "Long-term",
        purpose: null,
        sideEffects: [],
        startDate: "2022-03-15T00:00:00.000Z",
        endDate: null,
        prescribedBy: "Dr. Priya Sharma",
        isActive: true,
        specialInstructions: "Take in morning",
        interactionWarnings: [],
      },
      {
        medicineName: "Atorvastatin",
        genericName: null,
        dosage: "20mg",
        frequency: 1,
        duration: "Long-term",
        purpose: null,
        sideEffects: [],
        startDate: "2021-12-10T00:00:00.000Z",
        endDate: null,
        prescribedBy: "Dr. Ramesh Iyer",
        isActive: true,
        specialInstructions: "Take at night",
        interactionWarnings: [],
      },
      {
        medicineName: "Insulin (Glargine)",
        genericName: null,
        dosage: "10 units",
        frequency: 1,
        duration: "Long-term",
        purpose: null,
        sideEffects: [],
        startDate: "2023-07-05T00:00:00.000Z",
        endDate: null,
        prescribedBy: "Dr. Anil Mehta",
        isActive: true,
        specialInstructions: "Inject in abdomen",
        interactionWarnings: [],
      },
      {
        medicineName: "Vitamin D3",
        genericName: null,
        dosage: "60000 IU",
        frequency: 1,
        duration: "3 months",
        purpose: null,
        sideEffects: [],
        startDate: "2024-11-20T00:00:00.000Z",
        endDate: null,
        prescribedBy: "Dr. Priya Sharma",
        isActive: true,
        specialInstructions: "Take with milk",
        interactionWarnings: [],
      },
    ],
  },
  policyDetails: {
    policyStartDate: "2023-01-01T00:00:00.000Z",
    policyEndDate: "2028-12-31T00:00:00.000Z",
    sumAssured: 1500000,
    premiumAmount: 25000,
  },
};

let moderateupdates = {
  patientPersonalDetails: {
    fullName: "Rajesh Kumar",
    dateOfBirth: "1969-08-15",
    age: 54,
    gender: "Male",
    bloodGroup: "B+",
    weight: 78,
    height: "5ft 9in",
    contactNumber: "+9199887 77665",
    emergencyContact: {
      name: "Suresh Kumar",
      relationship: "Son",
      phone: "+91 9876543210",
    },
    aadharNumber: "123456789012",
    panNumber: "ABCDE1234F",
    address: {
      street: "12, SV Road",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      pincode: "",
    },
    occupation: "",
    maritalStatus: "",
    allergies: [
      {
        allergy: "Penicillin",
      },
      {
        allergy: "Pollen",
      },
    ],
    familyMedicalHistory: [
      {
        relationWithHim: "Father",
        medicalHistory: "Diabetes",
      },
      {
        relationWithHim: "Mother",
        medicalHistory: "Hypertension",
      },
    ],
    smokingAlcoholicFrequency: "Non-smoker, Occasional alcohol consumption",
  },
  billingDetails: {
    patientDetails: {
      name: "Rajesh Prasad",
    },
    billId: "INV9289",
    hospitalName: "Appolo Hospital",
    hospitalGSTIN: "",
    date: "2025-02-13",
    amount: 51650,
    description: "",
    itemizedCharges: [
      {
        serviceName: "Medicine Costs",
        quantity: null,
        unitPrice: null,
        totalPrice: 9200,
        category: null,
      },
      {
        serviceName: "Lab Tests (Blood Sugar, MRI)",
        quantity: null,
        unitPrice: null,
        totalPrice: 6800,
        category: null,
      },
      {
        serviceName: "Nursing Charges",
        quantity: 3,
        unitPrice: null,
        totalPrice: 3000,
        category: null,
      },
      {
        serviceName: "Other Medical Services",
        quantity: null,
        unitPrice: null,
        totalPrice: 2500,
        category: null,
      },
      {
        serviceName: "Room Charges (ICU Deluxe)",
        quantity: 3,
        unitPrice: null,
        totalPrice: 18000,
        category: null,
      },
      {
        serviceName: "Doctor Consultation Fees",
        quantity: 3,
        unitPrice: null,
        totalPrice: 4500,
        category: null,
      },
    ],
    taxes: {
      totalTax: 7650,
    },
    paymentMethod: "Online (UPI - Google Pay)",
    paymentStatus: "Pending",
    discountApplied: null,
    billGeneratedBy: "",
    totalBillingAmount: {
      subTotal: 22500,
      taxAmount: 7650,
      finalAmount: 51650,
    },
  },
  prescriptionsDetails: {
    patientDetails: {
      name: "Rajesh Prasad",
      gender: "Male",
      bloodGroup: "B+",
    },
    prescriptionId: "",
    prescribedBy: "Dr. Anil Mehta",
    doctorRegistrationNo: "DMC123456",
    specialization: "General Medicine",
    prescriptionDate: "2025-02-13",
    diagnosis: "Type 2 Diabetes, Hypertension",
    medicines: [
      {
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice Daily",
        duration: 30,
        durationUnit: "days",
        timings: null,
        specialInstructions: "For diabetes control",
      },
      {
        name: "Gliclazide",
        dosage: "80mg",
        frequency: "Once Daily",
        duration: 15,
        durationUnit: "days",
        timings: null,
        specialInstructions: "Monitor blood sugar levels",
      },
      {
        name: "Atorvastatin",
        dosage: "10mg",
        frequency: "Once at Night",
        duration: 30,
        durationUnit: "days",
        timings: null,
        specialInstructions: "For cholesterol management",
      },
      {
        name: "Vitamin B12",
        dosage: "1500mcg",
        frequency: "Once Daily",
        duration: 30,
        durationUnit: "days",
        timings: null,
        specialInstructions: "For nerve health",
      },
      {
        name: "Losartan",
        dosage: "50mg",
        frequency: "Once Daily",
        duration: 30,
        durationUnit: "days",
        timings: null,
        specialInstructions: "For blood pressure control",
      },
    ],
    additionalInstructions: "Maintain a low-carb, high-fiber diet.",
    followUpDate: "2025-03-15",
  },
  medicalHistoryDetails: {
    patientDetails: {
      name: "Rajesh Kumar",
      gender: "Male",
      bloodGroup: null,
    },
    allergies: [
      {
        allergy: "Penicillin",
      },
      {
        allergy: "Shellfish",
      },
      {
        allergy: "Dust Allergy",
      },
    ],
    chronicConditions: [
      {
        name: "Type 2 Diabetes",
      },
      {
        name: "Hypertension",
      },
      {
        name: "Hyperlipidemia",
      },
    ],
    majorInjuriesOrTrauma: [
      {
        nameOf: "Fractured left wrist",
        dateOf: "2005-01-01T00:00:00.000Z",
        recoveryStatus: "Fully recovered",
      },
      {
        nameOf: "Mild concussion",
        dateOf: "2010-01-01T00:00:00.000Z",
        recoveryStatus: "No long-term effects",
      },
    ],
    immunizationRecords: [
      {
        nameOf: "BCG",
        dateOf: "1971-03-15T00:00:00.000Z",
      },
      {
        nameOf: "Polio",
        dateOf: "1973-06-05T00:00:00.000Z",
      },
      {
        nameOf: "Hepatitis B",
        dateOf: "1995-11-12T00:00:00.000Z",
      },
      {
        nameOf: "COVID-19 (Covaxin)",
        dateOf: "2021-04-20T00:00:00.000Z",
      },
    ],
    hospitalRecords: [
      {
        disease: "Appendicitis",
        diagnosisDetails: "Acute appendicitis with severe abdominal pain",
        severity: "Severe",
        treatment: {
          type: "Surgical",
          details: "Emergency appendectomy",
          duration: "3 days",
          outcome: "Complete recovery",
        },
        doctorName: "Dr. Anand Patel",
        doctorSpecialization: null,
        hospitalName: null,
        hospitalId: null,
        dateOfDiagnosis: "1998-07-02T00:00:00.000Z",
        dateOfRecovery: "1998-07-05T00:00:00.000Z",
        dateOfReport: null,
        followUpRequired: null,
        additionalNotes: null,
      },
      {
        disease: "Kidney Stone",
        diagnosisDetails: null,
        severity: null,
        treatment: {
          type: null,
          details: null,
          duration: null,
          outcome: "No recurrence",
        },
        doctorName: "Dr. Manish Iyer",
        doctorSpecialization: null,
        hospitalName: null,
        hospitalId: null,
        dateOfDiagnosis: "2012-03-15T00:00:00.000Z",
        dateOfRecovery: null,
        dateOfReport: null,
        followUpRequired: null,
        additionalNotes: null,
      },
      {
        disease: "Kidney Stone",
        diagnosisDetails: null,
        severity: null,
        treatment: {
          type: "Surgical removal (Lithotripsy)",
          details: null,
          duration: "1 month",
          outcome: "Fully recovered",
        },
        doctorName: "Dr. Manish Iyer",
        doctorSpecialization: null,
        hospitalName: null,
        hospitalId: null,
        dateOfDiagnosis: "2012-03-10T00:00:00.000Z",
        dateOfRecovery: null,
        dateOfReport: null,
        followUpRequired: null,
        additionalNotes: null,
      },
      {
        disease: "Type 2 Diabetes",
        diagnosisDetails: null,
        severity: null,
        treatment: {
          type: "Lifestyle modification, Metformin 500mg",
          details: null,
          duration: "Ongoing",
          outcome: "Managed with medication",
        },
        doctorName: "Dr. Sameer Joshi",
        doctorSpecialization: null,
        hospitalName: null,
        hospitalId: null,
        dateOfDiagnosis: "2015-06-15T00:00:00.000Z",
        dateOfRecovery: null,
        dateOfReport: null,
        followUpRequired: null,
        additionalNotes: null,
      },
      {
        disease: "Hypertension",
        diagnosisDetails: null,
        severity: null,
        treatment: {
          type: "Losartan 50mg, Exercise recommendation",
          details: null,
          duration: "Ongoing",
          outcome: "Stable with treatment",
        },
        doctorName: "Dr. Priya Nair",
        doctorSpecialization: null,
        hospitalName: null,
        hospitalId: null,
        dateOfDiagnosis: "2018-09-20T00:00:00.000Z",
        dateOfRecovery: null,
        dateOfReport: null,
        followUpRequired: null,
        additionalNotes: null,
      },
    ],
  },
  pastMedicalCheckupsDetails: {
    patientDetails: {
      name: "Rohan Verma",
      gender: "Male",
      bloodGroup: "B+",
    },
    checkupRecords: [
      {
        checkupId: "CHK2024-04-02Dr. Mehta",
        checkupDate: "2024-04-02T00:00:00.000Z",
        checkupType: "Cardiac Evaluation",
        symptoms: [{ name: "Chest Pain" }, { name: "Shortness of Breath" }],
        diagnosis: "Mild Coronary Artery Disease",
        doctorName: "Dr. Mehta",
        doctorSpecialization: "Cardiologist",
        hospitalName: "Metro Heart Hospital",
        vitalSigns: {
          bloodPressure: "145/90",
          temperature: 98.6,
          pulseRate: 95,
          respiratoryRate: 18,
          oxygenSaturation: 98,
        },
        testsRecommended: [
          {
            testName: "ECG",
            reason: "Irregular heartbeats observed",
          },
        ],
        followUpDate: "2024-04-10T00:00:00.000Z",
        recommendations: "Lifestyle changes and further tests.",
      },
    ],
  },
  pastMedicalRecordsDetails: {
    records: [
      {
        recordId: "MRD-9856",
        recordDate: "2023-12-15T00:00:00.000Z",
        recordType: "Echocardiogram",
        hospitalOrLabName: "Metro Heart Hospital",
        resultSummary: "Mild heart valve leakage",
        interpretation: "No immediate intervention needed",
        criticalFindings: false,
        recommendedFollowUp: "Regular monitoring every 6 months",
      },
    ],
  },
  operationDetails: {
    surgeryName: "Heart Bypass Surgery",
    surgeryDate: "2024-07-05T00:00:00.000Z",
    surgeryType: "Cardiac",
    surgeonName: "Dr. Gupta",
    surgeonSpecialization: "Cardiothoracic Surgeon",
    anesthesiologist: "Dr. Rao",
    assistingSurgeons: [{ name: "Dr. Mehta" }],
    preOpDiagnosisDetails: "70% blockage in left coronary artery.",
    postOpDiagnosisDetails: "Successful bypass with normal heart function.",
    anesthesiaType: "General Anesthesia",
    operationDuration: 4,
    complications: [{ name: "Minor swelling" }],
    hospitalStayDuration: 5,
    postOpCare: "Physiotherapy recommended.",
    followUpInstructions: "Routine checkup after 1 month.",
  },
  doctorsNoteDetails: {
    notes: "Patient recovering well from bypass surgery.",
    assessment: "Stable condition, no complications observed.",
    plan: "Regular follow-up visits required.",
    recommendations: "Avoid heavy lifting for 3 months.",
    writtenBy: "Dr. Gupta",
    designation: "Cardiothoracic Surgeon",
    dateWritten: "2024-07-10T00:00:00.000Z",
  },
  regularMedicinesDetails: {
    patientDetails: {
      name: "Rajesh Kumar",
      gender: "Male",
      bloodGroup: null,
    },
    medicines: [
      {
        medicineName: "Metformin",
        genericName: null,
        dosage: "500mg",
        frequency: 2,
        duration: "Lifelong",
        purpose: null,
        sideEffects: [],
        startDate: "2020-01-01T00:00:00.000Z",
        endDate: null,
        prescribedBy: "Dr. Anil Mehta",
        isActive: true,
        specialInstructions: "Take with food",
        interactionWarnings: [],
      },
      {
        medicineName: "Amlodipine",
        genericName: null,
        dosage: "5mg",
        frequency: 1,
        duration: "Long-term",
        purpose: null,
        sideEffects: [],
        startDate: "2022-03-15T00:00:00.000Z",
        endDate: null,
        prescribedBy: "Dr. Priya Sharma",
        isActive: true,
        specialInstructions: "Take in morning",
        interactionWarnings: [],
      },
      {
        medicineName: "Atorvastatin",
        genericName: null,
        dosage: "20mg",
        frequency: 1,
        duration: "Long-term",
        purpose: null,
        sideEffects: [],
        startDate: "2021-12-10T00:00:00.000Z",
        endDate: null,
        prescribedBy: "Dr. Ramesh Iyer",
        isActive: true,
        specialInstructions: "Take at night",
        interactionWarnings: [],
      },
      {
        medicineName: "Insulin (Glargine)",
        genericName: null,
        dosage: "10 units",
        frequency: 1,
        duration: "Long-term",
        purpose: null,
        sideEffects: [],
        startDate: "2023-07-05T00:00:00.000Z",
        endDate: null,
        prescribedBy: "Dr. Anil Mehta",
        isActive: true,
        specialInstructions: "Inject in abdomen",
        interactionWarnings: [],
      },
      {
        medicineName: "Vitamin D3",
        genericName: null,
        dosage: "60000 IU",
        frequency: 1,
        duration: "3 months",
        purpose: null,
        sideEffects: [],
        startDate: "2024-11-20T00:00:00.000Z",
        endDate: null,
        prescribedBy: "Dr. Priya Sharma",
        isActive: true,
        specialInstructions: "Take with milk",
        interactionWarnings: [],
      },
    ],
  },
  policyDetails: {
    policyStartDate: "2023-01-01T00:00:00.000Z",
    policyEndDate: "2028-12-31T00:00:00.000Z",
    sumAssured: 1500000,
    premiumAmount: 25000,
  },
};

let legimateCase = {
  patientPersonalDetails: {
    fullName: "Rahul Mehta",
    dateOfBirth: "1969-08-15",
    age: 54,
    gender: "Male",
    bloodGroup: "O+",
    weight: 78,
    height: "5ft 9in",
    contactNumber: "+9199887 77665",
    emergencyContact: {
      name: "Suresh Mehta",
      relationship: "Son",
      phone: "+91 9876543210",
    },
    aadharNumber: "123456789012",
    panNumber: "ABCDE1234F",
    address: {
      street: "12, SV Road",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      pincode: "",
    },
    occupation: "",
    maritalStatus: "",
    allergies: [
      {
        allergy: "Penicillin",
      },
      {
        allergy: "Pollen",
      },
    ],
    familyMedicalHistory: [
      {
        relationWithHim: "Father",
        medicalHistory: "Diabetes",
      },
      {
        relationWithHim: "Mother",
        medicalHistory: "Hypertension",
      },
    ],
    smokingAlcoholicFrequency: "Non-smoker, Occasional alcohol consumption",
  },
  billingDetails: {
    patientDetails: {
      name: "Rahul Mehta",
    },
    billId: "INV9289",
    hospitalName: "Max Super Speciality Hospital",
    hospitalGSTIN: "",
    date: "2023-07-02",
    amount: 51650,
    description: "",
    itemizedCharges: [
      {
        serviceName: "Medicine Costs",
        quantity: null,
        unitPrice: null,
        totalPrice: 9200,
        category: null,
      },
      {
        serviceName: "Lab Tests (Blood Tests, Ultrasound)",
        quantity: null,
        unitPrice: null,
        totalPrice: 6800,
        category: null,
      },
      {
        serviceName: "Nursing Charges",
        quantity: 3,
        unitPrice: null,
        totalPrice: 3000,
        category: null,
      },
      {
        serviceName: "Other Medical Services",
        quantity: null,
        unitPrice: null,
        totalPrice: 2500,
        category: null,
      },
      {
        serviceName: "Room Charges (Private)",
        quantity: 3,
        unitPrice: null,
        totalPrice: 18000,
        category: null,
      },
      {
        serviceName: "Doctor Consultation Fees",
        quantity: 3,
        unitPrice: null,
        totalPrice: 4500,
        category: null,
      },
    ],
    taxes: {
      totalTax: 7650,
    },
    paymentMethod: "Online (UPI - Google Pay)",
    paymentStatus: "Paid",
    discountApplied: null,
    billGeneratedBy: "",
    totalBillingAmount: {
      subTotal: 22500,
      taxAmount: 7650,
      finalAmount: 51650,
    },
  },
  prescriptionsDetails: {
    patientDetails: {
      name: "Rahul Mehta",
      gender: "Male",
      bloodGroup: "O+",
    },
    prescriptionId: "",
    prescribedBy: "Dr. Sandeep Malhotra",
    doctorRegistrationNo: "DMC123456",
    specialization: "General Surgeon",
    prescriptionDate: "2023-07-02",
    diagnosis: "Post-operative care - Laparoscopic Appendectomy",
    medicines: [
      {
        name: "Amoxicillin",
        dosage: "500mg",
        frequency: "Thrice Daily",
        duration: 7,
        durationUnit: "days",
        timings: null,
        specialInstructions: "Take with food",
      },
      {
        name: "Paracetamol",
        dosage: "650mg",
        frequency: "As needed",
        duration: 5,
        durationUnit: "days",
        timings: null,
        specialInstructions: "Take for pain relief",
      },
    ],
    additionalInstructions:
      "Keep surgical site clean and dry. No heavy lifting for 2 weeks.",
    followUpDate: "2023-07-10",
  },
  medicalHistoryDetails: {
    patientDetails: {
      name: "Rahul Mehta",
      gender: "Male",
      bloodGroup: "O+",
    },
    allergies: [
      {
        allergy: "Penicillin",
      },
    ],
    chronicConditions: [],
    majorInjuriesOrTrauma: [
      {
        nameOf: "Fractured right ankle",
        dateOf: "2015-03-15T00:00:00.000Z",
        recoveryStatus: "Fully recovered",
      },
    ],
    immunizationRecords: [
      {
        nameOf: "BCG",
        dateOf: "1969-09-15T00:00:00.000Z",
      },
      {
        nameOf: "Polio",
        dateOf: "1969-12-05T00:00:00.000Z",
      },
      {
        nameOf: "Hepatitis B",
        dateOf: "1995-11-12T00:00:00.000Z",
      },
      {
        nameOf: "COVID-19 (Covaxin)",
        dateOf: "2021-04-20T00:00:00.000Z",
      },
    ],
    hospitalRecords: [
      {
        disease: "Appendicitis",
        diagnosisDetails: "Acute appendicitis requiring emergency surgery",
        severity: "Severe",
        treatment: {
          type: "Surgical",
          details: "Laparoscopic appendectomy",
          duration: "3 days hospitalization",
          outcome: "Complete recovery",
        },
        doctorName: "Dr. Sandeep Malhotra",
        doctorSpecialization: "General Surgeon",
        hospitalName: "Max Super Speciality Hospital",
        hospitalId: null,
        dateOfDiagnosis: "2023-06-30T00:00:00.000Z",
        dateOfRecovery: "2023-07-10T00:00:00.000Z",
        dateOfReport: null,
        followUpRequired: true,
        additionalNotes: null,
      },
    ],
  },
  pastMedicalCheckupsDetails: {
    patientDetails: {
      name: "Rahul Mehta",
      gender: "Male",
      bloodGroup: "O+",
    },
    checkupRecords: [
      {
        checkupId: "CHK2023-06-30",
        checkupDate: "2023-06-30T00:00:00.000Z",
        checkupType: "Emergency Consultation",
        symptoms: [
          { name: "Severe abdominal pain" },
          { name: "Nausea" },
          { name: "Loss of appetite" },
          { name: "Mild fever" },
        ],
        diagnosis: "Acute Appendicitis suspected",
        doctorName: "Dr. Neeraj Kapoor",
        doctorSpecialization: "General Physician",
        hospitalName: "Max Super Speciality Hospital, Mumbai",
        vitalSigns: {
          bloodPressure: "118/78",
          temperature: 100.2,
          pulseRate: 85,
          respiratoryRate: 18,
          oxygenSaturation: 97,
        },
        testsRecommended: [
          {
            testName: "Abdominal Ultrasound",
            reason: "To confirm appendicitis",
          },
          {
            testName: "Complete Blood Count (CBC)",
            reason: "To check for infection",
          },
        ],
        followUpDate: "2023-07-02T00:00:00.000Z",
        recommendations: "Urgent surgery if test results confirm appendicitis",
      },
      {
        checkupId: "CHK2023-07-01",
        checkupDate: "2023-07-01T00:00:00.000Z",
        checkupType: "Pre-Surgical Checkup",
        symptoms: [{ name: "Severe lower right abdominal pain" }],
        diagnosis: "Confirmed Acute Appendicitis",
        doctorName: "Dr. Anil Chaturvedi",
        doctorSpecialization: "Gastroenterologist",
        hospitalName: "Max Super Speciality Hospital, Mumbai",
        vitalSigns: {
          bloodPressure: "120/80",
          temperature: 101.1,
          pulseRate: 90,
          respiratoryRate: 20,
          oxygenSaturation: 97,
        },
        testsRecommended: [],
        followUpDate: "2023-07-12T00:00:00.000Z",
        recommendations:
          "Proceed with laparoscopic appendectomy within 24 hours",
      },
    ],
  },
  pastMedicalRecordsDetails: {
    patientDetails: {
      name: "Rahul Mehta",
      gender: "Male",
      bloodGroup: "O+",
    },
    records: [
      {
        recordId: "MRD-9023",
        recordDate: "2023-06-30T00:00:00.000Z",
        recordType: "Abdominal Ultrasound",
        hospitalOrLabName: "Max Diagnostic Centre",
        resultSummary: "Inflamed appendix detected",
        interpretation: "Findings are consistent with acute appendicitis.",
        criticalFindings: true,
        recommendedFollowUp: "Immediate surgical consultation",
      },
      {
        recordId: "MRD-9024",
        recordDate: "2023-06-30T00:00:00.000Z",
        recordType: "Complete Blood Count (CBC)",
        hospitalOrLabName: "Max Pathology Lab",
        resultSummary: "Elevated WBC count (13,500/mm³)",
        interpretation:
          "Possible bacterial infection, likely due to appendicitis.",
        criticalFindings: true,
        recommendedFollowUp: "Emergency surgical review",
      },
      {
        recordId: "MRD-9035",
        recordDate: "2023-07-10T00:00:00.000Z",
        recordType: "Post-Surgical Follow-up Checkup",
        hospitalOrLabName: "Max Super Speciality Hospital",
        resultSummary: "No complications, healing as expected.",
        interpretation:
          "Surgical wound healing properly, no signs of infection.",
        criticalFindings: false,
        recommendedFollowUp: "Routine checkup after 1 month",
      },
    ],
  },
  operationDetails: {
    patientDetails: {
      name: "Rahul Mehta",
      gender: "Male",
      bloodGroup: "O+",
    },
    surgeryName: "Laparoscopic Appendectomy",
    surgeryDate: "2023-07-02T00:00:00.000Z",
    surgeryType: "Minimally Invasive",
    surgeonName: "Dr. Sandeep Malhotra",
    surgeonSpecialization: "General Surgeon",
    anesthesiologist: "Dr. Pooja Desai",
    assistingSurgeons: [
      { name: "Dr. Aakash Patel" },
      { name: "Dr. Varun Khanna" },
    ],
    preOpDiagnosisDetails:
      "Acute Appendicitis confirmed via ultrasound and CBC",
    postOpDiagnosisDetails:
      "Appendix successfully removed with no complications",
    anesthesiaType: "General Anesthesia",
    operationDuration: 75,
    complications: [],
    hospitalStayDuration: 3,
    postOpCare:
      "No heavy lifting for 2 weeks, antibiotics prescribed to prevent infection.",
    followUpInstructions: "Next checkup scheduled for July 10, 2023",
  },
  doctorsNoteDetails: {
    patientDetails: {
      name: "Rahul Mehta",
      gender: "Male",
      bloodGroup: "O+",
    },
    notes:
      "Patient underwent laparoscopic appendectomy with no complications. Recovery has been smooth.",
    assessment: "Surgical site healing as expected, no signs of infection.",
    plan: "Continue antibiotics for 7 days, avoid strenuous activity.",
    recommendations:
      "Return for a follow-up in 1 month. Resume normal diet gradually.",
    writtenBy: "Dr. Sandeep Malhotra",
    designation: "Senior General Surgeon",
    dateWritten: "2023-07-10T00:00:00.000Z",
  },
  regularMedicinesDetails: {
    patientDetails: {
      name: "Rahul Mehta",
      gender: "Male",
      bloodGroup: "O+",
    },
    medicines: [
      {
        medicineName: "Amoxicillin",
        genericName: null,
        dosage: "500mg",
        frequency: 3,
        duration: "7 days",
        purpose: "Post-surgical antibiotic",
        sideEffects: [],
        startDate: "2023-07-02T00:00:00.000Z",
        endDate: "2023-07-09T00:00:00.000Z",
        prescribedBy: "Dr. Sandeep Malhotra",
        isActive: true,
        specialInstructions: "Take with food",
        interactionWarnings: [],
      },
      {
        medicineName: "Paracetamol",
        genericName: null,
        dosage: "650mg",
        frequency: 3,
        duration: "5 days",
        purpose: "Pain relief",
        sideEffects: [],
        startDate: "2023-07-02T00:00:00.000Z",
        endDate: "2023-07-07T00:00:00.000Z",
        prescribedBy: "Dr. Sandeep Malhotra",
        isActive: true,
        specialInstructions: "Take as needed for pain",
        interactionWarnings: [],
      },
    ],
  },
  policyDetails: {
    policyStartDate: "2023-01-01T00:00:00.000Z",
    policyEndDate: "2028-12-31T00:00:00.000Z",
    sumAssured: 1500000,
    premiumAmount: 25000,
  },
};

if (change.operationType === "insert") {
  const doc = change.fullDocument;
  let updates = {};

  // Process patient details if present
  if (doc.patientDetailsDocuments?.length > 0) {
    // Get JSON response from processDocuments
    const patientDetailsJson = await this.processDocuments(
      doc.patientDetailsDocuments,
      "PatientDetails",
      patientDetailsTemplate,
      patientDetailsTemplateSchema,
      dataMergers.mergePatientDetails
    );

    // Convert to JSON if it isn't already
    updates = {
      ...updates, // Preserve any existing data
      patientPersonalDetails: JSON.parse(JSON.stringify(patientDetailsJson)),
    };

    console.log("UPDATE SUCCESSFUL For Patient Personal Details\n");
  }
  if (doc.billsDocuments?.length > 0) {
    const billingJson = await this.processDocuments(
      doc.billsDocuments,
      "BillingDetails",
      billingDetailsTemplate,
      billingDetailsTemplateSchema,
      dataMergers.mergeBillingDetails
    );
    updates = {
      ...updates,
      billingDetails: JSON.parse(JSON.stringify(billingJson)),
    };
    console.log("UPDATE SUCCESSFUL For Billing Details\n");
  }
  // Process prescription details if present
  if (doc.prescriptionsDocuments?.length > 0) {
    const prescriptionJson = await this.processDocuments(
      doc.prescriptionsDocuments,
      "PrescriptionDetails",
      prescriptionsDetailsTemplate,
      prescriptionsDetailsTemplateSchema,
      dataMergers.mergePrescriptionDetails
    );
    updates = {
      ...updates,
      prescriptionsDetails: JSON.parse(JSON.stringify(prescriptionJson)),
    };
    console.log("UPDATE SUCCESSFUL For Prescription Details\n");
  }
  // Process medical history details if present
  if (doc.medicalHistoryDocuments?.length > 0) {
    const medicalHistoryJson = await this.processDocuments(
      doc.medicalHistoryDocuments,
      "MedicalHistoryDetails",
      medicalHistoryDetailsTemplate,
      medicalHistoryDetailsTemplateSchema,
      dataMergers.mergeMedicalHistoryDetails
    );
    updates = {
      ...updates,
      medicalHistoryDetails: JSON.parse(JSON.stringify(medicalHistoryJson)),
    };
    console.log("UPDATE SUCCESSFUL For Medical History Details\n");
  }
  // Process past medical checkups details if present
  if (doc.patientPastMedicalCheckupsDocuments?.length > 0) {
    const checkupsJson = await this.processDocuments(
      doc.patientPastMedicalCheckupsDocuments,
      "MedicalCheckupsDetails",
      pastMedicalCheckupsDetailsTemplate,
      pastMedicalCheckupsDetailsTemplateSchema,
      dataMergers.mergeMedicalCheckupsDetails
    );
    updates = {
      ...updates,
      pastMedicalCheckupsDetails: JSON.parse(JSON.stringify(checkupsJson)),
    };
    console.log("UPDATE SUCCESSFUL For Medical Checkups Details\n");
  }
  // Process past medical records details if present
  if (doc.patientPastMedicalRecordsDocuments?.length > 0) {
    const recordsJson = await this.processDocuments(
      doc.patientPastMedicalRecordsDocuments,
      "MedicalRecordsDetails",
      pastMedicalRecordsDetailsTemplate,
      pastMedicalRecordsDetailsTemplateSchema,
      dataMergers.mergeMedicalRecordsDetails
    );
    updates = {
      ...updates,
      pastMedicalRecordsDetails: JSON.parse(JSON.stringify(recordsJson)),
    };
    console.log("UPDATE SUCCESSFUL For Medical Records Details\n");
  }
  // Process regular medicines details if present
  if (doc.regularMedicinesOfPatientDocuments?.length > 0) {
    const medicinesJson = await this.processDocuments(
      doc.regularMedicinesOfPatientDocuments,
      "RegularMedicinesDetails",
      regularMedicinesDetailsTemplate,
      regularMedicinesDetailsTemplateSchema,
      dataMergers.mergeRegularMedicinesDetails
    );
    updates = {
      ...updates,
      regularMedicinesDetails: JSON.parse(JSON.stringify(medicinesJson)),
    };
    console.log("UPDATE SUCCESSFUL For Regular Medicines Details\n");
  }
  // Process operation details if present
  if (doc.operationDetailDocuments?.length > 0) {
    const operationJson = await this.processDocuments(
      doc.operationDetailDocuments,
      "OperationDetails",
      operationDetailsTemplate,
      operationDetailsTemplateSchema,
      dataMergers.mergeOperationDetails
    );
    updates = {
      ...updates,
      operationDetails: JSON.parse(JSON.stringify(operationJson)),
    };
    console.log("UPDATE SUCCESSFUL For Operation Details\n");
  }
  // Process doctor's note details if present
  if (doc.doctorsNoteDocuments?.length > 0) {
    const doctorsNoteJson = await this.processDocuments(
      doc.doctorsNoteDocuments,
      "DoctorsNoteDetails",
      doctorNotesDetailsTemplate,
      doctorNotesDetailsTemplateSchema,
      dataMergers.mergeDoctorNoteDetails
    );
    updates = {
      ...updates,
      doctorsNoteDetails: JSON.parse(JSON.stringify(doctorsNoteJson)),
    };
    console.log("UPDATE SUCCESSFUL For Doctor's Note Details\n");
  }
  // Process policy details if present
  if (doc.policyDocuments?.length > 0) {
    const policyJson = await this.processDocuments(
      doc.policyDocuments,
      "PolicyDetails",
      policyDetailsTemplate,
      policyDetailsTemplateSchema,
      dataMergers.mergePolicyDetails
    );
    updates = {
      ...updates,
      policyDetails: JSON.parse(JSON.stringify(policyJson)),
    };
    console.log("UPDATE SUCCESSFUL For Policy Details\n");
  }
  // Final logging of the complete updates object
  console.log("JSON DATA:", JSON.stringify(updates, null, 2));

  const processor = new GeminiProcessor(process.env.GEMINI_API_KEY);

  const patientDetailsComparison = {
    billingPatientDetails: updates.billingDetails?.patientDetails || null,
    prescriptionPatientDetails:
      updates.prescriptionsDetails?.patientDetails || null,
    medicalHistoryPatientDetails:
      updates.medicalHistoryDetails?.patientDetails || null,
    checkupsPatientDetails:
      updates.pastMedicalCheckupsDetails?.patientDetails || null,
    recordsPatientDetails:
      updates.pastMedicalRecordsDetails?.patientDetails || null,
    regularMedicinesPatientDetails:
      updates.regularMedicinesDetails?.patientDetails || null,
    operationPatientDetails: updates.operationDetails?.patientDetails || null,
    doctorsNotePatientDetails:
      updates.doctorsNoteDetails?.patientDetails || null,
  };

  console.log("Patient details comaprison ", patientDetailsComparison);

  const promptForConsistencyCheck = consistenyDetailsCheck(
    patientDetailsComparison
  );
  const resultForConsistencyCheck = await processor.processPrompt(
    promptForConsistencyCheck
  );
  console.log(
    "resultForConsistencyCheck",
    JSON.stringify(resultForConsistencyCheck, null, 2)
  );

  const extractedData = extractRelevantMedicalData(updates);
  console.log("Extracted Data", extractedData);

  const promptForRelevantMedicalData = fraudDetectionCheck(extractedData);

  const resultForRelevantData = await processor.processPrompt(
    promptForRelevantMedicalData
  );

  console.log(
    "resultForRelevantData",
    JSON.stringify(resultForRelevantData, null, 2)
  );

  const extractedDataOfBilling = extractRelevantBillingData(updates);
  console.log("Extracted Data", extractedDataOfBilling);

  const promptForRelevantBillingData = generatePhantomBillingPrompt(
    extractedDataOfBilling
  );

  const resultForRelevantBillingData = await processor.processPrompt(
    promptForRelevantBillingData
  );

  console.log(
    "resultForRelevantBillingData",
    JSON.stringify(resultForRelevantBillingData, null, 2)
  );
  // Update document with all extracted details
  if (Object.keys(updates).length > 0) {
    await HospitalSubmitted.findByIdAndUpdate(doc._id, updates);
    console.log("PUSHED in DB");
  }
}
