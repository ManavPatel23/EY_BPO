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
      updates = {
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
          smokingAlcoholicFrequency:
            "Non-smoker, Occasional alcohol consumption",
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
        operationDetails: {
          surgeryName: "Heart Bypass Surgery",
          surgeryDate: "2024-07-05T00:00:00.000Z",
          surgeryType: "Cardiac",
          surgeonName: "Dr. Gupta",
          surgeonSpecialization: "Cardiothoracic Surgeon",
          anesthesiologist: "Dr. Rao",
          assistingSurgeons: [{ name: "Dr. Mehta" }],
          preOpDiagnosisDetails: "70% blockage in left coronary artery.",
          postOpDiagnosisDetails:
            "Successful bypass with normal heart function.",
          anesthesiaType: "General Anesthesia",
          operationDuration: 4,
          complications: [{ name: "Minor swelling" }],
          hospitalStayDuration: 5,
          postOpCare: "Physiotherapy recommended.",
          followUpInstructions: "Routine checkup after 1 month.",
          hospitalName: "Shatabdi Hospital",
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
              symptoms: [
                { name: "Chest Pain" },
                { name: "Shortness of Breath" },
              ],
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
        doctorsNoteDetails: {
          notes: "Patient recovering well from bypass surgery.",
          assessment: "Stable condition, no complications observed.",
          plan: "Regular follow-up visits required.",
          recommendations: "Avoid heavy lifting for 3 months.",
          writtenBy: "Dr. Gupta",
          designation: "Cardiothoracic Surgeon",
          dateWritten: "2024-07-10T00:00:00.000Z",
        },
        policyDetails: {
          policyStartDate: "2023-01-01T00:00:00.000Z",
          policyEndDate: "2028-12-31T00:00:00.000Z",
          sumAssured: 1500000,
          premiumAmount: 25000,
          policyNumber: 1234567890,
        },
      };
      // updates = await this.extractAllDocumentData(doc, updates);

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
