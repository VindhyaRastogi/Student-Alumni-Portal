const Student = require("../models/Student");

// ✅ Create or Update Student Profile
const createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user._id; // from protect middleware
    const { gender, degree, specialization, batch, linkedin } = req.body;

    // Always take name & email from logged-in user
    let profileData = {
      userId,
      fullName: req.user.name,
      email: req.user.email,
      gender,
      degree,
      specialization,
      batch,
      linkedin,
    };

    // If profile picture uploaded
    if (req.file) {
      profileData.profilePicture = `/uploads/${req.file.filename}`;
    }

    let student = await Student.findOne({ userId });

    if (student) {
      // Update existing profile
      student = await Student.findOneAndUpdate(
        { userId },
        { $set: profileData },
        { new: true }
      ).populate("userId", "name email");

      return res.json({
        message: "Profile updated successfully",
        profile: student,
      });
    } else {
      // Create new profile
      student = new Student(profileData);
      await student.save();
      await student.populate("userId", "name email");

      return res.json({
        message: "Profile created successfully",
        profile: student,
      });
    }
  } catch (err) {
    console.error("Error saving student profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get Student Profile
const getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate(
      "userId",
      "name email"
    );

    if (!student) {
  return res.json({
    fullName: req.user.name,
    email: req.user.email,
    gender: "",
    degree: "",
    specialization: "",
    batch: "",
    linkedin: "",
    profilePicture: ""
  });
}


    res.json(student);
  } catch (err) {
    console.error("Error fetching student profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createOrUpdateProfile, getProfile };
