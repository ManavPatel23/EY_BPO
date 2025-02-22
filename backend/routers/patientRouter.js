const express = require("express");
const { buyPolicy } = require("../controllers/PatientController");
const isUserAuthenticated = require("../middlewares/isUserAuthenticated");

const patientRouter = express.Router();

patientRouter.post("/buy-policy", isUserAuthenticated, buyPolicy);

module.exports = patientRouter;
