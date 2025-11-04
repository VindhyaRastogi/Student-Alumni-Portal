const Alumni = require("../models/Alumni");

// ✅ Save or update alumni profile
const saveAlumniProfile = async (req, res) => {
  try {
    const formData = req.body || {};
    const profilePicture = req.file ? req.file.filename : null;

    // normalize incoming values
    const phone = formData.phone || formData.mobile || null;
    const preferredContact =
      formData.preferredContact || formData.preferred_contact || null;

    let alumni = await Alumni.findOne({ userId: req.user._id });
    if (alumni) {
      // assign simple fields explicitly to avoid accidental prototype pollution
      const updatable = [
        "gender",
        "linkedin",
        "jobTitle",
        "company",
        "areasOfInterest",
        "hoursPerWeek",
        "menteesCapacity",
        "preferredContact",
        "fullName",
        "email",
      ];
      updatable.forEach((k) => {
        if (formData[k] !== undefined) alumni[k] = formData[k];
      });

      // nested fields: degrees and location
      if (formData.degrees) alumni.degrees = formData.degrees;
      if (formData.location) alumni.location = formData.location;

      // phone and profile picture
      if (phone) alumni.phone = phone;
      if (profilePicture) {
        // store with consistent /uploads/ prefix so frontend can use as-is
        alumni.profilePicture = `/uploads/${profilePicture}`;
      }

      // ensure fullName/email exist on alumni (copy from user if missing)
      if (!alumni.fullName && req.user && req.user.fullName)
        alumni.fullName = req.user.fullName;
      if (!alumni.email && req.user && req.user.email)
        alumni.email = req.user.email;

      await alumni.save();
      // also sync a few important fields into the User.profile so that
      // the User document's updatedAt is touched and admin/list views
      // that read from User see the latest profile picture without stale cache
      try {
        const User = require("../models/User");
        const user = await User.findById(req.user._id);
        if (user) {
          user.profile = user.profile || {};
          if (profilePicture)
            user.profile.profilePicture = `/uploads/${profilePicture}`;
          if (formData.jobTitle) user.profile.jobTitle = formData.jobTitle;
          if (formData.company) user.profile.company = formData.company;
          if (formData.location)
            user.profile.location = formData.location || user.profile.location;
          await user.save();
        }
      } catch (syncErr) {
        console.warn(
          "Failed to sync alumni picture into User document:",
          syncErr.message
        );
      }
    } else {
      const createObj = {
        userId: req.user._id,
        fullName: formData.fullName || (req.user && req.user.fullName) || "",
        email: formData.email || (req.user && req.user.email) || "",
        gender: formData.gender,
        degrees: formData.degrees || [],
        linkedin: formData.linkedin || "",
        jobTitle: formData.jobTitle || "",
        company: formData.company || "",
        location: formData.location || {},
        areasOfInterest: formData.areasOfInterest || "",
        hoursPerWeek: formData.hoursPerWeek || null,
        menteesCapacity: formData.menteesCapacity || null,
        preferredContact: preferredContact || null,
        phone: phone || null,
        profilePicture: profilePicture ? `/uploads/${profilePicture}` : null,
      };

      alumni = await Alumni.create(createObj);
      // also create/sync into User.profile for consistency
      try {
        const User = require("../models/User");
        const user = await User.findById(req.user._id);
        if (user) {
          user.profile = user.profile || {};
          if (alumni.profilePicture)
            user.profile.profilePicture = alumni.profilePicture;
          if (alumni.jobTitle) user.profile.jobTitle = alumni.jobTitle;
          if (alumni.company) user.profile.company = alumni.company;
          if (alumni.location) user.profile.location = alumni.location;
          await user.save();
        }
      } catch (syncErr) {
        console.warn(
          "Failed to sync new alumni into User document:",
          syncErr.message
        );
      }
    }

    // return saved alumni
    res.json(alumni);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error saving alumni profile" });
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
    res.status(500).json({ message: "Server error fetching alumni profile" });
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
    if (areasOfInterest)
      query.areasOfInterest = { $regex: areasOfInterest, $options: "i" };

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

module.exports = {
  saveAlumniProfile,
  getAlumniProfile,
  getAlumniList,
  getAlumniById,
};
