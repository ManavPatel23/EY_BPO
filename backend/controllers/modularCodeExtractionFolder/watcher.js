const HospitalSubmitted = require("../../models/HospitalSubmittedSchema.js"); // Import your schema
const DocumentWatcher = require("./services/documentWatcher.js");

const watcher = new DocumentWatcher(
  "gemini-1.5-flash",
  process.env.GEMINI_API_KEY,
  io
);

// Start watching for uploads
watcher.watchUploads(HospitalSubmitted);

module.exports = watcher;
