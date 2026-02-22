import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { pageView } from "@/utils/metaPixel";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { OrdersProvider } from "@/hooks/useOrders";
import { DeliveryProvider } from "@/hooks/useDelivery";
import CartAbandonmentBanner from "@/components/CartAbandonmentBanner";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Admin from "./pages/Admin";
import Privacy from "./pages/Privacy";
import RefundPolicy from "./pages/RefundPolicy";
import Terms from "./pages/Terms";
import DeliveryArea from "./pages/DeliveryArea";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function PageViewTracker() {
  const location = useLocation();
  useEffect(() => {
    pageView();
  }, [location.pathname]);
  return null;
}

function AppContent() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PageViewTracker />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/delivery-area" element={<DeliveryArea />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <OrdersProvider>
            <DeliveryProvider>
              <Toaster />
              <Sonner />
              <CartAbandonmentBanner />
              <AppContent />
            </DeliveryProvider>
          </OrdersProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;