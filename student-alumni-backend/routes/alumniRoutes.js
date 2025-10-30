// ...existing code...
const express = require('express');
const multer = require('multer');
const router = express.Router();

// controllers: accept default or named shape
const alumniControllerModule = require('../controllers/alumniController');
const controllers = (alumniControllerModule && alumniControllerModule.default) ? alumniControllerModule.default : alumniControllerModule;
const { saveAlumniProfile, getAlumniProfile, getAlumniList, getAlumniById } = controllers || {};

// auth middleware: use the exported 'auth' function (do not modify authMiddleware.js)
const authModule = require('../middleware/authMiddleware');
// prefer authModule.auth, fall back to common shapes
let protect = (authModule && typeof authModule.auth === 'function') ? authModule.auth
            : (authModule && authModule.default && typeof authModule.default.auth === 'function') ? authModule.default.auth
            : (authModule && typeof authModule === 'function') ? authModule
            : (authModule && authModule.default && typeof authModule.default === 'function') ? authModule.default
            : null;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// clearer diagnostics
if (typeof protect !== 'function') {
  const available = authModule && typeof authModule === 'object' ? Object.keys(authModule) : typeof authModule;
  throw new TypeError(
    `protect (auth middleware) is not a function — check ../middleware/authMiddleware.js (exports: ${JSON.stringify(available)})`
  );
}
const availableCtrls = controllers && typeof controllers === 'object' ? Object.keys(controllers) : typeof controllers;
if (typeof saveAlumniProfile !== 'function' ||
    typeof getAlumniProfile !== 'function' ||
    typeof getAlumniList !== 'function' ||
    typeof getAlumniById !== 'function') {
  throw new TypeError(
    `alumniController missing expected functions. Available exports: ${JSON.stringify(availableCtrls)}`
  );
}

// routes
router.post('/profile', protect, upload.single('profilePicture'), saveAlumniProfile);
router.get('/profile', protect, getAlumniProfile);
router.get('/', protect, getAlumniList);
router.get('/:id', protect, getAlumniById);

module.exports = router;
// ...existing code...