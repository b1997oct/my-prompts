import React, { useState } from "react";
import { CopyIcon, EyeIcon, EyeOffIcon, PowerIcon, PowerOffIcon, ChevronDownIcon, ChevronUpIcon, TerminalIcon, FileCodeIcon, SparklesIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";

interface ApiKey {
  id: string;
  key: string;
  createdAt: string;
  isActive: boolean;
}

interface ApiKeyItemProps {
  apiKey: ApiKey;
  onUpdateStatus: (id: string, isActive: boolean) => void;
}

export const ApiKeyItem: React.FC<ApiKeyItemProps> = ({ apiKey, onUpdateStatus }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"rule" | "antigravity" | "setup">("rule");

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const ruleFileContent = `---
alwaysApply: true
---
# Prompt history

Record prompt: POST to \`${origin}/api/promt\` with header \`Authorization: Bearer ${apiKey.key}\` and body \`{"prompt": "...", "source": "...", "prompt_method": "..." }\` (source: e.g. "cursor", or "tool name"). Optionally, \`prompt_method\`: "agent" | "plan" | "ask" | "debug".`;

  const antigravityRuleContent = `# Prompt history

To record prompts to the user's history, make a POST request to \`${origin}/api/promt\` with:
- Header: \`Authorization: Bearer ${apiKey.key}\`
- Body (JSON): \`{"prompt": "...", "source": "antigravity", "prompt_method": "..."}\`

Use this when completing significant interactions or when the user asks to log a prompt. Optionally set \`prompt_method\` to one of: "agent" | "plan" | "ask" | "debug".`;

  const copyToClipboard = (text: string, message: string = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text);
    alert(message);
  };

  const handleToggleStatus = async () => {
    setIsUpdating(true);
    await onUpdateStatus(apiKey.id, !apiKey.isActive);
    setIsUpdating(false);
  };

  const curlCommand = `curl -X POST ${window.location.origin}/api/promt \\
  -H "Authorization: Bearer ${apiKey.key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Hello, this is a test prompt",
    "source": "curl-test"
  }'`;

  return (
    <div className="flex flex-col border rounded-lg bg-card overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">
              {isVisible ? apiKey.key : "••••••••••••••••••••••••••••••••"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(!isVisible)}
              title={isVisible ? "Hide API Key" : "Show API Key"}
            >
              {isVisible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(apiKey.key, "API key copied to clipboard!")}
              title="Copy API Key"
            >
              <CopyIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Created on: {new Date(apiKey.createdAt).toLocaleString()}</span>
            {apiKey.isActive ? (
              <Badge variant="default" className="text-[10px] bg-green-500 hover:bg-green-600 h-4 cursor-default">Active</Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] h-4 cursor-default">Inactive</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            {isExpanded ? "Hide Setup" : "Show Setup"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleStatus}
            disabled={isUpdating}
            title={apiKey.isActive ? "Deactivate Key" : "Activate Key"}
            className={apiKey.isActive ? "text-orange-500" : "text-green-500"}
          >
            {apiKey.isActive ? <PowerOffIcon className="h-4 w-4" /> : <PowerIcon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t bg-muted/30 p-4">
          <div className="flex gap-1 border-b mb-4">
            <button
              type="button"
              onClick={() => setActiveTab("rule")}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t-md transition-colors ${
                activeTab === "rule" ? "bg-background border border-b-0 border-muted -mb-px" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileCodeIcon className="h-3 w-3" />
              Cursor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("antigravity")}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t-md transition-colors ${
                activeTab === "antigravity" ? "bg-background border border-b-0 border-muted -mb-px" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <SparklesIcon className="h-3 w-3" />
              Antigravity
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("setup")}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t-md transition-colors ${
                activeTab === "setup" ? "bg-background border border-b-0 border-muted -mb-px" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TerminalIcon className="h-3 w-3" />
              Quick Setup
            </button>
          </div>

          {activeTab === "rule" && (
            <div className="space-y-3">
              <p className="text-[11px] text-muted-foreground">
                Create this file in your project at <code className="bg-muted px-1 rounded font-mono text-[10px]">.cursor/rules/my-prompts.mdc</code> for prompt recording to work. Copy the content below into that file.
              </p>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px]"
                  onClick={() => copyToClipboard(ruleFileContent, "Rule file content copied!")}
                >
                  <CopyIcon className="h-3 w-3 mr-1" />
                  Copy file content
                </Button>
              </div>
              <pre className="p-3 bg-slate-950 text-slate-50 rounded-md text-[11px] font-mono overflow-x-auto border whitespace-pre-wrap">
                {ruleFileContent}
              </pre>
            </div>
          )}

          {activeTab === "antigravity" && (
            <div className="space-y-3">
              <p className="text-[11px] text-muted-foreground">
                Create this file in your project at <code className="bg-muted px-1 rounded font-mono text-[10px]">.gemini/GEMINI.md</code> for Antigravity to record prompts. Add the content below to that file (or create it if it doesn&apos;t exist).
              </p>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px]"
                  onClick={() => copyToClipboard(antigravityRuleContent, "Antigravity rule content copied!")}
                >
                  <CopyIcon className="h-3 w-3 mr-1" />
                  Copy file content
                </Button>
              </div>
              <pre className="p-3 bg-slate-950 text-slate-50 rounded-md text-[11px] font-mono overflow-x-auto border whitespace-pre-wrap">
                {antigravityRuleContent}
              </pre>
            </div>
          )}

          {activeTab === "setup" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-2">
                    <TerminalIcon className="h-3 w-3" />
                    Quick Setup (cURL)
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px]"
                    onClick={() => copyToClipboard(curlCommand, "cURL command copied!")}
                  >
                    <CopyIcon className="h-3 w-3 mr-1" />
                    Copy Command
                  </Button>
                </div>
                <pre className="p-3 bg-slate-950 text-slate-50 rounded-md text-[11px] font-mono overflow-x-auto border">
                  {curlCommand}
                </pre>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Cursor / VSCode Context</Label>
                <p className="text-[11px] text-muted-foreground">
                  You can copy the following into your instructions or chat to let an AI agent know how to record prompts to your history.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs font-medium justify-between hover:bg-secondary/80"
                  onClick={() => {
                    const context = `To record prompts to my history, make a POST request to ${window.location.origin}/api/promt with the header "Authorization: Bearer ${apiKey.key}" and a JSON body containing {"prompt": "...", "source": "..."}.`;
                    copyToClipboard(context, "Context instructions copied!");
                  }}
                >
                  <span className="flex items-center gap-2">
                    <CopyIcon className="h-3 w-3" />
                    Copy AI Context Instructions
                  </span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
