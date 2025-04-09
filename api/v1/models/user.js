const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
  Uname: {
    type: String,
    required: true,
    unique: true
  },
  Upass: {
    type: String,
    required: false
  },
  fullname: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Fix: consistent naming and default model export
const UserModel = mongoose.models.User || mongoose.model('User', UsersSchema, 'users');

module.exports = UserModel;
