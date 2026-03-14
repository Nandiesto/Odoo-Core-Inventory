import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { GlassLayout } from './components/GlassLayout';
import { LoginView } from './pages/LoginView';
import { DashboardView } from './pages/DashboardView';
import { ProductsView } from './pages/ProductsView';
import { ReceiptsView } from './pages/ReceiptsView';
import { SignupView } from './pages/SignupView';
import { ForgotPasswordView } from './pages/ForgotPasswordView';

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

          {/* Fallback routing for unbuilt pages */}
          <Route path="/deliveries" element={<div style={{ padding: '40px' }}><h1 className="title-primary">Deliveries (Coming Soon)</h1></div>} />
          <Route path="/transfers" element={<div style={{ padding: '40px' }}><h1 className="title-primary">Transfers (Coming Soon)</h1></div>} />
          <Route path="/moves" element={<div style={{ padding: '40px' }}><h1 className="title-primary">Moves History (Coming Soon)</h1></div>} />
          <Route path="/settings" element={<div style={{ padding: '40px' }}><h1 className="title-primary">Settings (Coming Soon)</h1></div>} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
