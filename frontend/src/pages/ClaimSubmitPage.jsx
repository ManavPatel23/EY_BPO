import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload } from "lucide-react";
import axios from "axios";
import { BACKEND_URL } from "@/constant";

const ClaimSubmitPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    policyDocuments: [],
    patientDetailsDocuments: [],
    medicalHistoryDocuments: [],
    billsDocuments: [],
    prescriptionsDocuments: [],
    patientPastMedicalCheckupsDocuments: [],
    patientPastMedicalRecordsDocuments: [],
    regularMedicinesOfPatientDocuments: [],
    operationDetailDocuments: [],
    doctorsNoteDocuments: [],
  });

  const steps = [
    { title: "Policy Details", key: "policyDocuments" },
    { title: "Patient Details", key: "patientDetailsDocuments" },
    { title: "Medical History", key: "medicalHistoryDocuments" },
    { title: "Bills", key: "billsDocuments" },
    { title: "Prescriptions", key: "prescriptionsDocuments" },
    {
      title: "Past Medical Checkups",
      key: "patientPastMedicalCheckupsDocuments",
    },
    {
      title: "Past Medical Records",
      key: "patientPastMedicalRecordsDocuments",
    },
    { title: "Regular Medicines", key: "regularMedicinesOfPatientDocuments" },
    { title: "Operation Details", key: "operationDetailDocuments" },
    { title: "Doctor's Notes", key: "doctorsNoteDocuments" },
  ];

  const handleFileChange = (event, stepKey) => {
    const files = Array.from(event.target.files);
    setFormData((prev) => ({
      ...prev,
      [stepKey]: [...prev[stepKey], ...files],
    }));
  };

  const removeFile = (stepKey, index) => {
    setFormData((prev) => ({
      ...prev,
      [stepKey]: prev[stepKey].filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Create FormData object to send files
    const formDataToSend = new FormData();

    // Append all files from each section
    Object.entries(formData).forEach(([key, files]) => {
      files.forEach((file, index) => {
        formDataToSend.append(`${key}`, file);
      });
    });

    try {
      // Replace with your actual API endpoint
      console.log("Form submitted:", formDataToSend);
      const response = await axios.post(`${BACKEND_URL}/hosp/`, formDataToSend);
      console.log("RESPONSE ", response.data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded">
          <div
            className="h-full bg-blue-600 rounded transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>{currentStepData.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File upload section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <label className="flex flex-col items-center cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">
                  Click to upload or drag and drop
                </span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileChange(e, currentStepData.key)}
                  accept="image/*"
                />
              </label>
            </div>

            {/* Replace the existing preview section with this code */}
            {/* Uploaded files preview */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {formData[currentStepData.key].map((file, index) => (
                <div
                  key={index}
                  className="relative group border rounded-lg p-2 hover:shadow-lg transition-all"
                >
                  <div className="aspect-square w-full relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-md"
                      onLoad={() => URL.revokeObjectURL(file)} // Clean up the URL after image loads
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(currentStepData.key, index)}
                    >
                      Remove
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 truncate">
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={handleBack}
            disabled={currentStep === 0}
            variant="outline"
          >
            Back
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button onClick={handleSubmit}>Submit</Button>
          ) : (
            <Button onClick={handleNext}>Next</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ClaimSubmitPage;
