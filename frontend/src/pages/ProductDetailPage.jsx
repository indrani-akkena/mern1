import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, submitReview } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';

const StarRating = ({ rating, interactive, onRate }) => (
  <div className="flex items-center gap-1">
    {[1,2,3,4,5].map(star => (
      <svg key={star}
        className={`w-5 h-5 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'} ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        fill="currentColor" viewBox="0 0 20 20"
        onClick={() => interactive && onRate && onRate(star)}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading } = useSelector(state => state.products);
  const { userInfo } = useSelector(state => state.auth);

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => { dispatch(fetchProductById(id)); }, [dispatch, id]);

  const handleAddToCart = async () => {
    if (!userInfo) return toast.info('Please login to add items to cart');
    setAddingToCart(true);
    try {
      await dispatch(addToCart({ productId: id, quantity: qty })).unwrap();
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!userInfo) { navigate('/login'); return; }
    await dispatch(addToCart({ productId: id, quantity: qty }));
    navigate('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!review.comment.trim()) return toast.warn('Please write a review');
    try {
      await dispatch(submitReview({ id, review })).unwrap();
      toast.success('Review submitted!');
      setReview({ rating: 5, comment: '' });
      dispatch(fetchProductById(id));
    } catch (err) {
      toast.error(err || 'Failed to submit review');
    }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="shimmer h-96 rounded-2xl" />
        <div className="space-y-4"><div className="shimmer h-8 rounded w-3/4" /><div className="shimmer h-4 rounded" /><div className="shimmer h-4 w-1/2 rounded" /></div>
      </div>
    </div>
  );

  if (!product) return <div className="text-center py-20 text-gray-500">Product not found.</div>;

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/')}>Home</span>
        <span className="mx-2">/</span>
        <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/products')}>Products</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="bg-gray-50 rounded-2xl overflow-hidden aspect-square mb-3">
            <img src={product.images?.[activeImg] || 'https://via.placeholder.com/500'} alt={product.name}
              className="w-full h-full object-cover" onError={e => { e.target.src = 'https://via.placeholder.com/500'; }} />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-blue-500' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <span className="badge bg-blue-100 text-blue-700 mb-2">{product.category}</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-500 text-sm mb-1">by <span className="text-gray-700 font-medium">{product.brand}</span></p>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating} />
            <span className="text-sm text-gray-500">{product.rating?.toFixed(1)} ({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.originalPrice?.toLocaleString()}</span>
                <span className="badge bg-green-100 text-green-700">{discount}% off</span>
              </>
            )}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity + Buttons */}
          {product.stock > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 text-lg">−</button>
                  <span className="px-4 py-1.5 text-sm font-semibold border-x border-gray-200">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 text-lg">+</button>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddToCart} disabled={addingToCart} className="flex-1 btn-primary py-3">
                  {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
                </button>
                <button onClick={handleBuyNow} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-5 rounded-lg transition-colors">
                  ⚡ Buy Now
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2"><span>🚚</span> Free delivery above ₹999</div>
            <div className="flex items-center gap-2"><span>↩️</span> Easy 30-day returns</div>
            <div className="flex items-center gap-2"><span>🔒</span> Secure payment</div>
            <div className="flex items-center gap-2"><span>✅</span> Genuine product</div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
          {product.reviews?.length === 0 ? (
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4">
              {product.reviews?.map(r => (
                <div key={r._id} className="card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                      {r.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="ml-auto"><StarRating rating={r.rating} /></div>
                  </div>
                  <p className="text-sm text-gray-600">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Write Review */}
        {userInfo && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>
            <div className="card p-4">
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Your Rating</label>
                  <StarRating rating={review.rating} interactive onRate={r => setReview(prev => ({ ...prev, rating: r }))} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">Your Review</label>
                  <textarea value={review.comment} onChange={e => setReview(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4} className="input-field resize-none" placeholder="Share your experience..." />
                </div>
                <button type="submit" className="w-full btn-primary">Submit Review</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
