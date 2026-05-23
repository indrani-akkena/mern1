import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
const StatCard = ({ title, value, icon, color, sub }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, ordersRes] = await Promise.all([
          API.get('/users/stats'),
          API.get('/orders/stats')
        ]);
        setStats({ ...usersRes.data, ...ordersRes.data });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Array(4).fill(0).map((_, i) => <div key={i} className="shimmer h-28 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  const STATUS_COLORS = { Pending: 'text-yellow-600', Processing: 'text-blue-600', Shipped: 'text-purple-600', Delivered: 'text-green-600', Cancelled: 'text-red-600' };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/products/new" className="btn-primary text-sm py-2">+ Add Product</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users"    value={stats?.totalUsers?.toLocaleString() || 0}   icon="👥" color="text-blue-600"   sub={`${stats?.newUsersThisMonth || 0} new this month`} />
        <StatCard title="Total Orders"   value={stats?.totalOrders?.toLocaleString() || 0}  icon="📦" color="text-purple-600" sub="All time" />
        <StatCard title="Total Revenue"  value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon="💰" color="text-green-600"  sub="From paid orders" />
        <StatCard title="Active Users"   value={stats?.activeUsers?.toLocaleString() || 0}  icon="✅" color="text-orange-600" sub="Currently active" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-4">Order Status Breakdown</h3>
          {stats?.statusBreakdown?.length > 0 ? (
            <div className="space-y-3">
              {stats.statusBreakdown.map(s => (
                <div key={s._id} className="flex items-center gap-3">
                  <span className={`text-sm font-semibold w-24 ${STATUS_COLORS[s._id] || 'text-gray-600'}`}>{s._id}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (s.count / (stats.totalOrders || 1)) * 100)}%` }} />
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-8 text-right">{s.count}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">No orders yet.</p>}
        </div>

        {/* Recent Orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <Link to="/admin/orders" className="text-blue-600 text-sm hover:text-blue-700">View All →</Link>
          </div>
          {stats?.recentOrders?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.map(order => (
                <div key={order._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                    {order.user?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{order.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">₹{order.totalPrice?.toLocaleString()}</p>
                    <span className={`text-xs font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">No recent orders.</p>}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[
          { label: 'Manage Products', icon: '📦', to: '/admin/products', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
          { label: 'Manage Orders',   icon: '🛍️', to: '/admin/orders',   color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
          { label: 'Manage Users',    icon: '👥', to: '/admin/users',    color: 'bg-green-50 hover:bg-green-100 text-green-700' },
          { label: 'Add Product',     icon: '➕', to: '/admin/products/new', color: 'bg-orange-50 hover:bg-orange-100 text-orange-700' },
        ].map(link => (
          <Link key={link.to} to={link.to} className={`${link.color} rounded-2xl p-4 text-center transition-colors`}>
            <span className="text-3xl block mb-2">{link.icon}</span>
            <span className="text-sm font-semibold">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
