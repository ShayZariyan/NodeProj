const Order = require('../models/order');
const Product = require('../models/product');

exports.getTopProducts = async (req, res) => {
  const top = await Order.aggregate([
    { $unwind: '$cartItems' },
    {
      $group: {
        _id: '$cartItems.product',
        totalSold: { $sum: '$cartItems.quantity' }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 3 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    { $unwind: '$productInfo' }
  ]);

  res.json(top);
};
