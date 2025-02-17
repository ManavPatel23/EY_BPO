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

let geminiOutputCheckData = {};

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
  doctorsNotePatientDetails: updates.doctorsNoteDetails?.patientDetails || null,
};

// Consistency Check
const promptForConsistencyCheck = consistenyDetailsCheck(
  patientDetailsComparison
);
const resultForConsistencyCheck = await processor.processPrompt(
  promptForConsistencyCheck
);
geminiOutputCheckData.consistencyCheck = resultForConsistencyCheck;
console.log("resultForConsistencyCheck done ");

// Extracting Relevant Medical Data
const extractedData = extractRelevantMedicalData(updates);

const promptForRelevantMedicalData = fraudDetectionCheck(extractedData);
const resultForRelevantData = await processor.processPrompt(
  promptForRelevantMedicalData
);
geminiOutputCheckData.relevantMedicalDataCheck = resultForRelevantData;
console.log("resultForRelevantData done");

// Extracting Relevant Billing Data
const extractedDataOfBilling = extractRelevantBillingData(updates);

const promptForRelevantBillingData = generatePhantomBillingPrompt(
  extractedDataOfBilling
);
const resultForRelevantBillingData = await processor.processPrompt(
  promptForRelevantBillingData
);
geminiOutputCheckData.relevantBillingDataCheck = resultForRelevantBillingData;
console.log("resultForRelevantBillingData done");

// Final Output
console.log(
  "geminiOutputCheckData",
  JSON.stringify(geminiOutputCheckData, null, 2)
);

const finalGeminiTestExtract = {
  consistencyCheck: {
    isConsistent: geminiOutputCheckData.consistencyCheck.isConsistent,
    matchPercentage:
      geminiOutputCheckData.consistencyCheck.matchPercentage,
    summary: geminiOutputCheckData.consistencyCheck.summary,
  },
  relevantMedicalDataCheck: {
    riskPercentage:
      geminiOutputCheckData.relevantMedicalDataCheck.riskPercentage,
    riskLevel:
      geminiOutputCheckData.relevantMedicalDataCheck.riskLevel,
    finalRecommendation:
      geminiOutputCheckData.relevantMedicalDataCheck
        .finalRecommendation,
  },
  relevantBillingDataCheck: {
    insuranceVerification:
      geminiOutputCheckData.relevantBillingDataCheck
        .insuranceVerification,
    fraudAnalysis: {
      fraudPercentage:
        geminiOutputCheckData.relevantBillingDataCheck.fraudAnalysis
          .fraudPercentage,
      riskLevel:
        geminiOutputCheckData.relevantBillingDataCheck.fraudAnalysis
          .riskLevel,
      finalOutcomeAsSummary:
        geminiOutputCheckData.relevantBillingDataCheck.fraudAnalysis
          .finalOutcomeAsSummary,
    },
  },
};

console.log(finalGeminiTestExtract);

const finalGeminiTestPrompt = giveOverallScorePrompt(
  finalGeminiTestExtract
);

console.log(finalGeminiTestPrompt);

const finalGeminiTestResult = await processor.processPrompt(
  finalGeminiTestPrompt
);

console.log(
  "geminiFinal Test",
  JSON.stringify(finalGeminiTestResult, null, 2)
);
