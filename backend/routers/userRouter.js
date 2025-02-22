const express = require("express");
const {
  createUser,
  loginUser,
  getUserDetails,
} = require("../controllers/userController");
const isUserAuthenticated = require("../middlewares/isUserAuthenticated");

const userRouter = express.Router();

userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/me", isUserAuthenticated, getUserDetails);

module.exports = userRouter;
