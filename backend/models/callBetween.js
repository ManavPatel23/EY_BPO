const mongoose = require("mongoose");

const callBetweenSchema = new mongoose.Schema(
  {
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent", // Reference to the agent user
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the client user
    },
    agentCallRecord: {
      type: String, // Store the file path of the agent's recording
    },
    clientCallRecord: {
      type: String, // Store the file path of the client's recording
    },
    roomCallRecord: {
      type: String,
    },
    roomId: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const CallBetween = mongoose.model("CallBetween", callBetweenSchema);

module.exports = CallBetween;
