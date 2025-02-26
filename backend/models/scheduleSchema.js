const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema(
  {
    scheduleDate: {
      type: Date,
      required: true,
    },
    roomCallAudio: {
      type: String,
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    priorityScore: {
      type: Number,
      default: 0,
    },
    summaryOfClientQuery: {
      type: String,
      default: "",
    },
    summary: {
      type: String,
      default: "",
    },
    howAgentHandled: {
      type: String,
      default: "",
    },
    transcript: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Schedule =
  mongoose.models.Schedule || mongoose.model("Schedule", ScheduleSchema);

module.exports = Schedule;
