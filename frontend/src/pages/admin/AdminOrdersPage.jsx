import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus } from '../../redux/slices/orderSlice';
import { toast } from 'react-toastify';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_COLORS  = {
  Pending:    'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped:    'bg-purple-100 text-purple-700',
  Delivered:  'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-700'
};

const AdminOrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector(state => state.orders);
  const [filter, setFilter]           = useState('');
  const [updatingId, setUpdatingId]   = useState(null);
  const [tracking, setTracking]       = useState({});

  useEffect(() => { dispatch(fetchAllOrders({ limit: 50 })); }, [dispatch]);

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await dispatch(updateOrderStatus({ id: orderId, status, trackingNumber: tracking[orderId] })).unwrap();
      toast.success(`Order updated to ${status}`);
    } catch (err) {
      toast.error(err || 'Failed to update order');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filter ? orders.filter(o => o.status === filter) : orders;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-500 text-sm">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['', ...STATUS_OPTIONS].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s || 'All'} {s && `(${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="shimmer h-20 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Tracking', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link to={`/orders/${order._id}`} className="text-sm font-mono text-blue-600 hover:text-blue-700">
                        #{order._id?.slice(-8).toUpperCase()}
                      </Link>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{order.user?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.orderItems?.length} item(s)</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">₹{order.totalPrice?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                        {order.isPaid ? '✓ Paid' : '⏳ Pending'}
                      </span>
                      <p className="text-xs text-gray-400">{order.paymentMethod}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                        className={`text-xs font-semibold rounded-lg px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${STATUS_COLORS[order.status]}`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={tracking[order._id] || order.trackingNumber || ''}
                        onChange={e => setTracking(prev => ({ ...prev, [order._id]: e.target.value }))}
                        placeholder="Track #"
                        className="text-xs border border-gray-200 rounded px-2 py-1 w-24 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/orders/${order._id}`} className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">No orders found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
