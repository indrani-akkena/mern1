import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { toast } from 'react-toastify';

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(star => (
      <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      toast.info('Please login to add items to cart');
      return;
    }
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      toast.success(`${product.name.substring(0, 30)}... added to cart!`);
    } catch (err) {
      toast.error(err || 'Failed to add to cart');
    }
  };

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/products/${product._id}`} className="card group hover:shadow-md transition-all duration-200 flex flex-col">
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/300'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 badge bg-green-100 text-green-700">{discount}% off</span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 right-2 badge bg-blue-100 text-blue-700">Featured</span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-blue-600 font-medium mb-1">{product.brand}</p>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 leading-snug">{product.name}</h3>

        <div className="flex items-center gap-2 mb-2">
          <StarRating rating={product.rating} />
          <span className="text-xs text-gray-500">({product.numReviews})</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
