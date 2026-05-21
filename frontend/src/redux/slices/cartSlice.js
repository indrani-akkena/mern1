import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/cart');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity = 1 }, { rejectWithValue }) => {
  try {
    await API.post('/cart', { productId, quantity });
    const { data } = await API.get('/cart');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add to cart');
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    await API.put(`/cart/${itemId}`, { quantity });
    const { data } = await API.get('/cart');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update cart');
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    await API.delete(`/cart/${itemId}`);
    const { data } = await API.get('/cart');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove from cart');
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await API.delete('/cart');
    return { items: [], total: 0 };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to clear cart');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], total: 0, loading: false, error: null },
  reducers: {
    clearCartLocal: (state) => { state.items = []; state.total = 0; }
  },
  extraReducers: (builder) => {
    const handlers = [fetchCart, addToCart, updateCartItem, removeFromCart, clearCart];
    handlers.forEach(thunk => {
      builder
        .addCase(thunk.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(thunk.fulfilled, (state, { payload }) => {
          state.loading = false;
          state.items = payload.items || [];
          state.total = payload.total || 0;
        })
        .addCase(thunk.rejected, (state, { payload }) => { state.loading = false; state.error = payload; });
    });
  }
});

export const { clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;
