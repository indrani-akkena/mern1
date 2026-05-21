const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [120, 'Name cannot exceed 120 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Automotive', 'Food', 'Other']
  },
  brand: { type: String, default: 'Generic' },
  images: [{ type: String }],
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  tags: [String],
  sku: { type: String, unique: true },
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  }
}, { timestamps: true });

// Update rating on save
productSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    this.numReviews = this.reviews.length;
    this.rating = this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
  }
};

// Auto-generate SKU
productSchema.pre('save', function(next) {
  if (!this.sku) {
    this.sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
