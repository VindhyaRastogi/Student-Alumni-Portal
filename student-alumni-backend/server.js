require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const alumniRoutes = require("./routes/alumniRoutes");
const slotsRoutes = require("./routes/slotsRoutes");
const meetingsRoutes = require("./routes/meetingsRoutes");
const chatRoutes = require("./routes/chatRoutes");
const studentRoutes = require("./routes/studentRoutes");
const reportsRoutes = require("./routes/reportsRoutes");

const app = express();

// ✅ CORS setup — allow frontend requests
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // fallback for dev
    credentials: true,
  })
);

// ✅ Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static folder for uploads (serve profile pictures)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/slots", slotsRoutes);
app.use("/api/meetings", meetingsRoutes);
app.use("/api/chats", chatRoutes);

// ✅ Default route (optional)
app.get("/", (req, res) => {
  res.send("🚀 Student Alumni Portal Backend Running Successfully!");
});

// create HTTP server and attach socket.io
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// simple authentication for socket connections: client should send { auth: { token } }
io.on("connection", async (socket) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return;
    const room = `user:${user._id}`;
    socket.join(room);
    // useful to debug connections
    console.log(`Socket connected: ${socket.id} joined ${room}`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  } catch (err) {
    console.error("Socket auth error:", err && err.message);
  }
});

// attach io to app so controllers can emit events
app.set("io", io);

// ✅ Database + Server startup
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, async () => {
      console.log(`✅ Server started on port ${PORT}`);

      // Defensive: check for stray/legacy indexes on the slots collection that can cause duplicate-key errors
      try {
        const db = mongoose.connection.db;
        const coll = db.collection("slots");
        const indexes = await coll.indexes();
        console.log(
          "slots collection indexes:",
          indexes.map((i) => i.name)
        );
        const problematic = indexes.find(
          (i) => i.name === "alumniId_1_slots_1"
        );
        if (problematic) {
          console.warn(
            "Dropping legacy index alumniId_1_slots_1 on slots collection to avoid duplicate-key errors"
          );
          await coll.dropIndex("alumniId_1_slots_1");
          console.log("Dropped legacy index alumniId_1_slots_1");
        }
      } catch (idxErr) {
        // non-fatal — just log
        console.error(
          "Index cleanup check for slots collection failed:",
          idxErr && idxErr.message
        );
      }
      // Defensive: check meetings collection for legacy unique index on (alumniId, slot)
      try {
        const db = mongoose.connection.db;
        const meetingsColl = db.collection("meetings");
        const mIndexes = await meetingsColl.indexes();
        console.log(
          "meetings collection indexes:",
          mIndexes.map((i) => i.name)
        );
        const legacy = mIndexes.find((i) => i.name === "alumniId_1_slot_1");
        if (legacy) {
          console.warn(
            "Dropping legacy unique index alumniId_1_slot_1 on meetings collection"
          );
          await meetingsColl.dropIndex("alumniId_1_slot_1");
          console.log("Dropped legacy index alumniId_1_slot_1");
          // recreate a non-unique index on the same keys to preserve lookup performance
          await meetingsColl.createIndex({ alumniId: 1, slot: 1 });
          console.log("Created non-unique index on {alumniId:1, slot:1}");
        }
      } catch (midxErr) {
        console.error(
          "Index cleanup check for meetings collection failed:",
          midxErr && midxErr.message
        );
      }
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
