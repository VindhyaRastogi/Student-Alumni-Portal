const Alumni = require('../models/Alumni');

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
      alumni = await Alumni.create({ userId: req.user._id, ...formData, profilePicture });
    }

    res.json(alumni);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAlumniProfile = async (req, res) => {
  try {
    const alumni = await Alumni.findOne({ userId: req.user._id });
    if (!alumni) {
      // Return an empty object instead of 404
      return res.json({});
    }
    res.json(alumni);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.find().select("-password"); // password hide
    res.status(200).json(alumni);
  } catch (error) {
    res.status(500).json({ message: "Error fetching alumni list", error: error.message });
  }
};


module.exports = { saveAlumniProfile, getAlumniProfile,   getAllAlumni };
