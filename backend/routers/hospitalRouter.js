const express = require("express");
const {
  uploadDocumentsForClaim,
  createUser,
  loginUser,
  getUserDetails,
  getHospClaims,
  getClaimById,
  updateFaceVerificationCounter,
  updateLocaVerificationCounter,
} = require("../controllers/hospitalController");
const isUserAuthenticated = require("../middlewares/isUserAuthenticated");

const hospitalRouter = express.Router();

// for creating user
// upload will upload all the details
hospitalRouter.post("/", isUserAuthenticated, uploadDocumentsForClaim);
hospitalRouter.post("/register", createUser);
hospitalRouter.post("/login", loginUser);
hospitalRouter.get("/me", isUserAuthenticated, getUserDetails);
hospitalRouter.get("/allClaims", isUserAuthenticated, getHospClaims);
hospitalRouter.put(
  "/face/count/:cid",
  isUserAuthenticated,
  updateFaceVerificationCounter
);
hospitalRouter.put(
  "/loca/count/:cid",
  isUserAuthenticated,
  updateLocaVerificationCounter
);
hospitalRouter.get("/claim/:cid", isUserAuthenticated, getClaimById);

module.exports = hospitalRouter;
