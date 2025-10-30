const Alumni = require('../models/Alumni');

// ✅ Save or update alumni profile
const saveAlumniProfile = async (req, res) => {
  try {
    const formData = req.body;
    const profilePicture = req.file ? req.file.filename : null;

    let alumni = await Alumni.findOne({ userId: req.user._id });
    if (alumni) {
      Object.assign(alumni, formData);
      if (profilePicture) alumni.profilePicture = profilePicture;
      await alumni.save();
    } else {
      alumni = await Alumni.create({
        userId: req.user._id,
        ...formData,
        profilePicture,
      });
    }

    res.json(alumni);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error saving alumni profile' });
  }
};

// ✅ Get logged-in alumni profile
const getAlumniProfile = async (req, res) => {
  try {
    const alumni = await Alumni.findOne({ userId: req.user._id });
    if (!alumni) return res.json({});
    res.json(alumni);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching alumni profile' });
  }
};

// ✅ Get alumni list with filters
const getAlumniList = async (req, res) => {
  try {
    const { name, jobTitle, company, areasOfInterest, location } = req.query;

    let query = {};

    if (name) query.fullName = { $regex: name, $options: "i" };
    if (jobTitle) query.jobTitle = { $regex: jobTitle, $options: "i" };
    if (company) query.company = { $regex: company, $options: "i" };
    if (areasOfInterest) query.areasOfInterest = { $regex: areasOfInterest, $options: "i" };

    if (location) {
      query.$or = [
        { "location.city": { $regex: location, $options: "i" } },
        { "location.state": { $regex: location, $options: "i" } },
        { "location.country": { $regex: location, $options: "i" } },
      ];
    }

    const alumni = await Alumni.find(query).select("-__v");
    res.json(alumni);
  } catch (err) {
    console.error("Error fetching alumni list:", err);
    res.status(500).json({ message: "Server error fetching alumni" });
  }
};

// ✅ Get alumni profile by ID (for "View Profile")
const getAlumniById = async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) return res.status(404).json({ message: "Alumni not found" });
    res.json(alumni);
  } catch (err) {
    console.error("Error fetching alumni by ID:", err);
    res.status(500).json({ message: "Server error fetching alumni profile" });
  }
};

module.exports = { saveAlumniProfile, getAlumniProfile, getAlumniList, getAlumniById };
