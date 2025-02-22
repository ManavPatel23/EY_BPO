const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDb } = require("./utils/connectDB.js");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");

// routers import
// const userRouter = require("./routers/user");
const hospRouter = require("./routers/hospRouter.js");
const hospitalRouter = require("./routers/hospitalRouter.js");
const policyRouter = require("./routers/policyRouter.js");
const patientRouter = require("./routers/patientRouter.js");
const userRouter = require("./routers/userRouter.js");

const app = express();
dotenv.config();

const server = http.createServer(app);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// adding all the middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

const io = new Server(server, {
  pingTimeout: 60000,
  pingInterval: 25000,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  maxHttpBufferSize: 1e7, // 10 MB max file size
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server is Working",
  });
});

// connect DB
// Initialize watcher after DB connection
connectDb();

// adding routers
app.use("/api/v1/hospital", hospRouter);
app.use("/api/v1/hosp", hospitalRouter);
app.use("/api/v1/policy", policyRouter);
app.use("/api/v1/patient", patientRouter);
app.use("/api/v1/user", userRouter);

const agentMap = new Map();

io.on("connection", (socket) => {});

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
