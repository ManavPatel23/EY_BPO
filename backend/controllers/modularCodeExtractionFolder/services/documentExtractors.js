// services/documentExtractors.js
const extractors = {
  getPolicyDetailsPrompt: (template) => {
    return `Extract policy information from this document and return it in the following JSON structure. Follow these rules strictly:
  
  - For number fields (sumAssured, premiumAmount): use null if not found, convert all amounts to numbers without currency symbols or commas
  - For date fields (policyStartDate, policyEndDate): convert to ISO format date strings (YYYY-MM-DD), use null if not found
  - If start/end dates are shown as a period/duration, calculate the end date from the start date and duration
  - Remove any special characters, spaces, or formatting from numbers
  - Handle variations in date formats (DD/MM/YYYY, MM-DD-YYYY, etc.)
  - Remove any currency symbols (₹, $, etc.) from monetary values
  - If sum assured or premium is shown in different units (lakhs, crores), convert to exact number
  Only include fields that are clearly visible in the document.
  Return a clean JSON object without any additional text or explanations.
  
  ${JSON.stringify(template, null, 2)}`;
  },

  getPatientDetailsPrompt: (template) => {
    return `Extract patient personal information from this document and return it in the following JSON structure. Follow these rules strictly:
- For string fields: use null if not found (instead of empty string)
- For number fields: use null if not found
- For date fields: use null if not found
- For arrays: use [] if not found
- For object fields: use {} if not found
- For nested objects (like address): keep the object structure but use null for missing fields
- Calculate age from dateOfBirth if possible
- familyMedicalHistory should be an array of objects with relationWithHim and medicalHistory fields
- Convert all dates to ISO format date strings
Only include fields that are clearly visible in the document.
Do not include any additional text or markdown.

${JSON.stringify(template, null, 2)}`;
  },

  getBillingDetailsPrompt: (template) => {
    return `Extract billing information from this document and return it in the following JSON structure. Follow these rules strictly:
- For string fields: use null if not found (instead of empty string)
- For number fields: use null if not found
- For date fields: convert to ISO format date string, use null if not found
- For arrays: use [] if not found
- For object fields: use {} if not found
- Payment status must be one of: "Paid", "Pending", "Partially Paid"
- Only include itemized charges where both serviceName and totalPrice are present
- All monetary values should be numbers (not strings)
- All quantities should be numbers (not strings)
- totalBillingAmount should include:
  * subTotal (number)
  * taxAmount (sum of all taxes)
  * discountAmount (total discounts)
  * finalAmount (final total after taxes and discounts)
- For patientDetails, extract if present:
  * name (string, null if not found)
  * gender (string, null if not found)
  * bloodGroup (string, null if not found)

${JSON.stringify(template, null, 2)}`;
  },

  getPrescriptionDetailsPrompt: (template) => {
    return `Extract prescription information from this document and return it in the following JSON structure. Follow these rules strictly:
- For string fields: use null if not found (instead of empty string)
- For number fields: use null if not found
- For date fields: convert to ISO format date string, use null if not found
- For arrays: use [] if not found
- For object fields: use {} if not found
- durationUnit must be one of: "days", "weeks", "months"
- Convert all dates (prescriptionDate, followUpDate) to ISO format date strings
- For medicines array:
  * Each medicine must have at least a name
  * duration must be a number (not string)
  * Include only medicines where name is clearly visible
- For patientDetails, extract if present:
  * name (string, null if not found)
  * gender (string, null if not found)
  * bloodGroup (string, null if not found)

${JSON.stringify(template, null, 2)}`;
  },

  getMedicalHistoryDetailsPrompt: (template) => {
    return `You are analyzing a medical document. Generate a medical history record that ONLY includes information explicitly present in the source document.
  
  CRITICAL INSTRUCTIONS:
  1. Set any field to null if the information is not clearly stated in the document
  2. Do not make assumptions or fill in missing data
  3. Keep arrays empty if no relevant information is found
  4. For dates, use ISO format (YYYY-MM-DD) or null if not specified
  5. Use the same keys as mentioned in the input json
  
  Required structure (all fields should be null if not explicitly found):
  - patientDetails:
    - name: (string or null)
    - gender: (string or null)
    - bloodGroup: (string or null)
  - allergies: [] (empty array if none found) or array of:
    { allergy: (string) }
  - chronicConditions: [] (empty array if none found) or array of:
    { name: (string) }
  - majorInjuriesOrTrauma: [] (empty array if none found) or array of:
    {
      nameOf: (string or null)
      dateOf: (valid date string or null)
      recoveryStatus: (string or null)
    }
  - immunizationRecords: [] (empty array if none found) or array of:
    {
      nameOf: (string or null)
      dateOf: (valid date string or null)
    }
  - hospitalRecords: [] (empty array if none found) or array of:
    {
      disease: (string or null)
      diagnosisDetails: (string or null)
      doctorName: (string or null)
      doctorSpecialization: (string or null)
      severity: ("Mild" or "Moderate" or "Severe" or null)
      treatment: {
        type: (string or null)
        details: (string or null)
        duration: (string or null)
        outcome: (string or null)
      }
      dateOfDiagnosis: (valid date string or null)
      dateOfRecovery: (valid date string or null)
      dateOfReport: (valid date string or null)
      followUpRequired: (boolean or null)
      additionalNotes: (string or null)
      hospitalId: (valid MongoDB ObjectId string or null)
    }
  
  IMPORTANT:
  - Only include information that is explicitly stated in the document
  - Use null for any field where information is not clearly provided
  - Keep arrays empty if no relevant information is found
  - Don't invent or assume any information
  - If severity is mentioned, it must be exactly "Mild", "Moderate", or "Severe" - otherwise null
  - Dates must be in proper ISO format or null if not specified
  
  ${JSON.stringify(template, null, 2)}`;
  },

  getMedicalCheckupsDetailsPrompt: (template) => {
    return `You are analyzing a medical document. Generate a medical checkup record that ONLY includes information explicitly present in the source document.
  
  CRITICAL INSTRUCTIONS:
  1. Set any field to null if the information is not clearly stated in the document
  2. Do not make assumptions or fill in missing data
  3. Keep arrays empty if no relevant information is found
  4. For dates, use ISO format (YYYY-MM-DD) or null if not specified
  
  Required structure (all fields should be null if not explicitly found):
  - Patient details:
    - name: (string or null)
    - gender: (string or null)
    - bloodGroup: (string or null)
  - Checkup records: [] (empty array if none found) or array of:
    {
      checkupId: (string or null)
      checkupDate: (valid date string or null)
      checkupType: (string or null)
      symptoms: [] (empty array if none found) or array of:
        { name: (string) }
      diagnosis: (string or null)
      doctorName: (string or null)
      doctorSpecialization: (string or null)
      hospitalName: (string or null)
      vitalSigns: {
        bloodPressure: (string or null)
        temperature: (number or null)
        pulseRate: (number or null)
        respiratoryRate: (number or null)
        oxygenSaturation: (number or null)
      }
      testsRecommended: [] (empty array if none found) or array of:
        {
          testName: (string or null)
          reason: (string or null)
        }
      followUpDate: (valid date string or null)
      recommendations: (string or null)
    }
  
  IMPORTANT:
  - Only include information that is explicitly stated in the document
  - Use null for any field where information is not clearly provided
  - Keep arrays empty if no relevant information is found
  - Don't invent or assume any information
  - Vital signs should be null if not specifically mentioned
  - Blood pressure must be in format "120/80" or null if not specified
  - All numeric values should be null if not explicitly stated
  
  Example of proper null handling:
  {
    "vitalSigns": {
      "bloodPressure": null,
      "temperature": null,
      "pulseRate": 82,  // only included because explicitly found
      "respiratoryRate": null,
      "oxygenSaturation": null
    },
    "symptoms": [],  // empty because none found
    "testsRecommended": []  // empty because none found
  }
  
  ${JSON.stringify(template, null, 2)}`;
  },

  getMedicalRecordsDetailsPrompt: (template) => {
    return `You are analyzing a medical document. Generate a medical records object that ONLY includes information that is explicitly present in the source document.
  
  CRITICAL INSTRUCTIONS:
  1. DO NOT use any information from the template as default values
  2. If a piece of information is not clearly stated in the document, set that field to null
  3. Do not make assumptions or fill in missing data
  4. Do not copy values from the example below - they are just for format reference
  
  Required structure (set any missing fields to null):
  {
    patientDetails: {
      name: (string or null),
      gender: (string or null),
      bloodGroup: (string or null)
    },
    records: [
      {
        recordId: (string or null),
        recordDate: (valid date string or null),
        recordType: (string or null),
        hospitalOrLabName: (string or null),
        resultSummary: (string or null),
        testingFacility: (string or null),
        orderedBy: (string or null),
        normalRange: (string or null),
        observedValues: (string or null),
        interpretation: (string or null),
        criticalFindings: (boolean or null),
        recommendedFollowUp: (string or null)
      }
    ]
  }
  
  IMPORTANT RULES:
  1. If you can't find a specific field in the document, use null
  2. Don't invent or assume any information
  3. Keep the records array empty if no records are found
  4. Dates should be in ISO format (YYYY-MM-DD)
  5. Only include records that are explicitly mentioned
  6. If criticalFindings is not explicitly mentioned, set it to null
  
  Example format (DO NOT COPY THESE VALUES, just use the structure):
  {
    "patientDetails": {
      "name": null,
      "gender": null,
      "bloodGroup": null
    },
    "records": [
      {
        "recordId": null,
        "recordDate": null,
        "recordType": "Blood Test",
        "hospitalOrLabName": null,
        "resultSummary": "Elevated glucose",
        "testingFacility": null,
        "orderedBy": null,
        "normalRange": null,
        "observedValues": null,
        "interpretation": null,
        "criticalFindings": null,
        "recommendedFollowUp": null
      }
    ]
  }
  
  Please process the document and extract ONLY the information that is explicitly present. Return null for any fields where information is not clearly stated:
  
  ${JSON.stringify(template, null, 2)}`;
  },

  getRegularMedicinesDetailsPrompt: (template) => {
    return `You are analyzing a medical document. Generate a medical records object that ONLY includes information that is explicitly present in the source document.
  
  CRITICAL INSTRUCTIONS:
  1. DO NOT use any information from the template as default values
  2. If a piece of information is not clearly stated in the document, set that field to null
  3. Do not make assumptions or fill in missing data
  4. Do not copy values from the example below - they are just for format reference
  
  Required structure (set any missing fields to null):
  {
    patientDetails: {
      name: (string or null),
      gender: (string or null),
      bloodGroup: (string or null)
    },
      medicines: [
      {
        medicineName:(string or null),
        genericName:(string or null),
        dosage:(string or null),
        frequency: { type: Number },
        duration:(string or null),
        purpose:(string or null),
        sideEffects: [] (empty array if none found) or array of:
    { name: (string) },
        startDate: { type: Date },
        endDate: { type: Date },
        prescribedBy:(string or null),
        isActive: { type: Boolean },
        specialInstructions:(string or null),
        interactionWarnings: [] (empty array if none found) or array of:
    { name: (string) },
      },
    ],
  }
  
  IMPORTANT RULES:
  1. If you can't find a specific field in the document, use null
  2. Don't invent or assume any information
  3. Keep the records array empty if no records are found
  4. Dates should be in ISO format (YYYY-MM-DD)
  5. Only include records that are explicitly mentioned
  6. If criticalFindings is not explicitly mentioned, set it to null
  
  Example format (DO NOT COPY THESE VALUES, just use the structure from the provided JSON):
  
  Please process the document and extract ONLY the information that is explicitly present. Return null for any fields where information is not clearly stated:
  
  ${JSON.stringify(template, null, 2)}`;
  },

  getOperationDetailsPrompt: (template) => {
    return `You are analyzing a medical document. Generate an operation details object that ONLY includes information that is explicitly present in the source document.
  
  CRITICAL INSTRUCTIONS:
  1. DO NOT use any information from the template as default values
  2. If a piece of information is not clearly stated in the document, set that field to null
  3. Do not make assumptions or fill in missing data
  4. Do not copy values from the example below - they are just for format reference
  
  Required structure (set any missing fields to null):
  {
    patientDetails: {
      name: (string or null),
      gender: (string or null),
      bloodGroup: (string or null)
    },
    hospitalName : (string or null),
    surgeryName: (string or null),
    surgeryDate: (Date in ISO format or null),
    surgeryType: (string or null),
    surgeonName: (string or null),
    surgeonSpecialization: (string or null),
    anesthesiologist: (string or null),
    assistingSurgeons: [] (empty array if none found) or array of:
      { name: (string) },
    preOpDiagnosisDetails: (string or null),
    postOpDiagnosisDetails: (string or null),
    procedureDetails: (string or null),
    anesthesiaType: (string or null),
    operationDuration: (number in minutes or null),
    complications: [] (empty array if none found) or array of:
      { name: (string) },
    hospitalStayDuration: (number in days or null),
    postOpCare: (string or null),
    recoveryNotes: (string or null),
    followUpInstructions: (string or null)
  }
  
  IMPORTANT RULES:
  1. If you can't find a specific field in the document, use null
  2. Don't invent or assume any information
  3. Keep arrays empty if no relevant information is found
  4. Dates should be in ISO format (YYYY-MM-DD)
  5. Only include information that is explicitly mentioned
  6. Duration fields (operationDuration and hospitalStayDuration) should be numbers only
  7. For arrays (assistingSurgeons and complications), only include items explicitly mentioned
  8. Maintain consistent formatting for all string fields
  9. Do not generate any default values or placeholders
  
  Key Extraction Guidelines:
  - Patient Details: Only include if clearly stated in the document
  - Surgery Information: Extract exact names and dates as written
  - Medical Team: Include only explicitly mentioned personnel
  - Duration: Convert all times to minutes for operationDuration
  - Hospital Stay: Convert all durations to days
  - Complications: List only explicitly mentioned issues
  - Post-Op Information: Include only stated instructions and notes
  
  Example format (DO NOT COPY THESE VALUES, just use the structure):
  
  Please process the document and extract ONLY the information that is explicitly present. Return null for any fields where information is not clearly stated:
  
  ${JSON.stringify(template, null, 2)}`;
  },

  getDoctorsNoteDetailsPrompt: (template) => {
    return `You are analyzing a medical document. Generate a doctor's note object that ONLY includes information that is explicitly present in the source document.
    
    CRITICAL INSTRUCTIONS:
    1. DO NOT use any information from the template as default values.
    2. If a piece of information is not clearly stated in the document, set that field to null.
    3. Do not make assumptions or fill in missing data.
    4. Do not copy values from the example below - they are just for format reference.
    
    Required structure (set any missing fields to null):
    {
      patientDetails: {
        name: (string or null),
        gender: (string or null),
        bloodGroup: (string or null)
      },
      notes: (string or null),
      assessment: (string or null),
      plan: (string or null),
      recommendations: (string or null),
      writtenBy: (string or null),
      designation: (string or null),
      department: (string or null),
      dateWritten: (Date in ISO format or null)
    }
    
    IMPORTANT RULES:
    1. If you can't find a specific field in the document, use null.
    2. Don't invent or assume any information.
    3. Dates should be in ISO format (YYYY-MM-DD).
    4. Only include information that is explicitly mentioned.
    5. Maintain consistent formatting for all string fields.
    6. Do not generate any default values or placeholders.
    
    Key Extraction Guidelines:
    - Patient Details: Only include if clearly stated in the document.
    - Notes: Extract exact notes as written.
    - Assessment: Include only explicitly mentioned assessments.
    - Plan: Include only stated plans.
    - Recommendations: Include only stated recommendations.
    - Doctor's Details: Include only explicitly mentioned personnel.
    - Date: Convert all dates to ISO format (YYYY-MM-DD).
    
    Example format (DO NOT COPY THESE VALUES, just use the structure):
    
    Please process the document and extract ONLY the information that is explicitly present. Return null for any fields where information is not clearly stated:
    
    ${JSON.stringify(template, null, 2)}`;
  },
};

module.exports = extractors;
