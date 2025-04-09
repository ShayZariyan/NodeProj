const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  Pid: {
    type: Number,
    required: true,
    unique: true
  },
  Pname: {
    type: String,
    required: true
  },
  Price: {
    type: Number,
    required: true
  },
  picname: {
    type: String,
    required: true
  },
  Pdesc: {
    type: String,
    required: true
  },
  cid: {
    type: Number,
    required: true // Matches Category.Cid
  }
}, { timestamps: true });

// Fix overwrite error in dev environments
const ProductModel = mongoose.models.Product || mongoose.model('Product', ProductSchema, 'products');

module.exports = ProductModel;
