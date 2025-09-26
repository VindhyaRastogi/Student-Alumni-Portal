const requireRole = (required) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  if (Array.isArray(required)) {
    if (!required.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
  } else {
    if (req.user.role !== required) return res.status(403).json({ message: "Forbidden" });
  }

  next();
};

module.exports = { requireRole };
