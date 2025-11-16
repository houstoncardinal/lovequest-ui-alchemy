# Google Sign-In Setup - READY TO USE!

## ✅ What's Already Done:
1. Google Sign-In is enabled in your Firebase Console
2. `GoogleAuthProvider` and `signInWithPopup` have been added to your Firebase exports

## 📝 Quick Setup Instructions:

### Step 1: Add Google Sign-In to Login Page

Open `src/pages/Login.tsx` and make these changes:

**1. Update imports (line 4):**
```typescript
import { auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, db, doc, getDoc, setDoc, serverTimestamp } from "@/integrations/firebase";
```

**2. Add Google Sign-In handler (after line 74, after `handleInputChange`):**
```typescript
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user profile (first-time Google sign-in)
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

        toast({
          title: "Welcome!",
          description: "Let's complete your profile to get started.",
        });
        navigate("/onboarding");
      } else {
        toast({
          title: "Welcome back!",
          description: "You've been signed in with Google.",
        });
        navigate("/");
      }
    } catch (error: any) {
      let errorMessage = "Failed to sign in with Google.";

      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in cancelled.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Popup blocked. Please enable popups for this site.";
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "An account already exists with this email.";
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
```

**3. Add divider and Google button (after line 161, after the email/password form closing `</form>` tag):**
```typescript
          {/* Divider */}
          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-border text-foreground font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
            {isLoading ? "Signing In..." : "Sign in with Google"}
          </button>
```

---

### Step 2: Add Google Sign-In to SignUp Page (Optional)

Do the same thing in `src/pages/SignUp.tsx`:

**1. Update imports (around line 4):**
```typescript
import { auth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, db, doc, setDoc, serverTimestamp, signInWithPopup, GoogleAuthProvider, getDoc } from "@/integrations/firebase";
```

**2. Add the same `handleGoogleSignIn` function**

**3. Add the same divider and button before the "Already have an account?" section**

---

## 🧪 How to Test:

1. Run your app: `npm run dev`
2. Go to the Login page
3. Click "Sign in with Google"
4. Select your Google account
5. ✅ You should be signed in and redirected!

---

## ✅ What Happens When Users Sign In:

- **First-time Google users:** Profile is created in Firestore → Redirected to onboarding
- **Returning Google users:** Signed in directly → Redirected to home page
- **Profile data saved:** Name, email, photo, verification status

---

## 🔒 Security Notes:

- Google handles all password/credential security
- Your app gets a verified email address automatically
- Firebase handles all OAuth2 flow securely
- No client secrets needed in your code!

---

## 🎯 Already Configured in Firebase Console:

✅ Google Auth Provider enabled
✅ Authorized domains configured
✅ OAuth consent screen set up
✅ Client ID and Secret generated

**Everything is ready - just add the code above and test!** 🚀
