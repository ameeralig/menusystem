
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Critical pages - load immediately
import Index from "./pages/Index";
import Login from "./pages/auth/Login";

// Non-critical pages - lazy load
const Signup = lazy(() => import("./pages/auth/Signup"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AddProduct = lazy(() => import("./pages/AddProduct"));
const ProductPreview = lazy(() => import("./pages/ProductPreview"));
const ProductsDemo = lazy(() => import("./pages/ProductsDemo"));
const EditProduct = lazy(() => import("./pages/EditProduct"));
const SpinWheelPage = lazy(() => import("./pages/SpinWheelPage"));
const QRGenerator = lazy(() => import("./pages/QRGenerator"));
const StoreCustomization = lazy(() => import("./pages/StoreCustomization"));
const Profile = lazy(() => import("./pages/Profile"));
const Feedback = lazy(() => import("./pages/Feedback"));
const InstallPWA = lazy(() => import("./pages/InstallPWA"));
const CustomerFeedback = lazy(() => import("./pages/CustomerFeedback"));
const LegalPages = lazy(() => import("./pages/LegalPages"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const UserDetailsPage = lazy(() => import("./pages/UserDetailsPage"));
const AdminGuard = lazy(() => import("./components/admin/AdminGuard"));
const SalesManagement = lazy(() => import("./pages/SalesManagement"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md mx-auto p-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
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
              <Route path="/add-product" element={<AddProduct />} />
              <Route path="/products" element={<ProductsDemo />} />
              <Route path="/store/:slug/wheel" element={<SpinWheelPage />} />
              <Route path="/install" element={<InstallPWA />} />
              <Route path="/qr-generator" element={<QRGenerator />} />
              <Route path="/:slug" element={<ProductPreview />} />
              <Route path="/edit-product" element={<EditProduct />} />
              <Route path="/edit-product/:productId" element={<EditProduct />} />
              <Route path="/store-customization" element={<StoreCustomization />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/customer-feedback/:userId" element={<CustomerFeedback />} />
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
