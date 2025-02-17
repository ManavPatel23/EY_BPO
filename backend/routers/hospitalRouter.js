const express = require("express");
const {
  uploadDocumentsForClaim,
  createUser,
  loginUser,
  getUserDetails,
  getHospClaims,
} = require("../controllers/hospitalController");
const isAuthenticated = require("../middlewares/isAuthenticated");

const hospitalRouter = express.Router();

// for creating user
// upload will upload all the details
hospitalRouter.post("/", isAuthenticated, uploadDocumentsForClaim);
hospitalRouter.post("/register", createUser);
hospitalRouter.post("/login", loginUser);
hospitalRouter.get("/me", isAuthenticated, getUserDetails);
hospitalRouter.get("/allClaims/:id", isAuthenticated, getHospClaims);

module.exports = hospitalRouter;
