import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const { data } = await API.get(`/products?${query}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
  }
});

export const fetchProductById = createAsyncThunk('products/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await API.get(`/products/${id}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Product not found');
  }
});

export const fetchFeaturedProducts = createAsyncThunk('products/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/products/featured');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch featured');
  }
});

export const createProduct = createAsyncThunk('products/create', async (productData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/products', productData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create product');
  }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, ...productData }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/products/${id}`, productData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update product');
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/products/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete product');
  }
});

export const submitReview = createAsyncThunk('products/review', async ({ id, review }, { rejectWithValue }) => {
  try {
    const { data } = await API.post(`/products/${id}/reviews`, review);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to submit review');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [], featured: [], product: null,
    pages: 1, page: 1, total: 0,
    loading: false, error: null
  },
  reducers: {
    clearProduct: (state) => { state.product = null; },
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending,         (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled,       (state, { payload }) => { state.loading = false; state.products = payload.products; state.pages = payload.pages; state.page = payload.page; state.total = payload.total; })
      .addCase(fetchProducts.rejected,        (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(fetchProductById.pending,      (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProductById.fulfilled,    (state, { payload }) => { state.loading = false; state.product = payload; })
      .addCase(fetchProductById.rejected,     (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(fetchFeaturedProducts.fulfilled, (state, { payload }) => { state.featured = payload; })
      .addCase(deleteProduct.fulfilled,       (state, { payload }) => { state.products = state.products.filter(p => p._id !== payload); });
  }
});

export const { clearProduct, clearError } = productSlice.actions;
export default productSlice.reducer;
