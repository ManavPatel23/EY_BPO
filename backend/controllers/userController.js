const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/UserSchema");

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(500).json({
        success: false,
        message: "All Fields Are Required",
      });
    }

    let user = await User.findOne({ email });

    if (user) {
      return res.status(500).json({
        success: false,
        message: "User Already Exists",
      });
    }

    const hashPass = await bcrypt.hash(password, 10);

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    user = await User.create({
      name,
      email,
      password: hashPass,
    });

    return res.status(200).json({
      success: true,
      message: "User Created Successfully",
      user,
      token,
    });
  } catch (error) {
    console.log(error.message, " Error Message ", error);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(500).json({
      success: false,
      message: "All Fields Are Required",
    });
  }

  let user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(500).json({
      success: false,
      message: "User Doesn't Exist",
    });
  }

  const comparePass = await bcrypt.compare(password, user.password);

  if (!comparePass) {
    return res.status(500).json({
      success: false,
      message: "Password Doesn't Match",
    });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.status(200).json({
    success: true,
    message: "User Login Successfully",
    user,
    token,
  });
};

const getUserDetails = async (req, res) => {
  try {
    const myId = req.user._id;

    const user = await User.findById(myId);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);

    return res.status(300).json({
      success: false,
      message: error.message,
      error,
    });
  }
};

module.exports = { createUser, loginUser, getUserDetails };
