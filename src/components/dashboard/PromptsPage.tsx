import React from "react";
import { AuthProvider } from "../../context/AuthContext";
import { ProtectedRoute } from "../ProtectedRoute";
import { PromptsTable } from "./PromptsTable";

export const PromptsPage: React.FC = () => {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <PromptsTable />
      </ProtectedRoute>
    </AuthProvider>
  );
};
