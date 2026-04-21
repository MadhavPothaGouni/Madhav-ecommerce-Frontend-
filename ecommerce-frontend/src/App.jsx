import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

import Login    from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products  from './pages/Products';
import Orders, { OrderDetail } from './pages/Orders';
import Payments  from './pages/Payments';
import Profile   from './pages/Profile';
import { AdminUsers, AdminOrders } from './pages/Admin';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* Authenticated */}
      <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/products"  element={<PrivateRoute><Layout><Products /></Layout></PrivateRoute>} />
      <Route path="/orders"    element={<PrivateRoute><Layout><Orders /></Layout></PrivateRoute>} />
      <Route path="/orders/:id" element={<PrivateRoute><Layout><OrderDetail /></Layout></PrivateRoute>} />
      <Route path="/payments"  element={<PrivateRoute><Layout><Payments /></Layout></PrivateRoute>} />
      <Route path="/profile"   element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin/users"  element={<AdminRoute><Layout><AdminUsers /></Layout></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><Layout><AdminOrders /></Layout></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
