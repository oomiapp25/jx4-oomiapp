/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import TransportLines from './pages/TransportLines';
import JobOffers from './pages/JobOffers';
import Services from './pages/Services';
import DepartmentDetail from './pages/DepartmentDetail';
import CategoryDetail from './pages/CategoryDetail';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminDepartments from './pages/admin/Departments';
import AdminTransports from './pages/admin/Transports';
import AdminUsers from './pages/admin/Users';
import AdminAds from './pages/admin/Ads';
import AdminNews from './pages/admin/News';
import AdminJobs from './pages/admin/Jobs';
import AdminServices from './pages/admin/Services';
import AdminSettings from './pages/admin/Settings';

export default function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('Current User:', user.email, 'Role:', user.role);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="animate-pulse text-stone-400 font-medium">Cargando JX4 Paracotos...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/perfil" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/transporte" element={<TransportLines />} />
          <Route path="/empleos" element={<JobOffers />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/departamento/:slug" element={<DepartmentDetail />} />
          <Route path="/categoria/:slug" element={<CategoryDetail />} />
          
          {/* Protected Customer Routes */}
          <Route path="/checkout" element={<Checkout />} />
          <Route 
            path="/mis-pedidos" 
            element={user ? <MyOrders /> : <Navigate to="/login" />} 
          />
        </Route>

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            user && (
              user.role === 'admin' || 
              user.role.includes('_admin') || 
              user.email === 'jjtovar1510@gmail.com'
            ) ? <AdminLayout /> : <Navigate to="/" />
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="productos" element={<AdminProducts />} />
          <Route path="categorias" element={<AdminCategories />} />
          <Route path="departamentos" element={<AdminDepartments />} />
          <Route path="transportes" element={<AdminTransports />} />
          <Route path="usuarios" element={<AdminUsers />} />
          <Route path="ads" element={<AdminAds />} />
          <Route path="noticias" element={<AdminNews />} />
          <Route path="empleos" element={<AdminJobs />} />
          <Route path="servicios" element={<AdminServices />} />
          <Route path="configuracion" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}
