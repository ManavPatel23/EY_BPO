const express = require("express");
const {
  buyPolicy,
  uploadImageOfPolicy,
} = require("../controllers/PatientController");
const isUserAuthenticated = require("../middlewares/isUserAuthenticated");
const uploadSingle = require("../utils/multerUploadSingleConfig");

const patientRouter = express.Router();

patientRouter.post(
  "/buy-policy",
  isUserAuthenticated,
  uploadSingle.single("referenceImage"),
  buyPolicy
);

patientRouter.put(
  "/pass-image/:pId",
  isUserAuthenticated,
  uploadSingle.single("referenceImage"),
  uploadImageOfPolicy
);
module.exports = patientRouter;
