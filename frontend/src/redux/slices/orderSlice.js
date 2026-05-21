import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const createOrder = createAsyncThunk('orders/create', async (orderData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/orders', orderData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create order');
  }
});

export const fetchMyOrders = createAsyncThunk('orders/myOrders', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/orders/myorders');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
  }
});

export const fetchOrderById = createAsyncThunk('orders/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await API.get(`/orders/${id}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Order not found');
  }
});

export const fetchAllOrders = createAsyncThunk('orders/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const { data } = await API.get(`/orders?${query}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
  }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status, trackingNumber }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/orders/${id}/status`, { status, trackingNumber });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update order');
  }
});

export const cancelOrder = createAsyncThunk('orders/cancel', async (id, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/orders/${id}/cancel`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to cancel order');
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: { orders: [], order: null, loading: false, error: null, success: false },
  reducers: {
    clearOrderSuccess: (state) => { state.success = false; state.order = null; },
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending,        (state) => { state.loading = true; state.error = null; state.success = false; })
      .addCase(createOrder.fulfilled,      (state, { payload }) => { state.loading = false; state.success = true; state.order = payload; })
      .addCase(createOrder.rejected,       (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(fetchMyOrders.pending,      (state) => { state.loading = true; })
      .addCase(fetchMyOrders.fulfilled,    (state, { payload }) => { state.loading = false; state.orders = payload; })
      .addCase(fetchMyOrders.rejected,     (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(fetchOrderById.pending,     (state) => { state.loading = true; })
      .addCase(fetchOrderById.fulfilled,   (state, { payload }) => { state.loading = false; state.order = payload; })
      .addCase(fetchOrderById.rejected,    (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(fetchAllOrders.pending,     (state) => { state.loading = true; })
      .addCase(fetchAllOrders.fulfilled,   (state, { payload }) => { state.loading = false; state.orders = payload.orders; })
      .addCase(fetchAllOrders.rejected,    (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(updateOrderStatus.fulfilled,(state, { payload }) => { state.order = payload; const i = state.orders.findIndex(o => o._id === payload._id); if (i !== -1) state.orders[i] = payload; })
      .addCase(cancelOrder.fulfilled,      (state, { payload }) => { state.order = payload; });
  }
});

export const { clearOrderSuccess, clearError } = orderSlice.actions;
export default orderSlice.reducer;
