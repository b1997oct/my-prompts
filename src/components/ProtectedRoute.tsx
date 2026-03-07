import { useEffect } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import "@/services/config";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useFirebaseAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/signin";
    }
  }, [user, loading]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};
