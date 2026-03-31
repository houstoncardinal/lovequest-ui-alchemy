import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowRight, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast({ title: "Error", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: "Check your email", description: "We've sent you a password reset link." });
      setForgotMode(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to send reset email.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/15 to-accent/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/10 to-violet-400/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl" />
      </div>

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

      <div className="relative z-10 flex-1 flex flex-col justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-sm mx-auto w-full"
        >
          {forgotMode ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">Forgot Password</h2>
                <p className="text-muted-foreground">Enter your email to receive a reset link</p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email" id="email" name="email" value={formData.email} onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-border rounded-2xl focus:ring-2 focus:ring-ring focus:border-transparent transition-all bg-background text-foreground"
                    placeholder="Enter your email" required
                  />
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full bg-gradient-hero text-white font-semibold py-3.5 px-6 rounded-2xl shadow-elegant hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>

                <button type="button" onClick={() => setForgotMode(false)}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Back to Sign In
                </button>
              </form>
            </>
          ) : (
            <>
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
                  <button type="button" onClick={() => setForgotMode(true)} className="text-sm text-primary hover:text-primary/80 font-medium">
                    Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full bg-gradient-hero text-white font-semibold py-3.5 px-6 rounded-2xl shadow-elegant hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <button onClick={() => navigate("/signup")} className="text-primary hover:text-primary/80 font-semibold">Sign up</button>
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>

      <div className="relative z-10 h-1 bg-gradient-hero" />
    </div>
  );
};

export default Login;
