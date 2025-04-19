const Cart = require('../models/cart');
const Product = require('../models/product');
const Order = require('../models/order');
const axios = require('axios');
module.exports = {
  showCheckoutPage: async (req, res) => {
    try {
      const userId = req.user._id;
      const cart = await Cart.findOne({ userId }).populate('items.productId');

      if (!cart || cart.items.length === 0) {
        return res.redirect('/cart');
      }

      const cartItems = cart.items.map(item => ({
        _id: item.productId._id,
        Pname: item.productId.Pname,
        Price: item.productId.Price,
        quantity: item.quantity,
      }));

      const total = parseFloat(
        cartItems.reduce((sum, item) => sum + item.Price * item.quantity, 0).toFixed(2)
      );
      

      res.render('checkout', {
        title: 'Checkout',
        cart: cartItems,
        total
      });

    } catch (err) {
      console.error('❌ Error showing checkout page:', err);
      res.status(500).render('error', { title: 'Error', message: 'Could not load checkout page' });
    }
  },

  placeOrder: async (req, res) => {
    try {
      const userId = req.user._id;
      const { name, address, city, zip, phone } = req.body;
  
      const cart = await Cart.findOne({ userId }).populate('items.productId');
      if (!cart || cart.items.length === 0) return res.redirect('/cart');
  
      // 💡 Define cartItems here:
      const cartItems = cart.items.map(item => ({
        _id: item.productId._id,
        Pname: item.productId.Pname,
        Price: item.productId.Price,
        quantity: item.quantity,
      }));
  
      const total = parseFloat(
        cartItems.reduce((sum, item) => sum + item.Price * item.quantity, 0).toFixed(2)
      );
  
      const order = new Order({
        userId,
        items: cart.items.map(item => ({
          productId: item.productId._id,
          quantity: item.quantity
        })),
        shipping: { name, address, city, zip, phone },
        total
      });
  
      await order.save();
      cart.items = [];
      await cart.save();
  
      res.render('confirmation', { title: 'Order Placed', order });
  
    } catch (err) {
      console.error('❌ Error placing order:', err);
      res.status(500).render('error', { title: 'Error', message: 'Failed to place order' });
    }
  },  
  
  checkoutSinglePage : async (req, res) => {
    try {
      const userId = req.user._id;
      const productId = req.params.id;
  
      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).render('error', {
          title: 'Invalid ID',
          message: 'Product ID format is invalid'
        });
      }
  
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).render('error', {
          title: 'Not Found',
          message: 'Product not found'
        });
      }
  
      const cart = await Cart.findOne({ userId }).populate('items.productId');
  
      let cartItems = [];
  
      if (cart && cart.items.length > 0) {
        cartItems = cart.items.map(item => ({
          _id: item.productId._id,
          Pname: item.productId.Pname,
          Price: item.productId.Price,
          quantity: item.quantity
        }));
      }
  
      const existing = cartItems.find(i => i._id.toString() === product._id.toString());
      if (existing) {
        existing.quantity += 1;
      } else {
        cartItems.push({
          _id: product._id,
          Pname: product.Pname,
          Price: product.Price,
          quantity: 1
        });
      }
  
      const total = parseFloat(
        cartItems.reduce((sum, item) => sum + item.Price * item.quantity, 0).toFixed(2)
      );
  
      res.render('checkout', {
        title: 'Buy Now',
        cart: cartItems,
        total,
        single: true,
        productId: product._id
      });
  
    } catch (err) {
      console.error('❌ Error loading single checkout page:', err);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Could not load single product checkout'
      });
    }
  },
  

  // ✅ HANDLE SINGLE PRODUCT ORDER CONFIRMATION
  placeSingleOrder: async (req, res) => {
    try {
      const userId = req.user._id;
      const { name, address, city, zip, phone, productId } = req.body;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).render('error', { title: 'Error', message: 'Product not found' });
      }

      const order = new Order({
        userId,
        items: [{ productId: product._id, quantity: 1 }],
        shipping: { name, address, city, zip, phone },
        total: product.Price
      });

      await order.save();
      res.render('confirmation', { title: 'Order Placed', order });

    } catch (err) {
      console.error('❌ Error placing single order:', err);
      res.status(500).render('error', { title: 'Error', message: 'Failed to place single order' });
    }
  },

  processPayment: async (req, res) => {
    try {
      const {
        name, address, city, zip, phone,
        ccno, expmonth, expyear, cvv, sum,
        productId
      } = req.body;

      const userId = req.user._id;
      const expdate = `${expmonth}${expyear.slice(-2)}`;

      let orderItems = [];
      let totalAmount = parseFloat(sum);

      // ✅ SINGLE PRODUCT CHECKOUT
      if (productId) {
        const product = await Product.findById(productId);
        if (!product) return res.render('checkout-failed', { message: 'Product not found.' });

        orderItems.push({
          product: product._id,
          quantity: 1,
          price: product.Price
        });

        totalAmount = product.Price;

      } else {
        // ✅ CART CHECKOUT
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
          return res.render('checkout-failed', { message: 'Cart is empty.' });
        }

        orderItems = cart.items.map(item => ({
          product: item.productId._id,
          quantity: item.quantity,
          price: item.productId.Price
        }));

        totalAmount = cart.items.reduce((acc, item) => acc + item.productId.Price * item.quantity, 0).toFixed(2);

        cart.items = [];
        await cart.save();
      }

      // ✅ SEND PAYMENT TO TRANZILA
      const formData = qs.stringify({
        supplier: 'tranzilatest',
        sum: totalAmount,
        ccno,
        expdate,
        cvv,
        currency: '1',
        tranmode: 'A',
        lang: 'il'
      });

      const response = await axios.post(
        'https://secure5.tranzila.com/cgi-bin/tranzila31.cgi',
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const success = response.data.includes('Response=000');

      const order = new Order({
        user: userId,
        shipping: { name, address, city, zip, phone },
        cartItems: orderItems,
        total: totalAmount,
        payment: {
          cardEnding: ccno.slice(-4),
          status: success ? 'Paid' : 'Failed',
          tranzilaRaw: response.data
        }
      });

      await order.save();

      if (success) {
        return res.render('checkout-success', { order });
      } else {
        return res.render('checkout-failed', { message: 'Payment failed.', raw: response.data });
      }

    } catch (err) {
      console.error('❌ Payment Error:', err);
      res.render('checkout-failed', { message: 'An error occurred.', raw: err.message });
    }
  }
};

