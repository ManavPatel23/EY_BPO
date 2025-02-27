import React, { useState, useEffect, useRef } from "react";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import { useParams } from "react-router-dom";
import axios from "../axiosDefault";
import { BACKEND_URL } from "@/constant";

const GOOGLE_MAPS_API_KEY = "AIzaSyCJvMJSS0r-kiw3veQ6llXSIKYhOlFR7IY";
const LIBRARIES = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "8px",
};

const VerifyLocation = () => {
  // Get claimId from URL params
  const { claimId } = useParams();

  const [status, setStatus] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [claim, setClaim] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [hospitalLocation, setHospitalLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  // Fetch claim when component mounts
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

      const data = await response.data.claim;
      setClaim(data);
      setStatus("");

      // If claim has hospital name, auto-start verification
      if (data && data.hospitalName) {
        setStatus(`Found claim for ${data.hospitalName}. Getting location...`);
        verifyLocation(data.hospitalName);
      }
    } catch (error) {
      setStatus(`Error fetching claim: ${error.message}`);
    }
  };

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation is not supported by your browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          resolve(location);
        },
        (error) => {
          let errorMessage = "Error getting user location.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
            default:
              errorMessage = "Unknown error getting location.";
          }
          reject(errorMessage);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const findHospitalByName = async (hospitalName) => {
    console.log("hospitalName", hospitalName);

    const map = new window.google.maps.Map(document.createElement("div"));
    const service = new window.google.maps.places.PlacesService(map);

    return new Promise((resolve, reject) => {
      service.findPlaceFromQuery(
        {
          query: hospitalName,
          fields: ["name", "geometry", "formatted_address"],
        },
        (results, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            results.length > 0
          ) {
            const location = {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
              name: results[0].name,
              address: results[0].formatted_address,
            };
            setHospitalLocation(location);
            resolve(location);
          } else {
            reject("Hospital not found. Please check the name and try again.");
          }
        }
      );
    });
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const updateClaimVerification = async (isVerified, distanceValue) => {
    if (!claimId) return;

    try {
      setIsUpdating(true);
      setStatus("Updating verification status...");

      const { data } = await axios.put(
        `${BACKEND_URL}/hosp/loca/count/${claimId}`
      );

      setStatus(
        `Verification ${isVerified ? "successful" : "failed"} and updated ✓`
      );
    } catch (error) {
      setStatus(`Error updating verification: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const verifyLocation = async (hospitalNameToVerify) => {
    const nameToUse = hospitalNameToVerify || (claim && claim.hospitalName);

    if (!nameToUse) {
      setStatus("No hospital name available");
      return;
    }

    setIsVerifying(true);
    setStatus("Verifying your location...");

    try {
      const userLoc = await getUserLocation();
      const hospitalLoc = await findHospitalByName(nameToUse);

      const dist = calculateDistance(
        userLoc.lat,
        userLoc.lng,
        hospitalLoc.lat,
        hospitalLoc.lng
      );

      setDistance(dist);

      // Center the map to show both markers
      if (mapRef.current) {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(new window.google.maps.LatLng(userLoc.lat, userLoc.lng));
        bounds.extend(
          new window.google.maps.LatLng(hospitalLoc.lat, hospitalLoc.lng)
        );
        mapRef.current.fitBounds(bounds);
      }

      const isWithinLimit = dist <= 100;

      if (isWithinLimit) {
        setStatus(`Approved ✅ (${Math.round(dist)}m away)`);
        // Update verification status on backend
        await updateClaimVerification(true, dist);
      } else {
        setStatus(
          `Rejected ❌ (${Math.round(dist)}m away - must be within 100m)`
        );
      }
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : error}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  if (loadError) {
    return <div>Error loading Google Maps API: {loadError.message}</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Hospital Location Verification</h1>
      <p className="text-sm text-gray-600 text-center">
        Verifying your presence at {claim?.hospitalName || "the hospital"}
      </p>

      {(!claim || !claim.hospitalName) && (
        <div className="w-full">
          <p className="text-sm text-gray-600 mb-2">
            {claim
              ? "Hospital name not found in claim."
              : "Waiting for claim data..."}
          </p>
          <button
            onClick={() => claim && verifyLocation()}
            disabled={isVerifying || !isLoaded || !claim || isUpdating}
            className={`w-full px-4 py-2 rounded font-medium ${
              isVerifying || !isLoaded || !claim || isUpdating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-700 text-white"
            }`}
          >
            {isVerifying
              ? "Verifying..."
              : isUpdating
              ? "Updating..."
              : "Retry Verification"}
          </button>
        </div>
      )}

      {status && (
        <div
          className={`mt-2 p-3 rounded-lg w-full text-center font-semibold ${
            status.includes("Approved")
              ? "bg-green-100 text-green-800"
              : status.includes("Rejected")
              ? "bg-red-100 text-red-800"
              : status.includes("Error") || status.includes("No hospital")
              ? "bg-yellow-100 text-yellow-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {status}
        </div>
      )}

      {/* Map Container */}
      {isLoaded && (
        <div className="w-full mt-4">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={userLocation || { lat: 0, lng: 0 }}
            zoom={14}
            onLoad={handleMapLoad}
          >
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
                title="Your Location"
              />
            )}

            {hospitalLocation && (
              <Marker
                position={hospitalLocation}
                icon={{
                  url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
                title={hospitalLocation.name || "Hospital Location"}
              />
            )}
          </GoogleMap>

          {hospitalLocation && (
            <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
              <p className="font-semibold">{hospitalLocation.name}</p>
              <p className="text-gray-600">{hospitalLocation.address}</p>
              {distance !== null && (
                <p className="mt-1">
                  Distance:{" "}
                  <span className="font-semibold">{Math.round(distance)}m</span>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyLocation;
