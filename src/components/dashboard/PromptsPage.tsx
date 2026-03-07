import React from "react";
import { ProtectedRoute } from "../ProtectedRoute";
import { PromptsTable } from "./PromptsTable";

export const PromptsPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <PromptsTable />
    </ProtectedRoute>
  );
};
