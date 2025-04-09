const Cart = require('../models/cart');
const Product = require('../models/product');

module.exports = {

  // Add to Cart via link (GET /cart/add/:productId)
  addToCartViaLink: async (req, res) => {
    try {
      const userId = req.user?._id;

      if (!userId) return res.redirect('/auth');

      const productId = req.params.productId;
      const quantity = 1;

      let cart = await Cart.findOne({ userId });
      if (!cart) cart = new Cart({ userId, items: [] });

      const index = cart.items.findIndex(item => item.productId.toString() === productId);
      if (index > -1) {
        cart.items[index].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }

      await cart.save();
      res.redirect('/cart');
    } catch (err) {
      console.error('❌ Error adding to cart:', err);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Failed to add product to cart',
      });
    }
  },

  // Add to Cart via POST (for forms/api)
  addToCart: async (req, res) => {
    try {
      const { userId, productId, quantity } = req.body;

      if (!userId || !productId || !quantity) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
      }

      let cart = await Cart.findOne({ userId });
      if (!cart) cart = new Cart({ userId, items: [] });

      const index = cart.items.findIndex(item => item.productId.toString() === productId);
      if (index > -1) {
        cart.items[index].quantity += parseInt(quantity);
      } else {
        cart.items.push({ productId, quantity: parseInt(quantity) });
      }

      await cart.save();
      res.json({ success: true, message: 'Product added to cart.', cart });
    } catch (err) {
      console.error('❌ Error adding via POST:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // View Cart
  getCart: async (req, res) => {
    try {
      const userId = req.user?._id || req.params.userId;

      if (!userId) return res.redirect('/auth');

      const cart = await Cart.findOne({ userId }).populate('items.productId');

      if (!cart || cart.items.length === 0) {
        return res.render('cart', { title: 'Your Cart', cartItems: [], total: 0 });
      }

      const cartItems = cart.items.map(item => ({
        _id: item.productId._id,
        name: item.productId.Pname,
        price: item.productId.Price,
        quantity: item.quantity,
        total: item.quantity * item.productId.Price,
        image: item.productId.picname
      }));

      const total = cartItems.reduce((sum, item) => sum + item.total, 0);

      res.render('cart', { title: 'Your Cart', cartItems, total });
    } catch (err) {
      console.error('❌ Failed to load cart:', err.message);
      res.status(500).render('error', {
        title: 'Cart Error',
        message: 'Failed to load cart'
      });
    }
  },

  // Update Quantity
  updateCart: async (req, res) => {
    try {
      const { userId, productId, quantity } = req.body;
      const cart = await Cart.findOne({ userId });

      if (!cart) return res.status(404).render('error', { title: 'Cart Error', message: 'Cart not found' });

      const index = cart.items.findIndex(item => item.productId.toString() === productId);
      if (index > -1) {
        if (quantity <= 0) {
          cart.items.splice(index, 1);
        } else {
          cart.items[index].quantity = parseInt(quantity);
        }
        await cart.save();
      }

      res.redirect('/cart');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { title: 'Update Failed', message: err.message });
    }
  },

  // Remove Item
  removeFromCart: async (req, res) => {
    try {
      const { userId, productId } = req.body;
      const cart = await Cart.findOne({ userId });

      if (!cart) return res.status(404).render('error', { title: 'Cart Error', message: 'Cart not found' });

      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
      await cart.save();

      res.redirect('/cart');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { title: 'Remove Failed', message: err.message });
    }
  },

  // Clear Cart
  clearCart: async (req, res) => {
    try {
      const { userId } = req.params;
      let cart = await Cart.findOne({ userId });

      if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

      cart.items = [];
      await cart.save();
      res.json({ success: true, message: 'Cart cleared', cart });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};
