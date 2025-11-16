import React, { useEffect, useState } from 'react';
import { Heart, Sparkles, MessageCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NewMatchCelebrationProps {
  matchedProfile: {
    name: string;
    image: string;
    age: number;
  };
  onClose: () => void;
}

const NewMatchCelebration: React.FC<NewMatchCelebrationProps> = ({ matchedProfile, onClose }) => {
  const navigate = useNavigate();
  const [showCelebration, setShowCelebration] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([]);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setShowCelebration(true), 100);

    // Generate floating hearts animation
    const generateHearts = () => {
      const newHearts = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 15,
        duration: Math.random() * 3 + 2,
      }));
      setHearts(newHearts);
    };

    generateHearts();

    // Auto-generate more hearts periodically
    const interval = setInterval(() => {
      const newHeart = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 15,
        duration: Math.random() * 3 + 2,
      };
      setHearts(prev => [...prev.slice(-15), newHeart]);
    }, 800);

    return () => clearInterval(interval);
  }, [matchedProfile]);

  const handleContinueToMessage = () => {
    onClose();
    navigate('/matches');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Floating Hearts Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute animate-float text-red-400 opacity-60"
            style={{
              left: `${heart.x}%`,
              top: `${heart.y}%`,
              fontSize: `${heart.size}px`,
              animationDuration: `${heart.duration}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          >
            <Heart fill="currentColor" />
          </div>
        ))}
      </div>

      {/* Main Celebration Card */}
      <div
        className={`relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-700 ${
          showCelebration
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-90 opacity-0 translate-y-8'
        }`}
      >
        {/* Animated Sparkle Border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-300 via-emerald-400 to-blue-400 p-[2px]">
          <div className="absolute inset-[2px] bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 text-center">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Animated Matching Hearts */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              {/* Pulsing Background Heart */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart
                  className="w-24 h-24 text-white/20 animate-pulse"
                  fill="currentColor"
                />
              </div>

              {/* Floating Hearts */}
              <Heart
                className="w-12 h-12 text-red-300 relative z-10 animate-bounce"
                fill="currentColor"
                style={{ animationDelay: '0.1s' }}
              />
              <Heart
                className="w-8 h-8 text-pink-300 absolute top-2 left-6 animate-ping"
                fill="currentColor"
                style={{ animationDelay: '0.3s' }}
              />
              <Heart
                className="w-6 h-6 text-purple-300 absolute bottom-1 right-4 animate-ping"
                fill="currentColor"
                style={{ animationDelay: '0.5s' }}
              />

              {/* Sparkles */}
              <Sparkles
                className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-spin"
                fill="currentColor"
                style={{ animationDuration: '3s' }}
              />
              <Sparkles
                className="w-4 h-4 text-amber-300 absolute top-8 -left-1 animate-pulse"
                fill="currentColor"
              />
            </div>
          </div>

          {/* Match Text */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2 animate-fade-in-up">
              It's a Match! 🔥
            </h2>
            <p className="text-emerald-100 text-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              You and <span className="font-bold text-white">{matchedProfile.name}</span> liked each other!
            </p>
          </div>

          {/* Profile Preview */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-white/30 mb-3 shadow-xl">
              <img
                src={matchedProfile.image}
                alt={matchedProfile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-white font-semibold">{matchedProfile.name}, {matchedProfile.age}</p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleContinueToMessage}
            className="w-full bg-white text-emerald-600 hover:bg-emerald-50 rounded-2xl py-4 px-6 font-bold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 group"
          >
            <MessageCircle className="w-6 h-6 transition-transform group-hover:scale-110" />
            Start Chatting Now ✨
          </button>

          {/* Helper Text */}
          <p className="text-emerald-200 text-sm mt-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            You can now message each other in the Matches section
          </p>
        </div>
      </div>

      {/* Custom Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
              opacity: 0.6;
            }
            50% {
              transform: translateY(-20px) rotate(180deg);
              opacity: 0.9;
            }
          }

          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-float {
            animation: float 4s ease-in-out infinite;
          }

          .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
          }
        `
      }} />
    </div>
  );
};

export default NewMatchCelebration;
