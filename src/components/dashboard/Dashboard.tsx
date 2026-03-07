import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { createApiKey, listApiKeys, updateApiKey, type ApiKey } from "@/services/keys.service";
import { getApiErrorMessage } from "@/services/config";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { ApiKeyItem } from "./ApiKeyItem";
import { LogOutIcon, PlusIcon, UserIcon, TerminalIcon, TableIcon, RefreshCwIcon, FilterIcon } from "lucide-react";

type StatusFilterType = "all" | "active" | "inactive";

export const Dashboard: React.FC = () => {
  const { user } = useFirebaseAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");

  const fetchApiKeys = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await listApiKeys(statusFilter === "all" ? undefined : statusFilter);
      if (data?.ok) {
        setApiKeys(data.keys ?? []);
      } else {
        console.error("Failed to fetch keys:", data?.error);
      }
    } catch (error) {
      console.error("Error fetching API keys:", getApiErrorMessage(error, "Failed to fetch API keys"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, [user, statusFilter]);

  const generateApiKey = async () => {
    if (!user) return;
    try {
      const data = await createApiKey();
      if (data?.ok) {
        setApiKeys((prev) => (data.key ? [data.key, ...prev] : prev));
      } else {
        alert("Error generating API key: " + (data?.error ?? "Unknown error"));
      }
    } catch (error) {
      alert("Error generating API key: " + getApiErrorMessage(error, "Failed to generate API key"));
    }
  };

  const updateApiKeyStatus = async (apiKeyId: string, isActive: boolean) => {
    if (!user) return;

    try {
      const data = await updateApiKey(apiKeyId, isActive);
      if (data?.ok) {
        setApiKeys((prev) => prev.map((k) => (k._id === apiKeyId && data.key ? data.key : k)));
      } else {
        alert("Error updating API key status: " + (data?.error ?? "Unknown error"));
      }
    } catch (error) {
      alert("Error updating API key status: " + getApiErrorMessage(error, "Failed to update API key"));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("apiToken");
      localStorage.removeItem("token");
      window.location.href = "/signin";
    } catch (error: any) {
      alert("Error logging out: " + error.message);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <UserIcon className="h-6 w-6" />
              User Profile
            </CardTitle>
            <CardDescription>
              Logged in as: <span className="font-medium text-foreground">{user?.email}</span>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = "/docs"} className="flex items-center gap-2">
                <TerminalIcon className="h-4 w-4" />
                API Docs
            </Button>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                <LogOutIcon className="h-4 w-4" />
                Logout
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground whitespace-nowrap">Your API Keys</h2>
          <div className="flex items-center gap-2">
            <FilterIcon className="h-4 w-4 text-muted-foreground" />
            <select
              className="h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
            >
              <option value="all">All Keys</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={fetchApiKeys} disabled={loading} className="flex items-center gap-2">
                <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/prompts"} className="flex items-center gap-2">
                <TableIcon className="h-4 w-4" />
                View Prompts
            </Button>
            <Button onClick={generateApiKey} className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Generate New Key
            </Button>
        </div>
      </div>

      <div className="space-y-4">
        {loading && apiKeys.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Loading API keys...</div>
        ) : apiKeys.length > 0 ? (
          apiKeys.map((key) => (
            <ApiKeyItem 
              key={key._id} 
              apiKey={{ id: key._id, key: key.key, createdAt: key.createdAt, isActive: key.isActive }} 
              onUpdateStatus={updateApiKeyStatus}
            />
          ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
            {statusFilter === "all" 
              ? "No API keys found. Generate one to get started!"
              : `No ${statusFilter} API keys found.`}
          </div>
        )}
      </div>
    </div>
  );
};
