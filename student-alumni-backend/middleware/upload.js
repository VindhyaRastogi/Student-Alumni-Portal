// middleware/upload.js
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

// ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
} catch (e) {
  console.warn("Could not ensure uploads directory exists:", e.message);
}

// Storage config with unique filenames (timestamp + random hex) preserving extension
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || "";
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

module.exports = upload;
