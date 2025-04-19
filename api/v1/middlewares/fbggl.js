const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Cart = require('../models/cart');
require('dotenv').config();

// 🔐 Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://zippi-zap-computers.onrender.com/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ Uname: email });

    if (!user) {
      user = new User({
        Uname: email,
        fullname: profile.displayName,
        Upass: '',
        avatar: (profile.photos && profile.photos.length) ? profile.photos[0].value : null
      });
      await user.save();

      // Create empty cart
      const cart = new Cart({ userId: user._id, items: [] });
      await cart.save();
    }

    // Pass clean user data to route
    return done(null, user); // Let Passport pass the full user


  } catch (err) {
    console.error('Google Auth Error:', err);
    return done(err, null);
  }
}));


// 🔐 Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FB_CLIENT_ID,
  clientSecret: process.env.FB_CLIENT_SECRET,
  callbackURL: 'https://zippi-zap-computers.onrender.com/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'photos', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ Uname: profile.id });

    if (!user) {
      user = new User({
        Uname: profile.id,
        fullname: profile.displayName,
        Upass: '',
      });
      await user.save();

      // Create empty cart
      const cart = new Cart({ userId: user._id, items: [] });
      await cart.save();
    }

    done(null, user);
  } catch (err) {
    console.error('Facebook Auth Error:', err);
    done(err, null);
  }
}));

// 🧠 Session Management
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
