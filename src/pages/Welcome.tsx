import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Shield, Users, ArrowRight, LogIn, Sparkles, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Welcome = () => {
  const navigate = useNavigate();
  const { user, loading, bypassAuth } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate('/');
  }, [user, loading, navigate]);

  const handleBypass = async () => {
    try { await bypassAuth(); navigate("/"); } catch (error) { console.error("Bypass failed:", error); }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/15 to-accent/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/10 to-violet-400/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex items-center justify-center pt-12 pb-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-hero rounded-2xl flex items-center justify-center shadow-elegant">
            <Heart className="w-6 h-6 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">LoveQuest</h1>
            <p className="text-xs text-primary font-semibold tracking-wider uppercase">Premium Dating</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mb-10"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-[1.1]">
              Find Your<br />
              <span className="text-gradient">Perfect Match</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
              Connect with amazing people who share your vibe. Real connections, real relationships.
            </p>
          </motion.div>

          {/* Feature Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 gap-3 mb-10"
          >
            {[
              { icon: Shield, title: "Verified Profiles", sub: "Safe & secure" },
              { icon: Heart, title: "Smart Matching", sub: "AI-powered" },
              { icon: Users, title: "1M+ Members", sub: "Growing daily" },
              { icon: MessageCircle, title: "Chat & Video", sub: "Stay connected" },
            ].map((item, i) => (
              <div key={i} className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-glow rounded-xl flex items-center justify-center mx-auto mb-2">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            ))}
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-3"
          >
            <Button
              onClick={() => navigate("/signup")}
              className="w-full bg-gradient-hero text-white font-semibold py-6 rounded-2xl shadow-elegant hover:opacity-90 transition-all active:scale-[0.98] text-base"
              size="lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              onClick={() => navigate("/login")}
              variant="outline"
              className="w-full border-2 border-border text-foreground font-semibold py-6 rounded-2xl text-base hover:bg-muted"
              size="lg"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 space-y-3"
          >
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
              <span className="text-sm text-muted-foreground ml-2 font-medium">4.8 • 50K+ reviews</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> SSL Secure</span>
              <span className="w-px h-3 bg-border" />
              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Matching</span>
              <span className="w-px h-3 bg-border" />
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Verified</span>
            </div>
          </motion.div>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 pt-4 border-t border-border/50">
              <button onClick={handleBypass} className="text-xs text-muted-foreground hover:text-foreground underline">
                Dev Mode – Skip Registration
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="relative z-10 h-1 bg-gradient-hero" />
    </div>
  );
};

export default Welcome;
