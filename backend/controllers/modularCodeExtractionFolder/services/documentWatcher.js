// services/documentWatcher.js
const {
  UserBuyedInsurance,
} = require("../../../models/UserBuyedInsuranceSchema.js");
const {
  billingDetailsTemplateSchema,
  patientDetailsTemplateSchema,
  prescriptionsDetailsTemplateSchema,
  medicalHistoryDetailsTemplateSchema,
  pastMedicalCheckupsDetailsTemplateSchema,
  pastMedicalRecordsDetailsTemplateSchema,
  regularMedicinesDetailsTemplateSchema,
  operationDetailsTemplateSchema,
  doctorNotesDetailsTemplateSchema,
  policyDetailsTemplateSchema,
} = require("../template/documentSchemaTemplates.js");
const {
  patientDetailsTemplate,
  billingDetailsTemplate,
  prescriptionsDetailsTemplate,
  medicalHistoryDetailsTemplate,
  pastMedicalCheckupsDetailsTemplate,
  pastMedicalRecordsDetailsTemplate,
  regularMedicinesDetailsTemplate,
  operationDetailsTemplate,
  doctorNotesDetailsTemplate,
  policyDetailsTemplate,
} = require("../template/documentTemplates.js");
const DocumentProcessor = require("../utils/documentProcessor.js");
const {
  extractRelevantMedicalData,
  extractRelevantBillingData,
} = require("../verification/extractRelevantMedicalData.js");
const GeminiProcessor = require("../verification/geminiCommonCode.js");
const {
  consistenyDetailsCheck,
  fraudDetectionCheck,
  generatePhantomBillingPrompt,
  giveOverallScorePrompt,
  generateMedicalVerificationPrompt,
} = require("../verification/promptForGemini.js");
const dataMergers = require("./dataMergers.js");
const extractors = require("./documentExtractors.js");
const path = require("path");

class DocumentWatcher {
  constructor(model, apiKey, io) {
    this.processor = new DocumentProcessor(apiKey, model);

    this.io = io;
  }

  async processDocuments(documents, type, template, schemaTemplates, mergeFn) {
    let consolidatedDetails = template;

    for (const doc of documents) {
      try {
        const filePath = path.join(__dirname, "../../../uploads", doc.filePath);

        console.log("FILEPATH ", filePath);

        const prompt = extractors[`get${type}Prompt`](schemaTemplates);

        const extractedData = await this.processor.processDocument(
          filePath,
          prompt
        );

        consolidatedDetails = mergeFn(consolidatedDetails, extractedData);
      } catch (error) {
        console.error(`Error processing ${type} document:`, error.message);
      }
    }

    return consolidatedDetails;
  }

  async watchUploads(HospitalSubmitted) {
    try {
      const changeStream = HospitalSubmitted.watch();

      changeStream.on("change", async (change) => {
        if (change.operationType === "insert") {
          const doc = change.fullDocument;
          let updates = {};
          // Determine validation status based on final score
          let validationStatus;
          let summaryAfterVerification;

          const processor = new GeminiProcessor(process.env.GEMINI_API_KEY);

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

          // find policyDetails based on the policy number provided from the document .
          // if there is no policy details found then return error message
          // if found store it and will use it for further verification such as medical history given or not previosly

          const policyNumberProvided = updates.policyDetails.policyNumber;

          const userBuyedInsurancePolicyDetails =
            await UserBuyedInsurance.findOne({
              policyNumber: policyNumberProvided,
            });

          console.log(
            "userBuyedInsurancePolicyDetails",
            userBuyedInsurancePolicyDetails
          );

          // if user didnt buyed insurance return
          if (!userBuyedInsurancePolicyDetails) {
            validationStatus = "FAILED";
            summaryAfterVerification =
              "Policy Details Provided Doesn't Match . Provide Proper Policy Details";

            updates = {
              ...updates,
              validationStatus,
              summaryAfterVerification,
            };
            await HospitalSubmitted.findByIdAndUpdate(doc._id, updates);
            console.log("PUSHED in DB After Fail");

            return;
          }

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
              patientPersonalDetails: JSON.parse(
                JSON.stringify(patientDetailsJson)
              ),
            };

            console.log("UPDATE SUCCESSFUL For Patient Personal Details\n");
          }
          // Process billing details if present
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
              prescriptionsDetails: JSON.parse(
                JSON.stringify(prescriptionJson)
              ),
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
              medicalHistoryDetails: JSON.parse(
                JSON.stringify(medicalHistoryJson)
              ),
            };
            console.log("UPDATE SUCCESSFUL For Medical History Details\n");
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
              regularMedicinesDetails: JSON.parse(
                JSON.stringify(medicinesJson)
              ),
            };
            console.log("UPDATE SUCCESSFUL For Regular Medicines Details\n");
          }

          const policyDataForMedVerification = {
            policyStartDate:
              userBuyedInsurancePolicyDetails.insuranceDetails.policyStartDate,
            regularMedicines: {
              ...userBuyedInsurancePolicyDetails.regularMedicines,
            },
            medicalHistory: {
              ...userBuyedInsurancePolicyDetails.medicalHistory,
            },
          };

