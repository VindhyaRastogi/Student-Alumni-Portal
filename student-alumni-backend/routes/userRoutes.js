const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // ✅ fixed
const { requireRole } = require("../middleware/roleMiddleware");
const userCtrl = require("../controllers/userController");

router.get("/me", authMiddleware.auth, userCtrl.getMe);
router.put("/me", authMiddleware.auth, userCtrl.updateProfile);
router.get("/alumni", authMiddleware.auth, userCtrl.listAlumni);
router.get("/students", authMiddleware.auth, userCtrl.listStudents);
router.get("/:id", authMiddleware.auth, userCtrl.getUserById);
router.get(
  "/admin/users",
  authMiddleware.auth,
  requireRole("admin"),
  userCtrl.adminListUsers
);

module.exports = router;
