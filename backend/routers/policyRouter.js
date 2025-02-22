const express = require("express");
const { createMultiplePolicies } = require("../controllers/PolicyController");

const policyRouter = express.Router();

policyRouter.post("/create-multiple", createMultiplePolicies);

module.exports = policyRouter;
