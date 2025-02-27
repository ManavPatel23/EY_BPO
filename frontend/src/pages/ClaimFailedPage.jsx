import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "@/constant";

const ClaimFailedPage = () => {
  const navigate = useNavigate();
  const { claimId } = useParams();
  const [claim, setClaim] = useState(null);
  const [status, setStatus] = useState("Loading claim details...");
  const [errorData, setErrorData] = useState(null);

  useEffect(() => {
    if (claimId) {
      fetchClaimData(claimId);
    }
  }, [claimId]);

  const fetchClaimData = async (id) => {
    try {
      setStatus("Fetching claim data...");
      const response = await axios.get(`${BACKEND_URL}/hosp/claim/${id}`);

      if (!response.data.success) {
        throw new Error("Failed to fetch claim details");
      }

      const data = response.data.claim;
      setClaim(data);

      // Parse the JSON data from summaryAfterVerification if it exists
      if (data && data.summaryAfterVerification) {
        try {
          const parsedData = JSON.parse(data.summaryAfterVerification);
          setErrorData(parsedData);
        } catch (e) {
          console.error("Error parsing verification data:", e);
          setErrorData({ error: "Unable to parse verification data" });
        }
      }

      setStatus("");
    } catch (error) {
      setStatus(`Error fetching claim: ${error.message}`);
    }
  };

  // Renders each section of error data
  const renderConsistencyCheck = (data) => {
    if (!data) return null;

    return (
      <div className="bg-red-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Data Consistency Issues</h3>
        <div className="flex items-center mb-3">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mr-4">
            <span className="text-2xl font-bold text-red-600">
              {data.matchPercentage}%
            </span>
          </div>
          <div>
            <p className="font-medium">Data Consistency Score</p>
            <p className="text-sm text-gray-600">
              Documents with matching information
            </p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-2">Field Discrepancies:</h4>
          <ul className="list-disc pl-5 space-y-2">
            {Object.entries(data.fieldAnalysis).map(
              ([field, analysis]) =>
                !analysis.isConsistent && (
                  <li key={field} className="text-sm">
                    <span className="font-medium">{field}:</span>
                    <ul className="list-disc pl-5 mt-1">
                      {analysis.discrepancies.map((discrepancy, i) => (
                        <li key={i} className="text-red-600">
                          {discrepancy}
                        </li>
                      ))}
                    </ul>
                  </li>
                )
            )}
          </ul>
        </div>

        <div className="mt-4 text-sm bg-red-100 p-3 rounded">
          <p className="font-medium">Summary:</p>
          <p>{data.summary}</p>
        </div>
      </div>
    );
  };

  const renderMedicalDataCheck = (data) => {
    if (!data) return null;

    return (
      <div className="bg-red-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Medical Data Issues</h3>

        <div className="flex items-center mb-3">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mr-4">
            <span className="text-2xl font-bold text-red-600">
              {data.riskPercentage}%
            </span>
          </div>
          <div>
            <p className="font-medium">{data.riskLevel}</p>
            <p className="text-sm text-gray-600">
              Medical Data Risk Assessment
            </p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-2">Key Concerns:</h4>
          <ul className="list-disc pl-5">
            {data.keyFindings.concerns.map((concern, i) => (
              <li key={i} className="text-sm mb-2 text-red-600">
                {concern}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-2">Recommendations:</h4>
          <ul className="list-disc pl-5">
            {data.keyFindings.recommendations.map((rec, i) => (
              <li key={i} className="text-sm mb-2">
                {rec}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 text-sm bg-red-100 p-3 rounded">
          <p className="font-medium">Final Recommendation:</p>
          <p>{data.finalRecommendation}</p>
        </div>
      </div>
    );
  };

  const renderBillingDataCheck = (data) => {
    if (!data) return null;

    return (
      <div className="bg-red-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Billing Issues</h3>

        <div className="flex items-center mb-3">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mr-4">
            <span className="text-2xl font-bold text-red-600">
              {data.fraudAnalysis.fraudPercentage}%
            </span>
          </div>
          <div>
            <p className="font-medium">{data.fraudAnalysis.riskLevel}</p>
            <p className="text-sm text-gray-600">Billing Risk Assessment</p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-2">Insurance Coverage Issues:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(data.insuranceVerification).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <span
                  className={`w-4 h-4 rounded-full mr-2 ${
                    value === "Yes" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                <span>
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^\w/, (c) => c.toUpperCase())}
                  : {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-2">Billing Concerns:</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-red-100">
                  <th className="py-2 px-3 text-left">Category</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                  <th className="py-2 px-3 text-left">Concern Level</th>
                  <th className="py-2 px-3 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.fraudAnalysis.billingDetails.map((item, i) => (
                  <tr key={i} className="border-b border-red-200">
                    <td className="py-2 px-3">{item.category}</td>
                    <td className="py-2 px-3 text-right">₹{item.amount}</td>
                    <td className="py-2 px-3">{item.concernLevel}</td>
                    <td className="py-2 px-3">{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm bg-red-100 p-3 rounded">
          <p className="font-medium">Final Assessment:</p>
          <p>{data.fraudAnalysis.finalOutcomeAsSummary}</p>
        </div>
      </div>
    );
  };

  // Main render
  if (status) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg">{status}</p>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg">
            <p className="text-lg font-medium">No claim data found</p>
            <p className="mt-2">
              The claim you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="bg-red-600 px-6 py-4">
          <h1 className="text-white text-2xl font-bold">
            Claim Verification Failed
          </h1>
          <p className="text-red-100">Claim ID: {claim.claimId || claimId}</p>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <h2 className="text-lg font-medium mb-2">Patient Information</h2>
              <p>
                <span className="font-medium">Name:</span> {claim.patientName}
              </p>
              <p>
                <span className="font-medium">Hospital:</span>{" "}
                {claim.hospitalName}
              </p>
              <p>
                <span className="font-medium">Date:</span>{" "}
                {new Date(claim.claimDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-medium mb-2">Claim Status</h2>
              <div className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-red-500 mr-2"></span>
                <span className="font-medium text-red-600">
                  Verification Failed
                </span>
              </div>
              <p className="mt-2 text-sm">
                {claim.failureReason || "Multiple verification issues detected"}
              </p>
            </div>
          </div>

          {errorData && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">
                Verification Issues
              </h2>

              {errorData.consistencyCheck &&
                renderConsistencyCheck(errorData.consistencyCheck)}
              {errorData.relevantMedicalDataCheck &&
                renderMedicalDataCheck(errorData.relevantMedicalDataCheck)}
              {errorData.relevantBillingDataCheck &&
                renderBillingDataCheck(errorData.relevantBillingDataCheck)}

              <div className="bg-red-50 p-4 rounded-lg mt-6">
                <h3 className="text-lg font-semibold mb-2">Next Steps</h3>
                <p className="mb-4">
                  This claim has been flagged for potential fraud or data
                  inconsistencies. You can Call Our team for further information
                  and Correctness.
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      navigate("/user/call");
                    }}
                    className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimFailedPage;
