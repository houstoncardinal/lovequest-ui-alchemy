import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNavigation from "@/components/BottomNavigation";
import DesktopNavigation from "@/components/DesktopNavigation";
import ThemeToggle from "@/components/ThemeToggle";
import Home from "./pages/Home";
import LikeYou from "./pages/LikeYou";
import ForYou from "./pages/ForYou";
import Matches from "./pages/Matches";
import Community from "./pages/Community";
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
import LifestyleFeatures from "./pages/LifestyleFeatures";
import PremiumFeatures from "./pages/PremiumFeatures";
import AdvancedSearch from "./pages/AdvancedSearch";
import Verification from "./pages/Verification";
import RelationshipFeatures from "./pages/RelationshipFeatures";
import MatchInsightsWrapper from "./pages/MatchInsightsWrapper";
import EnhancedMatching from "./pages/EnhancedMatching";
import AdminDashboard from "./pages/AdminDashboard";
import Messages from "./pages/Messages";
import PhotoManager from "./pages/PhotoManager";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import PostDetailView from "./components/PostDetailView";

const queryClient = new QueryClient();

const AppWithNavigation = () => {
  const location = useLocation();
  
  // Pages where we don't want to show the bottom navigation
  const hideNavigationOn = ['/welcome', '/signup', '/login'];
  const showNavigation = !hideNavigationOn.includes(location.pathname);
  const isAuthPage = hideNavigationOn.includes(location.pathname);

  return (
    <>
      {/* Desktop Navigation - only shown on desktop */}
      {showNavigation && <DesktopNavigation />}
      
      {/* Main Content with responsive padding */}
      <div className={isAuthPage ? "" : "pb-20 md:pb-0 md:pt-20"}>
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/like-you" element={<ProtectedRoute><LikeYou /></ProtectedRoute>} />
          <Route path="/for-you" element={<ProtectedRoute><ForYou /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
           <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
           <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
           <Route path="/photo-manager" element={<ProtectedRoute><PhotoManager /></ProtectedRoute>} />
           <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><ProfileDetail /></ProtectedRoute>} />
          <Route path="/post/:postId" element={<ProtectedRoute><PostDetailView /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/manage-photos" element={<ProtectedRoute><ManagePhotos /></ProtectedRoute>} />
          <Route path="/preferences" element={<ProtectedRoute><Preferences /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/privacy-safety" element={<ProtectedRoute><PrivacySafety /></ProtectedRoute>} />
          <Route path="/help-support" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
          <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/advanced-filters" element={<ProtectedRoute><AdvancedFilters /></ProtectedRoute>} />
          <Route path="/block-report/:id" element={<ProtectedRoute><BlockReport /></ProtectedRoute>} />
          <Route path="/terms-of-service" element={<ProtectedRoute><TermsOfService /></ProtectedRoute>} />
          <Route path="/lifestyle-features" element={<ProtectedRoute><LifestyleFeatures /></ProtectedRoute>} />
          <Route path="/premium-features" element={<ProtectedRoute><PremiumFeatures /></ProtectedRoute>} />
          <Route path="/advanced-search" element={<ProtectedRoute><AdvancedSearch /></ProtectedRoute>} />
          <Route path="/verification" element={<ProtectedRoute><Verification /></ProtectedRoute>} />
          <Route path="/relationship-features" element={<ProtectedRoute><RelationshipFeatures /></ProtectedRoute>} />
          <Route path="/match-insights/:id" element={<ProtectedRoute><MatchInsightsWrapper /></ProtectedRoute>} />
          <Route path="/enhanced-matching" element={<ProtectedRoute><EnhancedMatching /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      
      {/* Mobile Bottom Navigation - only shown on mobile */}
      {showNavigation && <BottomNavigation />}
    </>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppWithNavigation />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
