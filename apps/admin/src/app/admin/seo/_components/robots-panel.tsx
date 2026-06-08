"use client";

import * as React from "react";
import { Loader2, Save, Shield, AlertCircle } from "lucide-react";
import { useToast } from "../../products/_components/use-toast";

export function RobotsPanel() {
  const { addToast } = useToast();
  const [content, setContent] = React.useState<string>("");
  const [originalContent, setOriginalContent] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchRobots() {
      try {
        const res = await fetch("/api/admin/seo/robots");
        if (res.ok) {
          const data = await res.json();
          setContent(data.content);
          setOriginalContent(data.content);
        }
      } catch {
        addToast({ title: "Error", description: "Failed to load robots.txt", variant: "error" });
      } finally {
        setLoading(false);
      }
    }
    fetchRobots();
  }, [addToast]);

  function validateContent(text: string): string | null {
    if (!text.includes("User-agent")) {
      return "Must include at least one User-agent directive";
    }
    // Check for common mistakes
    if (text.includes("User-agent: *") && text.includes("Disallow: /") && !text.includes("Sitemap")) {
      return "Warning: Blocking all crawling but no sitemap URL is specified";
    }
    return null;
  }

  function handleContentChange(newContent: string) {
    setContent(newContent);
    setValidationError(validateContent(newContent));
  }

  async function handleSave() {
    if (validationError && !validationError.startsWith("Warning")) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/seo/robots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Failed to save");

      addToast({ title: "robots.txt saved", variant: "success" });
      setOriginalContent(content);
    } catch {
      addToast({ title: "Error", description: "Could not save robots.txt", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  const isUnsaved = content !== originalContent;

  return (
    <div className="rounded-xl border border-white/10 bg-obsidian p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-medium">robots.txt</h2>
            <p className="text-xs text-muted font-body">Controls search engine crawling behavior</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !isUnsaved || (!!validationError && !validationError.startsWith("Warning"))}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-ui font-semibold transition-all disabled:opacity-50 ${
            isUnsaved
              ? "bg-accent text-obsidian hover:opacity-90"
              : "bg-white/5 text-muted cursor-not-allowed"
          }`}
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="h-4 w-4" /> {isUnsaved ? "Save Changes" : "Saved"}</>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
        </div>
      ) : (
        <>
          {/* Validation errors */}
          {validationError && (
            <div className={`flex items-start gap-2 px-4 py-3 rounded-lg mb-4 ${
              validationError.startsWith("Warning")
                ? "bg-amber-500/10 border border-amber-500/20"
                : "bg-coral/10 border border-coral/20"
            }`}>
              <AlertCircle className={`h-4 w-4 shrink-0 mt-0.5 ${
                validationError.startsWith("Warning") ? "text-amber-400" : "text-coral"
              }`} />
              <p className={`text-xs font-body ${
                validationError.startsWith("Warning") ? "text-amber-400" : "text-coral"
              }`}>
                {validationError}
              </p>
            </div>
          )}

          {/* Unsaved indicator */}
          {isUnsaved && (
            <p className="text-xs text-amber-400 font-body mb-3">
              You have unsaved changes
            </p>
          )}

          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-64 rounded-lg border border-white/10 bg-onyx p-4 text-sm text-softWhite font-mono leading-relaxed focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-none"
            spellCheck={false}
          />
        </>
      )}
    </div>
  );
}
