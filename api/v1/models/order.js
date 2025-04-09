const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  shipping: {
    name: String,
    address: String,
    city: String,
    zip: String,
    phone: String
  },
  cartItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number,
      price: Number
    }
  ],
  total: Number,
  payment: {
    cardEnding: String,
    status: String,
    tranzilaRaw: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
