import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '../../redux/slices/productSlice';
import { toast } from 'react-toastify';
import API from '../../utils/api';

const AdminProductsPage = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { products, loading } = useSelector(state => state.products);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data } = await API.get('/products/admin/all');
        dispatch({ type: 'products/fetchAll/fulfilled', payload: { products: data, pages: 1, page: 1, total: data.length } });
      } catch (err) {
        dispatch(fetchProducts({ limit: 100 }));
      }
    };
    fetchAll();
  }, [dispatch]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err || 'Failed to delete');
    }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} total products</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary">+ Add Product</Link>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, category, brand..." className="input-field max-w-sm" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(6).fill(0).map((_, i) => <div key={i} className="shimmer h-16 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.images?.[0]} alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg bg-gray-100"
                          onError={e => { e.target.src = 'https://via.placeholder.com/40'; }} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-blue-50 text-blue-700 text-xs">{product.category}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{product.price?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-600' : product.stock < 10 ? 'text-orange-600' : 'text-green-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      ⭐ {product.rating?.toFixed(1)} ({product.numReviews})
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                        <span className="text-gray-200">|</span>
                        <button onClick={() => handleDelete(product._id, product.name)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>No products found.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
