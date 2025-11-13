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

// list students (public for logged-in users; does NOT return admins)
exports.listStudents = async (req, res) => {
  try {
    const { name, degree, batch, areaOfInterest } = req.query || {};

    const query = { role: "student" };

    if (name) {
      // match fullName partially, case-insensitive
      query.fullName = { $regex: name, $options: "i" };
    }

    if (degree) {
      // degree is stored under profile.degree
      query["profile.degree"] = { $regex: degree, $options: "i" };
    }

    if (batch) {
      query["profile.batch"] = { $regex: batch, $options: "i" };
    }

    if (areaOfInterest) {
      query["profile.areaOfInterest"] = {
        $regex: areaOfInterest,
        $options: "i",
      };
    }

    const students = await User.find(query).select("-password");
    res.json(students);
  } catch (err) {
    console.error("listStudents error:", err);
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

// get a user by id (flatten profile for frontend)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    let profileData = {
      name: user.fullName,
      email: user.email,
      ...(user.profile || {}),
    };

    // try to merge Student collection if present (backwards compatibility)
    const Student = require("../models/Student");
    const studentDoc = await Student.findOne({ userId: user._id }).lean();
    if (studentDoc) {
      profileData = Object.assign({}, { name: profileData.name, email: profileData.email }, studentDoc);
    }

    res.json(profileData);
  } catch (err) {
    console.error("getUserById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
