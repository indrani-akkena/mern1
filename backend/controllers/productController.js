const Product = require('../models/Product');

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 12;
  const page = parseInt(req.query.page) || 1;

  const query = { isActive: true };

  // Search
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { brand: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Category filter
  if (req.query.category && req.query.category !== 'all') {
    query.category = req.query.category;
  }

  // Price range filter
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
  }

  // Featured
  if (req.query.featured === 'true') query.isFeatured = true;

  // Rating filter
  if (req.query.minRating) {
    query.rating = { $gte: parseFloat(req.query.minRating) };
  }

  // Sort
  let sortOption = { createdAt: -1 };
  switch (req.query.sort) {
    case 'price_asc':  sortOption = { price: 1 };  break;
    case 'price_desc': sortOption = { price: -1 }; break;
    case 'rating':     sortOption = { rating: -1 }; break;
    case 'newest':     sortOption = { createdAt: -1 }; break;
    case 'name_asc':   sortOption = { name: 1 }; break;
  }

  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .select('-reviews');

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
    hasMore: page < Math.ceil(count / pageSize)
  });
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('reviews.user', 'name avatar');
  if (!product || !product.isActive) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const product = new Product({
    ...req.body,
    images: req.body.images || ['https://via.placeholder.com/400x400?text=Product']
  });
  const created = await product.save();
  res.status(201).json(created);
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  Object.assign(product, req.body);
  const updated = await product.save();
  res.json(updated);
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  product.isActive = false;
  await product.save();
  res.json({ message: 'Product removed successfully' });
};

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ message: 'Rating and comment are required' });
  }

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const alreadyReviewed = product.reviews.find(
    r => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    return res.status(400).json({ message: 'You have already reviewed this product' });
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment
  });

  product.updateRating();
  await product.save();
  res.status(201).json({ message: 'Review added successfully' });
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true }).limit(8).select('-reviews');
  res.json(products);
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  const categories = await Product.distinct('category', { isActive: true });
  res.json(categories);
};

// @desc    Admin: Get all products including inactive
// @route   GET /api/products/admin/all
// @access  Private/Admin
const getAdminProducts = async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 }).select('-reviews');
  res.json(products);
};

module.exports = {
  getProducts, getProductById, createProduct, updateProduct,
  deleteProduct, createProductReview, getFeaturedProducts,
  getCategories, getAdminProducts
};
