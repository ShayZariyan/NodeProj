// routes/home.js
const express = require('express');
const router = express.Router();
const Product = require('../models/product');

router.get('/', async (req, res) => {
  try {
    const featuredProducts = await Product.find().sort({ _id: -1 }).limit(3);
    res.render('home', {
      title: 'Home',
      featuredProducts
    });
  } catch (err) {
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load home page'
    });
  }
});

module.exports = router;
