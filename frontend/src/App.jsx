import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { GlassLayout } from './components/GlassLayout';
import { LoginView } from './pages/LoginView';
import { DashboardView } from './pages/DashboardView';
import { ProductsView } from './pages/ProductsView';
import { ReceiptsView } from './pages/ReceiptsView';
import { DeliveriesView } from './pages/DeliveriesView';
import { TransfersView } from './pages/TransfersView';
import { MovesView } from './pages/MovesView';
import { SettingsView } from './pages/SettingsView';
import { SignupView } from './pages/SignupView';
import { ForgotPasswordView } from './pages/ForgotPasswordView';

import { WarehousesView } from './pages/WarehousesView';
import { LocationsView } from './pages/LocationsView';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<LoginView />} />
        <Route path="/signup" element={<SignupView />} />
        <Route path="/forgot-password" element={<ForgotPasswordView />} />

        {/* Protected app routes inside Glass Layout */}
        <Route element={
          <ProtectedRoute>
            <GlassLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/products" element={<ProductsView />} />
          <Route path="/receipts" element={<ReceiptsView />} />
          <Route path="/deliveries" element={<DeliveriesView />} />
          <Route path="/transfers" element={<TransfersView />} />
          <Route path="/moves" element={<MovesView />} />
          <Route path="/warehouses" element={<WarehousesView />} />
          <Route path="/locations" element={<LocationsView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
