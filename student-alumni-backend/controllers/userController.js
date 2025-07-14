const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'bio', 'jobTitle', 'company', // common
      'degree', 'specialization', 'batch', 'workRole', 'organization', 'profilePicture', // alumni
      'city', 'state', 'country',   // location (alumni)
      'branch', 'graduationYear'    // student
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Error updating profile' });
  }
};

exports.getFilteredAlumni = async (req, res) => {
  try {
    const { name, jobTitle, company } = req.query;

    let query = { role: 'alumni' };

    if (name) query.name = { $regex: name, $options: 'i' };
    if (jobTitle) query.jobTitle = { $regex: jobTitle, $options: 'i' };
    if (company) query.company = { $regex: company, $options: 'i' };

    const alumni = await User.find(query).select('-password');
    res.json(alumni);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alumni' });
  }
};
