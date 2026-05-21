const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page) || 1;
  const query = {};

  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const count = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .select('-password');

  res.json({ users, page, pages: Math.ceil(count / pageSize), total: count });
};

// @desc    Get user by ID (Admin)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.role = req.body.role || user.role;
  user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;

  const updated = await user.save();
  res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role, isActive: updated.isActive });
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user.role === 'admin') {
    return res.status(400).json({ message: 'Cannot delete admin user' });
  }

  await user.deleteOne();
  res.json({ message: 'User deleted successfully' });
};

// @desc    Get dashboard stats (Admin)
// @route   GET /api/users/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: new Date(new Date().setDate(1)) }
  });

  const totalOrders = await Order.countDocuments();
  const revenueData = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);

  const recentOrders = await Order.find({})
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    totalUsers,
    activeUsers,
    newUsersThisMonth,
    totalOrders,
    totalRevenue: revenueData[0]?.total || 0,
    recentOrders
  });
};

module.exports = { getUsers, getUserById, updateUser, deleteUser, getDashboardStats };
