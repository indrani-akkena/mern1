const express = require('express');
const router = express.Router();
const {
  createOrder, getOrderById, getMyOrders, updateOrderToPaid,
  getAllOrders, updateOrderStatus, cancelOrder, getOrderStats
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createOrder).get(protect, admin, getAllOrders);
router.get('/myorders', protect, getMyOrders);
router.get('/stats', protect, admin, getOrderStats);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, updateOrderToPaid);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
