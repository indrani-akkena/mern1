const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price stock isActive');

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Filter out inactive products
  cart.items = cart.items.filter(item => item.product && item.product.isActive);
  await cart.save();

  const total = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  res.json({ items: cart.items, total: parseFloat(total.toFixed(2)) });
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (product.stock < quantity) {
    return res.status(400).json({ message: `Only ${product.stock} items available in stock` });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(item => item.product.toString() === productId);

  if (existingItem) {
    const newQty = existingItem.quantity + parseInt(quantity);
    if (newQty > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} items available` });
    }
    existingItem.quantity = newQty;
    existingItem.price = product.price;
  } else {
    cart.items.push({ product: productId, quantity: parseInt(quantity), price: product.price });
  }

  await cart.save();

  const total = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  res.json({ message: 'Item added to cart', total: parseFloat(total.toFixed(2)), itemCount: cart.items.length });
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  const { quantity } = req.body;

  if (quantity < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1' });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  const item = cart.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ message: 'Item not found in cart' });

  const product = await Product.findById(item.product);
  if (product && product.stock < quantity) {
    return res.status(400).json({ message: `Only ${product.stock} items available` });
  }

  item.quantity = parseInt(quantity);
  await cart.save();

  const total = cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  res.json({ message: 'Cart updated', total: parseFloat(total.toFixed(2)) });
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
  await cart.save();

  const total = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  res.json({ message: 'Item removed from cart', total: parseFloat(total.toFixed(2)), itemCount: cart.items.length });
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  cart.items = [];
  await cart.save();
  res.json({ message: 'Cart cleared' });
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
