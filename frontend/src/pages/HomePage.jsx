import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/product/ProductCard';

const CATEGORIES = [
  { name: 'Electronics',   icon: '💻', color: 'bg-blue-50 text-blue-600' },
  { name: 'Clothing',      icon: '👕', color: 'bg-purple-50 text-purple-600' },
  { name: 'Books',         icon: '📚', color: 'bg-yellow-50 text-yellow-600' },
  { name: 'Home & Garden', icon: '🏡', color: 'bg-green-50 text-green-600' },
  { name: 'Sports',        icon: '⚽', color: 'bg-orange-50 text-orange-600' },
  { name: 'Beauty',        icon: '💄', color: 'bg-pink-50 text-pink-600' },
  { name: 'Toys',          icon: '🎮', color: 'bg-red-50 text-red-600' },
  { name: 'Automotive',    icon: '🚗', color: 'bg-gray-50 text-gray-600' }
];

const HomePage = () => {
  const dispatch = useDispatch();
  const { featured, loading } = useSelector(state => state.products);

  useEffect(() => { dispatch(fetchFeaturedProducts()); }, [dispatch]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            🎉 Free shipping on orders over ₹999
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Shop Smarter,<br />
            <span className="text-blue-200">Live Better</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Discover thousands of products across all categories. Unbeatable prices, fast delivery, and exceptional service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="bg-white text-blue-600 font-bold py-3 px-8 rounded-xl hover:bg-blue-50 transition-colors text-lg">
              Shop Now
            </Link>
            <Link to="/products?featured=true" className="border-2 border-white/50 text-white font-bold py-3 px-8 rounded-xl hover:bg-white/10 transition-colors text-lg">
              Featured Products
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['10,000+', 'Products'], ['50,000+', 'Happy Customers'], ['Free', 'Delivery above ₹999'], ['24/7', 'Customer Support']].map(([num, label]) => (
            <div key={label}>
              <div className="text-2xl font-bold text-blue-600">{num}</div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {CATEGORIES.map(cat => (
            <Link key={cat.name} to={`/products?category=${encodeURIComponent(cat.name)}`}
              className={`${cat.color} rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer`}>
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-xs font-semibold leading-tight">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products?featured=true" className="text-blue-600 font-medium hover:text-blue-700 text-sm">
            View All →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="shimmer h-48 rounded-xl mb-4" />
                <div className="shimmer h-4 rounded mb-2" />
                <div className="shimmer h-4 w-2/3 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(product => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-3xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-3">Try Our Math Expression Evaluator</h2>
          <p className="text-orange-100 mb-6">Evaluate complex mathematical expressions instantly — a project feature!</p>
          <Link to="/math" className="bg-white text-orange-600 font-bold py-3 px-8 rounded-xl hover:bg-orange-50 transition-colors inline-block">
            Open Calculator
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
