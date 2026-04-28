import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Marketplace from "./pages/Marketplace";
import AssetDetail from "./pages/AssetDetail";
import Dashboard from "./pages/Dashboard";
import Designer from "./pages/Designer";
import TrainModel from "./pages/TrainModel";
import Payment from "./pages/Payment";
import MyListedAssets from "./pages/MyListedAssets";
import Requests from "./pages/Requests";
import NotFound from "./pages/NotFound.tsx";
import { ScrollToTop } from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/asset/:id" element={<AssetDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/designer/:id" element={<Designer />} />
            <Route path="/train-model" element={<TrainModel />} />
            <Route path="/payment/:id" element={<Payment />} />
            <Route path="/my-listed-assets" element={<MyListedAssets />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
