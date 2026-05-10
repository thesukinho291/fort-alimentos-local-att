import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import LoginModal from "@/components/auth/LoginModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();
const Admin = lazy(() => import("./pages/Admin.tsx"));
const CustomerAccount = lazy(() => import("./pages/CustomerAccount.tsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.tsx"));
const RegisterCompany = lazy(() => import("./pages/RegisterCompany.tsx"));

const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="h-10 w-10 animate-pulse rounded-full bg-gradient-fort" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CustomerAuthProvider>
      <CartProvider>
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/cadastro" element={<RegisterCompany />} />
              <Route
                path="/minha-conta"
                element={
                  <ProtectedRoute>
                    <CustomerAccount />
                  </ProtectedRoute>
                }
              />
              <Route path="/produto/:id" element={<ProductDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <CartDrawer />
          <LoginModal />
        </BrowserRouter>
      </CartProvider>
    </CustomerAuthProvider>
  </QueryClientProvider>
);

export default App;
