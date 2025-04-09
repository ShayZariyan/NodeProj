const jwt = require('jsonwebtoken');
const UsersModel = require('../models/user'); // ✅ Make sure this path is correct
require('dotenv').config();


module.exports = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    req.user = null;
    return next(); // Guest access allowed
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // 🧠 Attach full user to req.user
    const user = await UsersModel.findById(decoded.id || decoded._id);
    if (!user) {
      res.clearCookie('token');
      req.user = null;
    } else {
      req.user = user;
    }

  } catch (err) {
    console.error('❌ Invalid Token:', err.message);
    res.clearCookie('token');
    req.user = null;
  }

  next();
};
