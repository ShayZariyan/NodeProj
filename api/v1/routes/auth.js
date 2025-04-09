const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); // Added this
require('dotenv').config();
const User = require('../models/user'); // Using User consistently


router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth' }),
  async (req, res) => {
    try {
      const user = req.user;

      const token = jwt.sign({
        _id: user._id,
        displayName: user.fullname,
        avatar: user.avatar
      }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });

      res.cookie('token', token, { httpOnly: true });
      res.redirect('/products');
    } catch (err) {
      console.error('Google Auth Error:', err.message);
      res.status(500).render('error', {
        title: 'Auth Error',
        message: 'Failed to login with Google: ' + err.message
      });
    }
  }
);


// =====================
// FACEBOOK LOGIN
// =====================
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email']
}));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/auth' }),
  (req, res) => {
    const token = jwt.sign(
      { _id: req.user._id, Uname: req.user.Uname },
      process.env.JWT_SECRET || 'Olala',
      { expiresIn: '1h' }
    );
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/products');
  }
);

// =====================
// LOGOUT
// =====================
router.get('/logout', (req, res, next) => {
  res.clearCookie('token');

  if (req.logout) {
    req.logout(err => {
      if (err) return next(err);
      return res.render('logout'); // 👈 Show logout.hbs
    });
  } else {
    res.render('logout'); // 👈 Show logout.hbs
  }
});


router.get('/', (req, res) => {
  res.render('auth'); // must exist as auth.hbs
});

// Render Register Page
router.get('/register', (req, res) => {
  res.render('register'); // must exist as register.hbs
});
module.exports = router;
