const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [orderItemSchema],
  shippingAddress: {
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'UPI', 'Card', 'NetBanking'],
    default: 'COD'
  },
  paymentResult: {
    id: String,
    status: String,
    updateTime: String,
    email: String
  },
  itemsPrice:    { type: Number, required: true, default: 0 },
  taxPrice:      { type: Number, required: true, default: 0 },
  shippingPrice: { type: Number, required: true, default: 0 },
  totalPrice:    { type: Number, required: true, default: 0 },
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  isDelivered: { type: Boolean, default: false },
  deliveredAt: Date,
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  trackingNumber: String,
  notes: String
}, { timestamps: true });

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Order', orderSchema);
