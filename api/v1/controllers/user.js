const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsersModel = require('../models/user');
const Cart = require('../models/cart');

const rounds = 10;

module.exports = {
  // Get All Users
  getAll: async (req, res) => {
    try {
      const users = await UsersModel.find();
      res.status(200).json({ msg: `All users:`, users });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: '❌ Server Error', error: err.message });
    }
  },

  // Get User by Uid
  getByID: async (req, res) => {
    try {
      const user = await UsersModel.find({ Uid: req.params.id });
      res.status(200).json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: '❌ Server Error', error: err.message });
    }
  },

  // User Login
  login: async (req, res) => {
    try {
      const { Uname, Upass } = req.body;

      const user = await UsersModel.findOne({ Uname });
      if (!user) {
        return res.status(404).render('auth', { error: `The user "${Uname}" doesn't exist.` });
      }

      const isMatch = await bcrypt.compare(Upass, user.Upass);
      if (!isMatch) {
        return res.status(401).render('auth', { error: '❌ Wrong password' });
      }

      const token = jwt.sign({ _id: user._id, Uname: user.Uname }, process.env.JWT_SECRET || 'Olala', { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });

      // Create cart if doesn't exist
      let cart = await Cart.findOne({ userId: user._id });
      if (!cart) {
        cart = new Cart({ userId: user._id, items: [] });
        await cart.save();
      }

      res.redirect('/products');
    } catch (err) {
      console.error(err);
      res.status(500).render('auth', { error: `❌ Server Error: ${err.message}` });
    }
  },

  // User Registration
  register: async (req, res) => {
    try {
      const { Uname, Upass, fullname } = req.body;

      if (!Uname || !Upass || !fullname) {
        return res.status(400).render('register', { error: '❌ All fields are required' });
      }

      const existingUser = await UsersModel.findOne({ Uname });
      if (existingUser) {
        return res.status(400).render('register', { error: `❌ Username "${Uname}" is already taken` });
      }

      const hashedPassword = await bcrypt.hash(Upass, rounds);
      const newUser = new UsersModel({ Uname, Upass: hashedPassword, fullname });
      await newUser.save();

      // Create empty cart
      const newCart = new Cart({ userId: newUser._id, items: [] });
      await newCart.save();

      // Auto login
      const token = jwt.sign({ _id: newUser._id, Uname: newUser.Uname }, process.env.JWT_SECRET || 'Olala', { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });

      res.redirect('/products');
    } catch (err) {
      console.error(err);
      res.status(500).render('register', { error: `❌ Server Error: ${err.message}` });
    }
  },

  // Update User by Uid
  Update: async (req, res) => {
    try {
      const updatedUser = await UsersModel.findOneAndUpdate(
        { Uid: req.params.Uid },
        req.body,
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ msg: `User with Uid ${req.params.Uid} not found` });
      }

      res.status(200).json({ msg: '✅ User updated', user: updatedUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: '❌ Server Error', error: err.message });
    }
  },

  // Delete User by Uid
  Delete: async (req, res) => {
    try {
      const deletedUser = await UsersModel.deleteOne({ Uid: req.params.id });

      if (deletedUser.deletedCount === 0) {
        return res.status(404).json({ msg: `User with Uid ${req.params.id} not found` });
      }

      res.status(200).json({ msg: `✅ User deleted successfully` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: '❌ Server Error', error: err.message });
    }
  },

  promoteToManager : async (req, res) => {
    try {
      if (req.user?.role !== 'manager') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
  
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { role: 'manager' },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      res.json({ success: true, user: updatedUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
