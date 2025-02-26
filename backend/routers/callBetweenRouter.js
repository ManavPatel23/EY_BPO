const express = require("express");
const { User } = require("../models/UserSchema.js");
const CallBetween = require("../models/callBetween.js");
const uploadSingle = require("../utils/multerUploadSingleConfig.js");

const callBetweenRouter = express.Router();

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
