const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // ✅ fixed
const { requireRole } = require("../middleware/roleMiddleware");
const userCtrl = require("../controllers/userController");
const upload = require("../middleware/upload");

router.get("/me", authMiddleware.auth, userCtrl.getMe);
router.put("/me", authMiddleware.auth, userCtrl.updateProfile);
router.get("/alumni", authMiddleware.auth, userCtrl.listAlumni);
router.get("/students", authMiddleware.auth, userCtrl.listStudents);
router.get("/:id", authMiddleware.auth, userCtrl.getUserById);
// POST /me/photo -> upload current user's profile picture
router.post(
  "/me/photo",
  authMiddleware.auth,
  upload.single("profilePicture"),
  userCtrl.uploadProfilePhoto
);
router.get(
  "/admin/users",
  authMiddleware.auth,
  requireRole("admin"),
  userCtrl.adminListUsers
);

module.exports = router;
