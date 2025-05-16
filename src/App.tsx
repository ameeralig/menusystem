
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import ProductPreview from "./pages/ProductPreview";
import ProductsDemo from "./pages/ProductsDemo";
import EditProduct from "./pages/EditProduct";
import StoreCustomization from "./pages/StoreCustomization";
import Profile from "./pages/Profile";
import Feedback from "./pages/Feedback";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminGuard from "./components/admin/AdminGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/:slug" element={<ProductPreview />} />
          <Route path="/edit-product" element={<EditProduct />} />
          <Route path="/edit-product/:productId" element={<EditProduct />} />
          <Route path="/store-customization" element={<StoreCustomization />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* لوحة التحكم الخاصة بالمسؤول */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route element={<AdminGuard />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
          
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
