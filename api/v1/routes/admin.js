const express = require('express');
const adminRouter = express.Router();
const verifyToken = require('../middlewares/auth');

const {
  getTopProducts,
  getAllProducts,
  getProductById,
  getAllCategories,
  getCategoryById,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/admin');

// ✅ Middleware: Require login + manager role
adminRouter.use(verifyToken);
adminRouter.use((req, res, next) => {
  if (req.user?.role !== 'manager') return res.sendStatus(403);
  next();
});

// ✅ JSON Endpoints
adminRouter.get('/data/top-products', getTopProducts);
adminRouter.get('/data/products', getAllProducts);
adminRouter.get('/data/products/:id', getProductById);
adminRouter.get('/data/categories', getAllCategories);
adminRouter.get('/data/categories/:id', getCategoryById);

// ✅ View: Admin Panel (GET only)
adminRouter.get('/', (req, res) => {
  res.render('admin', { user: req.user, title: 'Admin Panel' });
});

// ✅ Form-Based Routes (for Bootstrap modals in admin.hbs)
adminRouter.post('/products/create', createProduct);

adminRouter.post('/products/update', async (req, res, next) => {
  req.params.id = req.body.Pid;
  await updateProduct(req, res, next);
});

adminRouter.post('/products/delete/:id', deleteProduct);

adminRouter.post('/categories/create', createCategory);

adminRouter.post('/categories/update', async (req, res, next) => {
  req.params.id = req.body.Cid;
  await updateCategory(req, res, next);
});

adminRouter.post('/categories/delete/:id', deleteCategory);

// ✅ Optional: Catch bad POST /admin calls (debug safety)
adminRouter.post('/', (req, res) => {
  res.status(400).send('❌ Invalid POST to /admin. Check your form action.');
});

module.exports = adminRouter;
