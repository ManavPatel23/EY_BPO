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
const callBetweenRouter = require("./routers/callBetweenRouter.js");

const app = express();
dotenv.config();

const server = http.createServer(app);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// adding all the middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// add cors
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
app.use("/api/v1/call", callBetweenRouter);

const agents = new Map();
const clients = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id, " agents ", agents);

  // Agent Registration
  socket.on("register_agent", () => {
    agents.set(socket.id, { state: "idle" });
    console.log(`Agent ${socket.id} registered and is idle.`);
  });

  // Client connects
  socket.on("register_client", () => {
    // Initialize client data with an empty rejected agents list.
    clients.set(socket.id, {
      agentId: null,
      rejectedAgents: [],
      roomId: socket.id, // Set roomId to client's socket ID
    });
    console.log(`Client ${socket.id} registered.`);
  });

  // Helper function to find an idle agent excluding agents in the exclusions array
  function findIdleAgentExcluding(exclusions = []) {
    for (const [agentId, data] of agents.entries()) {
      if (data.state === "idle" && !exclusions.includes(agentId)) {
        return agentId;
      }
    }
    return null;
  }

  // Client requests a call
  socket.on("request_call", () => {
    const clientData = clients.get(socket.id);
    if (!clientData) return;

    const roomId = clientData.roomId; // Use the client's roomId
    console.log("clientData", clientData, roomId);

    const availableAgent = findIdleAgentExcluding(clientData.rejectedAgents);
    if (availableAgent) {
      agents.set(availableAgent, { state: "pending", clientId: socket.id });

      clientData.agentId = availableAgent;
      clients.set(socket.id, clientData);

      // Send roomId to the agent so they join the same room
      io.to(availableAgent).emit("call_request", {
        clientId: socket.id,
        roomId,
      });

      console.log(
        `Call request sent to Agent ${availableAgent} for Room: ${roomId}`
      );
    } else {
      socket.emit("no_agents_available");
    }
  });

  // Agent accepts the call
  socket.on("accept_call", ({ clientId }) => {
    const agentId = socket.id;
    agents.set(agentId, { state: "working", clientId });

    const clientData = clients.get(clientId);
    if (clientData) {
      // Clear the rejected list (if desired) upon a successful call
      clientData.rejectedAgents = [];
      clientData.agentId = agentId;
      clients.set(clientId, clientData);
    }

    // Notify both parties of the accepted call
    io.to(clientId).emit("call_accepted", {
      agentId,
      roomId: clientData.roomId,
    });
    io.to(agentId).emit("call_accepted", {
      clientId,
      roomId: clientData.roomId,
    });

    console.log(`Agent ${agentId} accepted call from Client ${clientId}.`);
  });

  // Agent rejects the call
  socket.on("reject_call", ({ clientId }) => {
    const agentId = socket.id;
    // Set the rejecting agent back to idle.
    agents.set(agentId, { state: "idle" });

    const clientData = clients.get(clientId);
    if (clientData) {
      // Add the rejecting agent to the client's rejected agents list.
      clientData.rejectedAgents.push(agentId);
      clients.set(clientId, clientData);

      // Find another idle agent excluding those in the rejected list.
      const newAgent = findIdleAgentExcluding(clientData.rejectedAgents);
      if (newAgent) {
        // Mark the new agent as pending for the call.
        agents.set(newAgent, { state: "pending", clientId });
        clientData.agentId = newAgent;
        clients.set(clientId, clientData);
        io.to(newAgent).emit("call_request", {
          clientId,
          roomId: clientData.roomId,
        });
        console.log(`Call request forwarded to Agent ${newAgent}.`);
      } else {
        io.to(clientId).emit("no_agents_available");
        console.log("No agents available after rejection.");
      }
    }
  });

  // WebRTC Signaling
  socket.on("webrtc_offer", (data) => {
    if (clients.has(data.target) || agents.has(data.target)) {
      io.to(data.target).emit("webrtc_offer", {
        offer: data.offer,
        sender: socket.id,
      });
    }
  });

  socket.on("webrtc_answer", (data) => {
    if (clients.has(data.target) || agents.has(data.target)) {
      io.to(data.target).emit("webrtc_answer", {
        answer: data.answer,
        sender: socket.id,
      });
    }
  });

  socket.on("webrtc_ice_candidate", (data) => {
    if (clients.has(data.target) || agents.has(data.target)) {
      io.to(data.target).emit("webrtc_ice_candidate", {
        candidate: data.candidate,
        sender: socket.id,
      });
    }
  });

  // Handle Agent Disconnection
  socket.on("disconnect", () => {
    if (agents.has(socket.id)) {
      const agentData = agents.get(socket.id);
      agents.delete(socket.id);
      console.log(`Agent ${socket.id} disconnected.`);

      // Notify client if agent was in a call
      if (agentData.state === "working" && agentData.clientId) {
        io.to(agentData.clientId).emit("agent_disconnected");
        clients.set(agentData.clientId, { agentId: null });

        // Try to find another agent
        const newAgent = findIdleAgent();
        if (newAgent) {
          io.to(newAgent).emit("call_request", {
            clientId: agentData.clientId,
            roomId: clients.get(agentData.clientId).roomId,
          });
          console.log(
            `Client ${agentData.clientId} reassigned to Agent ${newAgent}.`
          );
        }
      }
    } else if (clients.has(socket.id)) {
      const clientData = clients.get(socket.id);
      clients.delete(socket.id);
      console.log(`Client ${socket.id} disconnected.`);
      // Notify agent if client was in a call
      if (clientData.agentId) {
        agents.set(clientData.agentId, { state: "idle" });
        io.to(clientData.agentId).emit("client_disconnected");
      }
    }
  });
});

// Find an Idle Agent
function findIdleAgent() {
  for (const [agentId, data] of agents.entries()) {
    if (data.state === "idle") {
      return agentId;
    }
  }
  return null;
}

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
