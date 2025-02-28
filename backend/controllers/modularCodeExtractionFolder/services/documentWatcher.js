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
      // updates = {
      //   patientPersonalDetails: {
      //     fullName: "Vikram Sharma",
      //     dateOfBirth: "1972-04-23",
      //     age: 52,
      //     gender: "Male",
      //     bloodGroup: "O+",
      //     weight: 82,
      //     height: "5ft 10in",
      //     contactNumber: "+9188765 43210",
      //     emergencyContact: {
      //       name: "Neha Sharma",
      //       relationship: "Daughter",
      //       phone: "+91 9844556677",
      //     },
      //     aadharNumber: "987654321098",
      //     panNumber: "XYZAB5678C",
      //     address: {
      //       street: "45, MG Road",
      //       city: "Bangalore",
      //       state: "Karnataka",
      //       country: "India",
      //       pincode: "",
      //     },
      //     occupation: "",
      //     maritalStatus: "",
      //     allergies: [
      //       {
      //         allergy: "Sulfa Drugs",
      //       },
      //       {
      //         allergy: "Seafood",
      //       },
      //     ],
      //     familyMedicalHistory: [
      //       {
      //         relationWithHim: "Father",
      //         medicalHistory: "Heart Disease",
      //       },
      //       {
      //         relationWithHim: "Mother",
      //         medicalHistory: "Arthritis",
      //       },
      //     ],
      //     smokingAlcoholicFrequency:
      //       "Former smoker, Moderate alcohol consumption",
      //   },
      //   billingDetails: {
      //     patientDetails: {
      //       name: "Vikas Sharma",
      //     },
      //     billId: "INV4567",
      //     hospitalName: "Manipal Hospital",
      //     hospitalGSTIN: "",
      //     date: "2025-02-10",
      //     amount: 287500,
      //     description: "",
      //     itemizedCharges: [
      //       {
      //         serviceName: "Medicine Costs",
      //         quantity: null,
      //         unitPrice: null,
      //         totalPrice: 42500,
      //         category: null,
      //       },
      //       {
      //         serviceName: "Lab Tests (MRI, CT Scan, Specialized Blood Work)",
      //         quantity: null,
      //         unitPrice: null,
      //         totalPrice: 35000,
      //         category: null,
      //       },
      //       {
      //         serviceName: "Nursing Charges",
      //         quantity: 7,
      //         unitPrice: null,
      //         totalPrice: 21000,
      //         category: null,
      //       },
      //       {
      //         serviceName: "Specialized Medical Services",
      //         quantity: null,
      //         unitPrice: null,
      //         totalPrice: 58000,
      //         category: null,
      //       },
      //       {
      //         serviceName: "Room Charges (Premium Suite)",
      //         quantity: 7,
      //         unitPrice: null,
      //         totalPrice: 84000,
      //         category: null,
      //       },
      //       {
      //         serviceName: "Specialist Consultation Fees",
      //         quantity: 5,
      //         unitPrice: null,
      //         totalPrice: 25000,
      //         category: null,
      //       },
      //     ],
      //     taxes: {
      //       totalTax: 22000,
      //     },
      //     paymentMethod: "Insurance Claim",
      //     paymentStatus: "Pending",
      //     discountApplied: null,
      //     billGeneratedBy: "",
      //     totalBillingAmount: {
      //       subTotal: 110000,
      //       taxAmount: 22000,
      //       finalAmount: 287500,
      //     },
      //   },
      //   prescriptionsDetails: {
      //     patientDetails: {
      //       name: "V.K. Sharma",
      //       gender: "Male",
      //       bloodGroup: "O+",
      //     },
      //     prescriptionId: "",
      //     prescribedBy: "Dr. Vinod Kapoor",
      //     doctorRegistrationNo: "KMC789123",
      //     specialization: "Cardiology",
      //     prescriptionDate: "2025-02-10",
      //     diagnosis: "Coronary Artery Disease, COPD, Rheumatoid Arthritis",
      //     medicines: [
      //       {
      //         name: "Atorvastatin",
      //         dosage: "80mg",
      //         frequency: "Once Daily",
      //         duration: 90,
      //         durationUnit: "days",
      //         timings: null,
      //         specialInstructions: "For cholesterol control",
      //       },
      //       {
      //         name: "Clopidogrel",
      //         dosage: "75mg",
      //         frequency: "Once Daily",
      //         duration: 180,
      //         durationUnit: "days",
      //         timings: null,
      //         specialInstructions: "Blood thinner",
      //       },
      //       {
      //         name: "Tiotropium",
      //         dosage: "18mcg",
      //         frequency: "Once Daily",
      //         duration: 90,
      //         durationUnit: "days",
      //         timings: null,
      //         specialInstructions: "For COPD management",
      //       },
      //       {
      //         name: "Methotrexate",
      //         dosage: "15mg",
      //         frequency: "Once Weekly",
      //         duration: 90,
      //         durationUnit: "days",
      //         timings: null,
      //         specialInstructions: "For rheumatoid arthritis",
      //       },
      //       {
      //         name: "Prednisone",
      //         dosage: "10mg",
      //         frequency: "Once Daily",
      //         duration: 30,
      //         durationUnit: "days",
      //         timings: null,
      //         specialInstructions: "Tapering dose required",
      //       },
      //       {
      //         name: "Adalimumab",
      //         dosage: "40mg",
      //         frequency: "Every 2 weeks",
      //         duration: 180,
      //         durationUnit: "days",
      //         timings: null,
      //         specialInstructions: "Injection for rheumatoid arthritis",
      //       },
      //     ],
      //     additionalInstructions:
      //       "Avoid strenuous physical activity. Weekly blood tests required.",
      //     followUpDate: "2025-03-10",
      //   },
      //   medicalHistoryDetails: {
      //     patientDetails: {
      //       name: "Vikram Sharma",
      //       gender: "Male",
      //       bloodGroup: null,
      //     },
      //     allergies: [
      //       {
      //         allergy: "Sulfa Drugs",
      //       },
      //       {
      //         allergy: "Seafood",
      //       },
      //       {
      //         allergy: "Latex",
      //       },
      //     ],
      //     chronicConditions: [
      //       {
      //         name: "Coronary Artery Disease",
      //       },
      //       {
      //         name: "COPD",
      //       },
      //       {
      //         name: "Rheumatoid Arthritis",
      //       },
      //     ],
      //     majorInjuriesOrTrauma: [
      //       {
      //         nameOf: "Fractured right femur",
      //         dateOf: "2010-06-15T00:00:00.000Z",
      //         recoveryStatus: "Fully recovered",
      //       },
      //       {
      //         nameOf: "Severe sports injury to shoulder",
      //         dateOf: "2015-02-10T00:00:00.000Z",
      //         recoveryStatus: "Minor residual pain",
      //       },
      //     ],
      //     immunizationRecords: [
      //       {
      //         nameOf: "BCG",
      //         dateOf: "1972-06-15T00:00:00.000Z",
      //       },
      //       {
      //         nameOf: "Polio",
      //         dateOf: "1975-03-20T00:00:00.000Z",
      //       },
      //       {
      //         nameOf: "Hepatitis B",
      //         dateOf: "1997-05-18T00:00:00.000Z",
      //       },
      //       {
      //         nameOf: "COVID-19 (Covishield)",
      //         dateOf: "2021-05-10T00:00:00.000Z",
      //       },
      //     ],
      //     hospitalRecords: [
      //       {
      //         disease: "Pneumonia",
      //         diagnosisDetails: "Bilateral pneumonia with respiratory distress",
      //         severity: "Severe",
      //         treatment: {
      //           type: "Medical",
      //           details: "IV antibiotics, oxygen therapy",
      //           duration: "7 days",
      //           outcome: "Complete recovery",
      //         },
      //         doctorName: "Dr. Venugopal Rao",
      //         doctorSpecialization: null,
      //         hospitalName: null,
      //         hospitalId: null,
      //         dateOfDiagnosis: "2002-11-10T00:00:00.000Z",
      //         dateOfRecovery: "2002-11-17T00:00:00.000Z",
      //         dateOfReport: null,
      //         followUpRequired: null,
      //         additionalNotes: null,
      //       },
      //       {
      //         disease: "Rheumatoid Arthritis",
      //         diagnosisDetails: null,
      //         severity: null,
      //         treatment: {
      //           type: "Medical management",
      //           details: null,
      //           duration: "Ongoing",
      //           outcome: "Controlled with medication",
      //         },
      //         doctorName: "Dr. Sanjay Gupta",
      //         doctorSpecialization: null,
      //         hospitalName: null,
      //         hospitalId: null,
      //         dateOfDiagnosis: "2018-08-20T00:00:00.000Z",
      //         dateOfRecovery: null,
      //         dateOfReport: null,
      //         followUpRequired: null,
      //         additionalNotes: null,
      //       },
      //       {
      //         disease: "Coronary Artery Disease",
      //         diagnosisDetails: null,
      //         severity: null,
      //         treatment: {
      //           type: "Angioplasty with stent placement",
      //           details: null,
      //           duration: "Ongoing management",
      //           outcome: "Stable with medication",
      //         },
      //         doctorName: "Dr. Vinod Kapoor",
      //         doctorSpecialization: null,
      //         hospitalName: null,
      //         hospitalId: null,
      //         dateOfDiagnosis: "2022-04-15T00:00:00.000Z",
      //         dateOfRecovery: null,
      //         dateOfReport: null,
      //         followUpRequired: null,
      //         additionalNotes: null,
      //       },
      //       {
      //         disease: "COPD",
      //         diagnosisDetails: null,
      //         severity: null,
      //         treatment: {
      //           type: "Bronchodilators, pulmonary rehabilitation",
      //           details: null,
      //           duration: "Ongoing",
      //           outcome: "Managed with medication",
      //         },
      //         doctorName: "Dr. Meera Patel",
      //         doctorSpecialization: null,
      //         hospitalName: null,
      //         hospitalId: null,
      //         dateOfDiagnosis: "2023-02-10T00:00:00.000Z",
      //         dateOfRecovery: null,
      //         dateOfReport: null,
      //         followUpRequired: null,
      //         additionalNotes: null,
      //       },
      //     ],
      //   },
      //   pastMedicalCheckupsDetails: {
      //     patientDetails: {
      //       name: "Vikram K. Sharma",
      //       gender: "Male",
      //       bloodGroup: "A+",
      //     },
      //     checkupRecords: [
      //       {
      //         checkupId: "CHK2025-01-15Dr. Mehta",
      //         checkupDate: "2025-01-15T00:00:00.000Z",
      //         checkupType: "Emergency Evaluation",
      //         symptoms: [
      //           { name: "Chest Pain" },
      //           { name: "Shortness of Breath" },
      //           { name: "Extreme Fatigue" },
      //         ],
      //         diagnosis:
      //           "Acute Myocardial Infarction with Complications (Tampered)",
      //         doctorName: "Dr. Mehta",
      //         doctorSpecialization: "Cardiologist",
      //         hospitalName: "Elite Heart Institute",
      //         vitalSigns: {
      //           bloodPressure: "190/110",
      //           temperature: 102.5,
      //           pulseRate: 125,
      //           respiratoryRate: 38,
      //           oxygenSaturation: 65,
      //         },
      //         testsRecommended: [
      //           {
      //             testName: "Specialized Cardiac Enzyme Panel",
      //             reason: "Suspicion of Severe Heart Damage",
      //           },
      //           {
      //             testName: "Contrast-Enhanced CT Angiography",
      //             reason: "Evaluation of Coronary Blockage",
      //           },
      //         ],
      //         followUpDate: "2025-01-25T00:00:00.000Z",
      //         recommendations: "Emergency Bypass Surgery (Fake Recommendation)",
      //       },
      //     ],
      //   },
      //   pastMedicalRecordsDetails: {
      //     records: [
      //       {
      //         recordId: "FAKE-CARD-9876",
      //         recordDate: "2025-01-18T00:00:00.000Z",
      //         recordType: "Advanced Cardiac Assessment",
      //         hospitalOrLabName: "Unverified Cardiac Center",
      //         resultSummary:
      //           "Multi-Vessel Coronary Disease with Severe Blockage (Fake)",
      //         interpretation: "Imminent Heart Failure Risk (Tampered)",
      //         criticalFindings: true,
      //         recommendedFollowUp: "Immediate multi-vessel bypass surgery",
      //       },
      //     ],
      //   },
      //   operationDetails: {
      //     surgeryName: "Emergency Quintuple Bypass (Fake Surgery)",
      //     surgeryDate: "2025-02-05T00:00:00.000Z",
      //     surgeryType: "Ultra-Complex Cardiac",
      //     surgeonName: "Dr. Phantom",
      //     surgeonSpecialization: "Cardiothoracic Surgeon",
      //     anesthesiologist: "Dr. Ghost",
      //     assistingSurgeons: [{ name: "Dr. Shadow" }, { name: "Dr. Mystery" }],
      //     preOpDiagnosisDetails:
      //       "Total Coronary Artery Occlusion in All Vessels (Tampered Data)",
      //     postOpDiagnosisDetails: "Complete Revascularization Achieved (Fake)",
      //     anesthesiaType: "Advanced Cardiac Protocol",
      //     operationDuration: 720,
      //     complications: [{ name: "None Despite Extreme Risk (Unrealistic)" }],
      //     hospitalStayDuration: 2,
      //     postOpCare: "Minimal recovery time required (Fake Data)",
      //     followUpInstructions:
      //       "Resume normal activities in 48 hours (Unrealistic)",
      //     hospitalName: "Shatabdi Hospital",
      //   },
      //   doctorsNoteDetails: {
      //     notes:
      //       "Patient has undergone quintuple bypass with revolutionary technique. Miraculous recovery expected.",
      //     assessment:
      //       "Complete cardiac function restoration despite severe disease.",
      //     plan: "Minimal follow-up required due to extraordinary outcome (Fake).",
      //     recommendations: "Return to work within 1 week (Unrealistic).",
      //     writtenBy: "Dr. Phantom",
      //     designation: "Chief Cardiac Surgeon",
      //     dateWritten: "2025-02-07T00:00:00.000Z",
      //   },
      //   regularMedicinesDetails: {
      //     patientDetails: {
      //       name: "Vikram Sharma",
      //       gender: "Male",
      //       bloodGroup: null,
      //     },
      //     medicines: [
      //       {
      //         medicineName: "Atorvastatin",
      //         genericName: null,
      //         dosage: "80mg",
      //         frequency: 1,
      //         duration: "Lifelong",
      //         purpose: null,
      //         sideEffects: [],
      //         startDate: "2022-04-20T00:00:00.000Z",
      //         endDate: null,
      //         prescribedBy: "Dr. Vinod Kapoor",
      //         isActive: true,
      //         specialInstructions: "Take at night",
      //         interactionWarnings: [],
      //       },
      //       {
      //         medicineName: "Clopidogrel",
      //         genericName: null,
      //         dosage: "75mg",
      //         frequency: 1,
      //         duration: "Long-term",
      //         purpose: null,
      //         sideEffects: [],
      //         startDate: "2022-04-20T00:00:00.000Z",
      //         endDate: null,
      //         prescribedBy: "Dr. Vinod Kapoor",
      //         isActive: true,
      //         specialInstructions: "Take with food",
      //         interactionWarnings: [],
      //       },
      //       {
      //         medicineName: "Methotrexate",
      //         genericName: null,
      //         dosage: "15mg",
      //         frequency: 0.14,
      //         duration: "Long-term",
      //         purpose: null,
      //         sideEffects: [],
      //         startDate: "2018-09-05T00:00:00.000Z",
      //         endDate: null,
      //         prescribedBy: "Dr. Sanjay Gupta",
      //         isActive: true,
      //         specialInstructions: "Take once weekly",
      //         interactionWarnings: [],
      //       },
      //       {
      //         medicineName: "Tiotropium",
      //         genericName: null,
      //         dosage: "18mcg",
      //         frequency: 1,
      //         duration: "Long-term",
      //         purpose: null,
      //         sideEffects: [],
      //         startDate: "2023-02-15T00:00:00.000Z",
      //         endDate: null,
      //         prescribedBy: "Dr. Meera Patel",
      //         isActive: true,
      //         specialInstructions: "Use inhaler daily",
      //         interactionWarnings: [],
      //       },
      //       {
      //         medicineName: "Adalimumab",
      //         genericName: null,
      //         dosage: "40mg",
      //         frequency: 0.5,
      //         duration: "Long-term",
      //         purpose: null,
      //         sideEffects: [],
      //         startDate: "2020-06-10T00:00:00.000Z",
      //         endDate: null,
      //         prescribedBy: "Dr. Sanjay Gupta",
      //         isActive: true,
      //         specialInstructions: "Inject every 2 weeks",
      //         interactionWarnings: [],
      //       },
      //       {
      //         medicineName: "Prednisone",
      //         genericName: null,
      //         dosage: "10mg",
      //         frequency: 1,
      //         duration: "As needed",
      //         purpose: null,
      //         sideEffects: [],
      //         startDate: "2024-12-15T00:00:00.000Z",
      //         endDate: null,
      //         prescribedBy: "Dr. Sanjay Gupta",
      //         isActive: true,
      //         specialInstructions: "Tapering dose",
      //         interactionWarnings: [],
      //       },
      //     ],
      //   },
      //   policyDetails: {
      //     policyStartDate: "2024-01-01T00:00:00.000Z",
      //     policyEndDate: "2029-12-31T00:00:00.000Z",
      //     sumAssured: 2500000,
      //     premiumAmount: 45000,
      //     policyNumber: 1234567890,
      //   },
      // };

      console.log(updates.operationDetails);

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

      updates = {
        ...updates,
        referenceImage: validationResult.policyDetails.referenceImage,
        hospitalName: updates.operationDetails.hospitalName,
      };

      console.log(
        "Reference Image ",
        updates.referenceImage,
        updates.hospitalName
      );

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
