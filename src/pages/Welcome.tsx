import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Shield, Users, ArrowRight, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Welcome = () => {
  const navigate = useNavigate();
  const { user, loading, bypassAuth } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleBypass = async () => {
    try {
      await bypassAuth();
      navigate("/");
    } catch (error) {
      console.error("Bypass failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex flex-col relative overflow-hidden">
      {/* Modern Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-300/30 to-emerald-500/20 rounded-full -translate-y-48 translate-x-48 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-400/25 to-teal-300/15 rounded-full translate-y-44 -translate-x-44 blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-amber-200/20 to-pink-200/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl animate-bounce" style={{animationDuration: '8s'}} />
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-l from-emerald-200/25 to-green-200/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}} />

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-emerald-400/40 rounded-full animate-bounce" style={{animationDuration: '4s'}} />
        <div className="absolute top-40 right-20 w-1 h-1 bg-emerald-500/60 rounded-full animate-bounce" style={{animationDuration: '6s', animationDelay: '3s'}} />
        <div className="absolute bottom-32 left-1/3 w-3 h-3 bg-amber-400/30 rounded-full animate-bounce" style={{animationDuration: '5s', animationDelay: '1s'}} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-center p-6 pt-8">
        <div className="flex items-center space-x-4 group">
          <Heart className="w-12 h-12 text-emerald-500 stroke-2 stroke-emerald-500 fill-transparent transition-all duration-300 group-hover:stroke-emerald-600 group-hover:scale-110 relative">
            {/* Pulse effect on hover */}
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/50 scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300" />
          </Heart>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">LoveQuest</h1>
            <p className="text-sm text-emerald-600 font-medium">Premium Dating</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md mx-auto text-center">
          {/* Welcome Message - Enhanced */}
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-800 bg-clip-text text-transparent drop-shadow-sm">
              Find Your<br />
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                Perfect Match
              </span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-sm mx-auto">
              Connect with singles who share your values in a premium, respectful, and faith-centered environment.
            </p>

            {/* Enhanced Feature Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="group bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-emerald-200/50 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-emerald-900 mb-1">Verified & Safe</p>
                <p className="text-xs text-emerald-700">Secure platform</p>
              </div>

              <div className="group bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-emerald-200/50 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-emerald-900 mb-1">Meaningful Matches</p>
                <p className="text-xs text-emerald-700">Real connections</p>
              </div>

              <div className="group bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-emerald-200/50 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-emerald-900 mb-1">50K+ Members</p>
                <p className="text-xs text-emerald-700">Growing community</p>
              </div>

              <div className="group bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-emerald-200/50 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-emerald-900 mb-1">Direct Messaging</p>
                <p className="text-xs text-emerald-700">Easy communication</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={() => navigate("/signup")}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 text-lg flex items-center justify-center relative overflow-hidden group hover:from-emerald-600 hover:to-emerald-700"
              size="lg"
            >
              <span className="relative z-10 flex items-center">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </Button>

            <Button
              onClick={() => navigate("/login")}
              variant="ghost"
              className="w-full border-2 border-emerald-300 text-emerald-700 font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg flex items-center justify-center bg-white/80 backdrop-blur-sm hover:bg-emerald-100 hover:text-emerald-800 hover:border-emerald-400"
              size="lg"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </div>

          {/* Enhanced Social Proof */}
          <div className="mt-10 space-y-4">
            <div className="flex items-center justify-center space-x-2 text-emerald-700 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-emerald-200/50">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Join 50,000+ singles finding love</span>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center space-x-6 text-xs text-emerald-600 mt-6">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span className="font-medium">SSL Secure</span>
              </div>
              <div className="w-px h-4 bg-emerald-300"></div>
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span className="font-medium">Faith-Focused</span>
              </div>
              <div className="w-px h-4 bg-emerald-300"></div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span className="font-medium">Verified Users</span>
              </div>
            </div>
          </div>

          {/* Development Bypass */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 pt-6 border-t border-emerald-200/50">
              <button
                onClick={handleBypass}
                className="text-xs text-emerald-600 hover:text-emerald-700 underline transition-colors duration-200"
              >
                Development Mode - Skip Registration
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom accent */}
      <div className="relative z-10 h-1 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700"></div>
    </div>
  );
};

export default Welcome;
