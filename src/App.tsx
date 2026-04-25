
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from './pages/AuthCallback';
import HousesForRentKigali from './pages/HousesForRentKigali';
import ApartmentsForRentKigali from './pages/ApartmentsForRentKigali';
import CheapHousesKigali from './pages/CheapHousesKigali';
import HousesForSaleKigali from './pages/HousesForSaleKigali';
import LandForSaleKigali from './pages/LandForSaleKigali';
import RealEstateAgentsKigali from './pages/RealEstateAgentsKigali';
import HousesForRentKacyiru from './pages/HousesForRentKacyiru';
import HousesForRentKimihurura from './pages/HousesForRentKimihurura';
import PropertyPage from './pages/PropertyPage';
const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/houses-for-rent-kigali" element={<HousesForRentKigali />} />
              <Route path="/apartments-for-rent-kigali" element={<ApartmentsForRentKigali />} />
              <Route path="/cheap-houses-kigali" element={<CheapHousesKigali />} />
              <Route path="/houses-for-sale-kigali" element={<HousesForSaleKigali />} />
              <Route path="/land-for-sale-kigali" element={<LandForSaleKigali />} />
              <Route path="/real-estate-agents-kigali" element={<RealEstateAgentsKigali />} />
              <Route path="/houses-for-rent-kacyiru" element={<HousesForRentKacyiru />} />
              <Route path="/houses-for-rent-kimihurura" element={<HousesForRentKimihurura />} />
              <Route path="/property/:slug" element={<PropertyPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
