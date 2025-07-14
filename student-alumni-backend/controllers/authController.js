const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ Register Controller — No manual bcrypt hashing
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Let Mongoose schema handle password hashing
    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('❌ Registration Error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// ✅ Login Controller with detailed logging
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Login Attempt:");
    console.log("Email:", email);
    console.log("Password (entered):", password);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log("✅ User found:", user.email);
    console.log("Password (stored hash):", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Password match result:", isMatch);

    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log("✅ Password matched!");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};
