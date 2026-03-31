import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowRight, Eye, EyeOff, Crown, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "", agreeToTerms: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (!formData.agreeToTerms) {
      toast({ title: "Error", description: "Please agree to the Terms of Service and Privacy Policy.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email, password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { first_name: formData.firstName, last_name: formData.lastName, display_name: formData.firstName }
        }
      });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Account created!", description: "Please check your email to verify your account." });
      navigate("/onboarding");
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/15 to-accent/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/10 to-violet-400/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl" />
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center justify-between p-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/welcome")} className="hover:bg-muted">
          <ArrowRight className="w-6 h-6 rotate-180 text-primary" />
        </Button>
        <div className="flex items-center">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-hero rounded-2xl flex items-center justify-center shadow-elegant ring-4 ring-primary/10">
              <Heart className="w-7 h-7 text-white fill-current" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
              <Crown className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-foreground">LoveQuest</h1>
            <p className="text-xs text-primary font-medium">Premium Dating</p>
          </div>
        </div>
        <div></div>
      </motion.div>

      {/* Form Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-8 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="max-w-md mx-auto w-full bg-card/80 backdrop-blur-sm rounded-3xl shadow-card border border-border/50 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Create Account</h2>
            <p className="text-primary">Join LoveQuest and find your soulmate</p>
            <Badge className="mt-4 bg-gradient-hero text-white px-4 py-1 text-xs font-bold shadow-elegant inline-flex items-center">
              <Sparkles className="w-3 h-3 mr-1" /> Premium Experience
            </Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First name" required className="mt-2 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last name" required className="mt-2 rounded-xl" />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" required className="mt-2 rounded-xl" />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Create a password" required className="mt-2 pr-12 rounded-xl" />
                <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm your password" required className="mt-2 rounded-xl" />
            </div>

            <div className="flex items-start">
              <Input type="checkbox" id="agreeToTerms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange}
                className="w-4 h-4 mt-1 text-primary border-border rounded focus:ring-primary" required />
              <Label htmlFor="agreeToTerms" className="ml-2 text-sm text-muted-foreground">
                I agree to the{' '}
                <Button type="button" variant="link" className="text-primary hover:text-primary/80 font-medium px-0 h-auto">Terms of Service</Button>{' '}
                and{' '}
                <Button type="button" variant="link" className="text-primary hover:text-primary/80 font-medium px-0 h-auto">Privacy Policy</Button>
              </Label>
            </div>

            <Button type="submit" disabled={isLoading}
              className="w-full bg-gradient-hero text-white font-semibold py-6 rounded-2xl shadow-elegant hover:opacity-90 transition-all active:scale-[0.98] text-base" size="lg">
              {isLoading ? "Creating Account..." : "Create Account"}
              {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>

            <Button type="button" variant="outline"
              className="w-full flex items-center justify-center gap-2 py-6 rounded-2xl border-2 border-border text-foreground hover:bg-muted mt-2"
              onClick={() => toast({ title: "Coming soon!", description: "Google sign up will be available soon." })}>
              <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.9 33.1 30.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.6 0 5 .8 7 2.2l6.4-6.4C33.5 5.5 28.1 3.5 22 3.5 11.6 3.5 3 12.1 3 22.5S11.6 41.5 22 41.5c9.5 0 17.5-7.7 17.5-17.5 0-1.2-.1-2.1-.3-3z"/></g></svg>
              Sign up with Google
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Button type="button" variant="link" onClick={() => navigate("/login")} className="text-primary hover:text-primary/80 font-semibold px-0 h-auto">
                Sign in
              </Button>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 h-1 bg-gradient-hero" />
    </div>
  );
};

export default SignUp;
