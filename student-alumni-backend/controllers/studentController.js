
const User = require("../models/User");

const path = require("path");

// ✅ Get student profile by ID (or from token)
exports.getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from token middleware
    const user = await User.findById(userId).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching student profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update student profile
exports.updateStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const updateData = { ...req.body };
    if (req.file) {
      updateData.profilePicture = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};