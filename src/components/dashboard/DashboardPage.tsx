import React from "react";
import { ProtectedRoute } from "../ProtectedRoute";
import { Dashboard } from "./Dashboard";

export const DashboardPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
};
