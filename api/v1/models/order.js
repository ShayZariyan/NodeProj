const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
    }
  ],
  shipping: {
    name: String,
    address: String,
    city: String,
    zip: String,
    phone: String
  },
  total: Number
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
