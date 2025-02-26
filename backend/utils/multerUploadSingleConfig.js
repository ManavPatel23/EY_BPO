const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads")); // Set upload directory
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

const uploadSingle = multer({ storage });

module.exports = uploadSingle;
