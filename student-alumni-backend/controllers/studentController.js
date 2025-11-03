const User = require("../models/User");
const Student = require("../models/Student");
const path = require("path");
const fs = require("fs");

// ✅ Get logged-in student profile
exports.getStudentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Flatten the response so frontend receives student fields at top-level
    // (frontend expects properties like degree, specialization, etc.)
    let profileData = {
      name: user.fullName,
      email: user.email,
      // merge any role-specific data stored under user.profile
      ...(user.profile || {}),
    };

    // If user.profile doesn't contain student-specific fields, fall back to the
    // separate Student collection (for projects that stored data there previously)
    const studentDoc = await Student.findOne({ userId: user._id }).lean();
    if (studentDoc) {
      // merge studentDoc fields (but keep name/email from User)
      profileData = {
        name: profileData.name,
        email: profileData.email,
        ...studentDoc,
      };
    }

    return res.json(profileData);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update student profile
exports.updateStudentProfile = async (req, res) => {
  try {
    const { gender, degree, specialization, batch, areaOfInterest, linkedin } =
      req.body;

    let updateData = {
      gender,
      degree,
      specialization,
      batch,
      areaOfInterest,
      linkedin,
    };

    // ✅ Handle profile picture if uploaded via multer (req.file)
    if (req.file) {
      // multer stores file info on req.file; filename is generated in the route
      updateData.profilePicture = `/uploads/${req.file.filename}`;
    }

    // Load the user and persist the student-specific fields under user.profile
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profile = user.profile || {};
    // Copy incoming updateData into user.profile
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) user.profile[key] = updateData[key];
    });

    // If file uploaded via multer, save its path inside user.profile
    if (req.file) {
      user.profile.profilePicture = `/uploads/${req.file.filename}`;
    }

    await user.save();

    // Persist into Student collection as well for compatibility
    try {
      const studentDoc = await Student.findOne({ userId: user._id });
      if (studentDoc) {
        // update fields on existing Student doc
        Object.keys(user.profile || {}).forEach((k) => {
          studentDoc[k] = user.profile[k];
        });
        studentDoc.name = user.fullName;
        studentDoc.email = user.email;
        await studentDoc.save();
      } else {
        // create new Student doc from user.profile
        await Student.create({
          userId: user._id,
          name: user.fullName,
          email: user.email,
          ...(user.profile || {}),
        });
      }
    } catch (e) {
      console.warn("Could not sync Student collection:", e.message);
    }

    // Respond with a flattened profile object (name/email + profile fields)
    const responseProfile = {
      name: user.fullName,
      email: user.email,
      ...(user.profile || {}),
    };

    return res.json(responseProfile);
  } catch (error) {
    console.error("Error updating student profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
