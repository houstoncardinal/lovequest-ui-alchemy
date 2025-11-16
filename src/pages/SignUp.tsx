import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowRight, Eye, EyeOff, Crown, Sparkles } from "lucide-react";
import { auth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, db, doc, setDoc, serverTimestamp } from "@/integrations/firebase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Error",
        description: "Please agree to the Terms of Service and Privacy Policy.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Update display name in Firebase Auth
      await updateProfile(user, {
        displayName: formData.firstName,
      });

      // Send email verification
      await sendEmailVerification(user);

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.firstName,
        photoURL: null,
        bio: '',
        isVerified: false,
        verificationLevel: 'email',
        canAccessApp: false, // Will be set to true after onboarding
        isPremium: false,
        premiumTier: 'free',
        profileCompleteness: 10, // Just email and name
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActive: serverTimestamp(),
      });

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });

      navigate("/onboarding");
    } catch (error: any) {
      let errorMessage = "Something went wrong. Please try again.";

      // Firebase error codes
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Email/password sign-up is not enabled.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Button 
          variant="ghost"
          size="icon"
          onClick={() => navigate("/welcome")}
          className="hover:bg-emerald-100"
        >
          <ArrowRight className="w-6 h-6 rotate-180 text-emerald-600" />
        </Button>
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
            <p className="text-xs text-emerald-600 font-medium">Premium Dating</p>
          </div>
        </div>
        <div></div>
      </div>

      {/* Form Content */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8">
        <div className="max-w-md mx-auto w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-100 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-emerald-600">Join LoveQuest and find your soulmate</p>
            <Badge className="mt-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-1 text-xs font-bold shadow-lg inline-flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Premium Experience
            </Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First name"
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last name"
                  required
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  required
                  className="mt-2 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
                className="mt-2"
              />
            </div>

            <div className="flex items-start">
              <Input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="w-4 h-4 mt-1 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                required
              />
              <Label htmlFor="agreeToTerms" className="ml-2 text-sm text-emerald-700">
                I agree to the{' '}
                <Button type="button" variant="link" className="text-emerald-600 hover:text-emerald-700 font-medium px-0 h-auto">Terms of Service</Button>{' '}
                and{' '}
                <Button type="button" variant="link" className="text-emerald-600 hover:text-emerald-700 font-medium px-0 h-auto">Privacy Policy</Button>
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              size="lg"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
              {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>

            {/* Google Sign Up Placeholder */}
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 mt-2"
              onClick={() => toast({ title: "Coming soon!", description: "Google sign up will be available soon." })}
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.9 33.1 30.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.6 0 5 .8 7 2.2l6.4-6.4C33.5 5.5 28.1 3.5 22 3.5 11.6 3.5 3 12.1 3 22.5S11.6 41.5 22 41.5c9.5 0 17.5-7.7 17.5-17.5 0-1.2-.1-2.1-.3-3z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 17.1 18.3 15 22 15c2.6 0 5 .8 7 2.2l6.4-6.4C33.5 5.5 28.1 3.5 22 3.5c-6.6 0-12 5.4-12 12 0 2.1.5 4.1 1.3 5.7z"/><path fill="#FBBC05" d="M22 41.5c6.2 0 11.4-2.1 15.2-5.7l-7-5.7C28.7 32.9 26.5 34 24 34c-6.6 0-12-5.4-12-12 0-1.3.2-2.5.5-3.7l-7-5.1C3.5 17.1 3 19.1 3 22.5c0 10.4 8.6 19 19 19z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.2 3.2-4.2 5.5-7.7 5.5-6.6 0-12-5.4-12-12 0-1.3.2-2.5.5-3.7l-7-5.1C3.5 17.1 3 19.1 3 22.5c0 10.4 8.6 19 19 19 6.1 0 11.5-2.1 15.2-5.7l-7-5.7C28.7 32.9 26.5 34 24 34c-6.6 0-12-5.4-12-12 0-1.3.2-2.5.5-3.7l-7-5.1C3.5 17.1 3 19.1 3 22.5c0 10.4 8.6 19 19 19 6.1 0 11.5-2.1 15.2-5.7l-7-5.7C28.7 32.9 26.5 34 24 34c-6.6 0-12-5.4-12-12 0-1.3.2-2.5.5-3.7l-7-5.1C3.5 17.1 3 19.1 3 22.5c0 10.4 8.6 19 19 19z"/></g></svg>
              Sign up with Google
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-emerald-700">
              Already have an account?{' '}
              <Button
                type="button"
                variant="link"
                onClick={() => navigate("/login")}
                className="text-emerald-600 hover:text-emerald-700 font-semibold px-0 h-auto"
              >
                Sign in
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;