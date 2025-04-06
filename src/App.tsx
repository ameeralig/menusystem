import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { supabase } from './integrations/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import ProductPreview from './pages/ProductPreview';
import StoreCustomization from './pages/StoreCustomization';
import Feedback from './pages/Feedback';
import StoreAppearance from './pages/StoreAppearance';
import './index.css';

const App = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !session ? (
              <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
                <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-white">
                  <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4">
                    Welcome to Your Store Manager
                  </h1>
                  <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={['google', 'github']}
                    redirectTo={`${window.location.origin}/dashboard`}
                  />
                </div>
              </div>
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            session ? (
              <Dashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/add-product"
          element={
            session ? (
              <AddProduct />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/edit-product/:productId?"
          element={
            session ? (
              <EditProduct />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="/products/:userId" element={<ProductPreview />} />
        <Route
          path="/store-customization"
          element={
            session ? (
              <StoreCustomization />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/feedback"
          element={
            session ? (
              <Feedback />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="/store-appearance" element={<StoreAppearance />} />
      </Routes>
    </Router>
  );
};

export default App;
