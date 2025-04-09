const Category = require('../models/categories');
const Product = require('../models/product');

module.exports = { 
  // Get All Categories
  getAll: async (req, res) => {
    try {
      const categories = await Category.find();
      res.render('categories', { title: 'Categories', categories });
    } catch (err) {
      res.status(500).render('error', { title: 'Error', message: 'Failed to fetch categories' });
    }
  },

  // Get Category by Cid
  getByID: async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await Category.findOne({ Cid: categoryId });
  
      if (!category) {
        return res.status(404).render('error', {
          title: 'Category Not Found',
          message: 'This category does not exist.'
        });
      }
  
      const products = await Product.find({ cid: categoryId });
  
      res.render('category', {
        title: category.Cname,
        category,
        products,
        query: {} // just to prevent undefined query in template
      });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Failed to load category page'
      });
    }
  },  

  // Add New Category
  addNew: async (req, res) => {
    try {
      const newCategory = new Category(req.body);
      await newCategory.save();
      res.json(newCategory);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Update Category by MongoDB _id
  Update: async (req, res) => {
    try {
      const updatedCategory = await Category.findById(req.params.id);
      if (!updatedCategory) return res.status(404).json('Category not found');
      Object.assign(updatedCategory, req.body);
      await updatedCategory.save();
      res.json(updatedCategory);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Delete Category by MongoDB _id
  Delete: async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) return res.status(404).json('Category not found');
      await category.deleteOne();
      res.json({ message: 'Category deleted successfully' });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Get Products by Category (with filtering and sorting)
  getByCategory: async (req, res) => {
    try {
      const categoryId = parseInt(req.params.cid); 
      const { min, max, sort } = req.query;

      const query = { cid: categoryId };

      if (min || max) {
        query.Price = {};
        if (min) query.Price.$gte = parseFloat(min);
        if (max) query.Price.$lte = parseFloat(max);
      }

      let sortOptions = {};
      if (sort === 'price_asc') sortOptions.Price = 1;
      else if (sort === 'price_desc') sortOptions.Price = -1;

      const [products, category] = await Promise.all([
        Product.find(query).sort(sortOptions),
        Category.findOne({ Cid: categoryId })
      ]);

      res.render('category', {
        title: category?.Cname || 'Category',
        products,
        category,
        query: req.query
      });

    } catch (err) {
      console.error(err);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Failed to fetch products by category'
      });
    }
  }
};
