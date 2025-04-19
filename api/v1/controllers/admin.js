const Order = require('../models/order');
const Product = require('../models/product');
const Category = require('../models/categories');

module.exports = {
// GET Top 3 selling products
getTopProducts : async (req, res) => {
  try {
    const top = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" }
    ]);

    res.json(
      top.map((entry) => ({
        totalSold: entry.totalSold,
        product: entry.productInfo
      }))
    );
  } catch (err) {
    console.error("❌ Failed to get top products:", err);
    res.status(500).json({ error: "Server Error" });
  }
},

//
// PRODUCT CRUD
//

getAllProducts : async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
},

getProductById : async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
},

createProduct : async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.redirect('/admin'); // ✅ redirect instead of json for form submission
  } catch (err) {
    console.error("❌ Create product failed:", err);
    res.status(500).send('Product creation failed');
  }
},

updateProduct : async (req, res) => {
  try {
    req.params.id = req.body._id; // ✅ Set ID from form
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Not found' });

    res.redirect('/admin');
  } catch (err) {
    console.error("❌ Update failed:", err);
    res.status(500).send('Update failed');
  }
},

deleteProduct: async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    console.error('❌ Failed to delete product:', err);
    res.status(500).send('Delete failed');
  }
},


//
// CATEGORY CRUD
//

getAllCategories : async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
},

getCategoryById : async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
},

createCategory : async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.redirect('/admin');
  } catch (err) {
    res.status(500).json({ error: 'Creation failed' });
  }
},

updateCategory : async (req, res) => {
  try {
    req.params.id = req.body._id;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!category) return res.status(404).json({ error: 'Not found' });

    res.redirect('/admin');
  } catch (err) {
    console.error("❌ Update category failed:", err);
    res.status(500).send('Update failed');
  }
},


deleteCategory: async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    console.error('❌ Failed to delete category:', err);
    res.status(500).send('Delete failed');
  }
}
};
