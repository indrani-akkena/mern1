import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, cancelOrder } from '../redux/slices/orderSlice';
import { toast } from 'react-toastify';

const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];
const STATUS_COLORS = {
  Pending:    'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped:    'bg-purple-100 text-purple-700',
  Delivered:  'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-700'
};

const OrderDetailPage = () => {
  const { id }    = useParams();
  const location  = useLocation();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { order, loading } = useSelector(state => state.orders);
  const isSuccess = new URLSearchParams(location.search).get('success') === 'true';

  useEffect(() => { dispatch(fetchOrderById(id)); }, [dispatch, id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await dispatch(cancelOrder(id)).unwrap();
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err || 'Failed to cancel order');
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="shimmer h-8 w-48 rounded" />
      <div className="shimmer h-32 rounded-2xl" />
      <div className="shimmer h-48 rounded-2xl" />
    </div>
  );

  if (!order) return <div className="text-center py-20 text-gray-500">Order not found.</div>;

  const currentStep = order.status === 'Cancelled' ? -1 : STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Success Banner */}
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-green-800 mb-1">Order Placed Successfully!</h2>
          <p className="text-green-600 text-sm">Thank you for your purchase! We'll send you updates on your order.</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-500 text-sm mt-1">Order #{order._id?.slice(-8).toUpperCase()}</p>
        </div>
        <span className={`badge text-sm px-3 py-1 ${STATUS_COLORS[order.status]}`}>{order.status}</span>
      </div>

      {/* Order Progress */}
      {order.status !== 'Cancelled' && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Order Progress</h3>
          <div className="flex items-center">
            {STATUS_STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs mt-1.5 font-medium ${i <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>{s}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
          {order.trackingNumber && (
            <p className="text-sm text-gray-600 mt-3">📦 Tracking: <span className="font-semibold text-blue-600">{order.trackingNumber}</span></p>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {/* Order Items */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Items Ordered</h3>
            <div className="space-y-4">
              {order.orderItems?.map(item => (
                <div key={item._id} className="flex items-center gap-3">
                  <img src={item.image || item.product?.images?.[0]} alt={item.name}
                    className="w-14 h-14 object-cover rounded-xl bg-gray-50"
                    onError={e => { e.target.src = 'https://via.placeholder.com/56'; }} />
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product?._id || item.product}`} className="font-medium text-gray-900 hover:text-blue-600 text-sm line-clamp-1">{item.name}</Link>
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                  </div>
                  <p className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Items</span><span>₹{order.itemsPrice?.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax</span><span>₹{order.taxPrice?.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingPrice === 0 ? <span className="text-green-600">FREE</span> : `₹${order.shippingPrice}`}</span></div>
              <hr className="border-gray-100" />
              <div className="flex justify-between font-bold text-gray-900"><span>Total</span><span>₹{order.totalPrice?.toLocaleString()}</span></div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
              <p className="text-gray-600">Payment: <span className="font-semibold">{order.paymentMethod}</span></p>
              <p className="text-gray-600 mt-1">Status: <span className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>{order.isPaid ? 'Paid' : 'Pending'}</span></p>
            </div>
          </div>

          <div className="card p-5 text-sm text-gray-600">
            <p>Placed on: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            {order.isPaid && <p>Paid on: {new Date(order.paidAt).toLocaleDateString('en-IN')}</p>}
            {order.isDelivered && <p>Delivered on: {new Date(order.deliveredAt).toLocaleDateString('en-IN')}</p>}
          </div>

          <div className="space-y-2">
            {['Pending', 'Processing'].includes(order.status) && (
              <button onClick={handleCancel} className="w-full btn-danger py-2.5 text-sm">Cancel Order</button>
            )}
            <Link to="/orders" className="w-full btn-secondary py-2.5 text-sm text-center block">← My Orders</Link>
            <Link to="/products" className="w-full btn-primary py-2.5 text-sm text-center block">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
