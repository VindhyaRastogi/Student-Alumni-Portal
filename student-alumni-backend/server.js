require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const alumniRoutes = require("./routes/alumniRoutes");
const studentRoutes = require("./routes/studentRoutes");

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
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Default route (optional)
app.get("/", (req, res) => {
  res.send("🚀 Student Alumni Portal Backend Running Successfully!");
});

// ✅ Database + Server startup
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
