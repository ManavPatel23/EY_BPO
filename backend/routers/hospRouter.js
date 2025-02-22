const express = require("express");
const {
  createHospital,
  createMultipleHospitals,
} = require("../controllers/hospital");
const isAuthenticated = require("../middlewares/isAuthenticated");

const hospRouter = express.Router();

// for creating user
// upload will upload all the details
hospRouter.post("/create", createHospital);
hospRouter.post("/createMultiple", createMultipleHospitals);

module.exports = hospRouter;
