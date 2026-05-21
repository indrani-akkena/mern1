import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder, clearOrderSuccess } from '../redux/slices/orderSlice';
import { fetchCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';

const STEPS = ['Shipping', 'Payment', 'Review'];

const CheckoutPage = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { items, total } = useSelector(state => state.cart);
  const { loading, success, order, error } = useSelector(state => state.orders);
  const { userInfo } = useSelector(state => state.auth);

  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState({
    street: userInfo?.address?.street || '',
    city: userInfo?.address?.city || '',
    state: userInfo?.address?.state || '',
    zipCode: userInfo?.address?.zipCode || '',
    country: userInfo?.address?.country || 'India'
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  useEffect(() => {
    if (success && order) {
      dispatch(clearOrderSuccess());
      navigate(`/orders/${order._id}?success=true`);
    }
  }, [success, order, dispatch, navigate]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const tax      = parseFloat((total * 0.18).toFixed(2));
  const shipping_fee = total > 999 ? 0 : 99;
  const grandTotal   = parseFloat((total + tax + shipping_fee).toFixed(2));

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!shipping.street || !shipping.city || !shipping.state || !shipping.zipCode) {
      return toast.warn('Please fill all shipping fields');
    }
    setStep(1);
  };

  const handlePlaceOrder = async () => {
    const orderItems = items.map(item => ({
      product:  item.product._id,
      name:     item.product.name,
      image:    item.product.images?.[0],
      price:    item.price,
      quantity: item.quantity
    }));
    await dispatch(createOrder({ orderItems, shippingAddress: shipping, paymentMethod }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Step Indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium ${i <= step ? 'text-blue-600' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h2>
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                  <input className="input-field" value={shipping.street}
                    onChange={e => setShipping({...shipping, street: e.target.value})}
                    placeholder="123 Main St, Apartment 4B" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                    <input className="input-field" value={shipping.city}
                      onChange={e => setShipping({...shipping, city: e.target.value})}
                      placeholder="Hyderabad" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                    <input className="input-field" value={shipping.state}
                      onChange={e => setShipping({...shipping, state: e.target.value})}
                      placeholder="Telangana" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ZIP / Pin Code</label>
                    <input className="input-field" value={shipping.zipCode}
                      onChange={e => setShipping({...shipping, zipCode: e.target.value})}
                      placeholder="500001" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                    <input className="input-field" value={shipping.country}
                      onChange={e => setShipping({...shipping, country: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary py-3">Continue to Payment →</button>
              </form>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3 mb-6">
                {[
                  { value: 'COD', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
                  { value: 'UPI', label: 'UPI Payment', icon: '📱', desc: 'GPay, PhonePe, Paytm' },
                  { value: 'Card', label: 'Credit / Debit Card', icon: '💳', desc: 'All major cards accepted' },
                  { value: 'NetBanking', label: 'Net Banking', icon: '🏦', desc: 'All major banks' }
                ].map(opt => (
                  <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={e => setPaymentMethod(e.target.value)} className="accent-blue-600" />
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1">← Back</button>
                <button onClick={() => setStep(2)} className="btn-primary flex-1">Review Order →</button>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Review Your Order</h2>

              <div className="mb-4 p-3 bg-gray-50 rounded-xl text-sm">
                <p className="font-semibold text-gray-700 mb-1">📍 Shipping to:</p>
                <p className="text-gray-600">{shipping.street}, {shipping.city}, {shipping.state} {shipping.zipCode}, {shipping.country}</p>
              </div>
              <div className="mb-4 p-3 bg-gray-50 rounded-xl text-sm">
                <p className="font-semibold text-gray-700">💳 Payment: <span className="text-blue-600">{paymentMethod}</span></p>
              </div>

              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item._id} className="flex items-center gap-3">
                    <img src={item.product?.images?.[0]} alt="" className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                      onError={e => { e.target.src = 'https://via.placeholder.com/48'; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                    </div>
                    <p className="text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary flex-1 py-3">
                  {loading ? 'Placing Order...' : '✅ Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="card p-5 h-fit sticky top-24">
          <h3 className="font-bold text-gray-900 mb-4">Price Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Items ({items.length})</span><span>₹{total.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-600"><span>GST (18%)</span><span>₹{tax}</span></div>
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shipping_fee === 0 ? 'text-green-600' : ''}>{shipping_fee === 0 ? 'FREE' : `₹${shipping_fee}`}</span></div>
            <hr className="border-gray-100" />
            <div className="flex justify-between font-bold text-gray-900 text-base"><span>Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
          </div>
          <p className="text-xs text-green-600 mt-3">🎉 You save ₹{(items.reduce((a, i) => a + ((i.product?.originalPrice || i.price) - i.price) * i.quantity, 0)).toLocaleString()} on this order!</p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
