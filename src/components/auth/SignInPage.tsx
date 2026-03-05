import React from "react";
import { AuthProvider } from "../../context/AuthContext";
import { SignInForm } from "./SignInForm";

export const SignInPage: React.FC = () => {
  return (
    <AuthProvider>
      <div className="flex items-center justify-center min-h-screen p-4">
        <SignInForm />
      </div>
    </AuthProvider>
  );
};
