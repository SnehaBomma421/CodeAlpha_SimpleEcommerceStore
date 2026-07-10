const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protected user routes - specific routes BEFORE parameterized ones
router.post('/', protect, createOrder);
router.get('/', protect, getUserOrders);
router.get('/all', protect, admin, getAllOrders);
router.get('/:id', protect, getOrderById);

// Admin routes
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
