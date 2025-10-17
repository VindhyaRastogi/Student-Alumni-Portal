const User = require("../models/User");
const path = require("path");
const fs = require("fs");

// ✅ Get logged-in student profile
exports.getStudentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update student profile
exports.updateStudentProfile = async (req, res) => {
  try {
    const {
      gender,
      degree,
      specialization,
      batch,
      areaOfInterest,
      linkedin,
    } = req.body;

    let updateData = {
      gender,
      degree,
      specialization,
      batch,
      areaOfInterest,
      linkedin,
    };

    // ✅ Handle profile picture if uploaded
    if (req.files && req.files.profilePicture) {
      const file = req.files.profilePicture;
      const uploadPath = path.join(__dirname, "../uploads", file.name);
      await file.mv(uploadPath);
      updateData.profilePicture = `/uploads/${file.name}`;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    }).select("-password");

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating student profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