          const claimDataForMedVerification = {
            medicalHistory: {
              ...updates.medicalHistoryDetails.hospitalRecords,
            },
            regularMedicines: { ...updates.regularMedicinesDetails.medicines },
          };

          const promptForMedVerification = generateMedicalVerificationPrompt(
            policyDataForMedVerification,
            claimDataForMedVerification
          );
          const resultAfterMedVerification = await processor.processPrompt(
            promptForMedVerification
          );
          console.log(
            "resultAfterMedVerification done ",
            resultAfterMedVerification
          );

          // if user didnt buyed insurance return
          if (resultAfterMedVerification.verificationScore < 50) {
            validationStatus = "FAILED";
            summaryAfterVerification = JSON.stringify(
              resultAfterMedVerification,
              null,
              2
            );
            updates = {
              ...updates,
              validationStatus,
              summaryAfterVerification,
            };
            await HospitalSubmitted.findByIdAndUpdate(doc._id, updates);
            console.log("PUSHED in DB After Medical Verification Fail");

            return;
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
              pastMedicalCheckupsDetails: JSON.parse(
                JSON.stringify(checkupsJson)
              ),
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
              pastMedicalRecordsDetails: JSON.parse(
                JSON.stringify(recordsJson)
              ),
            };
            console.log("UPDATE SUCCESSFUL For Medical Records Details\n");
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

          // Final logging of the complete updates object
          console.log("JSON DATA:", JSON.stringify(updates, null, 2));

          let geminiOutputCheckData = {};

          const patientDetailsComparison = {
            billingPatientDetails:
              updates.billingDetails?.patientDetails || null,
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
            operationPatientDetails:
              updates.operationDetails?.patientDetails || null,
            doctorsNotePatientDetails:
              updates.doctorsNoteDetails?.patientDetails || null,
          };

          // Consistency Check
          const promptForConsistencyCheck = consistenyDetailsCheck(
            patientDetailsComparison
          );
          const resultForConsistencyCheck = await processor.processPrompt(
            promptForConsistencyCheck
          );
          geminiOutputCheckData.consistencyCheck = resultForConsistencyCheck;
          console.log(
            "resultForConsistencyCheck done ",
            geminiOutputCheckData.consistencyCheck
          );

          // Extracting Relevant Medical Data
          const extractedData = extractRelevantMedicalData(updates);

          const promptForRelevantMedicalData =
            fraudDetectionCheck(extractedData);
          const resultForRelevantData = await processor.processPrompt(
            promptForRelevantMedicalData
          );
          geminiOutputCheckData.relevantMedicalDataCheck =
            resultForRelevantData;
          console.log(
            "resultForRelevantData done",
            geminiOutputCheckData.relevantMedicalDataCheck
          );

          // Extracting Relevant Billing Data
          const extractedDataOfBilling = extractRelevantBillingData(updates);

          const promptForRelevantBillingData = generatePhantomBillingPrompt(
            extractedDataOfBilling
          );
          const resultForRelevantBillingData = await processor.processPrompt(
            promptForRelevantBillingData
          );
          geminiOutputCheckData.relevantBillingDataCheck =
            resultForRelevantBillingData;
          console.log(
            "resultForRelevantBillingData done",
            geminiOutputCheckData.relevantBillingDataCheck
          );

          // Final Output

          const finalGeminiTestExtract = {
            matchPercentage:
              geminiOutputCheckData.consistencyCheck.matchPercentage * 5,
            riskPercentage:
              (100 -
                geminiOutputCheckData.relevantMedicalDataCheck.riskPercentage) *
              3,
            fraudPercentage:
              (100 -
                geminiOutputCheckData.relevantBillingDataCheck.fraudAnalysis
                  .fraudPercentage) *
              2,
          };

          console.log(finalGeminiTestExtract);

          const finalScore =
            Object.values(finalGeminiTestExtract).reduce(
              (sum, value) => sum + value,
              0
            ) / 10;

          geminiOutputCheckData.finalScoreAfterVerification = finalScore;

          console.log(finalScore);

          console.log(
            "geminiOutputCheckData",
            JSON.stringify(geminiOutputCheckData, null, 2)
          );

          if (finalScore >= 80) {
            validationStatus = "VERIFIED";
            summaryAfterVerification =
              "Claim is highly legitimate and approved.";
          } else if (finalScore >= 60) {
            validationStatus = "NEEDS_CORRECTION";
            summaryAfterVerification = JSON.stringify(
              geminiOutputCheckData,
              null,
              2
            );
          } else {
            validationStatus = "FAILED";
            summaryAfterVerification = JSON.stringify(
              geminiOutputCheckData,
              null,
              2
            );
          }

          updates = {
            ...updates,
            validationStatus,
            summaryAfterVerification,
            finalScoreAfterVerification: finalScore,
          };

          // Update document with all extracted details
          if (Object.keys(updates).length > 0) {
            await HospitalSubmitted.findByIdAndUpdate(doc._id, updates);
            console.log("PUSHED in DB");
          }
        }
      });

      console.log("Watching for hospital uploads...");
    } catch (error) {
      console.error("Error watching hospital uploads:", error);
    }
  }
}

module.exports = DocumentWatcher;
