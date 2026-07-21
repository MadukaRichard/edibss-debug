import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './styles/global.css';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import MyOrders from './pages/MyOrders';
import ProductDetail from './pages/ProductDetail';

import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import ProductsCMS from './admin/pages/ProductsCMS';
// 1. ADDED CATEGORIES IMPORT HERE
import CategoriesCMS from './admin/pages/CategoriesCMS'; 
import OrdersCMS from './admin/pages/OrdersCMS';
import RidersCMS from './admin/pages/RidersCMS';
import ReviewsCMS from './admin/pages/ReviewsCMS';
import HeroCMS from './admin/pages/HeroCMS';
import FeeRulesCMS from './admin/pages/FeeRulesCMS';
import PaymentSettingsCMS from './admin/pages/PaymentSettingsCMS';

function StoreLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        {/* ADD THE FUTURE FLAGS HERE */}
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Toaster position="top-right" toastOptions={{ duration:3500, style:{ fontFamily:'Inter,sans-serif', fontSize:14 } }} />
          <Routes>
            {/* Store routes */}
            <Route path="/" element={<StoreLayout><Home/></StoreLayout>} />
            <Route path="/products" element={<StoreLayout><Home/></StoreLayout>} />
            <Route path="/products/:id" element={<StoreLayout><ProductDetail/></StoreLayout>} />
            <Route path="/cart" element={<StoreLayout><Cart/></StoreLayout>} />
            <Route path="/checkout" element={<StoreLayout><Checkout/></StoreLayout>} />
            <Route path="/track" element={<StoreLayout><TrackOrder/></StoreLayout>} />
            <Route path="/track/:id" element={<StoreLayout><TrackOrder/></StoreLayout>} />
            <Route path="/orders" element={<StoreLayout><MyOrders/></StoreLayout>} />
            <Route path="/login" element={<Auth/>} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout><Dashboard/></AdminLayout>} />
            <Route path="/admin/products" element={<AdminLayout><ProductsCMS/></AdminLayout>} />
            {/* 2. ADDED CATEGORIES ROUTE HERE */}
            <Route path="/admin/categories" element={<AdminLayout><CategoriesCMS/></AdminLayout>} /> 
            <Route path="/admin/orders" element={<AdminLayout><OrdersCMS/></AdminLayout>} />
            <Route path="/admin/riders" element={<AdminLayout><RidersCMS/></AdminLayout>} />
            <Route path="/admin/reviews" element={<AdminLayout><ReviewsCMS/></AdminLayout>} />
            <Route path="/admin/hero" element={<AdminLayout><HeroCMS/></AdminLayout>} />
            <Route path="/admin/fee-rules" element={<AdminLayout><FeeRulesCMS/></AdminLayout>} />
            <Route path="/admin/payment-settings" element={<AdminLayout><PaymentSettingsCMS/></AdminLayout>} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}