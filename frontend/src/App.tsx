import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login1 from "./pages/Login1";
// import Dashboard from "./pages/Dashboard";
import Invoice from "./pages/Invoice";
import Profile from "./pages/Profile";
// import InvoiceList from "./components/InvoiceList"; 

// Import your WalletTest component here
import WalletTest from "./components/WalletTest1"; // Adjust path if needed
import features from "./components/FeatureSection";
import InvoiceList1 from "./components/InvoiceList1";
// import Dashboard from "./pages/Dashboard";
// import Dashboard from "@/pages/Dashboard";
import Dashboard from './pages/Dashboard'; 
import Documentation from "./pages/Documentation";
// import Profile from "./pages/Profile";
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthLogin from './components/ui/AuthLogin';
import FeatureSection from "./components/FeatureSection";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
        <App />
      </GoogleOAuthProvider> */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login1 />} />
          <Route path="/dashboard" element={<Dashboard />} /> 
          <Route path="/feature" element={<FeatureSection />} /> 
          {/* <Route path="/auth" element={<AuthLogin />} /> */}
          {/* <Route path="/dashboard" element={<Dashboard/>} /> */}
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/invoices" element={<InvoiceList1 />} />
          <Route path="/documentation" element={<Documentation />} />

          {/* 💡 Temporary test route for wallet connection */}
          <Route path="/wallet-test" element={<WalletTest />} />

          {/* Catch-all route for undefined paths */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
