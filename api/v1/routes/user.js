const express = require('express');
const userrouter = express.Router();

const {
  register,
  login,
  getAll,
  getByID,
  Update,
  Delete
} = require('../controllers/user');

// 🧾 GET all users (admin/debug use)
userrouter.get('/', getAll);

// 🔍 GET user by custom Uid
userrouter.get('/:id', getByID);

// 📝 Register new user
userrouter.post('/register', register);

// 🔐 Login user
userrouter.post('/login', login);

// ✏️ Update user by Mongo ID
userrouter.put('/:id', Update);

// ❌ Delete user by Mongo ID
userrouter.delete('/:id', Delete);

module.exports = userrouter;
