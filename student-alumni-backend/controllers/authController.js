const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AllowedEmail = require("../models/AllowedEmail");

const signToken = (user) =>
  jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "fullName, email and password required" });
    }

    const normalized = email.toLowerCase().trim();

    // check allowed
    const allowed = await AllowedEmail.findOne({ email: normalized });
    if (!allowed) {
      return res.status(403).json({ message: "Email not authorized to register. Use your college email or contact admin." });
    }

    // existing
    const existing = await User.findOne({ email: normalized });
    if (existing) return res.status(400).json({ message: "User already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email: normalized,
      password: hashed,
      role: allowed.role,
    });

    const token = signToken(user);
    const userSafe = { _id: user._id, fullName: user.fullName, email: user.email, role: user.role };

    res.json({ user: userSafe, token });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });

    const normalized = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalized });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    const userSafe = { _id: user._id, fullName: user.fullName, email: user.email, role: user.role };

    res.json({ user: userSafe, token });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
