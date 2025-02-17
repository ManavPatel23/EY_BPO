const extractRelevantMedicalData = (jsonData) => {
  // Extract checkups data
  const checkups =
    jsonData.pastMedicalCheckupsDetails?.checkupRecords.map((checkup) => ({
      date: checkup.checkupDate,
      diagnosis: checkup.diagnosis,
      symptoms: checkup.symptoms.map((s) => s.name),
      doctor: checkup.doctorName,
      specialization: checkup.doctorSpecialization,
      hospital: checkup.hospitalName,
      recommendations: checkup.recommendations,
      vitalSigns: checkup.vitalSigns,
      testsRecommended: checkup.testsRecommended.map((t) => t.testName),
    })) || [];

  // Extract medical records
  const records =
    jsonData.pastMedicalRecordsDetails?.records.map((record) => ({
      date: record.recordDate,
      type: record.recordType,
      facility: record.hospitalOrLabName,
      summary: record.resultSummary,
      interpretation: record.interpretation,
      criticalFindings: record.criticalFindings,
    })) || [];

  // Extract operation details
  const operation = {
    surgeryName: jsonData.operationDetails?.surgeryName,
    surgeryDate: jsonData.operationDetails?.surgeryDate,
    surgeon: jsonData.operationDetails?.surgeonName,
    surgeonSpecialization: jsonData.operationDetails?.surgeonSpecialization,
    preOpDiagnosis: jsonData.operationDetails?.preOpDiagnosisDetails,
    postOpDiagnosis: jsonData.operationDetails?.postOpDiagnosisDetails,
    complications: jsonData.operationDetails?.complications,
    hospital: jsonData.operationDetails?.hospitalName,
  };

  // Extract doctor's notes
  const doctorsNotes = {
    assessment: jsonData.doctorsNoteDetails?.assessment,
    plan: jsonData.doctorsNoteDetails?.plan,
    writtenBy: jsonData.doctorsNoteDetails?.writtenBy,
    dateWritten: jsonData.doctorsNoteDetails?.dateWritten,
  };

  return {
    checkups,
    records,
    operation,
    doctorsNotes,
  };
};


function extractRelevantBillingData(patientData) {
  const {
      patientPersonalDetails,
      billingDetails,
      operationDetails,
      prescriptionsDetails,
      medicalHistoryDetails
  } = patientData;

  return {
      patient: {
          name: patientPersonalDetails.fullName,
          age: patientPersonalDetails.age,
          gender: patientPersonalDetails.gender,
          medicalConditions: medicalHistoryDetails.chronicConditions.map(c => c.name),
          allergies: patientPersonalDetails.allergies.map(a => a.allergy)
      },
      diagnosis: prescriptionsDetails.diagnosis,
      operation: {
          name: operationDetails.surgeryName,
          date: operationDetails.surgeryDate,
          duration: operationDetails.operationDuration,
          hospitalStay: operationDetails.hospitalStayDuration,
          complications: operationDetails.complications?.map(c => c.name) || [],
          anesthesiaType: operationDetails.anesthesiaType,
          surgeons: [
              operationDetails.surgeonName,
              ...(operationDetails.assistingSurgeons?.map(s => s.name) || [])
          ]
      },
      billing: {
          billId: billingDetails.billId,
          hospitalName: billingDetails.hospitalName,
          date: billingDetails.date,
          totalAmount: billingDetails.totalBillingAmount.finalAmount,
          itemizedCharges: billingDetails.itemizedCharges,
          taxes: billingDetails.taxes,
          paymentStatus: billingDetails.paymentStatus
      }
  };
}

module.exports = { extractRelevantMedicalData ,extractRelevantBillingData };
