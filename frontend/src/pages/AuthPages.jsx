import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, clearError } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';

// ======================== LOGIN PAGE ========================
export const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { userInfo, loading, error } = useSelector(state => state.auth);

  useEffect(() => { if (userInfo) navigate('/'); }, [userInfo, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.warn('Please fill all fields');
    await dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your ShopMart account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input-field" placeholder="your@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="input-field" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary text-base py-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">Create one free</Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <p className="font-semibold mb-1">Demo Credentials:</p>
            <p>Admin: admin@shopmart.com / admin123</p>
            <p>User:  john@example.com / john123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ======================== REGISTER PAGE ========================
export const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, loading, error } = useSelector(state => state.auth);

  useEffect(() => { if (userInfo) navigate('/'); }, [userInfo, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return toast.warn('Please fill all fields');
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    await dispatch(registerUser({ name: formData.name, email: formData.email, password: formData.password }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Join thousands of happy shoppers</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {[['name', 'Full Name', 'text', 'John Doe'], ['email', 'Email Address', 'email', 'your@email.com'], ['password', 'Password', 'password', '••••••••'], ['confirmPassword', 'Confirm Password', 'password', '••••••••']].map(([field, label, type, placeholder]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <input type={type} name={field} value={formData[field]} onChange={handleChange}
                  className="input-field" placeholder={placeholder} required />
              </div>
            ))}
            <button type="submit" disabled={loading} className="w-full btn-primary text-base py-3">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
