import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LikeYou from "./pages/LikeYou";
import ForYou from "./pages/ForYou";
import Chat from "./pages/Chat";
import Account from "./pages/Account";
import ProfileDetail from "./pages/ProfileDetail";
import Welcome from "./pages/Welcome";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import EditProfile from "./pages/EditProfile";
import ManagePhotos from "./pages/ManagePhotos";
import Preferences from "./pages/Preferences";
import Notifications from "./pages/Notifications";
import PrivacySafety from "./pages/PrivacySafety";
import HelpSupport from "./pages/HelpSupport";
import Pricing from "./pages/Pricing";
import Settings from "./pages/Settings";
import AdvancedFilters from "./pages/AdvancedFilters";
import BlockReport from "./pages/BlockReport";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/like-you" element={<LikeYou />} />
          <Route path="/for-you" element={<ForYou />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/account" element={<Account />} />
          <Route path="/profile/:id" element={<ProfileDetail />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/manage-photos" element={<ManagePhotos />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/privacy-safety" element={<PrivacySafety />} />
          <Route path="/help-support" element={<HelpSupport />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/advanced-filters" element={<AdvancedFilters />} />
          <Route path="/block-report/:id" element={<BlockReport />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
