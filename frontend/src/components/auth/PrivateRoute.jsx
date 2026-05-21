import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const PrivateRoute = () => {
  const { userInfo } = useSelector(state => state.auth);
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

export const AdminRoute = () => {
  const { userInfo } = useSelector(state => state.auth);
  if (!userInfo) return <Navigate to="/login" replace />;
  if (userInfo.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
};
