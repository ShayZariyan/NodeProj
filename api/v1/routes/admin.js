const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const Order = require('../models/order');


// 🔐 Only allow access to managers
router.get('/', verifyToken, (req, res) => {
  if (req.user?.role !== 'manager') return res.redirect('/');
  res.render('admin', { user: req.user });
})

router.get('/top-products', verifyToken, async (req, res) => {
    if (req.user?.role !== 'manager') return res.status(403).json({ error: 'Forbidden' });
  
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
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);
  
    res.json(top);
  });
  

module.exports = router;
