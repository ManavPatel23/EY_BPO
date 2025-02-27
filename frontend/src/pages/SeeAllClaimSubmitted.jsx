import { BACKEND_URL } from "@/constant";
import { UserContext } from "@/context/userContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import Cookies from "js-cookie";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SeeAllClaimSubmitted = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [claimsData, setClaimsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    async function fetchAPI() {
      try {
        setLoading(true);
        const token = Cookies.get("token");

        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }

        const response = await axios.get(`${BACKEND_URL}/hosp/allClaims`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (response.data.success) {
          setClaimsData(response.data.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAPI();
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING_REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "VERIFIED":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "NEEDS_CORRECTION":
        return "bg-yellow-500 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleClaimClick = (claim) => {
    const claimId = claim.claimId;
    const currentTime = new Date();

    switch (claim.validationStatus) {
      case "VERIFIED":
        // Check if face verification is needed and if timeout has passed or isn't set
        if (
          claim.faceVerification.counter < 2 &&
          (!claim.faceVerification.timeOut ||
            new Date(claim.faceVerification.timeOut) < currentTime)
        ) {
          navigate(`/verify/face/${claim.claimId}`);
        }
        // If face is verified, check if location verification is needed and if timeout has passed or isn't set
        else if (
          claim.locationVerification.counter < 2 &&
          (!claim.locationVerification.timeOut ||
            new Date(claim.locationVerification.timeOut) < currentTime)
        ) {
          navigate(`/verify/location/${claimId}`);
        }
        // Both verifications are complete or timeouts haven't passed, just view the claim
        else if (
          claim.faceVerification.counter >= 2 &&
          claim.locationVerification.counter >= 2
        ) {
          navigate(`/claim-details/${claimId}`);
        }
        break;

      case "FAILED":
      case "NEEDS_CORRECTION":
        navigate(`/claim/fail/${claimId}`);
        break;

      case "PENDING_REVIEW":
      case "CLAIM_PROCESSED":
        // Do not navigate anywhere for these statuses
        break;

      default:
        // Handle any other statuses if needed
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading claims data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Submitted Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Member Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Submitted At
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {claimsData.map((claim, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleClaimClick(claim)}
                  >
                    <td className="px-6 py-4 text-sm">
                      {claim.patientId.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {claim.patientId.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          claim.validationStatus
                        )}`}
                      >
                        {claim.validationStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {formatDate(claim.submittedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {formatDate(claim.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeeAllClaimSubmitted;
