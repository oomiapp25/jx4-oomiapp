/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ArrowUp } from 'lucide-react';

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
import NewsPage from './pages/News';
import SocialHelp from './pages/SocialHelp';
import Community from './pages/Community';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Catalog from './pages/Catalog';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminDepartments from './pages/admin/Departments';
import AdminTransports from './pages/admin/Transports';
import AdminUsers from './pages/admin/Users';
import AdminAds from './pages/admin/Ads';
import AdminVideos from './pages/admin/Videos';
import AdminNews from './pages/admin/News';
import AdminJobs from './pages/admin/Jobs';
import AdminServices from './pages/admin/Services';
import AdminSocial from './pages/admin/SocialManagement';
import AdminCommunity from './pages/admin/CommunityManagement';
import AdminSettings from './pages/admin/Settings';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function FloatingScrollButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-20 right-6 z-50 p-3 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all duration-300 animate-bounce"
      aria-label="Volver arriba"
    >
      <ArrowUp size={24} />
    </button>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('Current User:', user.email, 'Roles:', user.roles);
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
      <ScrollToTop />
      <FloatingScrollButton />
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
          <Route path="/noticias" element={<NewsPage />} />
          <Route path="/empleos" element={<JobOffers />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/departamento/:slug" element={<DepartmentDetail />} />
          <Route path="/categoria/:slug" element={<CategoryDetail />} />
          <Route path="/ayuda-social" element={<SocialHelp />} />
          <Route path="/comunidad" element={<Community />} />
          <Route path="/privacidad" element={<PrivacyPolicy />} />
          <Route path="/catalogo" element={<Catalog />} />
          
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
              (user.roles || []).includes('admin') || 
              (user.roles || []).some(r => r.includes('_admin')) || 
              user.email.toLowerCase() === 'jjtovar1510@gmail.com'
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
          <Route path="videos" element={<AdminVideos />} />
          <Route path="noticias" element={<AdminNews />} />
          <Route path="empleos" element={<AdminJobs />} />
          <Route path="servicios" element={<AdminServices />} />
          <Route path="ayuda-social" element={<AdminSocial />} />
          <Route path="comunidad" element={<AdminCommunity />} />
          <Route path="configuracion" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}
