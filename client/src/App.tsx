import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import CartProvider from "./context/CartProvider";
import { SearchProvider } from "./context/SearchContext";
import { UserProvider } from "./context/UserContext";
import { ProductProvider } from "./context/ProductContext";
import { ChatbotProvider } from "./context/ChatbotContext";
import ChatbotWidget from "./components/ChatbotWidget";
import Index from "./pages/Index";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetails from "./pages/ProductDetails";
import AllProducts from "./pages/AllProducts";
import UserProfile from "./pages/UserProfile";
import UserAddress from "./pages/UserAddress";
import NotFound from "./pages/NotFound";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminDebug from "./components/admin/AdminDebug";
import DashboardOverview from "./components/admin/DashboardOverview";
import AddProduct from "./components/admin/AddProduct";
import ProductList from "./components/admin/ProductList";
import OrderManagement from "./components/admin/OrderManagement";
import ReservationManagement from "./components/admin/ReservationManagement";
import Reservations from "./pages/Reservations";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/products" element={<AllProducts />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/addresses" element={<UserAddress />} />
        <Route path="/reservations" element={<Reservations />} />
        
        {/* Admin Routes */}
        <Route path="/admin/debug" element={<AdminDebug />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="products" element={<ProductList />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="reservations" element={<ReservationManagement />} />
          <Route index element={<DashboardOverview />} />
        </Route>
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Show chatbot only on customer-facing pages */}
      {!isAdminRoute && <ChatbotWidget />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <ProductProvider>
        <ChatbotProvider>
          <CartProvider>
            <SearchProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AppContent />
                </BrowserRouter>
              </TooltipProvider>
            </SearchProvider>
          </CartProvider>
        </ChatbotProvider>
      </ProductProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
