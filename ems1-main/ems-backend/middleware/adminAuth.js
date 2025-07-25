// middlewares/adminAuth.js

const adminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: User not authenticated' });
  }

  // Ensure role is lowercase before comparison for safety
  if (typeof req.user.role !== 'string' || req.user.role.toLowerCase() !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
  }

  next();
};

module.exports = adminAuth;
