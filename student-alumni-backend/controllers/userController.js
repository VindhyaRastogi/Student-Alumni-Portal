const User = require('../models/User');

// GET /users/me
const getProfile = async (req, res) => {
  res.json(req.user);
};

// POST /users (create new profile)
const createProfile = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.profilePicture = `/uploads/${req.file.filename}`;

    const existing = await User.findOne({ email: req.user.email });
    if (existing) return res.status(400).json({ message: 'Profile already exists' });

    const newUser = new User({ ...data, email: req.user.email });
    await newUser.save();
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ message: 'Server error while creating profile' });
  }
};

// PUT /users/:id (update profile)
const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.profilePicture = `/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// GET /users/alumni (fetch all alumni with filters)
const getAllAlumni = async (req, res) => {
  try {
    const { name, jobTitle, company } = req.query;
    const filter = { userType: 'alumni' };

    if (name) filter.name = new RegExp(name, 'i');
    if (jobTitle) filter.jobTitle = new RegExp(jobTitle, 'i');
    if (company) filter.company = new RegExp(company, 'i');

    const alumni = await User.find(filter);
    res.json(alumni);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching alumni list' });
  }
};

// GET /users/alumni/:id (fetch one alumni by ID)
const getAlumniById = async (req, res) => {
  try {
    const alumni = await User.findById(req.params.id);
    if (!alumni || alumni.userType !== 'alumni') {
      return res.status(404).json({ message: 'Alumni not found' });
    }
    res.json(alumni);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching alumni profile' });
  }
};

module.exports = {
  getProfile,
  createProfile,
  updateProfile,
  getAllAlumni,
  getAlumniById
};
