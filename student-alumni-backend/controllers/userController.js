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

    // Find the user so we can merge profile fields instead of overwriting.
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If fullName provided at top-level, update it.
    if (
      typeof updates.fullName === "string" &&
      updates.fullName.trim() !== ""
    ) {
      user.fullName = updates.fullName;
    }

    // Merge other profile fields into existing profile object instead of
    // replacing the entire object. This preserves existing data like
    // profile.profilePicture when the request only contains some fields.
    const profileUpdates = { ...updates };
    // remove top-level fullName from profileUpdates if present
    delete profileUpdates.fullName;

    user.profile = { ...(user.profile || {}), ...(profileUpdates || {}) };
    user.profileCompleted = true;

    await user.save();

    const ret = user.toObject();
    delete ret.password;
    res.json(ret);
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
      profileData = Object.assign(
        {},
        { name: profileData.name, email: profileData.email },
        studentDoc
      );
    }

    res.json(profileData);
  } catch (err) {
    console.error("getUserById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// upload profile picture for current user (multipart/form-data with field 'profilePicture')
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ message: "Unauthorized" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // store path with /uploads prefix
    const filename = req.file.filename;
    user.profile = user.profile || {};
    user.profile.profilePicture = `/uploads/${filename}`;

    await user.save();

    // return updated user (without password)
    const ret = user.toObject();
    delete ret.password;
    res.json(ret);
  } catch (err) {
    console.error("uploadProfilePhoto error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: update another user's basic fields (soft-block / role)
exports.adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { allowed, role } = req.body || {};

    const updates = {};
    if (typeof allowed !== "undefined") updates.allowed = !!allowed;
    if (typeof role === "string" && role.trim() !== "") updates.role = role;

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ message: "No valid fields to update" });

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
    }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("adminUpdateUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
