const express = require("express");
const {
  uploadDocumentsForClaim,
} = require("../controllers/hospitalController");

const hospitalRouter = express.Router();

// for creating user
// upload will upload all the details
hospitalRouter.post("/", uploadDocumentsForClaim);

module.exports = hospitalRouter;
