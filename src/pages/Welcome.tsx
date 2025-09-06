import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowRight, Crown, Star, Shield, Sparkles, Diamond, Users, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const Welcome = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);
  
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Find Your Halal Match",
      subtitle: "Connect with Muslims who share your values and marriage goals in a premium, respectful environment.",
      icon: Heart,
      color: "from-emerald-500 via-emerald-600 to-emerald-700",
      bgGradient: "from-emerald-50 via-white to-emerald-100",
      features: ["Faith-centered connections", "Verified profiles", "Respectful community"],
      accent: "bg-gradient-to-br from-emerald-200/60 to-emerald-400/40",
      iconSize: "w-16 h-16 md:w-20 md:h-20",
      badge: (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-1 text-xs font-bold shadow-lg flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Halal & Premium
        </Badge>
      ),
      microDecor: (
        <>
          <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-emerald-200/40 to-emerald-400/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-2 right-2 w-6 h-6 bg-gradient-to-br from-emerald-300/40 to-emerald-500/20 rounded-full blur-md animate-pulse delay-200" />
        </>
      )
    },
    {
      title: "Luxury Experience, Faithful Connections",
      subtitle: "LoveQuest offers a premium, safe, and sophisticated space designed exclusively for Muslim singles seeking marriage.",
      icon: Crown,
      color: "from-amber-500 via-amber-600 to-amber-700",
      bgGradient: "from-amber-50 via-white to-amber-100",
      features: ["Premium matching", "Privacy-first", "Marriage-focused"],
      accent: "bg-gradient-to-br from-amber-200/60 to-amber-400/40",
      iconSize: "w-16 h-16 md:w-20 md:h-20",
      badge: (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-1 text-xs font-bold shadow-lg flex items-center gap-1">
          <Crown className="w-3 h-3" />
          Luxury
        </Badge>
      ),
      microDecor: (
        <>
          <div className="absolute -top-4 right-0 w-10 h-10 bg-gradient-to-br from-amber-200/40 to-amber-400/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-2 left-2 w-6 h-6 bg-gradient-to-br from-amber-300/40 to-amber-500/20 rounded-full blur-md animate-pulse delay-200" />
        </>
      )
    },
    {
      title: "Privacy & Trust First",
      subtitle: "Your privacy and faith are our top priorities. Experience the highest level of security and discretion.",
      icon: Shield,
      color: "from-emerald-600 via-emerald-700 to-emerald-800",
      bgGradient: "from-emerald-50 via-white to-emerald-50",
      features: ["End-to-end encryption", "Verified members", "Safe environment"]
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/signup");
    }
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentSlideData.bgGradient} transition-all duration-1000 ease-in-out flex flex-col`}> 
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-emerald-200/20 to-emerald-400/20 rounded-full -translate-y-36 translate-x-36 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-300/20 to-emerald-500/20 rounded-full translate-y-48 -translate-x-48 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-emerald-100">
              <Heart className="w-7 h-7 text-white fill-current" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
              <Crown className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">LoveQuest</h1>
            <p className="text-xs text-emerald-600 font-medium">Premium Halal Dating</p>
          </div>
        </div>
        
        {currentSlide < slides.length - 1 && (
          <button 
            onClick={() => navigate("/signup")}
            className="px-4 py-2 rounded-xl text-gray-600 font-medium hover:text-gray-900 hover:bg-white/50 transition-all duration-200"
          >
            Skip
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 w-full max-w-xl mx-auto">
        {/* Premium Icon Container */}
        <div className="relative mb-6 flex flex-col items-center w-full">
          <div className={`relative flex items-center justify-center mx-auto mb-2 ${currentSlideData.accent} rounded-2xl shadow-2xl w-24 h-24 md:w-32 md:h-32`}> 
            {currentSlideData.microDecor}
            <Icon className={`${currentSlideData.iconSize} text-white drop-shadow-lg relative z-10`} />
            {currentSlideData.badge}
          </div>
        </div>
        {/* Content */}
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
            {currentSlideData.title}
          </h2>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8">
            {currentSlideData.subtitle}
          </p>
          {/* Feature highlights */}
          <div className="grid grid-cols-1 gap-3 mb-8">
            {currentSlideData.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm">
                <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700 font-medium text-sm md:text-base">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex space-x-3 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`rounded-full transition-all duration-500 ${
                index === currentSlide 
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 w-10 h-3" 
                  : "bg-gray-300 w-3 h-3 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={nextSlide}
            className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 flex items-center justify-center relative overflow-hidden group"
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            
            <span className="relative z-10 flex items-center">
              {currentSlide === slides.length - 1 ? "Begin Your Journey" : "Continue"}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </span>
          </button>

          {/* Social proof */}
          <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
            <Users className="w-4 h-4" />
            <span>Join 50,000+ Muslims finding love</span>
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="relative z-10 h-2 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700"></div>
    </div>
  );
};

export default Welcome;