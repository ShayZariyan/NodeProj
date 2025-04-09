const express = require('express');
const catrouter = express.Router();
const {
  getAll,
  getByID,
  addNew,
  Update,
  Delete,
  getByCategory
} = require('../controllers/categories');

// Get all categories
catrouter.get('/', getAll);

// Get products by custom category Cid (MUST come before /:id to avoid conflict)
catrouter.get('/category/:cid', getByCategory);

// Get category by MongoDB _id
catrouter.get('/:id', getByID);

// Add a new category
catrouter.post('/', addNew);

// Update category
catrouter.put('/:id', Update);

// Delete category
catrouter.delete('/:id', Delete);

module.exports = catrouter;
