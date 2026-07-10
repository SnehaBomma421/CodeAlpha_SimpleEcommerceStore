const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getSuggestions,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes - order matters! Specific routes before parameterized ones
router.get('/featured', getFeaturedProducts);
router.get('/suggestions', getSuggestions);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
