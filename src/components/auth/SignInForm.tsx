import React, { useState } from "react";
import { 
  GoogleAuthProvider, 
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";

export const SignInForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createUserDocIfNeeded = async (user: any) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
      });
      const data = await response.json();
      if (!data.ok) {
        console.error("Failed to sync user to MongoDB:", data.error);
      }
    } catch (err) {
      console.error("Error syncing user:", err);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      const userCredential = await signInWithPopup(auth, provider);
      console.log("[Auth] Google sign-in successful:", userCredential.user.uid);
      await createUserDocIfNeeded(userCredential.user);
      console.log("[Firestore] User document synced successfully.");
      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("[Auth Error]", err);
      if (err.code === 'permission-denied') {
        setError("Firestore Permission Denied. Check your security rules and project ID.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Personal Workspace</CardTitle>
        <CardDescription>
          Sign in or create an account with your Google account to manage your API keys.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 py-6">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        <Button 
          variant="outline" 
          type="button" 
          className="w-full h-12 text-base font-medium" 
          onClick={handleGoogleSignIn} 
          disabled={loading}
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              <svg className="mr-3 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Continue with Google
            </>
          )}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground mt-2">
          By continuing, you agree to our terms of service and privacy policy.
        </p>
      </CardContent>
    </Card>
  );
};
