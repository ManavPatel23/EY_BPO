// services/documentWatcher.js
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
          let updates = {
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
              smokingAlcoholicFrequency:
                "Non-smoker, Occasional alcohol consumption",
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
                  diagnosisDetails:
                    "Acute appendicitis requiring emergency surgery",
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
                  recommendations:
                    "Urgent surgery if test results confirm appendicitis",
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
                  interpretation:
                    "Findings are consistent with acute appendicitis.",
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
              assessment:
                "Surgical site healing as expected, no signs of infection.",
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

          const processor = new GeminiProcessor(process.env.GEMINI_API_KEY);

          // // Process patient details if present
          // if (doc.patientDetailsDocuments?.length > 0) {
          //   // Get JSON response from processDocuments
          //   const patientDetailsJson = await this.processDocuments(
          //     doc.patientDetailsDocuments,
          //     "PatientDetails",
          //     patientDetailsTemplate,
          //     patientDetailsTemplateSchema,
          //     dataMergers.mergePatientDetails
          //   );

          //   // Convert to JSON if it isn't already
          //   updates = {
          //     ...updates, // Preserve any existing data
          //     patientPersonalDetails: JSON.parse(
          //       JSON.stringify(patientDetailsJson)
          //     ),
          //   };

          //   console.log("UPDATE SUCCESSFUL For Patient Personal Details\n");
          // }
          // if (doc.billsDocuments?.length > 0) {
          //   const billingJson = await this.processDocuments(
          //     doc.billsDocuments,
          //     "BillingDetails",
          //     billingDetailsTemplate,
          //     billingDetailsTemplateSchema,
          //     dataMergers.mergeBillingDetails
          //   );
          //   updates = {
          //     ...updates,
          //     billingDetails: JSON.parse(JSON.stringify(billingJson)),
          //   };
          //   console.log("UPDATE SUCCESSFUL For Billing Details\n");
          // }
          // // Process prescription details if present
          // if (doc.prescriptionsDocuments?.length > 0) {
          //   const prescriptionJson = await this.processDocuments(
          //     doc.prescriptionsDocuments,
          //     "PrescriptionDetails",
          //     prescriptionsDetailsTemplate,
          //     prescriptionsDetailsTemplateSchema,
          //     dataMergers.mergePrescriptionDetails
          //   );
          //   updates = {
          //     ...updates,
          //     prescriptionsDetails: JSON.parse(
          //       JSON.stringify(prescriptionJson)
          //     ),
          //   };
          //   console.log("UPDATE SUCCESSFUL For Prescription Details\n");
          // }
          // // Process medical history details if present
          // if (doc.medicalHistoryDocuments?.length > 0) {
          //   const medicalHistoryJson = await this.processDocuments(
          //     doc.medicalHistoryDocuments,
          //     "MedicalHistoryDetails",
          //     medicalHistoryDetailsTemplate,
          //     medicalHistoryDetailsTemplateSchema,
          //     dataMergers.mergeMedicalHistoryDetails
          //   );
          //   updates = {
          //     ...updates,
          //     medicalHistoryDetails: JSON.parse(
          //       JSON.stringify(medicalHistoryJson)
          //     ),
          //   };
          //   console.log("UPDATE SUCCESSFUL For Medical History Details\n");
          // }
          // // Process past medical checkups details if present
          // if (doc.patientPastMedicalCheckupsDocuments?.length > 0) {
          //   const checkupsJson = await this.processDocuments(
          //     doc.patientPastMedicalCheckupsDocuments,
          //     "MedicalCheckupsDetails",
          //     pastMedicalCheckupsDetailsTemplate,
          //     pastMedicalCheckupsDetailsTemplateSchema,
          //     dataMergers.mergeMedicalCheckupsDetails
          //   );
          //   updates = {
          //     ...updates,
          //     pastMedicalCheckupsDetails: JSON.parse(
          //       JSON.stringify(checkupsJson)
          //     ),
          //   };
          //   console.log("UPDATE SUCCESSFUL For Medical Checkups Details\n");
          // }
          // // Process past medical records details if present
          // if (doc.patientPastMedicalRecordsDocuments?.length > 0) {
          //   const recordsJson = await this.processDocuments(
          //     doc.patientPastMedicalRecordsDocuments,
          //     "MedicalRecordsDetails",
          //     pastMedicalRecordsDetailsTemplate,
          //     pastMedicalRecordsDetailsTemplateSchema,
          //     dataMergers.mergeMedicalRecordsDetails
          //   );
          //   updates = {
          //     ...updates,
          //     pastMedicalRecordsDetails: JSON.parse(
          //       JSON.stringify(recordsJson)
          //     ),
          //   };
          //   console.log("UPDATE SUCCESSFUL For Medical Records Details\n");
          // }
          // // Process regular medicines details if present
          // if (doc.regularMedicinesOfPatientDocuments?.length > 0) {
          //   const medicinesJson = await this.processDocuments(
          //     doc.regularMedicinesOfPatientDocuments,
          //     "RegularMedicinesDetails",
          //     regularMedicinesDetailsTemplate,
          //     regularMedicinesDetailsTemplateSchema,
          //     dataMergers.mergeRegularMedicinesDetails
          //   );
          //   updates = {
          //     ...updates,
          //     regularMedicinesDetails: JSON.parse(
          //       JSON.stringify(medicinesJson)
          //     ),
          //   };
          //   console.log("UPDATE SUCCESSFUL For Regular Medicines Details\n");
          // }
          // // Process operation details if present
          // if (doc.operationDetailDocuments?.length > 0) {
          //   const operationJson = await this.processDocuments(
          //     doc.operationDetailDocuments,
          //     "OperationDetails",
          //     operationDetailsTemplate,
          //     operationDetailsTemplateSchema,
          //     dataMergers.mergeOperationDetails
          //   );
          //   updates = {
          //     ...updates,
          //     operationDetails: JSON.parse(JSON.stringify(operationJson)),
          //   };
          //   console.log("UPDATE SUCCESSFUL For Operation Details\n");
          // }
          // // Process doctor's note details if present
          // if (doc.doctorsNoteDocuments?.length > 0) {
          //   const doctorsNoteJson = await this.processDocuments(
          //     doc.doctorsNoteDocuments,
          //     "DoctorsNoteDetails",
          //     doctorNotesDetailsTemplate,
          //     doctorNotesDetailsTemplateSchema,
          //     dataMergers.mergeDoctorNoteDetails
          //   );
          //   updates = {
          //     ...updates,
          //     doctorsNoteDetails: JSON.parse(JSON.stringify(doctorsNoteJson)),
          //   };
          //   console.log("UPDATE SUCCESSFUL For Doctor's Note Details\n");
          // }
          // // Process policy details if present
          // if (doc.policyDocuments?.length > 0) {
          //   const policyJson = await this.processDocuments(
          //     doc.policyDocuments,
          //     "PolicyDetails",
          //     policyDetailsTemplate,
          //     policyDetailsTemplateSchema,
          //     dataMergers.mergePolicyDetails
          //   );
          //   updates = {
          //     ...updates,
          //     policyDetails: JSON.parse(JSON.stringify(policyJson)),
          //   };
          //   console.log("UPDATE SUCCESSFUL For Policy Details\n");
          // }
          // // Final logging of the complete updates object
          // console.log("JSON DATA:", JSON.stringify(updates, null, 2));

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
          console.log("resultForConsistencyCheck done ");

          // Extracting Relevant Medical Data
          const extractedData = extractRelevantMedicalData(updates);

          const promptForRelevantMedicalData =
            fraudDetectionCheck(extractedData);
          const resultForRelevantData = await processor.processPrompt(
            promptForRelevantMedicalData
          );
          geminiOutputCheckData.relevantMedicalDataCheck =
            resultForRelevantData;
          console.log("resultForRelevantData done");

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
          console.log("resultForRelevantBillingData done");

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

          const finalScore =
            Object.values(finalGeminiTestExtract).reduce(
              (sum, value) => sum + value,
              0
            ) / 10;

          geminiOutputCheckData.finalScoreAfterVerification = finalScore;

          console.log(
            "geminiOutputCheckData",
            JSON.stringify(geminiOutputCheckData, null, 2)
          );

          // Determine validation status based on final score
          let validationStatus;
          let summaryAfterVerification;

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

          updates.validationStatus = validationStatus;
          updates.summaryAfterVerification = summaryAfterVerification;

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
