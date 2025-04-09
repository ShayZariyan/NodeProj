const router = require('express').Router();
const { 
  showCheckoutPage, 
  placeOrder,
  checkoutSinglePage,
  placeSingleOrder,
  processPayment
} = require('../controllers/checkout');
const verifyToken = require('../middlewares/auth.js');


// 🛒 Full cart checkout
router.get('/', showCheckoutPage);
router.post('/confirm', placeOrder);

// ⚡ Single product checkout
router.get('/single/:id', checkoutSinglePage);
router.post('/single', placeSingleOrder);
router.post('/process-payment', verifyToken,processPayment);


module.exports = router;
