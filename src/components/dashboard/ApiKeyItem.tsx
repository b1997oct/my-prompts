import React, { useState, useEffect } from "react";
import { CopyIcon, EyeIcon, EyeOffIcon, PowerIcon, PowerOffIcon, ChevronDownIcon, ChevronUpIcon, TerminalIcon, FileCodeIcon, SparklesIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import moment from "moment";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  key: string;
  createdAt: string;
  isActive: boolean;
}

interface ApiKeyItemProps {
  apiKey: ApiKey;
  onUpdateStatus: (id: string, isActive: boolean) => void;
  defaultExpanded?: boolean;
}

export const ApiKeyItem: React.FC<ApiKeyItemProps> = ({ apiKey, onUpdateStatus, defaultExpanded }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded ?? false);
  const [activeTab, setActiveTab] = useState<"rule" | "antigravity" | "setup" | "analytics">("rule");

  useEffect(() => {
    if (defaultExpanded) {
      setIsExpanded(true);
    }
  }, [defaultExpanded]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const ruleFileContent = `---
alwaysApply: true
---

You **must** log every user prompt before doing anything else.

## What to do every turn

run this \`curl\` command:

\`\`\`bash
curl -X POST "${origin}/api/promt" \\
  -H "Authorization: Bearer ${apiKey.key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "<full prompt text>",
    "source": "cursor",
    "prompt_method": "agent"
  }'
\`\`\``;

  const antigravityRuleContent = `
You **must** log every user prompt before doing anything else.

## What to do every turn

run this \`curl\` command:

\`\`\`bash
curl -X POST "${origin}/api/promt" \\
  -H "Authorization: Bearer ${apiKey.key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "<full prompt text>",
    "source": "antigravity",
    "prompt_method": "agent"
  }'
\`\`\``;

  const copyToClipboard = (text: string, message: string = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text);
    toast.success(message);
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
            <span>Created on: {moment(apiKey.createdAt).fromNow()}</span>
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
            onClick={() => {
              const url = `${origin}/prompt-samples?token=${apiKey.key}`;
              const prompt = `I am sharing a list of my recent AI prompts. Please analyze them and tell me how I'm doing. What are my strengths and weaknesses in prompt engineering? Where can I improve my communication style with AI to get better results? Are there any recurring patterns or mistakes I should be aware of?\n\nHere is the link to my prompt history:\n${url}`;
              copyToClipboard(prompt, "AI Analysis Prompt copied to clipboard!");

              if (isExpanded && activeTab === "analytics") {
                setIsExpanded(false);
              } else {
                setIsExpanded(true);
                setActiveTab("analytics");
              }
            }}
            className="flex items-center gap-2 text-primary hover:text-primary/80 hover:bg-primary/5"
            title="Copy AI Analysis Prompt"
          >
            <SparklesIcon className="h-4 w-4" />
            <span className="hidden sm:inline">AI Analytics</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            {isExpanded ? (activeTab === "analytics" ? "Hide Analytics" : "Hide Setup") : "Show Setup"}
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
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t-md transition-colors ${activeTab === "rule" ? "bg-background border border-b-0 border-muted -mb-px" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <FileCodeIcon className="h-3 w-3" />
              Cursor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("antigravity")}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t-md transition-colors ${activeTab === "antigravity" ? "bg-background border border-b-0 border-muted -mb-px" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <SparklesIcon className="h-3 w-3" />
              Antigravity
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("setup")}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t-md transition-colors ${activeTab === "setup" ? "bg-background border border-b-0 border-muted -mb-px" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <TerminalIcon className="h-3 w-3" />
              Quick Setup
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t-md transition-colors ${activeTab === "analytics" ? "bg-background border border-b-0 border-muted -mb-px" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <SparklesIcon className="h-3 w-3" />
              AI Analytics
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

          {activeTab === "analytics" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-2">
                    <SparklesIcon className="h-3 w-3" />
                    AI Evaluation Prompt
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px]"
                    onClick={() => {
                      const url = `${origin}/prompt-samples?token=${apiKey.key}`;
                      const prompt = `I am sharing a list of my recent AI prompts. Please analyze them and tell me how I'm doing. What are my strengths and weaknesses in prompt engineering? Where can I improve my communication style with AI to get better results? Are there any recurring patterns or mistakes I should be aware of?\n\nHere is the link to my prompt history:\n${url}`;
                      copyToClipboard(prompt, "Analysis prompt copied!");
                    }}
                  >
                    <CopyIcon className="h-3 w-3 mr-1" />
                    Copy Content
                  </Button>
                </div>
                <div className="p-3 bg-primary/5 border rounded-md text-[11px] leading-relaxed italic text-muted-foreground">
                  "I am sharing a list of my recent AI prompts. Please analyze them and tell me how I'm doing. What are my strengths and weaknesses in prompt engineering? Where can I improve my communication style with AI to get better results? Are there any recurring patterns or mistakes I should be aware of?
                  <br /><br />
                  Here is the link to my prompt history:<br />
                  <span className="font-mono text-[10px] text-primary">{origin}/prompt-samples?token={apiKey.key}</span>"
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  className="w-full text-xs gap-2 py-6 border-slate-200 hover:bg-slate-50"
                  onClick={() => window.open('https://gemini.google.com/app', '_blank')}
                >
                  <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304fe6292a20ca2a.svg" className="h-4 w-4" alt="Gemini" />
                  Analyze with Gemini
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-xs gap-2 py-6 border-slate-200 hover:bg-slate-50"
                  onClick={() => window.open('https://chatgpt.com', '_blank')}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5153-4.9066 6.0462 6.0462 0 0 0-3.9471-3.1202 6.0417 6.0417 0 0 0-6.1915 1.5432 6.0526 6.0526 0 0 0-4.6644-.0478 6.0417 6.0417 0 0 0-3.1246 3.9436 6.0502 6.0502 0 0 0-1.5544 6.1824 6.0502 6.0502 0 0 0 .5154 4.9066 6.0502 6.0502 0 0 0 3.9471 3.1202 6.0549 6.0549 0 0 0 6.1915-1.5433 6.0526 6.0526 0 0 0 4.6695.0478 6.0417 6.0417 0 0 0 3.1246-3.9436 6.0502 6.0502 0 0 0 1.5544-6.1824Zm-10.2819 11.433c-1.129 0-2.2274-.3165-3.1793-.913l.1158-.0661 2.3732-1.3546a.8252.8252 0 0 0 .4117-.7116v-3.3283l2.8464 1.6377a.066.066 0 0 1 .033.057v3.31a5.0315 5.0315 0 0 1-4.6008 1.3689Zm-7.9142-3.818a5.0118 5.0118 0 0 1-.5814-4.8143l.1197.0681 2.3732 1.3546a.8252.8252 0 0 0 .8235 0l2.8821-1.6575v3.2753a.066.066 0 0 1-.033.057l-2.8687 1.6515a5.0118 5.0118 0 0 1-2.7154.0642Zm-2.2816-9.6999a5.0315 5.0315 0 0 1 4.024-3.4453l-.004 1.1378v2.731a.8252.8252 0 0 0 .4118.7116l2.8821 1.6575-2.8464 1.6377a.066.066 0 0 1-.066 0l-2.8686-1.6515a5.0118 5.0118 0 0 1-1.533-3.0789Zm16.1011-.1449-.1158.0661-2.3732 1.3546a.8252.8252 0 0 0-.4117.7116v3.3283l-2.8464-1.6377a.066.066 0 0 1-.033-.057v-3.31a5.0315 5.0315 0 0 1 4.6008-1.3689Zm3.1793 4.2954a5.0118 5.0118 0 0 1 .5814 4.8143l-.1197-.0681-2.3732-1.3546a.8252.8252 0 0 0-.8235 0l-2.8821 1.6575v-3.2753a.066.066 0 0 1 .033-.057l2.8687-1.6515a5.0118 5.0118 0 0 1 2.7154-.0642Zm-3.2655 8.1652a5.0315 5.0315 0 0 1-4.024 3.4453l.004-1.1378v-2.731a.8252.8252 0 0 0-.4118-.7116l-2.8821-1.6575 2.8464-1.6377a.066.066 0 0 1 .066 0l2.8686 1.6515a5.0118 5.0118 0 0 1 1.533 3.0789ZM12 8.1258a3.875 3.875 0 1 0 0 7.75 3.875 3.875 0 0 0 0-7.75Z" /></svg>
                  Analyze with ChatGPT
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
