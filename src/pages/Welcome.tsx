import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Find Your Halal Match",
      subtitle: "Connect with Muslims who share your values and marriage goals.",
      image: "🌙",
      color: "from-amber-500 to-yellow-600"
    },
    {
      title: "Luxury Experience, Faithful Connections",
      subtitle: "Jaan offers a premium, safe, and respectful space for Muslim singles.",
      image: "💎",
      color: "from-slate-700 to-slate-900"
    },
    {
      title: "Privacy & Trust First",
      subtitle: "Your privacy and faith are our top priorities.",
      image: "🛡️",
      color: "from-emerald-600 to-teal-700"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
            <Heart className="w-6 h-6 text-white fill-current" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Jaan</h1>
        </div>
        
        {currentSlide < slides.length - 1 && (
          <button 
            onClick={() => navigate("/signup")}
            className="text-slate-600 font-medium hover:text-slate-800 transition-colors"
          >
            Skip
          </button>
        )}
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div 
          className={`w-32 h-32 rounded-full bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center mb-8 shadow-2xl`}
        >
          <span className="text-6xl">{slides[currentSlide].image}</span>
        </div>

        <h2 className="text-3xl font-bold text-slate-800 text-center mb-4">
          {slides[currentSlide].title}
        </h2>
        
        <p className="text-slate-600 text-center text-lg leading-relaxed mb-12 max-w-sm">
          {slides[currentSlide].subtitle}
        </p>

        {/* Dots Indicator */}
        <div className="flex space-x-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-gradient-to-r from-amber-500 to-yellow-600 w-8" : "bg-slate-300"
              }`}
            />
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={nextSlide}
          className="w-full max-w-sm bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center"
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Continue"}
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default Welcome;