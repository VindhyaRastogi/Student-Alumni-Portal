const User = require("../models/User");

// get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// update profile (store role-specific data inside profile object)
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body || {};
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profile: updates, profileCompleted: true } },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// list alumni (public for logged-in users; does NOT return admins)
exports.listAlumni = async (req, res) => {
  try {
    const alumni = await User.find({ role: "alumni" }).select("-password");
    res.json(alumni);
  } catch (err) {
    console.error("listAlumni error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// admin — list all users (excluding passwords)
exports.adminListUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("adminListUsers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
