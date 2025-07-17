const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// exports.updateProfile = async (req, res) => {
//   try {
//     const allowedFields = [
//       'bio', 'jobTitle', 'company',               // common
//       'degree', 'specialization', 'batch',        // academic
//       'workRole', 'organization',                 // alumni
//       'city', 'state', 'country',                 // location
//       'branch', 'graduationYear', 'semester', 'year' // student
//     ];

//     const updates = {};

//     // ✅ Add all allowed fields from the request body
//     for (const field of allowedFields) {
//       if (req.body[field] !== undefined) {
//         updates[field] = req.body[field];
//       }
//     }

//     // ✅ Handle uploaded profile picture (if any)
//     if (req.file) {
//       updates.profilePicture = `/uploads/${req.file.filename}`; // Adjust if using cloud storage
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       req.user.id,
//       { $set: updates },
//       { new: true, runValidators: true }
//     ).select('-password');

//     if (!updatedUser) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     res.json(updatedUser);
//   } catch (err) {
//     console.error('Profile update error:', err);
//     res.status(500).json({ error: 'Error updating profile' });
//   }
// };

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.file) {
      user.profilePicture = `/uploads/${req.file.filename}`;
    }

    const fields = ['degree', 'branch', 'specialization', 'semester', 'year', 'batch'];
    for (let field of fields) {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    }

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    console.error('❌ Error updating user:', err.message); // <-- Add this
    res.status(500).json({ message: 'Server Error', error: err.message }); // <-- Send error
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
