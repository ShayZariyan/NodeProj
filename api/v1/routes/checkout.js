const router = require('express').Router();
const { 
  showCheckoutPage, 
  placeOrder,
  checkoutSinglePage,
  placeSingleOrder 
} = require('../controllers/checkout');

// 🛒 Full cart checkout
router.get('/', showCheckoutPage);
router.post('/confirm', placeOrder);

// ⚡ Single product checkout
router.get('/single/:id', checkoutSinglePage);
router.post('/single', placeSingleOrder);

module.exports = router;
