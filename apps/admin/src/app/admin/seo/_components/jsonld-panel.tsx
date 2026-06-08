"use client";

import * as React from "react";
import { Loader2, Search, CheckCircle2, AlertCircle, Info, Code2 } from "lucide-react";
import { useToast } from "../../products/_components/use-toast";

interface SchemaResult {
  index: number;
  type: string;
  hasContext: boolean;
  hasErrors: boolean;
  errors: string[];
  preview: string;
}

interface ValidateResult {
  url: string;
  status: number;
  schemaCount: number;
  schemas: SchemaResult[];
  hasErrors: boolean;
}

const HOMEPAGE_SCHEMAS = [
  {
    "@type": "Organization",
    context: true,
    fields: ["name", "url", "logo", "sameAs", "description"],
  },
  {
    "@type": "WebSite",
    context: true,
    fields: ["name", "url", "description", "potentialAction"],
  },
  {
    "@type": "WebPage",
    context: true,
    fields: ["name", "description", "url", "breadcrumb"],
  },
];

export function JsonLdPanel() {
  const { addToast } = useToast();
  const [testUrl, setTestUrl] = React.useState("https://alayainsider.com/");
  const [result, setResult] = React.useState<ValidateResult | null>(null);
  const [testing, setTesting] = React.useState(false);

  async function handleTest(e: React.FormEvent) {
    e.preventDefault();
    if (!testUrl.trim()) return;

    setTesting(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/seo/validate-jsonld", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: testUrl.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        addToast({ title: "Error", description: err.error || "Validation failed", variant: "error" });
        return;
      }

      const data = await res.json();
      setResult(data);
    } catch {
      addToast({ title: "Error", description: "Could not validate URL", variant: "error" });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-obsidian p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <Code2 className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-medium">JSON-LD Structured Data</h2>
          <p className="text-xs text-muted font-body">Validate structured data on any page</p>
        </div>
      </div>

      {/* Homepage Schemas Reference */}
      <div className="rounded-lg bg-onyx p-4 mb-6">
        <h3 className="text-xs font-ui font-semibold text-muted uppercase tracking-wider mb-3">
          Homepage Schemas (Reference)
        </h3>
        <div className="space-y-2">
          {HOMEPAGE_SCHEMAS.map((schema) => (
            <div key={schema["@type"]} className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-ui font-medium text-softWhite">{schema["@type"]}</span>
                <span className="text-[10px] text-muted font-body ml-2">
                  {schema.fields.join(", ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* URL Tester */}
      <form onSubmit={handleTest} className="mb-6">
        <label className="block text-sm font-ui font-medium text-softWhite mb-2">
          Test a URL for structured data
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="https://alayainsider.com/product/slug"
            className="flex-1 h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
          />
          <button
            type="submit"
            disabled={testing || !testUrl.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-obsidian text-sm font-ui font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {testing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Testing...</>
            ) : (
              <><Search className="h-4 w-4" /> Validate</>
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted font-body">
              Found <strong className="text-softWhite">{result.schemaCount}</strong> schema{result.schemaCount === 1 ? "" : "s"}
            </p>
            {result.hasErrors ? (
              <span className="inline-flex items-center gap-1 text-xs font-ui text-coral">
                <AlertCircle className="h-3.5 w-3.5" />
                Errors found
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-ui text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                All valid
              </span>
            )}
          </div>

          {result.schemas.length === 0 ? (
            <div className="rounded-lg bg-onyx p-6 text-center">
              <Info className="h-8 w-8 mx-auto text-muted/30 mb-2" />
              <p className="text-sm text-muted font-body">
                No JSON-LD structured data found on this page.
              </p>
            </div>
          ) : (
            result.schemas.map((schema) => (
              <div
                key={schema.index}
                className={`rounded-lg border p-3 ${
                  schema.hasErrors
                    ? "border-coral/20 bg-coral/5"
                    : "border-emerald-500/20 bg-emerald-500/5"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-ui font-semibold text-softWhite">
                    {schema.type}
                  </span>
                  {schema.hasErrors ? (
                    <span className="text-[10px] font-ui text-coral">Has issues</span>
                  ) : (
                    <span className="text-[10px] font-ui text-emerald-400">Valid</span>
                  )}
                </div>
                <p className="text-xs text-muted font-body truncate">{schema.preview}</p>
                {schema.errors.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {schema.errors.map((err, i) => (
                      <li key={i} className="text-[10px] text-coral font-body flex items-start gap-1">
                        <span>&bull;</span>
                        {err}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
