const express = require("express");
const { User } = require("../models/UserSchema.js");
const CallBetween = require("../models/callBetween.js");
const uploadSingle = require("../utils/multerUploadSingleConfig.js");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");
const axios = require("axios"); // For calling your ML model API
const Schedule = require("../models/scheduleSchema.js");

const callBetweenRouter = express.Router();
// Schedule call endpoint
callBetweenRouter.post("/schedule/call", async (req, res) => {
  try {
    const { agentId, clientId, roomCallAudio, scheduleDate } = req.body;

    if (!agentId || !clientId || !roomCallAudio || !scheduleDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Find the call recording using roomId
    const callRecord = await CallBetween.findOne({ roomId: roomCallAudio });

    if (!callRecord || !callRecord.roomCallRecord) {
      return res.status(404).json({
        success: false,
        message: "Call recording not found",
      });
    }

    const audioFilePath = callRecord.roomCallRecord;

    if (!fs.existsSync(audioFilePath)) {
      return res.status(404).json({
        success: false,
        message: "Audio file not found",
      });
    }

    console.log(audioFilePath);

    // Step 1: Send the audio file to the transcription endpoint
    const formData = new FormData();
    formData.append("audio", fs.createReadStream(audioFilePath));

    const transcriptionResponse = await axios.post(
      "http://localhost:5000/transcribe",
      formData,
      { headers: { ...formData.getHeaders() } }
    );

    const transcript = transcriptionResponse.data.transcription;
    console.log("Generated transcript:", transcript);

    // Step 2: Send the transcript to the analysis endpoint
    const analysisResponse = await axios.post("http://localhost:5000/analyze", {
      transcript: transcript,
    });

    // Extract the data from the analysis response
    const { summaryOfClientQuery, summary, howAgentHandled, priorityScore } =
      analysisResponse.data;

    // Create a new schedule document
    const newSchedule = new Schedule({
      scheduleDate: new Date(scheduleDate),
      roomCallAudio,
      clientId: callRecord.client,
      agentId,
      priorityScore,
      summaryOfClientQuery,
      summary,
      howAgentHandled,
      transcript,
    });

    // Save the schedule document
    await newSchedule.save();

    return res.status(201).json({
      success: true,
      message: "Follow-up call scheduled successfully",
      schedule: newSchedule,
    });
  } catch (error) {
    console.error("Error scheduling call:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to schedule follow-up call",
      error: error.message,
    });
  }
});

callBetweenRouter.get("/test", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello, how are you?" }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: response.data.choices[0].message.content,
    });
  } catch (error) {
    console.error(
      "Error calling OpenAI:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to connect to OpenAI",
      error: error.response?.data || error.message,
    });
  }
});

// for uploading audio after leaving roomm
callBetweenRouter.post(
  "/upload-audio-after-call",
  uploadSingle.single("audio"),
  async (req, res) => {
    try {
      const { userId, isAgent, roomId } = req.body; // ✅ Include `roomId`
      const isAgentBoolean = isAgent === "true";

      console.log(
        "Received isAgent:",
        isAgent,
        "Converted:",
        isAgentBoolean,
        "Room ID:",
        roomId
      );

      if (!req.file) {
        return res.status(400).json({ message: "No audio file uploaded!" });
      }

      const { path: audioPath } = req.file;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // ✅ Find an existing call entry for this specific `roomId`
      let existingCall = await CallBetween.findOne({ roomId });

      console.log("EXISTING CALL:", existingCall, "isAgent:", isAgentBoolean);

      if (!existingCall) {
        // ✅ Create a new call entry for a new session
        existingCall = new CallBetween({
          roomId, // ✅ Store roomId
          agent: isAgentBoolean ? userId : null,
          client: isAgentBoolean ? null : userId,
          agentCallRecord: isAgentBoolean ? audioPath : null,
          clientCallRecord: isAgentBoolean ? null : audioPath,
        });
      } else {
        // ✅ Update the existing document for the same `roomId`
        if (isAgentBoolean) {
          existingCall.agent = userId;
          existingCall.agentCallRecord = audioPath;
        } else {
          existingCall.client = userId;
          existingCall.clientCallRecord = audioPath;
        }
      }

      const callBetween = await existingCall.save();

      res.status(200).json({
        message: "Call data saved successfully!",
        audioPath,
        callBetween,
      });
    } catch (error) {
      console.error("Error uploading audio:", error);
      res.status(500).json({ message: "Failed to upload audio." });
    }
  }
);

callBetweenRouter.post(
  "/upload-room-audio",
  uploadSingle.single("audio"),
  async (req, res) => {
    try {
      const { roomId } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No audio file uploaded!" });
      }

      const { path: audioPath } = req.file;

      // Find an existing call entry for this specific roomId
      let existingCall = await CallBetween.findOne({ roomId });

      if (!existingCall) {
        // Create a new call entry if none exists
        existingCall = new CallBetween({
          roomId,
          roomCallRecord: audioPath,
        });
      } else {
        // Update the existing document with room call recording
        existingCall.roomCallRecord = audioPath;
      }

      const callBetween = await existingCall.save();

      res.status(200).json({
        message: "Room call recording saved successfully!",
        audioPath,
        callBetween,
      });
    } catch (error) {
      console.error("Error uploading room audio:", error);
      res.status(500).json({ message: "Failed to upload room audio." });
    }
  }
);

// Endpoint to get the recorded audio (for agent)
callBetweenRouter.get("/get-agent-record/:roomId", async (req, res) => {
  const { roomId } = req.params;

  console.log("Agent ", roomId);

  const callRecord = await CallBetween.findOne({ roomId });
  console.log("CALLRECORD", callRecord);

  if (callRecord && callRecord.agentCallRecord) {
    res.download(callRecord.agentCallRecord); // Send the agent's audio file
  } else {
    res.status(404).json({ message: "No call record found for this agent." });
  }
});

// Endpoint to get the recorded audio (for client)
callBetweenRouter.get("/get-client-record/:roomId", async (req, res) => {
  const { roomId } = req.params;

  console.log("CLIENT ", roomId);

  const callRecord = await CallBetween.findOne({ roomId });
  console.log("CALLRECORD", callRecord);

  if (callRecord && callRecord.clientCallRecord) {
    res.download(callRecord.clientCallRecord); // Send the client's audio file
  } else {
    res.status(404).json({ message: "No call record found for this client." });
  }
});

module.exports = callBetweenRouter;
