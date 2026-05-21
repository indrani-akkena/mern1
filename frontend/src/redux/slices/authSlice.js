import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/auth/login', credentials);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/auth/register', userData);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await API.put('/auth/profile', userData);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { userInfo, loading: false, error: null },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('userInfo');
      state.userInfo = null;
    },
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    const pending   = (state) => { state.loading = true; state.error = null; };
    const fulfilled = (state, { payload }) => { state.loading = false; state.userInfo = payload; };
    const rejected  = (state, { payload }) => { state.loading = false; state.error = payload; };

    builder
      .addCase(loginUser.pending, pending).addCase(loginUser.fulfilled, fulfilled).addCase(loginUser.rejected, rejected)
      .addCase(registerUser.pending, pending).addCase(registerUser.fulfilled, fulfilled).addCase(registerUser.rejected, rejected)
      .addCase(updateProfile.pending, pending).addCase(updateProfile.fulfilled, fulfilled).addCase(updateProfile.rejected, rejected);
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
