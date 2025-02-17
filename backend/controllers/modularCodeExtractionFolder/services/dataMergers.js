const mongoose = require("mongoose");

const dataMergers = {
  mergePolicyDetails: (existing, extracted) => {
    // Helper function to parse and validate dates
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return date instanceof Date && !isNaN(date) ? date : null;
    };

    // Helper function to parse and validate numbers
    const parseNumber = (value) => {
      if (value === null || value === undefined) return null;
      const num = Number(value.toString().replace(/[^0-9.-]/g, ""));
      return isNaN(num) ? null : num;
    };

    return {
      policyStartDate:
        parseDate(extracted.policyStartDate) ||
        existing.policyStartDate ||
        null,
      policyEndDate:
        parseDate(extracted.policyEndDate) || existing.policyEndDate || null,
      sumAssured:
        parseNumber(extracted.sumAssured) || existing.sumAssured || null,
      premiumAmount:
        parseNumber(extracted.premiumAmount) || existing.premiumAmount || null,
    };
  },

  mergePatientDetails(existing, new_data) {
    const merged = { ...existing };

    // Merge simple fields
    for (const [key, value] of Object.entries(new_data)) {
      if (
        value &&
        value !== "" &&
        value !== null &&
        !Array.isArray(value) &&
        typeof value !== "object"
      ) {
        merged[key] = value;
      }
    }

    // Merge address
    if (new_data.address) {
      merged.address = {
        street: new_data.address.street || existing.address.street,
        city: new_data.address.city || existing.address.city,
        state: new_data.address.state || existing.address.state,
        country: new_data.address.country || existing.address.country,
        pincode: new_data.address.pincode || existing.address.pincode,
      };
    }

    // Merge emergency contact
    if (new_data.emergencyContact) {
      merged.emergencyContact = {
        name: new_data.emergencyContact.name || existing.emergencyContact.name,
        relationship:
          new_data.emergencyContact.relationship ||
          existing.emergencyContact.relationship,
        phone:
          new_data.emergencyContact.phone || existing.emergencyContact.phone,
      };
    }

    // Merge arrays (allergies)
    if (new_data.allergies && new_data.allergies.length > 0) {
      merged.allergies = [
        ...new Set([...existing.allergies, ...new_data.allergies]),
      ];
    }

    // Merge family medical history
    if (
      new_data.familyMedicalHistory &&
      new_data.familyMedicalHistory.length > 0
    ) {
      merged.familyMedicalHistory = [
        ...existing.familyMedicalHistory,
        ...new_data.familyMedicalHistory.filter(
          (newRecord) =>
            !existing.familyMedicalHistory.some(
              (existingRecord) =>
                existingRecord.relationWithHim === newRecord.relationWithHim
            )
        ),
      ];
    }

    return merged;
  },
  mergeBillingDetails: (existing, new_data) => {
    const merged = { ...existing };

    // Merge simple fields
    for (const [key, value] of Object.entries(new_data)) {
      if (value && !Array.isArray(value) && typeof value !== "object") {
        merged[key] = value;
      }
    }

    // Merge patientDetails
    if (new_data.patientDetails) {
      merged.patientDetails = {
        name: new_data.patientDetails.name || existing.patientDetails?.name,
        gender:
          new_data.patientDetails.gender || existing.patientDetails?.gender,
        bloodGroup:
          new_data.patientDetails.bloodGroup ||
          existing.patientDetails?.bloodGroup,
      };
    }

    // Merge itemized charges
    if (new_data.itemizedCharges?.length > 0) {
      merged.itemizedCharges = [
        ...(existing.itemizedCharges || []),
        ...new_data.itemizedCharges,
      ];
    }

    // Merge taxes
    if (new_data.taxes) {
      merged.taxes = {
        cgst: new_data.taxes.cgst || existing.taxes?.cgst,
        sgst: new_data.taxes.sgst || existing.taxes?.sgst,
        totalTax: new_data.taxes.totalTax || existing.taxes?.totalTax,
      };
    }

    // merge total billing amount
    if (new_data.totalBillingAmount) {
      merged.totalBillingAmount = {
        subTotal:
          new_data.totalBillingAmount.subTotal ||
          existing.totalBillingAmount?.subTotal,
        taxAmount:
          new_data.totalBillingAmount.taxAmount ||
          existing.totalBillingAmount?.taxAmount,
        discountAmount:
          new_data.totalBillingAmount.discountAmount ||
          existing.totalBillingAmount?.discountAmount,
        finalAmount:
          new_data.totalBillingAmount.finalAmount ||
          existing.totalBillingAmount?.finalAmount,
      };
    }
    return merged;
  },

  mergePrescriptionDetails: (existing, new_data) => {
    const merged = { ...existing };

    // Merge simple fields
    for (const [key, value] of Object.entries(new_data)) {
      if (value && !Array.isArray(value) && typeof value !== "object") {
        merged[key] = value;
      }
    }

    // Merge patientDetails
    if (new_data.patientDetails) {
      merged.patientDetails = {
        name: new_data.patientDetails.name || existing.patientDetails?.name,
        gender:
          new_data.patientDetails.gender || existing.patientDetails?.gender,
        bloodGroup:
          new_data.patientDetails.bloodGroup ||
          existing.patientDetails?.bloodGroup,
      };
    }

    // Merge medicines
    if (new_data.medicines?.length > 0) {
      merged.medicines = [...(existing.medicines || []), ...new_data.medicines];
    }

    return merged;
  },

  mergeMedicalHistoryDetails: (existing, new_data) => {
    const merged = { ...existing };

    // Merge patient details
    merged.patientDetails = {
      name:
        new_data.patientDetails?.name || existing.patientDetails?.name || null,
      gender:
        new_data.patientDetails?.gender ||
        existing.patientDetails?.gender ||
        null,
      bloodGroup:
        new_data.patientDetails?.bloodGroup ||
        existing.patientDetails?.bloodGroup ||
        null,
    };

    // Merge allergies - ensure uniqueness
    if (new_data.allergies?.length > 0) {
      const existingAllergies = new Set(
        existing.allergies?.map((a) => a.allergy) || []
      );
      merged.allergies = [
        ...(existing.allergies || []),
        ...new_data.allergies
          .filter((a) => a.allergy && !existingAllergies.has(a.allergy))
          .map((a) => ({ allergy: a.allergy })),
      ];
    } else {
      merged.allergies = existing.allergies || [];
    }

    // Merge chronic conditions - ensure uniqueness
    if (new_data.chronicConditions?.length > 0) {
      const existingConditions = new Set(
        existing.chronicConditions?.map((c) => c.name) || []
      );
      merged.chronicConditions = [
        ...(existing.chronicConditions || []),
        ...new_data.chronicConditions
          .filter((c) => c.name && !existingConditions.has(c.name))
          .map((c) => ({ name: c.name })),
      ];
    } else {
      merged.chronicConditions = existing.chronicConditions || [];
    }

    // Merge major injuries/trauma
    if (new_data.majorInjuriesOrTrauma?.length > 0) {
      const existingInjuries = new Map(
        (existing.majorInjuriesOrTrauma || []).map((injury) => [
          `${injury.nameOf}-${injury.dateOf}`,
          injury,
        ])
      );

      new_data.majorInjuriesOrTrauma.forEach((injury) => {
        if (!injury.nameOf) return;
        const key = `${injury.nameOf}-${injury.dateOf}`;

        if (!existingInjuries.has(key)) {
          existingInjuries.set(key, {
            nameOf: injury.nameOf,
            dateOf: injury.dateOf ? new Date(injury.dateOf) : null,
            recoveryStatus: injury.recoveryStatus || null,
          });
        }
      });

      merged.majorInjuriesOrTrauma = Array.from(existingInjuries.values());
    } else {
      merged.majorInjuriesOrTrauma = existing.majorInjuriesOrTrauma || [];
    }

    // Merge immunization records
    if (new_data.immunizationRecords?.length > 0) {
      const existingImmunizations = new Map(
        (existing.immunizationRecords || []).map((record) => [
          `${record.nameOf}-${record.dateOf}`,
          record,
        ])
      );

      new_data.immunizationRecords.forEach((record) => {
        if (!record.nameOf) return;
        const key = `${record.nameOf}-${record.dateOf}`;

        if (!existingImmunizations.has(key)) {
          existingImmunizations.set(key, {
            nameOf: record.nameOf,
            dateOf: record.dateOf ? new Date(record.dateOf) : null,
          });
        }
      });

      merged.immunizationRecords = Array.from(existingImmunizations.values());
    } else {
      merged.immunizationRecords = existing.immunizationRecords || [];
    }

    // Merge hospital records
    if (new_data.hospitalRecords?.length > 0) {
      const existingRecords = new Map(
        (existing.hospitalRecords || []).map((record) => [
          `${record.disease}-${record.dateOfDiagnosis}-${record.hospitalName}`,
          record,
        ])
      );

      new_data.hospitalRecords.forEach((record) => {
        if (!record.disease || !record.dateOfDiagnosis) return;
        const key = `${record.disease}-${record.dateOfDiagnosis}-${record.hospitalName}`;

        const existingRecord = existingRecords.get(key);
        if (existingRecord) {
          // Update existing record with new data if provided
          existingRecords.set(key, {
            ...existingRecord,
            diagnosisDetails:
              record.diagnosisDetails ||
              existingRecord.diagnosisDetails ||
              null,
            severity: record.severity || existingRecord.severity || null,
            treatment: {
              type:
                record.treatment?.type ||
                existingRecord.treatment?.type ||
                null,
              details:
                record.treatment?.details ||
                existingRecord.treatment?.details ||
                null,
              duration:
                record.treatment?.duration ||
                existingRecord.treatment?.duration ||
                null,
              outcome:
                record.treatment?.outcome ||
                existingRecord.treatment?.outcome ||
                null,
            },
            doctorName: record.doctorName || existingRecord.doctorName || null,
            doctorSpecialization:
              record.doctorSpecialization ||
              existingRecord.doctorSpecialization ||
              null,
            hospitalName:
              record.hospitalName || existingRecord.hospitalName || null,
            // Only set hospitalId if it's a valid ObjectId or null
            hospitalId:
              record.hospitalId &&
              mongoose.Types.ObjectId.isValid(record.hospitalId)
                ? record.hospitalId
                : existingRecord.hospitalId || null,
            dateOfDiagnosis: record.dateOfDiagnosis
              ? new Date(record.dateOfDiagnosis)
              : existingRecord.dateOfDiagnosis,
            dateOfRecovery: record.dateOfRecovery
              ? new Date(record.dateOfRecovery)
              : existingRecord.dateOfRecovery,
            dateOfReport: record.dateOfReport
              ? new Date(record.dateOfReport)
              : existingRecord.dateOfReport,
            followUpRequired:
              record.followUpRequired ??
              existingRecord.followUpRequired ??
              null,
            additionalNotes:
              record.additionalNotes || existingRecord.additionalNotes || null,
          });
        } else {
          // Add new record
          existingRecords.set(key, {
            disease: record.disease,
            diagnosisDetails: record.diagnosisDetails || null,
            severity: record.severity || null,
            treatment: {
              type: record.treatment?.type || null,
              details: record.treatment?.details || null,
              duration: record.treatment?.duration || null,
              outcome: record.treatment?.outcome || null,
            },
            doctorName: record.doctorName || null,
            doctorSpecialization: record.doctorSpecialization || null,
            hospitalName: record.hospitalName || null,
            // Only set hospitalId if it's a valid ObjectId, otherwise null
            hospitalId:
              record.hospitalId &&
              mongoose.Types.ObjectId.isValid(record.hospitalId)
                ? record.hospitalId
                : null,
            dateOfDiagnosis: record.dateOfDiagnosis
              ? new Date(record.dateOfDiagnosis)
              : null,
            dateOfRecovery: record.dateOfRecovery
              ? new Date(record.dateOfRecovery)
              : null,
            dateOfReport: record.dateOfReport
              ? new Date(record.dateOfReport)
              : null,
            followUpRequired: record.followUpRequired ?? null,
            additionalNotes: record.additionalNotes || null,
          });
        }
      });

      merged.hospitalRecords = Array.from(existingRecords.values());
    } else {
      merged.hospitalRecords = existing.hospitalRecords || [];
    }

    return merged;
  },

  mergeMedicalCheckupsDetails: (existing, new_data) => {
    // Helper function to check if value is a valid array with content
    const isValidArray = (arr) =>
      Array.isArray(arr) && arr.length > 0 && !arr.includes("[Array]");

    // Helper function to check if value is a valid object with content
    const isValidObject = (obj) =>
      obj &&
      typeof obj === "object" &&
      !Object.values(obj).includes("[Object]");

    const merged = { ...existing };

    // Merge patient details
    merged.patientDetails = {
      name:
        new_data.patientDetails?.name || existing.patientDetails?.name || null,
      gender:
        new_data.patientDetails?.gender ||
        existing.patientDetails?.gender ||
        null,
      bloodGroup:
        new_data.patientDetails?.bloodGroup ||
        existing.patientDetails?.bloodGroup ||
        null,
    };

    // Merge checkup records
    if (isValidArray(new_data.checkupRecords)) {
      const existingCheckups = new Map(
        (existing.checkupRecords || []).map((record) => [
          record.checkupId || `CHK${record.checkupDate}${record.doctorName}`,
          record,
        ])
      );

      new_data.checkupRecords.forEach((record) => {
        // Generate checkupId if null
        const checkupId =
          record.checkupId || `CHK${record.checkupDate}${record.doctorName}`;

        if (!checkupId) return;

        const existingRecord = existingCheckups.get(checkupId);
        if (existingRecord) {
          // Update existing record
          existingCheckups.set(checkupId, {
            ...existingRecord,
            checkupId,
            checkupDate: record.checkupDate
              ? new Date(record.checkupDate)
              : existingRecord.checkupDate,
            checkupType:
              record.checkupType ||
              existingRecord.checkupType ||
              "Regular Checkup",
            symptoms: isValidArray(record.symptoms)
              ? record.symptoms.map((s) => ({ name: s.name }))
              : isValidArray(existingRecord.symptoms)
              ? existingRecord.symptoms
              : [],
            diagnosis: record.diagnosis || existingRecord.diagnosis,
            doctorName: record.doctorName || existingRecord.doctorName,
            doctorSpecialization:
              record.doctorSpecialization ||
              existingRecord.doctorSpecialization ||
              "General Physician",
            hospitalName: record.hospitalName || existingRecord.hospitalName,
            vitalSigns: isValidObject(record.vitalSigns)
              ? record.vitalSigns
              : isValidObject(existingRecord.vitalSigns)
              ? existingRecord.vitalSigns
              : {
                  bloodPressure: null,
                  temperature: null,
                  pulseRate: null,
                  respiratoryRate: null,
                  oxygenSaturation: null,
                },
            testsRecommended: isValidArray(record.testsRecommended)
              ? record.testsRecommended
              : isValidArray(existingRecord.testsRecommended)
              ? existingRecord.testsRecommended
              : [],
            followUpDate: record.followUpDate
              ? new Date(record.followUpDate)
              : existingRecord.followUpDate,
            recommendations:
              record.recommendations || existingRecord.recommendations,
          });
        } else {
          // Add new record
          existingCheckups.set(checkupId, {
            checkupId,
            checkupDate: record.checkupDate
              ? new Date(record.checkupDate)
              : null,
            checkupType: record.checkupType || "Regular Checkup",
            symptoms: isValidArray(record.symptoms)
              ? record.symptoms.map((s) => ({ name: s.name }))
              : [],
            diagnosis: record.diagnosis || null,
            doctorName: record.doctorName || null,
            doctorSpecialization:
              record.doctorSpecialization || "General Physician",
            hospitalName: record.hospitalName || null,
            vitalSigns: isValidObject(record.vitalSigns)
              ? record.vitalSigns
              : {
                  bloodPressure: null,
                  temperature: null,
                  pulseRate: null,
                  respiratoryRate: null,
                  oxygenSaturation: null,
                },
            testsRecommended: isValidArray(record.testsRecommended)
              ? record.testsRecommended
              : [],
            followUpDate: record.followUpDate
              ? new Date(record.followUpDate)
              : null,
            recommendations: record.recommendations || null,
          });
        }
      });

      merged.checkupRecords = Array.from(existingCheckups.values());
    } else {
      merged.checkupRecords = existing.checkupRecords || [];
    }

    return merged;
  },

  mergeMedicalRecordsDetails: (existing, new_data) => {
    // Helper function to check if value is a valid array with content
    const isValidArray = (arr) =>
      Array.isArray(arr) && arr.length > 0 && !arr.includes("[Array]");

    const merged = { ...existing };

    // Merge patient details
    merged.patientDetails = {
      name:
        new_data.patientDetails?.name || existing.patientDetails?.name || null,
      gender:
        new_data.patientDetails?.gender ||
        existing.patientDetails?.gender ||
        null,
      bloodGroup:
        new_data.patientDetails?.bloodGroup ||
        existing.patientDetails?.bloodGroup ||
        null,
    };

    // Merge medical records
    if (isValidArray(new_data.records)) {
      const existingRecords = new Map(
        (existing.records || []).map((record) => [
          record.recordId || `REC${record.recordDate}${record.recordType}`,
          record,
        ])
      );

      new_data.records.forEach((record) => {
        // Generate recordId if null
        const recordId =
          record.recordId || `REC${record.recordDate}${record.recordType}`;

        if (!recordId) return;

        const existingRecord = existingRecords.get(recordId);
        if (existingRecord) {
          // Update existing record
          existingRecords.set(recordId, {
            ...existingRecord,
            recordId,
            recordDate: record.recordDate
              ? new Date(record.recordDate)
              : existingRecord.recordDate,
            recordType: record.recordType || existingRecord.recordType,
            hospitalOrLabName:
              record.hospitalOrLabName || existingRecord.hospitalOrLabName,
            resultSummary: record.resultSummary || existingRecord.resultSummary,
            testingFacility:
              record.testingFacility || existingRecord.testingFacility,
            orderedBy: record.orderedBy || existingRecord.orderedBy,
            normalRange: record.normalRange || existingRecord.normalRange,
            observedValues:
              record.observedValues || existingRecord.observedValues,
            interpretation:
              record.interpretation || existingRecord.interpretation,
            criticalFindings:
              record.criticalFindings ??
              existingRecord.criticalFindings ??
              false,
            recommendedFollowUp:
              record.recommendedFollowUp || existingRecord.recommendedFollowUp,
          });
        } else {
          // Add new record
          existingRecords.set(recordId, {
            recordId,
            recordDate: record.recordDate ? new Date(record.recordDate) : null,
            recordType: record.recordType || null,
            hospitalOrLabName: record.hospitalOrLabName || null,
            resultSummary: record.resultSummary || null,
            testingFacility: record.testingFacility || null,
            orderedBy: record.orderedBy || null,
            normalRange: record.normalRange || null,
            observedValues: record.observedValues || null,
            interpretation: record.interpretation || null,
            criticalFindings: record.criticalFindings ?? false,
            recommendedFollowUp: record.recommendedFollowUp || null,
          });
        }
      });

      merged.records = Array.from(existingRecords.values());
    } else {
      merged.records = existing.records || [];
    }

    return merged;
  },

  mergeRegularMedicinesDetails: (existing, new_data) => {
    const isValidArray = (arr) =>
      Array.isArray(arr) && arr.length > 0 && !arr.includes("[Array]");

    const merged = { ...existing };

    // Merge patient details
    merged.patientDetails = {
      name:
        new_data.patientDetails?.name || existing.patientDetails?.name || null,
      gender:
        new_data.patientDetails?.gender ||
        existing.patientDetails?.gender ||
        null,
      bloodGroup:
        new_data.patientDetails?.bloodGroup ||
        existing.patientDetails?.bloodGroup ||
        null,
    };

    // Merge medicines
    if (isValidArray(new_data.medicines)) {
      const existingMedicines = new Map(
        (existing.medicines || []).map((medicine) => [
          medicine.medicineName,
          medicine,
        ])
      );

      new_data.medicines.forEach((medicine) => {
        if (!medicine.medicineName) return;

        const existingMedicine = existingMedicines.get(medicine.medicineName);
        if (existingMedicine) {
          // Merge side effects arrays
          const mergedSideEffects = [
            ...(existingMedicine.sideEffects || []),
            ...(medicine.sideEffects || []),
          ].filter(
            (effect, index, self) =>
              index === self.findIndex((e) => e.name === effect.name)
          );

          // Merge interaction warnings arrays
          const mergedWarnings = [
            ...(existingMedicine.interactionWarnings || []),
            ...(medicine.interactionWarnings || []),
          ].filter(
            (warning, index, self) =>
              index === self.findIndex((w) => w.name === warning.name)
          );

          // Update existing medicine
          existingMedicines.set(medicine.medicineName, {
            ...existingMedicine,
            medicineName: medicine.medicineName,
            genericName: medicine.genericName || existingMedicine.genericName,
            dosage: medicine.dosage || existingMedicine.dosage,
            frequency: medicine.frequency || existingMedicine.frequency,
            duration: medicine.duration || existingMedicine.duration,
            purpose: medicine.purpose || existingMedicine.purpose,
            sideEffects: mergedSideEffects,
            startDate: medicine.startDate
              ? new Date(medicine.startDate)
              : existingMedicine.startDate,
            endDate: medicine.endDate
              ? new Date(medicine.endDate)
              : existingMedicine.endDate,
            prescribedBy:
              medicine.prescribedBy || existingMedicine.prescribedBy,
            isActive: medicine.isActive ?? existingMedicine.isActive ?? true,
            specialInstructions:
              medicine.specialInstructions ||
              existingMedicine.specialInstructions,
            interactionWarnings: mergedWarnings,
          });
        } else {
          // Add new medicine
          existingMedicines.set(medicine.medicineName, {
            medicineName: medicine.medicineName,
            genericName: medicine.genericName || null,
            dosage: medicine.dosage || null,
            frequency: medicine.frequency || null,
            duration: medicine.duration || null,
            purpose: medicine.purpose || null,
            sideEffects: medicine.sideEffects || [],
            startDate: medicine.startDate ? new Date(medicine.startDate) : null,
            endDate: medicine.endDate ? new Date(medicine.endDate) : null,
            prescribedBy: medicine.prescribedBy || null,
            isActive: medicine.isActive ?? true,
            specialInstructions: medicine.specialInstructions || null,
            interactionWarnings: medicine.interactionWarnings || [],
          });
        }
      });

      merged.medicines = Array.from(existingMedicines.values());
    } else {
      merged.medicines = existing.medicines || [];
    }

    return merged;
  },

  mergeOperationDetails: (existing, new_data) => {
    // Helper function to check if value is a valid array with content
    const isValidArray = (arr) =>
      Array.isArray(arr) && arr.length > 0 && !arr.includes("[Array]");

    const merged = { ...existing };

    // Merge patient details
    merged.patientDetails = {
      name:
        new_data.patientDetails?.name || existing.patientDetails?.name || null,
      gender:
        new_data.patientDetails?.gender ||
        existing.patientDetails?.gender ||
        null,
      bloodGroup:
        new_data.patientDetails?.bloodGroup ||
        existing.patientDetails?.bloodGroup ||
        null,
    };

    // Merge operation details
    merged.surgeryName = new_data.surgeryName || existing.surgeryName || null;
    merged.surgeryDate = new_data.surgeryDate
      ? new Date(new_data.surgeryDate)
      : existing.surgeryDate || null;
    merged.surgeryType = new_data.surgeryType || existing.surgeryType || null;
    merged.surgeonName = new_data.surgeonName || existing.surgeonName || null;
    merged.surgeonSpecialization =
      new_data.surgeonSpecialization || existing.surgeonSpecialization || null;
    merged.anesthesiologist =
      new_data.anesthesiologist || existing.anesthesiologist || null;

    // Merge assisting surgeons array
    if (isValidArray(new_data.assistingSurgeons)) {
      const existingAssistingSurgeons = new Set(
        (existing.assistingSurgeons || []).map((surgeon) => surgeon.name)
      );

      merged.assistingSurgeons = [
        ...(existing.assistingSurgeons || []),
        ...new_data.assistingSurgeons.filter(
          (surgeon) => !existingAssistingSurgeons.has(surgeon.name)
        ),
      ];
    } else {
      merged.assistingSurgeons = existing.assistingSurgeons || [];
    }

    // Merge complications array
    if (isValidArray(new_data.complications)) {
      const existingComplications = new Set(
        (existing.complications || []).map((complication) => complication.name)
      );

      merged.complications = [
        ...(existing.complications || []),
        ...new_data.complications.filter(
          (complication) => !existingComplications.has(complication.name)
        ),
      ];
    } else {
      merged.complications = existing.complications || [];
    }

    // Merge other fields
    merged.preOpDiagnosisDetails =
      new_data.preOpDiagnosisDetails || existing.preOpDiagnosisDetails || null;
    merged.postOpDiagnosisDetails =
      new_data.postOpDiagnosisDetails ||
      existing.postOpDiagnosisDetails ||
      null;
    merged.procedureDetails =
      new_data.procedureDetails || existing.procedureDetails || null;
    merged.anesthesiaType =
      new_data.anesthesiaType || existing.anesthesiaType || null;
    merged.operationDuration =
      new_data.operationDuration || existing.operationDuration || null;
    merged.hospitalStayDuration =
      new_data.hospitalStayDuration || existing.hospitalStayDuration || null;
    merged.postOpCare = new_data.postOpCare || existing.postOpCare || null;
    merged.recoveryNotes =
      new_data.recoveryNotes || existing.recoveryNotes || null;
    merged.followUpInstructions =
      new_data.followUpInstructions || existing.followUpInstructions || null;

    return merged;
  },

  mergeDoctorNoteDetails: (existing, new_data) => {
    const merged = { ...existing };

    // Merge patient details
    merged.patientDetails = {
      name:
        new_data.patientDetails?.name || existing.patientDetails?.name || null,
      gender:
        new_data.patientDetails?.gender ||
        existing.patientDetails?.gender ||
        null,
      bloodGroup:
        new_data.patientDetails?.bloodGroup ||
        existing.patientDetails?.bloodGroup ||
        null,
    };

    // Merge doctor's note details
    merged.notes = new_data.notes || existing.notes || null;
    merged.assessment = new_data.assessment || existing.assessment || null;
    merged.plan = new_data.plan || existing.plan || null;
    merged.recommendations =
      new_data.recommendations || existing.recommendations || null;

    // Merge doctor's details
    merged.writtenBy = new_data.writtenBy || existing.writtenBy || null;
    merged.designation = new_data.designation || existing.designation || null;
    merged.department = new_data.department || existing.department || null;

    // Merge dateWritten
    merged.dateWritten = new_data.dateWritten
      ? new Date(new_data.dateWritten)
      : existing.dateWritten || null;

    return merged;
  },
};

module.exports = dataMergers;
