require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const alumniRoutes = require("./routes/alumniRoutes");
const slotsRoutes = require("./routes/slotsRoutes");
const meetingsRoutes = require("./routes/meetingsRoutes");
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
app.use("/api/slots", slotsRoutes);
app.use("/api/meetings", meetingsRoutes);

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
    app.listen(PORT, async () => {
      console.log(`✅ Server started on port ${PORT}`);

      // Defensive: check for stray/legacy indexes on the slots collection that can cause duplicate-key errors
      try {
        const db = mongoose.connection.db;
        const coll = db.collection('slots');
        const indexes = await coll.indexes();
        console.log('slots collection indexes:', indexes.map(i => i.name));
        const problematic = indexes.find(i => i.name === 'alumniId_1_slots_1');
        if (problematic) {
          console.warn('Dropping legacy index alumniId_1_slots_1 on slots collection to avoid duplicate-key errors');
          await coll.dropIndex('alumniId_1_slots_1');
          console.log('Dropped legacy index alumniId_1_slots_1');
        }
      } catch (idxErr) {
        // non-fatal — just log
        console.error('Index cleanup check for slots collection failed:', idxErr && idxErr.message);
      }
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
