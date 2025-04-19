
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import ProductPreview from "./pages/ProductPreview";
import StorePreview from "./pages/StorePreview";
import ProductsDemo from "./pages/ProductsDemo";
import EditProduct from "./pages/EditProduct";
import StoreCustomization from "./pages/StoreCustomization";
import Profile from "./pages/Profile";
import Feedback from "./pages/Feedback";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

const App = () => {
  const [isLoginSubdomain, setIsLoginSubdomain] = useState(false);
  const [isStoreSubdomain, setIsStoreSubdomain] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const isLogin = hostname === 'login.qrmenuc.com';
    const isStore = hostname.endsWith('.qrmenuc.com') && !isLogin;
    
    setIsLoginSubdomain(isLogin);
    setIsStoreSubdomain(isStore);
    
    console.log("النطاق الحالي:", hostname);
    console.log("هل هو نطاق تسجيل الدخول:", isLogin);
    console.log("هل هو نطاق متجر:", isStore);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {isLoginSubdomain ? (
              <>
                <Route path="/" element={<Login />} />
                <Route path="*" element={<Login />} />
              </>
            ) : isStoreSubdomain ? (
              <>
                <Route path="/" element={<StorePreview />} />
                <Route path="*" element={<StorePreview />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Index />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/login" element={<Navigate to="/auth/login" />} />
                <Route path="/auth/signup" element={<Signup />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/products" element={<ProductsDemo />} />
                
                {/* توجيه المستخدم إلى صفحة المعاينة حسب النطاق الفرعي */}
                <Route path="/:storeSlug" element={<StorePreview />} />
                
                <Route path="/products/:userId" element={<ProductPreview />} />
                
                <Route path="/edit-product" element={<EditProduct />} />
                <Route path="/edit-product/:productId" element={<EditProduct />} />
                <Route path="/store-customization" element={<StoreCustomization />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/contact" element={<Contact />} />
              </>
            )}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
