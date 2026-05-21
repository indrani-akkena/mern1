import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../redux/slices/orderSlice';

const STATUS_COLORS = {
  Pending:    'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped:    'bg-purple-100 text-purple-700',
  Delivered:  'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-700'
};

const MyOrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector(state => state.orders);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      {Array(4).fill(0).map((_, i) => <div key={i} className="shimmer h-24 rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-7xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">You haven't placed any orders. Start shopping!</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Order #{order._id?.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <span className={`badge ${STATUS_COLORS[order.status]}`}>{order.status}</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                {order.orderItems?.slice(0, 3).map((item, i) => (
                  <img key={i} src={item.image} alt={item.name}
                    className="w-10 h-10 object-cover rounded-lg bg-gray-100"
                    onError={e => { e.target.src = 'https://via.placeholder.com/40'; }} />
                ))}
                {order.orderItems?.length > 3 && (
                  <span className="text-xs text-gray-500">+{order.orderItems.length - 3} more</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-gray-500">{order.orderItems?.length} item{order.orderItems?.length > 1 ? 's' : ''} · </span>
                  <span className="font-semibold text-gray-900">₹{order.totalPrice?.toLocaleString()}</span>
                  <span className="text-gray-500 ml-2">via {order.paymentMethod}</span>
                </div>
                <Link to={`/orders/${order._id}`} className="text-sm text-blue-600 font-semibold hover:text-blue-700">
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
