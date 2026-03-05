import React from "react";
import { AuthProvider } from "../../context/AuthContext";
import { ProtectedRoute } from "../ProtectedRoute";
import { Dashboard } from "./Dashboard";

export const DashboardPage: React.FC = () => {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    </AuthProvider>
  );
};
