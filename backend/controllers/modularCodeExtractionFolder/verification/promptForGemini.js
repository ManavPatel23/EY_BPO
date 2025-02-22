const promptsForGemini = {
  consistenyDetailsCheck: (template) => {
    return `Analyze the following patient details from different medical documents and verify consistency:
       ${JSON.stringify(template, null, 2)}
      Please check and report following these specific rules:
  
      1. Field Priority Weights:
         - Name: 50% of total score (Critical identifier field)
         - Blood Group: 25% of total score
         - Gender: 25% of total score
  
      2. Null Value Handling:
         - Ignore any fields that are null or undefined in documents
         - Only compare fields that have actual values
         - If a field is missing in a document, skip that document for that field's comparison
  
      3. For each field (name, bloodGroup, gender):
         - List all unique non-null values found
         - Compare only between documents where the field has a value
         - Identify discrepancies only between non-null values
         - Calculate consistency based only on documents where the field is present
  
      4. Match Percentage Calculation:
         - Calculate separate consistency scores for each field:
           * Name consistency score (50% weight):
             - If name is consistent across all non-null instances: 50 points
             - If any name discrepancy exists: 0 points
           * Blood Group consistency score (25% weight):
             - Consistent: 25 points
             - Inconsistent: 0 points
           * Gender consistency score (25% weight):
             - Consistent: 25 points
             - Inconsistent: 0 points
         - Final match percentage = Sum of all weighted scores
  
      5. Overall assessment:
         - Mark as inconsistent (isConsistent: false) if name has ANY discrepancy
         - For other fields, note discrepancies but weight them less severely
  
      Please format your response as a JSON with this structure:
      {
          "isConsistent": true/false,
          "fieldAnalysis": {
              "name": {
                  "uniqueValues": ["value1", "value2"],
                  "isConsistent": true/false,
                  "discrepancies": ["document1 vs document2: different values"],
                  "totalDocumentsWithField": number,
                  "documentsWithMatchingValues": number,
                  "fieldScore": number  // Out of 50
              },
              "bloodGroup": {
                  // same structure as name but fieldScore out of 25
              },
              "gender": {
                  // same structure as name but fieldScore out of 25
              }
          },
          "matchPercentage": number,  // Weighted sum of all fieldScores
          "summary": "Detailed explanation of findings, including:
                     - Name consistency status (highest priority)
                     - Other field consistencies
                     - How the weighted match percentage was calculated
                     - Clear indication of which documents were excluded due to null values
                     - Impact of name discrepancies on overall score"
      }
     `;
  },

  fraudDetectionCheck: (medicalData) => {
    return `Analyze the following medical case for potential fraud by evaluating pre-operative care, medical records, operation details, doctor's notes, and overall surgical justification:
  ${JSON.stringify(medicalData, null, 2)}

  **Evaluation Criteria (Fraud Detection vs. Legitimate Case Validation):**

  1. **Pre-Operative Care (Key Indicator)**
     ✅ Legitimate:  
     - **Any** checkup within the **last year** before surgery (not strictly 3 months)  
     - Some indication of progression, even if detailed records are limited  
     - Some specialist involvement preferred but **not mandatory**  

     ❌ Fraud Indicators:  
     - **No medical visits at all** before surgery  
     - Sudden surgery with **no prior mention** of the condition  

  2. **Diagnostic Evidence (Reasonable Proof of Necessity)**
     ✅ Legitimate:  
     - **At least one** piece of supporting medical evidence (imaging, lab tests, or doctor’s notes)  
     - Surgery performed based on **clinical assessment**, even if full diagnostics are missing  

     ❌ Fraud Indicators:  
     - **No supporting documentation at all**  
     - Conflicting reports that contradict the need for surgery  

  3. **Surgical Justification (Medical Necessity)**
     ✅ Legitimate:  
     - **Prior treatment attempts are preferred but not required** if surgery was clearly needed  
     - Direct surgery allowed if the condition was severe and urgent  

     ❌ Fraud Indicators:  
     - **No clear reason** for skipping conservative treatment  
     - No documentation explaining why immediate surgery was chosen  

  4. **Documentation Integrity**
     ✅ Legitimate:  
     - Some missing documents are acceptable if available records **logically support the procedure**  
     - Doctor’s notes should provide a **general timeline** of care  

     ❌ Fraud Indicators:  
     - **Key records completely missing** (e.g., no pre-op notes, no surgery report)  
     - No rationale provided for major medical decisions  

  **Fraud Risk Calculation (More Flexible for Legitimate Cases):**  
  - **0-20%**: No Fraud Risk ✅ (Well-documented, reasonable case)  
  - **21-40%**: Low Risk ⚠️ (Some minor gaps but mostly legitimate)  
  - **41-60%**: Moderate Risk 🚧 (Lacking documentation but case seems reasonable)  
  - **61-80%**: High Risk 🚨 (Major inconsistencies, unclear necessity)  
  - **81-100%**: Critical Fraud Risk ❌ (Severe documentation gaps, likely fraud)  

  **Response Format:**  
  {
      "riskPercentage": number,  
      "riskLevel": "No Fraud Risk" | "Low Risk" | "Moderate Risk" | "High Risk" | "Critical Fraud Risk",  
      "keyFindings": {  
          "strengths": [string],  
          "concerns": [string],  
          "recommendations": [string]  
      },  
      "finalRecommendation": string  
  }`;
  },

  generatePhantomBillingPrompt: (data) => {
    return `Analyze the following medical billing data to identify potential billing irregularities while considering reasonable variations in medical practices and costs. Ensure that the response strictly follows valid JSON format without additional text, markdown formatting, or code blocks.

Conditions to verify:

The totalPrice under Medicine Costs should not exceed ₹10,000.
The totalPrice under Lab Tests should not exceed ₹10,000.
The totalPrice under Nursing Charges should not exceed ₹5,000.
The totalPrice under Other Medical Services should not exceed ₹3,000.
The totalPrice under Doctor Consultation Fees should not exceed ₹10,000.
The totalPrice under Room Charges should not exceed ₹20,000.
The sum of all itemized charges should match totalAmount with an acceptable margin of error of ₹8,000.
Expected Response Format:
Return a valid JSON object structured as follows:

json
Copy
Edit
{
  "insuranceVerification": {
    "medicineCostsWithinLimit": "<Yes/No>",
    "labTestsWithinLimit": "<Yes/No>",
    "nursingChargesWithinLimit": "<Yes/No>",
    "otherMedicalServicesWithinLimit": "<Yes/No>",
    "doctorConsultationFeesWithinLimit": "<Yes/No>",
    "roomChargesWithinLimit": "<Yes/No>",
    "totalBillingAmountValid": "<Yes/No>"
  },
  "fraudAnalysis": {
    "fraudPercentage": <estimated percentage of questionable charges>,
    "riskLevel": "<No Fraud Risk | Low Risk | Moderate Risk | High Risk | Critical Fraud Risk>",
    "billingDetails": [
      {
        "category": "<service category>",
        "amount": <total amount>,
        "concernLevel": "<Minor | Moderate | Significant>",
        "notes": "<observations about the charges dont print the exceeded charges values . >"
      }
    ],
    "finalOutcomeAsSummary": "<overall assessment of billing patterns>"
  }
}
Important Instructions for Response:

The response must be a valid JSON with no markdown, explanations, or additional text.
If there is an issue with the billing, classify the concern level as Minor, Moderate, or Significant.
Ensure consistency and correctness of numerical data.
Medical Billing Data:
${JSON.stringify(data, null, 2)}`;
  },

  giveOverallScorePrompt: (data) => {
    return `Evaluate the following insurance claim JSON data and determine an overall legitimacy score (1-100), where 100 represents the most legitimate claim:

  ${JSON.stringify(data, null, 2)}

Evaluation Criteria:
1. Consistency Check (30% weight)
   - Use matchPercentage directly as the score.

2. Medical Data Check (45% weight)
   - Convert riskPercentage to a legitimacy score using: (100 - riskPercentage).

3. Billing Data Check (25% weight)
   - Convert fraudPercentage to a legitimacy score using: (100 - fraudPercentage).

Final Score Calculation:
(Consistency Score × 0.30) + (Medical Score × 0.45) + (Billing Score × 0.25)

Output Format:
- Individual component scores
- Final weighted legitimacy score (1-100)
- Explanation of calculation
- Claim approval recommendation based on score:
  80-100: ✅ Approved
  60-79: ⚠️ Further Review Required
  Below 60: ❌ Rejected

Provide the final legitimacy score along with the claim approval decision in a structured format.`;
  },

  generateMedicalVerificationPrompt: (policyData, claimData) => {
    return `Analyze ONLY what medical conditions and medicines existed BEFORE the policy purchase date and verify if they were properly disclosed. Any conditions or medications that started after the policy purchase date should NOT be considered as non-disclosures.
  
    INSURANCE POLICY DATA (At time of policy purchase):
    ${JSON.stringify(policyData, null, 2)}
  
    CURRENT CLAIM DATA:
    ${JSON.stringify(claimData, null, 2)}
  
    Instructions for Analysis:
    1. First, identify the policy purchase date
    
    2. For medical history verification, ONLY check:
       - Medical conditions that existed BEFORE policy purchase date
       - Compare these pre-existing conditions against what was disclosed
       - Ignore any conditions that developed after policy purchase
       - Focus only on what should have been known and disclosed at purchase time
  
    3. For regular medicines verification, ONLY check:
       - Medications being taken BEFORE policy purchase date
       - Compare these pre-existing medications against what was disclosed
       - Ignore any medications started after policy purchase
       - Focus only on medicines that should have been disclosed at purchase time
  
    4. Consider reasonable variations:
       - Minor differences in condition names/terminology
       - Slightly different medication brand names
       - Normal variations in reported dates within a reasonable range
  
    Provide analysis in this exact JSON format:
    {
      "verificationScore": <0-100>,
      "nonDisclosures": [
        {
          "category": <"Medical History" | "Regular Medicines">,
          "severity": <"Low" | "Medium" | "High" | "Critical">,
          "description": <string - ONLY include conditions/medicines that existed before policy purchase>,
          "impact": <string>
        }
      ],
      "verificationSummary": {
        "consistencyLevel": <"High" | "Moderate" | "Low">,
        "criticalFindings": <string - ONLY about pre-policy conditions/medicines>,
        "recommendedAction": <"Approve" | "Review" | "Investigate" | "Reject">,
        "explanation": <string - focus ONLY on what should have been disclosed at purchase>
      }
    }
  
    Base the verification score ONLY on pre-policy disclosures:
    - 90-100: All pre-existing conditions and medicines were properly disclosed
    - 70-89: Minor omissions of pre-existing conditions/medicines
    - 50-69: Notable missing disclosures of pre-existing conditions/medicines
    - 30-49: Significant non-disclosure of pre-existing conditions/medicines
    - 0-29: Critical failure to disclose major pre-existing conditions/medicines
  
    IMPORTANT: Do NOT count any conditions or medications that started after the policy purchase date as non-disclosures.`;
  },
};

module.exports = promptsForGemini;
