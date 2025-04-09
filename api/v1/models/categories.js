const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  Cid: {
    type: Number,
    required: true,
    unique: true
  },
  Cname: {
    type: String,
    required: true
  },
  picname: {
    type: String,
    required: true
  },
  Cdesc: {
    type: String,
    required: true
  },
  ParentCat: {
    type: String,
    default: null
  }
}, { timestamps: true });

const CategoryModel = mongoose.model('Categories', CategorySchema, 'categories');
module.exports = CategoryModel;
