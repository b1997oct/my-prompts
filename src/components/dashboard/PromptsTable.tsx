import React, { useEffect, useState, useMemo } from "react";
import moment  from "moment";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { deletePromptById, listPrompts, type Prompt } from "@/services/prompts.service";
import { getApiErrorMessage } from "@/services/config";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { ArrowLeftIcon, ExternalLinkIcon, RefreshCwIcon, FilterIcon, XIcon, Trash2Icon } from "lucide-react";

type DateRangeType = "all" | "1D" | "7D" | "custom";

export const PromptsTable: React.FC = () => {
  const { user } = useFirebaseAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [tokenFilter, setTokenFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRangeType>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  const fetchPrompts = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const data = await listPrompts();
      if (data.ok) {
        setPrompts(data.prompts ?? []);
      } else {
        setError(data.error || "Failed to fetch prompts");
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to fetch prompts"));
    } finally {
      setLoading(false);
    }
  };

  const deletePrompt = async (id: string) => {
    if (!user || !confirm("Are you sure you want to delete this prompt?")) return;

    try {
      const data = await deletePromptById(id);
      if (data.ok) {
        setPrompts(prev => prev.filter(p => p._id !== id));
      } else {
        alert(data.error || "Failed to delete prompt");
      }
    } catch (err) {
      alert("Error: " + getApiErrorMessage(err, "Failed to delete prompt"));
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, [user]);

  // Derived options for source filter
  const sourceOptions = useMemo(() => {
    const sources = new Set<string>();
    prompts.forEach(p => {
      if (p.source) sources.add(p.source);
    });
    return Array.from(sources).sort();
  }, [prompts]);

  // Derived options for token filter
  const tokenOptions = useMemo(() => {
    const tokens = new Set<string>();
    prompts.forEach(p => {
      if (p.tokenId) tokens.add(p.tokenId);
    });
    return Array.from(tokens).sort();
  }, [prompts]);

  // Filtered prompts
  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      // Source filter
      if (sourceFilter !== "all" && p.source !== sourceFilter) {
        return false;
      }

      // Token filter
      if (tokenFilter !== "all" && p.tokenId !== tokenFilter) {
        return false;
      }

      // Date filter
      if (dateRange === "all") return true;

      const promptDate = new Date(p.createdAt).getTime();
      const now = new Date().getTime();

      if (dateRange === "1D") {
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        return promptDate >= oneDayAgo;
      }

      if (dateRange === "7D") {
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        return promptDate >= sevenDaysAgo;
      }

      if (dateRange === "custom") {
        if (customStartDate) {
          const start = new Date(customStartDate).getTime();
          if (promptDate < start) return false;
        }
        if (customEndDate) {
          // Set to end of day for the end date
          const end = new Date(customEndDate).setHours(23, 59, 59, 999);
          if (promptDate > end) return false;
        }
      }

      return true;
    });
  }, [prompts, sourceFilter, tokenFilter, dateRange, customStartDate, customEndDate]);

  const resetFilters = () => {
    setSourceFilter("all");
    setTokenFilter("all");
    setDateRange("all");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => window.location.href = "/dashboard"} size="icon">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Recorded Prompts</h1>
        </div>
        <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => window.location.href = "/docs"} className="flex items-center gap-2">
                <ExternalLinkIcon className="h-4 w-4" />
                API Docs
            </Button>
            <Button variant="outline" size="sm" onClick={fetchPrompts} disabled={loading} className="flex items-center gap-2">
                <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
            </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            {/* Source Filter */}
            <div className="space-y-2">
              <Label htmlFor="source-filter">Filter by Source</Label>
              <select
                id="source-filter"
                className="w-full h-8 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="all">All Sources</option>
                {sourceOptions.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            {/* Token Filter */}
            <div className="space-y-2">
              <Label htmlFor="token-filter">Filter by Token</Label>
              <select
                id="token-filter"
                className="w-full h-8 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={tokenFilter}
                onChange={(e) => setTokenFilter(e.target.value)}
              >
                <option value="all">All Tokens</option>
                {tokenOptions.map(token => (
                  <option key={token} value={token}>
                    {token === "session" ? "Browser Session" : `Key: ${token.replace('key_', '').slice(0, 8)}...`}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Presets */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex gap-1 p-1 bg-muted rounded-lg h-8 items-center">
                {(["all", "1D", "7D", "custom"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={cn(
                      "flex-1 text-xs font-medium py-1 px-2 rounded-md transition-all",
                      dateRange === range
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-background/50"
                    )}
                  >
                    {range.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            {dateRange === "custom" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
                className="text-muted-foreground h-8"
              >
                <XIcon className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>History</CardTitle>
            <CardDescription>
              {filteredPrompts.length} of {prompts.length} prompts shown
            </CardDescription>
          </div>
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading prompts...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : filteredPrompts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3">Created At</th>
                    <th className="px-4 py-3">Prompt</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Token Auth</th>
                    <th className="px-4 py-3">Meta</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPrompts.map((p) => (
                    <tr key={p._id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs font-mono">
                        {moment(p.createdAt).fromNow()}
                      </td>
                      <td className="px-4 py-3 font-medium max-w-md truncate" title={p.prompt}>
                        {p.prompt}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.source || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${p.tokenId === 'session' ? 'bg-blue-100/50 text-blue-700 border-blue-200' : 'bg-green-100/50 text-green-700 border-green-200'}`}>
                          {p.tokenId === 'session' ? 'Session' : `Key: ${p.tokenId?.replace('key_', '').slice(0, 8)}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.meta ? (
                          <div className="flex gap-1 flex-wrap">
                            {Object.entries(p.meta).map(([k, v]) => (
                              <span key={k} className="px-1.5 py-0.5 bg-secondary text-[10px] rounded border">
                                {k}: {String(v)}
                              </span>
                            ))}
                          </div>
                        ) : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deletePrompt(p._id)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
              No prompts match your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
