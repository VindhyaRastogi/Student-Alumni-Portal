const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload?.id) return res.status(401).json({ message: "Invalid token" });

    // attach minimal user info
    req.user = { id: payload.id, role: payload.role };

    // optional: attach user document without password
    req.userDoc = await User.findById(payload.id).select("-password");

    next();
  } catch (err) {
    console.error("authMiddleware error:", err.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { authMiddleware };
