import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowRight, Eye, EyeOff, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { bypassAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }

      toast({ title: "Welcome back!", description: "You've been signed in successfully." });
      navigate("/");
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleBypass = async () => {
    try {
      await bypassAuth();
      toast({ title: "Development Bypass", description: "You've been signed in with a development account." });
      navigate("/");
    } catch (error) {
      toast({ title: "Bypass Error", description: "Something went wrong with the bypass.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/15 to-accent/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/10 to-violet-400/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center justify-center pt-10 pb-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-hero rounded-2xl flex items-center justify-center shadow-elegant">
            <Heart className="w-6 h-6 text-white fill-current" />
          </div>
          <h1 className="text-xl font-bold text-foreground">LoveQuest</h1>
        </div>
      </motion.div>

      {/* Form Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-sm mx-auto w-full"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email" id="email" name="email" value={formData.email} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-ring focus:border-transparent transition-all bg-background text-foreground"
                placeholder="Enter your email" required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password} onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-border rounded-2xl focus:ring-2 focus:ring-ring focus:border-transparent transition-all bg-background text-foreground"
                  placeholder="Enter your password" required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleInputChange}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary hover:text-primary/80 font-medium">Forgot password?</button>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full bg-gradient-hero text-white font-semibold py-3.5 px-6 rounded-2xl shadow-elegant hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-4">
              <button onClick={handleBypass}
                className="w-full flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-muted-foreground font-medium py-3 px-6 rounded-2xl border border-border transition-all">
                <Zap className="w-5 h-5 text-yellow-500" /> Development Bypass
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <button onClick={() => navigate("/signup")} className="text-primary hover:text-primary/80 font-semibold">Sign up</button>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 h-1 bg-gradient-hero" />
    </div>
  );
};

export default Login;
