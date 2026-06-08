"use client";

import * as React from "react";
import { RefreshCcw, Loader2, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "../../products/_components/use-toast";

interface SitemapStats {
  urlsInSitemap: number;
  activeProducts: number;
  publishedPosts: number;
  categories: number;
  publicCollections: number;
}

export function SitemapPanel() {
  const { addToast } = useToast();
  const [content, setContent] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState<SitemapStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [regenerating, setRegenerating] = React.useState(false);
  const [showRaw, setShowRaw] = React.useState(false);

  const fetchSitemap = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo/sitemap");
      if (res.ok) {
        const data = await res.json();
        setContent(data.content);
        setStats(data.stats);
      }
    } catch {
      addToast({ title: "Error", description: "Failed to load sitemap", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  React.useEffect(() => {
    fetchSitemap();
  }, [fetchSitemap]);

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const res = await fetch("/api/admin/seo/sitemap/regenerate", { method: "POST" });
      if (!res.ok) throw new Error("Failed to regenerate");

      const data = await res.json();
      addToast({ title: data.message || "Sitemap regenerated", variant: "success" });
      await fetchSitemap();
    } catch {
      addToast({ title: "Error", description: "Could not regenerate sitemap", variant: "error" });
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-obsidian p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-medium">Sitemap</h2>
            <p className="text-xs text-muted font-body">sitemap.xml</p>
          </div>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-obsidian text-sm font-ui font-semibold hover:opacity-90 transition-all disabled:opacity-50"
        >
          {regenerating ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Regenerating...</>
          ) : (
            <><RefreshCcw className="h-4 w-4" /> Regenerate</>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
        </div>
      ) : stats ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="rounded-lg bg-onyx p-3 text-center">
              <p className="text-2xl font-ui font-bold text-accent">{stats.urlsInSitemap}</p>
              <p className="text-[10px] text-muted font-ui mt-0.5">URLs in Sitemap</p>
            </div>
            <div className="rounded-lg bg-onyx p-3 text-center">
              <p className="text-2xl font-ui font-bold text-softWhite">{stats.activeProducts}</p>
              <p className="text-[10px] text-muted font-ui mt-0.5">Active Products</p>
            </div>
            <div className="rounded-lg bg-onyx p-3 text-center">
              <p className="text-2xl font-ui font-bold text-softWhite">{stats.publishedPosts}</p>
              <p className="text-[10px] text-muted font-ui mt-0.5">Published Posts</p>
            </div>
            <div className="rounded-lg bg-onyx p-3 text-center">
              <p className="text-2xl font-ui font-bold text-softWhite">{stats.categories}</p>
              <p className="text-[10px] text-muted font-ui mt-0.5">Categories</p>
            </div>
            <div className="rounded-lg bg-onyx p-3 text-center">
              <p className="text-2xl font-ui font-bold text-softWhite">{stats.publicCollections}</p>
              <p className="text-[10px] text-muted font-ui mt-0.5">Collections</p>
            </div>
          </div>

          {/* Coverage indicator */}
          {stats.urlsInSitemap < stats.activeProducts + stats.publishedPosts + stats.categories + stats.publicCollections + 12 ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-400 font-body">
                Sitemap may be outdated. Regenerate to include all current content.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-400 font-body">
                Sitemap is up to date.
              </p>
            </div>
          )}

          {/* Toggle raw view */}
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="text-xs font-ui text-muted hover:text-accent transition-colors mb-2"
          >
            {showRaw ? "Hide raw XML" : "Show raw XML"}
          </button>

          {showRaw && content && (
            <pre className="rounded-lg bg-onyx p-4 overflow-x-auto text-[11px] leading-relaxed text-muted font-mono max-h-96 overflow-y-auto">
              {content}
            </pre>
          )}
        </>
      ) : (
        <p className="text-sm text-muted font-body py-8 text-center">Could not load sitemap data.</p>
      )}
    </div>
  );
}
