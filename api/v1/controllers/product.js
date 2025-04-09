const Product = require('../models/product');
const Category = require('../models/categories');

module.exports = {
  // List All Products with Optional Filtering and Sorting
  getAll: async (req, res) => {
    try {
      const { min, max, sort } = req.query;

      const filter = {};
      if (min || max) {
        filter.Price = {};
        if (min) filter.Price.$gte = parseFloat(min);
        if (max) filter.Price.$lte = parseFloat(max);
      }

      let sortOption = {};
      if (sort === 'price_asc') sortOption.Price = 1;
      else if (sort === 'price_desc') sortOption.Price = -1;

      const products = await Product.find(filter).sort(sortOption);

      res.render('products', {
        title: 'Products',
        products,
        query: req.query // For syncing filters in the UI
      });
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Failed to fetch products'
      });
    }
  },

  // Get Product by Mongo _id
  getByID: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).render('error', {
          title: 'Product Not Found',
          message: 'Sorry, we couldn’t find that product.'
        });
      }

      res.render('product', {
        title: product.Pname,
        product
      });
    } catch (err) {
      console.error("❌ Error loading product:", err);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Something went wrong while loading the product.'
      });
    }
  },

  // Add a New Product
  addNew: async (req, res) => {
    try {
      const newProduct = new Product(req.body); // _id auto-generated
      await newProduct.save();
      res.redirect('/products');
    } catch (err) {
      console.error("❌ Error adding product:", err);
      res.status(500).json({ error: 'Failed to add product', details: err.message });
    }
  },

  // Update Existing Product
  Update: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).render('error', { title: 'Error', message: 'Product not found' });
      }

      Object.assign(product, req.body);
      await product.save();
      res.redirect('/products');
    } catch (err) {
      console.error("❌ Error updating product:", err);
      res.status(500).json({ error: 'Failed to update product', details: err.message });
    }
  },

  // Delete a Product
  Delete: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).render('error', { title: 'Error', message: 'Product not found' });
      }

      await product.deleteOne();
      res.redirect('/products');
    } catch (err) {
      console.error("❌ Error deleting product:", err);
      res.status(500).json({ error: 'Failed to delete product', details: err.message });
    }
  }
};
