const express = require('express');
const router = express.Router();
const {
  getAll,
  getByID,
  addNew,
  Update,
  Delete
} = require('../controllers/product');

// 🛒 GET all products (with optional filter/sort)
router.get('/', getAll);

// 🔍 GET product by ID
router.get('/:id', getByID);

// ➕ POST new product
router.post('/', addNew);

// ✏️ PUT update product by ID
router.put('/:id', Update);

// ❌ DELETE product by ID
router.delete('/:id', Delete);

module.exports = router;
