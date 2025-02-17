const templates = {

  policyDetailsTemplate : {},

  patientDetailsTemplate: {
    fullName: "",
    dateOfBirth: null,
    age: null,
    gender: "",
    bloodGroup: "",
    weight: null,
    height: null,
    contactNumber: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
    aadharNumber: "",
    panNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
    },
    occupation: "",
    maritalStatus: "",
    allergies: [],
    familyMedicalHistory: [],
    smokingAlcoholicFrequency: "",
  },

  billingDetailsTemplate: {
    patientDetails: {},
    billId: "",
    hospitalName: "",
    hospitalGSTIN: "",
    date: null,
    amount: null,
    description: "",
    itemizedCharges: [],
    taxes: {},
    paymentMethod: "",
    paymentStatus: "Paid || Pending || Partially Paid",
    discountApplied: null,
    billGeneratedBy: "",
    totalBillingAmount: {},
  },

  prescriptionsDetailsTemplate: {
    patientDetails: {},
    prescriptionId: "",
    prescribedBy: "",
    doctorRegistrationNo: "",
    specialization: "",
    prescriptionDate: "",
    diagnosis: "",
    medicines: [],
    additionalInstructions: "",
    followUpDate: "",
  },

  medicalHistoryDetailsTemplate: {
    patientDetails: {},
    allergies: [],
    chronicConditions: [],
    majorInjuriesOrTrauma: [],
    immunizationRecords: [],
    hospitalRecords: [],
  },

  pastMedicalCheckupsDetailsTemplate: {
    patientDetails: {},
    checkupRecords: [],
  },

  pastMedicalRecordsDetailsTemplate: {
    patientDetails: {},
    records: [],
  },

  regularMedicinesDetailsTemplate: {
    patientDetails: {},
    medicines: [],
  },

  operationDetailsTemplate: {
    patientDetails: {},
    surgeryName: "",
    surgeryDate: "",
    surgeryType: "",
    surgeonName: "",
    surgeonSpecialization: "",
    anesthesiologist: "",
    assistingSurgeons: [],
    preOpDiagnosisDetails: "",
    postOpDiagnosisDetails: "",
    procedureDetails: "",
    anesthesiaType: "",
    operationDuration: null,
    complications: [],
    hospitalStayDuration: null,
    postOpCare: "",
    recoveryNotes: "",
    followUpInstructions: "",
  },

  doctorNotesDetailsTemplate: {
    patientDetails: {},
    notes: null,
    assessment: null,
    plan: null,
    recommendations: null,
    writtenBy: null,
    designation: null,
    department: null,
    dateWritten: null,
  },
};

module.exports = templates;
