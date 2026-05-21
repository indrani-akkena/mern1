const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items provided' });
  }

  // Validate stock and calculate prices
  let itemsPrice = 0;
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) return res.status(404).json({ message: `Product ${item.product} not found` });
    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    }
    itemsPrice += product.price * item.quantity;

    // Deduct stock
    product.stock -= item.quantity;
    await product.save();
  }

  const taxPrice = parseFloat((itemsPrice * 0.18).toFixed(2)); // 18% GST
  const shippingPrice = itemsPrice > 999 ? 0 : 99;
  const totalPrice = parseFloat((itemsPrice + taxPrice + shippingPrice).toFixed(2));

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'COD',
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  });

  // Clear cart after ordering
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  res.status(201).json(order);
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images price');

  if (!order) return res.status(404).json({ message: 'Order not found' });

  // Only owner or admin can view
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to view this order' });
  }

  res.json(order);
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('orderItems.product', 'name images');
  res.json(orders);
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = 'Processing';
  order.paymentResult = {
    id: req.body.id || `PAY-${Date.now()}`,
    status: 'COMPLETED',
    updateTime: new Date().toISOString(),
    email: req.body.email || req.user.email
  };

  const updated = await order.save();
  res.json(updated);
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page) || 1;

  const query = {};
  if (req.query.status) query.status = req.query.status;

  const count = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ orders, page, pages: Math.ceil(count / pageSize), total: count });
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.status = req.body.status;

  if (req.body.status === 'Delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  if (req.body.trackingNumber) {
    order.trackingNumber = req.body.trackingNumber;
  }

  const updated = await order.save();
  res.json(updated);
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  if (['Shipped', 'Delivered'].includes(order.status)) {
    return res.status(400).json({ message: 'Cannot cancel a shipped or delivered order' });
  }

  // Restore stock
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }

  order.status = 'Cancelled';
  const updated = await order.save();
  res.json(updated);
};

// @desc    Get order stats (Admin)
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);

  const statusBreakdown = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const monthlySales = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 }
  ]);

  res.json({
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    statusBreakdown,
    monthlySales
  });
};

module.exports = {
  createOrder, getOrderById, getMyOrders, updateOrderToPaid,
  getAllOrders, updateOrderStatus, cancelOrder, getOrderStats
};
