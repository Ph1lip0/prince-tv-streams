import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Channels from "./pages/Channels";
import Matches from "./pages/Matches";
import Profile from "./pages/Profile";
import Watch from "./pages/Watch";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ChannelsAdmin from "./pages/admin/ChannelsAdmin";
import MatchesAdmin from "./pages/admin/MatchesAdmin";
import SlideshowsAdmin from "./pages/admin/SlideshowsAdmin";
import UsersAdmin from "./pages/admin/UsersAdmin";
import PaymentsAdmin from "./pages/admin/PaymentsAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/channels" element={<Channels />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/watch/:channelId" element={<Watch />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="channels" element={<ChannelsAdmin />} />
                <Route path="matches" element={<MatchesAdmin />} />
                <Route path="slideshows" element={<SlideshowsAdmin />} />
                <Route path="users" element={<UsersAdmin />} />
                <Route path="payments" element={<PaymentsAdmin />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;