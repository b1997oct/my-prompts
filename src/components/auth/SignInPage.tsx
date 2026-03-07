import React from "react";
import { SignInForm } from "./SignInForm";

export const SignInPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <SignInForm />
    </div>
  );
};
