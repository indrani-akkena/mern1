import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, clearError } from '../redux/slices/authSlice';
import { fetchMyOrders } from '../redux/slices/orderSlice';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { userInfo, loading, error } = useSelector(state => state.auth);
  const { orders } = useSelector(state => state.orders);

  const [formData, setFormData] = useState({
    name: userInfo?.name || '',
    email: userInfo?.email || '',
    phone: userInfo?.phone || '',
    password: '',
    confirmPassword: '',
    street: userInfo?.address?.street || '',
    city: userInfo?.address?.city || '',
    state: userInfo?.address?.state || '',
    zipCode: userInfo?.address?.zipCode || '',
    country: userInfo?.address?.country || 'India'
  });
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);
  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: { street: formData.street, city: formData.city, state: formData.state, zipCode: formData.zipCode, country: formData.country }
    };
    if (formData.password) payload.password = formData.password;
    try {
      await dispatch(updateProfile(payload)).unwrap();
      toast.success('Profile updated successfully!');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      // error handled above
    }
  };

  const stats = [
    { label: 'Total Orders', value: orders.length },
    { label: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length },
    { label: 'Pending', value: orders.filter(o => ['Pending','Processing'].includes(o.status)).length },
    { label: 'Cancelled', value: orders.filter(o => o.status === 'Cancelled').length }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="card p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-700">
          {userInfo?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{userInfo?.name}</h1>
          <p className="text-gray-500 text-sm">{userInfo?.email}</p>
          <span className={`badge mt-1 ${userInfo?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {userInfo?.role === 'admin' ? '👑 Admin' : '👤 Customer'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {['profile', 'security'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab === 'profile' ? '📋 Profile' : '🔒 Security'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 'profile' && (
          <div className="card p-6 space-y-5">
            <h2 className="font-bold text-gray-900">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="Your Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} className="input-field" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="+91 98765 43210" />
              </div>
            </div>

            <hr className="border-gray-100" />
            <h3 className="font-semibold text-gray-800">Shipping Address</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                <input name="street" value={formData.street} onChange={handleChange} className="input-field" placeholder="123 Main Street" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input name="city" value={formData.city} onChange={handleChange} className="input-field" placeholder="Hyderabad" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                <input name="state" value={formData.state} onChange={handleChange} className="input-field" placeholder="Telangana" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">PIN Code</label>
                <input name="zipCode" value={formData.zipCode} onChange={handleChange} className="input-field" placeholder="500001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                <input name="country" value={formData.country} onChange={handleChange} className="input-field" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary py-2.5">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="card p-6 space-y-5">
            <h2 className="font-bold text-gray-900">Change Password</h2>
            <p className="text-sm text-gray-500">Leave blank to keep your current password.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input name="password" type="password" value={formData.password} onChange={handleChange}
                className="input-field" placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange}
                className="input-field" placeholder="Repeat new password" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary py-2.5">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        )}
      </form>

      {userInfo?.role === 'admin' && (
        <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-semibold text-purple-800">Admin Access</p>
            <p className="text-sm text-purple-600">You have full admin privileges</p>
          </div>
          <Link to="/admin" className="bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-purple-700">
            Admin Panel →
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
