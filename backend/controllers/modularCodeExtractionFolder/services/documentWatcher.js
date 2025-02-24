// services/documentWatcher.js
const HospitalSubmittedSchema = require("../../../models/HospitalSubmittedSchema.js");
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

    this.geminiProcessor = new GeminiProcessor(
      process.env.GEMINI_API_KEY,
      model
    );

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
          await this.processNewClaim(change.fullDocument);
        }
      });

      console.log("Watching for hospital uploads...");
    } catch (error) {
      console.error("Error watching hospital uploads:", error);
    }
  }

  async processNewClaim(doc) {
    try {
      let updates = {};

      // Process all document types
      updates = await this.extractAllDocumentData(doc, updates);

      // Validate policy number
      const validationResult = await this.validatePolicyNumber(updates);
      if (!validationResult.isValid) {
        await this.updateClaimStatus(doc._id, {
          ...updates,
          validationStatus: "FAILED",
          summaryAfterVerification: validationResult.message,
        });
        return;
      }

      // Validate medical history
      const medicalValidationResult = await this.validateMedicalHistory(
        validationResult.policyDetails,
        updates
      );

      if (!medicalValidationResult.isValid) {
        await this.updateClaimStatus(doc._id, {
          ...updates,
          validationStatus: "FAILED",
          summaryAfterVerification: medicalValidationResult.resultData,
        });
        return;
      }

      console.log("Extracted Data ", updates);

      // Perform comprehensive validation
      const validationResults = await this.performComprehensiveValidation(
        updates
      );

      // Calculate final score and determine validation status
      const finalResult = this.calculateFinalScore(validationResults);

      // Update the claim with final status
      await this.updateClaimStatus(doc._id, {
        ...updates,
        validationStatus: finalResult.validationStatus,
        summaryAfterVerification: finalResult.summaryAfterVerification,
        finalScoreAfterVerification: finalResult.finalScore,
      });

      console.log("Claim processed successfully");
    } catch (error) {
      console.error("Error processing claim:", error);
    }
  }

  async extractAllDocumentData(doc, updates) {
    const documentProcessors = [
      {
        documents: doc.policyDocuments,
        type: "PolicyDetails",
        template: policyDetailsTemplate,
        schema: policyDetailsTemplateSchema,
        merger: dataMergers.mergePolicyDetails,
        updateKey: "policyDetails",
      },
      {
        documents: doc.patientDetailsDocuments,
        type: "PatientDetails",
        template: patientDetailsTemplate,
        schema: patientDetailsTemplateSchema,
        merger: dataMergers.mergePatientDetails,
        updateKey: "patientPersonalDetails",
      },
      {
        documents: doc.billsDocuments,
        type: "BillingDetails",
        template: billingDetailsTemplate,
        schema: billingDetailsTemplateSchema,
        merger: dataMergers.mergeBillingDetails,
        updateKey: "billingDetails",
      },
      {
        documents: doc.prescriptionsDocuments,
        type: "PrescriptionDetails",
        template: prescriptionsDetailsTemplate,
        schema: prescriptionsDetailsTemplateSchema,
        merger: dataMergers.mergePrescriptionDetails,
        updateKey: "prescriptionsDetails",
      },
      {
        documents: doc.medicalHistoryDocuments,
        type: "MedicalHistoryDetails",
        template: medicalHistoryDetailsTemplate,
        schema: medicalHistoryDetailsTemplateSchema,
        merger: dataMergers.mergeMedicalHistoryDetails,
        updateKey: "medicalHistoryDetails",
      },
      {
        documents: doc.regularMedicinesOfPatientDocuments,
        type: "RegularMedicinesDetails",
        template: regularMedicinesDetailsTemplate,
        schema: regularMedicinesDetailsTemplateSchema,
        merger: dataMergers.mergeRegularMedicinesDetails,
        updateKey: "regularMedicinesDetails",
      },
      {
        documents: doc.patientPastMedicalCheckupsDocuments,
        type: "MedicalCheckupsDetails",
        template: pastMedicalCheckupsDetailsTemplate,
        schema: pastMedicalCheckupsDetailsTemplateSchema,
        merger: dataMergers.mergeMedicalCheckupsDetails,
        updateKey: "pastMedicalCheckupsDetails",
      },
      {
        documents: doc.patientPastMedicalRecordsDocuments,
        type: "MedicalRecordsDetails",
        template: pastMedicalRecordsDetailsTemplate,
        schema: pastMedicalRecordsDetailsTemplateSchema,
        merger: dataMergers.mergeMedicalRecordsDetails,
        updateKey: "pastMedicalRecordsDetails",
      },
      {
        documents: doc.operationDetailDocuments,
        type: "OperationDetails",
        template: operationDetailsTemplate,
        schema: operationDetailsTemplateSchema,
        merger: dataMergers.mergeOperationDetails,
        updateKey: "operationDetails",
      },
      {
        documents: doc.doctorsNoteDocuments,
        type: "DoctorsNoteDetails",
        template: doctorNotesDetailsTemplate,
        schema: doctorNotesDetailsTemplateSchema,
        merger: dataMergers.mergeDoctorNoteDetails,
        updateKey: "doctorsNoteDetails",
      },
    ];

    for (const processor of documentProcessors) {
      if (processor.documents?.length > 0) {
        const processedData = await this.processDocuments(
          processor.documents,
          processor.type,
          processor.template,
          processor.schema,
          processor.merger
        );

        updates = {
          ...updates,
          [processor.updateKey]: JSON.parse(JSON.stringify(processedData)),
        };

        console.log(`UPDATE SUCCESSFUL For ${processor.type}\n`);
      }
    }

    return updates;
  }

  async validatePolicyNumber(updates) {
    try {
      const policyNumberProvided = updates.policyDetails.policyNumber;

      const userBuyedInsurancePolicyDetails = await UserBuyedInsurance.findOne({
        policyNumber: policyNumberProvided,
      });

      console.log(
        "userBuyedInsurancePolicyDetails",
        userBuyedInsurancePolicyDetails
      );

      if (!userBuyedInsurancePolicyDetails) {
        return {
          isValid: false,
          message:
            "Policy Details Provided Doesn't Match. Provide Proper Policy Details",
        };
      }

      return {
        isValid: true,
        policyDetails: userBuyedInsurancePolicyDetails,
      };
    } catch (error) {
      console.error("Error validating policy number:", error);
      return {
        isValid: false,
        message: "Error validating policy details",
      };
    }
  }

  async validateMedicalHistory(policyDetails, updates) {
    try {
      const policyDataForMedVerification = {
        policyStartDate: policyDetails.insuranceDetails.policyStartDate,
        regularMedicines: {
          ...policyDetails.regularMedicines,
        },
        medicalHistory: {
          ...policyDetails.medicalHistory,
        },
      };

      const claimDataForMedVerification = {
        medicalHistory: {
          ...updates.medicalHistoryDetails.hospitalRecords,
        },
        regularMedicines: {
          ...updates.regularMedicinesDetails.medicines,
        },
      };

      const promptForMedVerification = generateMedicalVerificationPrompt(
        policyDataForMedVerification,
        claimDataForMedVerification
      );

      const resultAfterMedVerification =
        await this.geminiProcessor.processPrompt(promptForMedVerification);

      console.log(
        "resultAfterMedVerification done",
        resultAfterMedVerification
      );

      if (resultAfterMedVerification.verificationScore < 50) {
        return {
          isValid: false,
          resultData: JSON.stringify(resultAfterMedVerification, null, 2),
        };
      }

      return {
        isValid: true,
        resultData: resultAfterMedVerification,
      };
    } catch (error) {
      console.error("Error validating medical history:", error);
      return {
        isValid: false,
        resultData: "Error validating medical history",
      };
    }
  }

  async performComprehensiveValidation(updates) {
    try {
      const geminiOutputCheckData = {};

      // Patient details consistency check
      const patientDetailsComparison =
        this.extractPatientDetailsForComparison(updates);
      const promptForConsistencyCheck = consistenyDetailsCheck(
        patientDetailsComparison
      );
      const resultForConsistencyCheck =
        await this.geminiProcessor.processPrompt(promptForConsistencyCheck);
      geminiOutputCheckData.consistencyCheck = resultForConsistencyCheck;

      // Medical data fraud check

      const extractedMedicalData = extractRelevantMedicalData(updates);
      console.log("extractedMedicalData", extractedMedicalData);

      const promptForRelevantMedicalData =
        fraudDetectionCheck(extractedMedicalData);
      const resultForRelevantData = await this.geminiProcessor.processPrompt(
        promptForRelevantMedicalData
      );

      console.log("resultForRelevantData", resultForRelevantData);

      geminiOutputCheckData.relevantMedicalDataCheck = resultForRelevantData;

      // Billing data fraud check
      const extractedBillingData = extractRelevantBillingData(updates);
      const promptForRelevantBillingData =
        generatePhantomBillingPrompt(extractedBillingData);
      const resultForRelevantBillingData =
        await this.geminiProcessor.processPrompt(promptForRelevantBillingData);
      geminiOutputCheckData.relevantBillingDataCheck =
        resultForRelevantBillingData;

      console.log(geminiOutputCheckData);

      return geminiOutputCheckData;
    } catch (error) {
      console.error("Error performing comprehensive validation:", error);
      throw error;
    }
  }

  extractPatientDetailsForComparison(updates) {
    return {
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
  }

  calculateFinalScore(validationResults) {
    const finalGeminiTestExtract = {
      matchPercentage: validationResults.consistencyCheck.matchPercentage * 5,
      riskPercentage:
        (100 - validationResults.relevantMedicalDataCheck.riskPercentage) * 3,
      fraudPercentage:
        (100 -
          validationResults.relevantBillingDataCheck.fraudAnalysis
            .fraudPercentage) *
        2,
    };

    console.log(finalGeminiTestExtract);

    const finalScore =
      Object.values(finalGeminiTestExtract).reduce(
        (sum, value) => sum + value,
        0
      ) / 10;

    console.log(finalScore);

    let validationStatus, summaryAfterVerification;

    if (finalScore >= 80) {
      validationStatus = "VERIFIED";
      summaryAfterVerification = "Claim is highly legitimate and approved.";
    } else if (finalScore >= 60) {
      validationStatus = "NEEDS_CORRECTION";
      summaryAfterVerification = JSON.stringify(validationResults, null, 2);
    } else {
      validationStatus = "FAILED";
      summaryAfterVerification = JSON.stringify(validationResults, null, 2);
    }

    return {
      validationStatus,
      summaryAfterVerification,
      finalScore,
    };
  }

  async updateClaimStatus(docId, updates) {
    try {
      await HospitalSubmittedSchema.findByIdAndUpdate(docId, updates);
      console.log("PUSHED in DB");
    } catch (error) {
      console.error("Error updating claim status:", error);
      throw error;
    }
  }
}

module.exports = DocumentWatcher;
