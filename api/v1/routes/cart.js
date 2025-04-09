const router = require('express').Router();
const {addToCart,addToCartViaLink, getCart, updateCart, removeFromCart, clearCart} = require('../controllers/cart');

router.post('/add', addToCart);
router.get('/add/:productId', addToCartViaLink);
router.get('/:userId?', getCart);
router.post('/update', updateCart);
router.post('/remove', removeFromCart);
router.delete('/clear/:userId', clearCart);

module.exports = router;
