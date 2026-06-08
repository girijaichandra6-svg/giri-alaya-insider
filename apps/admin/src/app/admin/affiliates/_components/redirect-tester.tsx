"use client";

import * as React from "react";
import { ExternalLink, Loader2, Search, CheckCircle2, AlertCircle, Link2 } from "lucide-react";
import { useToast } from "../../products/_components/use-toast";

interface TestResult {
  link: {
    id: string;
    url: string;
    cloakedUrl: string | null;
    resolvedUrl: string;
    isActive: boolean;
    priority: number;
  };
  product: { title: string; slug: string };
  retailer: { name: string; website: string };
  network: { name: string; identifier: string };
}

export function RedirectTester() {
  const { addToast } = useToast();
  const [input, setInput] = React.useState("");
  const [result, setResult] = React.useState<TestResult | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleTest(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      // Determine whether input is a linkId or a path
      const isLinkId = input.includes("-") && !input.includes("/");
      const body = isLinkId
        ? { linkId: input.trim() }
        : { path: input.trim().replace("/go/", "") };

      const res = await fetch("/api/admin/affiliates/test-redirect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        addToast({ title: "Error", description: err.error || "Lookup failed", variant: "error" });
        return;
      }

      const data = await res.json();
      setResult(data);
    } catch {
      addToast({ title: "Error", description: "Could not test redirect", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-obsidian p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <Link2 className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-medium">Redirect Tester</h2>
          <p className="text-xs text-muted font-body">Test /go/ link resolution</p>
        </div>
      </div>

      <form onSubmit={handleTest} className="mb-5">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Link ID or /go/path (e.g., aff_ninja-air-fryer or /go/dyson-v15)"
            className="flex-1 h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors font-mono text-xs"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-obsidian text-sm font-ui font-semibold hover:opacity-90 transition-all disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Testing...</>
            ) : (
              <><Search className="h-4 w-4" /> Test</>
            )}
          </button>
        </div>
      </form>

      {result && (
        <div className="space-y-3">
          {/* Status */}
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
            result.link.isActive
              ? "bg-emerald-500/10 border border-emerald-500/20"
              : "bg-coral/10 border border-coral/20"
          }`}>
            {result.link.isActive
              ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              : <AlertCircle className="h-4 w-4 text-coral shrink-0" />
            }
            <span className={`text-sm font-ui font-medium ${
              result.link.isActive ? "text-emerald-400" : "text-coral"
            }`}>
              {result.link.isActive ? "Active" : "Inactive"}
            </span>
            <span className="text-xs text-muted font-body ml-auto">
              Priority: {result.link.priority}
            </span>
          </div>

          {/* Product Info */}
          <div className="rounded-lg bg-onyx p-3">
            <p className="text-xs text-muted font-ui uppercase tracking-wider mb-1">Product</p>
            <p className="text-sm font-medium text-softWhite font-body">{result.product.title}</p>
            <p className="text-xs text-muted font-body font-mono">/{result.product.slug}</p>
          </div>

          {/* Retailer & Network */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-onyx p-3">
              <p className="text-xs text-muted font-ui uppercase tracking-wider mb-1">Retailer</p>
              <p className="text-sm font-medium text-softWhite font-body">{result.retailer.name}</p>
              <a
                href={result.retailer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent font-body hover:underline inline-flex items-center gap-1 mt-0.5"
              >
                {result.retailer.website} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="rounded-lg bg-onyx p-3">
              <p className="text-xs text-muted font-ui uppercase tracking-wider mb-1">Network</p>
              <p className="text-sm font-medium text-softWhite font-body">{result.network.name}</p>
              <p className="text-xs text-muted font-body font-mono mt-0.5">{result.network.identifier}</p>
            </div>
          </div>

          {/* URL Chain */}
          <div className="rounded-lg bg-onyx p-4">
            <p className="text-xs text-muted font-ui uppercase tracking-wider mb-2">Resolved URL</p>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-muted font-body">Original URL</p>
                <p className="text-xs text-softWhite font-body font-mono break-all">{result.link.url}</p>
              </div>
              {result.link.cloakedUrl && (
                <div>
                  <p className="text-[10px] text-muted font-body">Cloaked URL</p>
                  <p className="text-xs text-softWhite font-body font-mono break-all">{result.link.cloakedUrl}</p>
                </div>
              )}
              <div className="border-t border-white/5 pt-2">
                <p className="text-[10px] text-muted font-body">Resolves to</p>
                <a
                  href={result.link.resolvedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent font-body font-mono break-all hover:underline inline-flex items-center gap-1"
                >
                  {result.link.resolvedUrl} <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
