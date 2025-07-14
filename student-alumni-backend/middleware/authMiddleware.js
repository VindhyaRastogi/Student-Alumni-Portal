const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path as needed

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid Token' });
  }
};

const verifyAdmin = async (req, res, next) => {
  // Ensure auth middleware ran first and set req.user
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Fetch user from DB to verify role
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  auth,
  verifyAdmin,
};
