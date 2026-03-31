import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Shield, Users, ArrowRight, LogIn, Sparkles, Star, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroImage from "@/assets/welcome-hero.jpg";

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
      {/* Hero image section — takes ~45% of viewport */}
      <div className="relative w-full flex-[0_0_45%] overflow-hidden">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          src={heroImage}
          alt="Happy couple enjoying a moment together"
          className="absolute inset-0 w-full h-full object-cover"
          width={768}
          height={1024}
        />
        {/* Gradient overlay bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        {/* Gradient overlay top for status bar */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent h-24" />

        {/* Logo on top of image */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="absolute top-[max(env(safe-area-inset-top),12px)] left-0 right-0 flex items-center justify-between px-5 pt-1"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
              <Heart className="w-4 h-4 text-white fill-current" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight drop-shadow-md">LoveQuest</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25">
            <Sparkles className="w-2.5 h-2.5 text-white" />
            <span className="text-[10px] font-semibold text-white uppercase tracking-wider">Premium</span>
          </div>
        </motion.div>
      </div>

      {/* Content section — remaining 55% */}
      <div className="relative z-10 flex-1 flex flex-col justify-between px-6 -mt-4 min-h-0">
        {/* Title & tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <h1 className="text-[clamp(1.8rem,7vw,2.8rem)] font-extrabold text-foreground leading-[1.05] tracking-tight">
            Where Real Love<br />
            <span className="text-gradient">Begins</span>
          </h1>
          <p className="text-muted-foreground text-[13px] leading-relaxed max-w-[260px] mx-auto mt-2">
            Join millions finding meaningful connections through AI-powered compatibility matching.
          </p>
        </motion.div>

        {/* Trust indicators — compact row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="flex items-center justify-center gap-4 py-1"
        >
          {[
            { icon: Shield, label: "Verified Profiles" },
            { icon: CheckCircle2, label: "AI Matching" },
            { icon: Users, label: "2M+ Members" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
                <item.icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
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

        {/* Social proof footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center space-y-1 pb-[max(env(safe-area-inset-bottom),8px)]"
        >
          <div className="flex items-center justify-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
            ))}
            <span className="text-[11px] text-muted-foreground ml-1 font-medium">4.9 · 100K+ reviews</span>
          </div>
          <p className="text-[10px] text-muted-foreground/60">
            Trusted by millions worldwide · SSL Encrypted · Photo Verified
          </p>
        </motion.div>
      </div>

      {/* Bottom accent line */}
      <div className="relative z-10 h-0.5 bg-gradient-hero" />

      {/* Dev bypass */}
      {process.env.NODE_ENV === "development" && (
        <button onClick={handleBypass} className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 text-[10px] text-muted-foreground/50 hover:text-foreground">
          Dev Skip
        </button>
      )}
    </div>
  );
};

export default Welcome;
