import React, { useEffect, useState, useMemo } from "react";
import moment from "moment";
import * as XLSX from "xlsx";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { deletePromptById, listPrompts, type Prompt } from "@/services/prompts.service";
import { getApiErrorMessage } from "@/services/config";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeftIcon, ExternalLinkIcon, RefreshCwIcon, FilterIcon, XIcon, Trash2Icon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon, Settings2Icon, CheckIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

type DateRangeType = "all" | "1D" | "7D" | "custom";

const EXPORT_COLUMNS = [
  { id: "createdAt", label: "Created At" },
  { id: "prompt", label: "Prompt" },
  { id: "source", label: "Source" },
  { id: "tokenType", label: "Token Type" },
  { id: "tokenId", label: "Token ID" },
  { id: "meta", label: "Meta" },
];

export const PromptsTable: React.FC = () => {
  const { user } = useFirebaseAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter states
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [tokenFilter, setTokenFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRangeType>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // Export states
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(["createdAt", "prompt"]);

  const toggleColumn = (columnId: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

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
        toast.success("Prompt deleted successfully");
      } else {
        toast.error(data.error || "Failed to delete prompt");
      }
    } catch (err) {
      toast.error("Error: " + getApiErrorMessage(err, "Failed to delete prompt"));
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
    const filtered = prompts.filter(p => {
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

    // Reset pagination when filter changes
    setCurrentPage(1);
    return filtered;
  }, [prompts, sourceFilter, tokenFilter, dateRange, customStartDate, customEndDate]);

  // Paginated prompts
  const paginatedPrompts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPrompts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPrompts, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredPrompts.length / itemsPerPage));

  const resetFilters = () => {
    setSourceFilter("all");
    setTokenFilter("all");
    setDateRange("all");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  const exportToExcel = () => {
    if (filteredPrompts.length === 0) {
      toast.error("No data to export");
      return;
    }

    if (selectedColumns.length === 0) {
      toast.error("Please select at least one column to export");
      return;
    }

    const exportData = filteredPrompts.map(p => {
      const row: any = {};
      if (selectedColumns.includes("createdAt")) {
        row["Created At"] = moment(p.createdAt).format("YYYY-MM-DD HH:mm:ss");
      }
      if (selectedColumns.includes("prompt")) {
        row["Prompt"] = p.prompt;
      }
      if (selectedColumns.includes("source")) {
        row["Source"] = p.source || "N/A";
      }
      if (selectedColumns.includes("tokenType")) {
        row["Token Type"] = p.tokenId === 'session' ? 'Session' : 'API Key';
      }
      if (selectedColumns.includes("tokenId")) {
        row["Token ID"] = p.tokenId || "N/A";
      }
      if (selectedColumns.includes("meta")) {
        row["Meta"] = p.meta ? JSON.stringify(p.meta) : "N/A";
      }
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Prompts");

    // Generate filename with timestamp
    const timestamp = moment().format("YYYY-MM-DD_HHmm");
    XLSX.writeFile(workbook, `prompts_export_${timestamp}.xlsx`);
    setIsExportDialogOpen(false);
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

      <div className="flex justify-end mb-4 gap-2">
        <AlertDialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExportDialogOpen(true)}
            disabled={loading || filteredPrompts.length === 0}
            className="h-8 text-xs flex items-center gap-2"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            Export Table Data
          </Button>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Export Columns</AlertDialogTitle>
              <AlertDialogDescription>
                Select which columns you want to include in the Excel file.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid grid-cols-2 gap-2 py-4">
              {EXPORT_COLUMNS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => toggleColumn(col.id)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-all text-left",
                    selectedColumns.includes(col.id)
                      ? "bg-primary/5 border-primary text-primary font-medium"
                      : "bg-background border-input text-muted-foreground hover:bg-muted"
                  )}
                >
                  {col.label}
                  {selectedColumns.includes(col.id) && (
                    <CheckIcon className="h-3 w-3" />
                  )}
                </button>
              ))}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={exportToExcel} disabled={selectedColumns.length === 0}>
                Download .xlsx
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>History</CardTitle>
            <CardDescription>
              {filteredPrompts.length} of {prompts.length} prompts shown
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading prompts...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : paginatedPrompts.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-hidden border rounded-lg">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3 font-semibold border-r">Created At</th>
                      <th className="px-4 py-3 font-semibold border-r">Prompt</th>
                      <th className="px-4 py-3 font-semibold border-r">Source</th>
                      <th className="px-4 py-3 font-semibold border-r">Token Auth</th>
                      <th className="px-4 py-3 font-semibold border-r">Meta</th>
                      <th className="px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedPrompts.map((p) => (
                      <tr key={p._id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-4 py-4 whitespace-nowrap text-muted-foreground text-xs font-mono border-r">
                          {moment(p.createdAt).fromNow()}
                        </td>
                        <td className="px-4 py-4 font-medium max-w-md border-r">
                          <div className="line-clamp-2" title={p.prompt}>
                            {p.prompt}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground border-r">
                          {p.source || "N/A"}
                        </td>
                        <td className="px-4 py-4 border-r">
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${p.tokenId === 'session' ? 'bg-blue-100/50 text-blue-700 border-blue-200' : 'bg-green-100/50 text-green-700 border-green-200'}`}>
                            {p.tokenId === 'session' ? 'Session' : `Key: ${p.tokenId?.replace('key_', '').slice(0, 8)}`}
                          </span>
                        </td>
                        <td className="px-4 py-4 border-r">
                          {p.meta ? (
                            <div className="flex gap-1 flex-wrap">
                              {Object.entries(p.meta).map(([k, v]) => (
                                <span key={k} className="px-1.5 py-0.5 bg-secondary text-[10px] rounded border">
                                  {k}: {String(v)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => deletePrompt(p._id)}
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-xs text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPrompts.length)} of {filteredPrompts.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <div className="text-xs font-medium px-2">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
