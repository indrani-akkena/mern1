import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, total, loading } = useSelector(state => state.cart);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const handleQtyChange = async (itemId, qty) => {
    if (qty < 1) return;
    try {
      await dispatch(updateCartItem({ itemId, quantity: qty })).unwrap();
    } catch (err) {
      toast.error(err || 'Failed to update quantity');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Clear all items from cart?')) {
      await dispatch(clearCart());
      toast.success('Cart cleared');
    }
  };

  const tax      = parseFloat((total * 0.18).toFixed(2));
  const shipping = total > 999 ? 0 : 99;
  const grandTotal = parseFloat((total + tax + shipping).toFixed(2));

  if (items.length === 0) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <div className="text-8xl mb-6">🛒</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
      <p className="text-gray-500 mb-8">Add some products to get started!</p>
      <Link to="/products" className="btn-primary text-base py-3 px-8">Browse Products</Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart ({items.length} items)</h1>
        <button onClick={handleClearCart} className="text-sm text-red-500 hover:text-red-700">Clear Cart</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item._id} className="card p-4 flex gap-4">
              <img
                src={item.product?.images?.[0] || 'https://via.placeholder.com/80'}
                alt={item.product?.name}
                className="w-20 h-20 object-cover rounded-xl bg-gray-50 flex-shrink-0"
                onError={e => { e.target.src = 'https://via.placeholder.com/80'; }}
              />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product?._id}`} className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 text-sm">
                  {item.product?.name}
                </Link>
                <p className="text-blue-600 font-bold mt-1">₹{item.price?.toLocaleString()}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => handleQtyChange(item._id, item.quantity - 1)} disabled={loading}
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-50">−</button>
                    <span className="px-3 py-1 text-sm font-semibold border-x border-gray-200">{item.quantity}</span>
                    <button onClick={() => handleQtyChange(item._id, item.quantity + 1)} disabled={loading}
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-50">+</button>
                  </div>
                  <span className="text-sm text-gray-500">= ₹{(item.price * item.quantity).toLocaleString()}</span>
                  <button onClick={() => handleRemove(item._id)} className="ml-auto text-red-400 hover:text-red-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-blue-600">Add ₹{(999 - total + 1).toFixed(0)} more for free shipping!</p>
              )}
              <hr className="border-gray-100" />
              <div className="flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout')} className="w-full btn-primary py-3 text-base mb-3">
              Proceed to Checkout →
            </button>
            <Link to="/products" className="w-full btn-secondary py-2.5 text-sm text-center block">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
