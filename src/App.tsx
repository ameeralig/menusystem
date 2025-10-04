
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import ProductPreview from "./pages/ProductPreview";
import ProductsDemo from "./pages/ProductsDemo";
import EditProduct from "./pages/EditProduct";
import SpinWheelPage from "./pages/SpinWheelPage";
import QRGenerator from "./pages/QRGenerator";
import StoreCustomization from "./pages/StoreCustomization";
import Profile from "./pages/Profile";
import Feedback from "./pages/Feedback";
import CustomerFeedback from "./pages/CustomerFeedback";
import LegalPages from "./pages/LegalPages";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import UserDetailsPage from "./pages/UserDetailsPage";
import AdminGuard from "./components/admin/AdminGuard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/products" element={<ProductsDemo />} />
            <Route path="/store/:slug/wheel" element={<SpinWheelPage />} />
            <Route path="/qr-generator" element={<QRGenerator />} />
            <Route path="/:slug" element={<ProductPreview />} />
            <Route path="/edit-product" element={<EditProduct />} />
            <Route path="/edit-product/:productId" element={<EditProduct />} />
            <Route path="/store-customization" element={<StoreCustomization />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/customer-feedback/:userId" element={<CustomerFeedback />} />
            
            {/* صفحة موحدة للشروط والأحكام وسياسة الخصوصية والاتصال */}
            <Route path="/legal" element={<LegalPages />} />
            
            {/* تحويل المسارات القديمة إلى المسار الجديد مع التبويب المناسب */}
            <Route path="/terms" element={<Navigate to="/legal?tab=terms" replace />} />
            <Route path="/privacy" element={<Navigate to="/legal?tab=privacy" replace />} />
            <Route path="/contact" element={<Navigate to="/legal?tab=contact" replace />} />
            
            {/* لوحة التحكم الخاصة بالمسؤول */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route element={<AdminGuard />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users/:userId" element={<UserDetailsPage />} />
            </Route>
            
            {/* لوحة التحكم الخاصة بالموظف */}
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
