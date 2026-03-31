import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Shield, Users, ArrowRight, LogIn, Sparkles, Star, Crown } from "lucide-react";
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
    <div className="h-[100dvh] bg-background flex flex-col relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-15%] w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] bg-gradient-to-br from-primary/12 to-accent/8 rounded-full blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-15%] w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] bg-gradient-to-tr from-primary/8 to-violet-400/6 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-gradient-to-r from-primary/[0.03] to-accent/[0.03] rounded-full blur-3xl" />
      </div>

      {/* Top bar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),12px)] pb-2"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-hero rounded-xl flex items-center justify-center shadow-elegant">
            <Heart className="w-[18px] h-[18px] text-white fill-current" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">LoveQuest</span>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/8 border border-primary/15">
          <Crown className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Premium</span>
        </div>
      </motion.header>

      {/* Main — flex-1 fills remaining space, justify-between distributes content */}
      <main className="relative z-10 flex-1 flex flex-col justify-between px-5 py-3 min-h-0">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center"
        >
          <h2 className="text-[clamp(1.75rem,7vw,3rem)] font-extrabold text-foreground leading-[1.08] tracking-tight">
            Find Your<br />
            <span className="text-gradient">Perfect Match</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px] mx-auto mt-2">
            Real connections with people who share your energy. Start your story today.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-4 gap-2 my-3"
        >
          {[
            { icon: Shield, label: "Verified" },
            { icon: Heart, label: "AI Match" },
            { icon: Users, label: "1M+ Users" },
            { icon: MessageCircle, label: "Chat" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-card/70 backdrop-blur-sm border border-border/40">
              <div className="w-9 h-9 rounded-xl bg-gradient-glow flex items-center justify-center">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[11px] font-semibold text-foreground">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="space-y-2.5"
        >
          <Button
            onClick={() => navigate("/signup")}
            className="w-full bg-gradient-hero text-white font-semibold h-[52px] rounded-2xl shadow-elegant hover:opacity-90 transition-all active:scale-[0.98] text-[15px]"
            size="lg"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="w-full border-2 border-border text-foreground font-semibold h-[52px] rounded-2xl text-[15px] hover:bg-muted/60"
            size="lg"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center space-y-1.5 pb-[max(env(safe-area-inset-bottom),8px)]"
        >
          <div className="flex items-center justify-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" />
            ))}
            <span className="text-xs text-muted-foreground ml-1.5 font-medium">4.8 · 50K+ reviews</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Shield className="w-2.5 h-2.5" /> SSL Secure</span>
            <span className="w-px h-2.5 bg-border" />
            <span className="flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> AI Matching</span>
            <span className="w-px h-2.5 bg-border" />
            <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" /> Verified</span>
          </div>
        </motion.div>
      </main>

      {/* Bottom accent */}
      <div className="relative z-10 h-0.5 bg-gradient-hero" />

      {/* Dev bypass — hidden in prod */}
      {process.env.NODE_ENV === "development" && (
        <button onClick={handleBypass} className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 text-[10px] text-muted-foreground/50 hover:text-foreground">
          Dev Skip
        </button>
      )}
    </div>
  );
};

export default Welcome;
