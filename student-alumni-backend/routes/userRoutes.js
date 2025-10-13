const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // ✅ fixed
const { requireRole } = require("../middleware/roleMiddleware");
const userCtrl = require("../controllers/userController");

router.get("/me", authMiddleware, userCtrl.getMe);
router.put("/me", authMiddleware, userCtrl.updateProfile);

// listing endpoints
router.get("/alumni", authMiddleware, userCtrl.listAlumni);

// admin-only
router.get("/admin/users", authMiddleware, requireRole("admin"), userCtrl.adminListUsers);

module.exports = router;
