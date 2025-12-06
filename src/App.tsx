import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// المكونات الأساسية تحمّل مباشرة
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// الصفحة الرئيسية ومعاينة المتجر - تحمّل مباشرة (الأهم للـ LCP)
import Index from "./pages/Index";
import ProductPreview from "./pages/ProductPreview";
import NotFound from "./pages/NotFound";

// صفحات تسجيل الدخول - تحمّل بشكل كسول
const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));

// لوحة التحكم والصفحات الثقيلة - تحمّل عند الحاجة فقط
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProductsDemo = lazy(() => import("./pages/ProductsDemo"));
const QRGenerator = lazy(() => import("./pages/QRGenerator"));
const StoreCustomization = lazy(() => import("./pages/StoreCustomization"));
const Profile = lazy(() => import("./pages/Profile"));
const SalesManagement = lazy(() => import("./pages/SalesManagement"));
const InstallPWA = lazy(() => import("./pages/InstallPWA"));
const LegalPages = lazy(() => import("./pages/LegalPages"));

// صفحات الأدمن - تحمّل فقط للمسؤولين
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const UserDetailsPage = lazy(() => import("./pages/UserDetailsPage"));
const AdminGuard = lazy(() => import("./components/admin/AdminGuard"));

const queryClient = new QueryClient();

// مكون التحميل البسيط
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<ProductsDemo />} />
              <Route path="/install" element={<InstallPWA />} />
              <Route path="/qr-generator" element={<QRGenerator />} />
              <Route path="/:slug" element={<ProductPreview />} />
              <Route path="/store-customization" element={<StoreCustomization />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/sales-management" element={<SalesManagement />} />
              
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
              
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
