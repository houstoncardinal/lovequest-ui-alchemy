import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowRight, Eye, EyeOff, Crown, Sparkles } from "lucide-react";
import { auth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, db, doc, setDoc, serverTimestamp, signInWithPopup, GoogleAuthProvider, getDoc } from "@/integrations/firebase";
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


  const handleGoogleSignIn = async () => {
    console.log('🚀 Google Sign-Up: Starting...');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      console.log('🔐 Google Sign-Up: Opening popup...');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('✅ Google Sign-Up: User signed in:', user.email);

      // Check if user profile exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      console.log('📝 Google Sign-Up: Checking Firestore for existing user...');
      const userDoc = await getDoc(userDocRef);
      console.log('📊 Google Sign-Up: User exists?', userDoc.exists());

      if (!userDoc.exists()) {
        // Create new user profile (first-time Google sign-up)
        console.log('🆕 Google Sign-Up: Creating new user profile...');
        const nameParts = user.displayName?.split(' ') || ['', ''];
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || null,
          bio: '',
          isVerified: user.emailVerified,
          verificationLevel: user.emailVerified ? 'email' : 'none',
          canAccessApp: false,
          isPremium: false,
          premiumTier: 'free',
          profileCompleteness: 20,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastActive: serverTimestamp(),
        });

        console.log('✨ Google Sign-Up: Profile created! Redirecting to onboarding...');
        toast({
          title: "Welcome!",
          description: "Let's complete your profile to get started.",
        });
        navigate("/onboarding");
      } else {
        // User already exists, just sign them in
        console.log('👤 Google Sign-Up: Existing user, signing in...');
        toast({
          title: "Welcome back!",
          description: "You've been signed in with Google.",
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error('Google Sign-Up Error:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);

      let errorMessage = "Failed to sign up with Google.";

      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-up cancelled.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Popup blocked. Please enable popups for this site.";
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "An account already exists with this email.";
      } else {
        // Show the actual error for debugging
        errorMessage = `Failed to sign up: ${error?.message || 'Unknown error'}`;
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

            {/* Divider */}
            <div className="mt-6 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-emerald-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-emerald-600">Or continue with</span>
                </div>
              </div>
            </div>

            {/* Google Sign Up Button */}
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? "Signing Up..." : "Sign up with Google"}
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