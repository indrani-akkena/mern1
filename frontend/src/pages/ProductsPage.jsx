import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/product/ProductCard';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Automotive', 'Food'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name_asc', label: 'Name A-Z' }
];

const ProductsPage = () => {
  const dispatch  = useDispatch();
  const location  = useLocation();
  const navigate  = useNavigate();
  const { products, loading, pages, page, total } = useSelector(state => state.products);

  const params = new URLSearchParams(location.search);
  const [filters, setFilters] = useState({
    search:   params.get('search') || '',
    category: params.get('category') || 'all',
    sort:     params.get('sort') || 'newest',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    page: 1
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadProducts = useCallback(() => {
    const queryParams = {};
    if (filters.search)   queryParams.search = filters.search;
    if (filters.category !== 'all') queryParams.category = filters.category;
    if (filters.sort)     queryParams.sort = filters.sort;
    if (filters.minPrice) queryParams.minPrice = filters.minPrice;
    if (filters.maxPrice) queryParams.maxPrice = filters.maxPrice;
    queryParams.page = filters.page;
    queryParams.limit = 12;
    dispatch(fetchProducts(queryParams));
  }, [dispatch, filters]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', category: 'all', sort: 'newest', minPrice: '', maxPrice: '', page: 1 });
    navigate('/products');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
          <p className="text-gray-500 text-sm mt-1">{total} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden btn-secondary text-sm py-2">
            Filters
          </button>
          <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}
            className="input-field w-auto text-sm py-2">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-56 flex-shrink-0`}>
          <div className="card p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-700">Clear all</button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Search</label>
              <input type="text" value={filters.search} onChange={e => updateFilter('search', e.target.value)}
                placeholder="Search products..." className="input-field text-sm" />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Category</label>
              <div className="space-y-1">
                <label className="flex items-center gap-2 cursor-pointer py-1">
                  <input type="radio" name="category" value="all" checked={filters.category === 'all'} onChange={e => updateFilter('category', e.target.value)} className="accent-blue-600" />
                  <span className="text-sm text-gray-700">All Categories</span>
                </label>
                {CATEGORIES.map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer py-1">
                    <input type="radio" name="category" value={cat} checked={filters.category === cat} onChange={e => updateFilter('category', e.target.value)} className="accent-blue-600" />
                    <span className="text-sm text-gray-700">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Price Range (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)}
                  placeholder="Min" className="input-field text-sm" />
                <input type="number" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)}
                  placeholder="Max" className="input-field text-sm" />
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="shimmer h-48 rounded-xl mb-4" />
                  <div className="shimmer h-4 rounded mb-2" />
                  <div className="shimmer h-4 w-2/3 rounded mb-4" />
                  <div className="shimmer h-8 rounded" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map(product => <ProductCard key={product._id} product={product} />)}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setFilters(prev => ({ ...prev, page: p }))}
                      className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${p === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
