"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@alaya/ui";
import { Separator } from "@/components/ui/separator";
import { clientFetch } from "@/lib/api";
import type { SubcategoryData } from "@/lib/api";
import { categories } from "@alaya/config";
import { Search, X } from "lucide-react";

interface SearchFiltersProps {
  currentCategory?: string;
  currentSubcategory?: string;
  currentQuery: string;
  currentTab: string;
  onNavigate?: () => void;
}

export function SearchFilters({
  currentCategory,
  currentSubcategory,
  currentQuery,
  currentTab,
  onNavigate,
}: SearchFiltersProps) {
  const pathname = usePathname();
  const [subcategories, setSubcategories] = React.useState<SubcategoryData[]>([]);
  const [totalProductCount, setTotalProductCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  // Debounce the search query by 200ms
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset search when category changes
  React.useEffect(() => {
    setSearchQuery("");
    setDebouncedQuery("");
  }, [currentCategory]);

  // Fetch subcategories when a category is selected
  React.useEffect(() => {
    if (!currentCategory) {
      setSubcategories([]);
      setTotalProductCount(0);
      return;
    }
    setLoading(true);
    async function load() {
      try {
        const data = await clientFetch<{ subcategories: SubcategoryData[]; totalProductCount: number }>(
          `/subcategories?category=${currentCategory}`
        );
        setSubcategories(data.subcategories);
        setTotalProductCount(data.totalProductCount);
      } catch {
        setSubcategories([]);
        setTotalProductCount(0);
      } finally {
        setLoading(false);
    }
    }
    load();
  }, [currentCategory]);

  // Client-side filtering of subcategories
  const filteredSubcategories = React.useMemo(() => {
    if (!debouncedQuery) return subcategories;
    const q = debouncedQuery.toLowerCase();
    return subcategories.filter((sub) =>
      sub.name.toLowerCase().includes(q)
    );
  }, [subcategories, debouncedQuery]);

  function buildHref(params: Record<string, string | undefined>): string {
    const sp = new URLSearchParams();
    sp.set("q", currentQuery);
    if (params.category) sp.set("category", params.category);
    if (params.subcategory) sp.set("subcategory", params.subcategory);
    if (currentTab && currentTab !== "products") sp.set("tab", currentTab);
    const qs = sp.toString();
    return `${pathname}?${qs}`;
  }

  const hasActiveFilters = !!currentCategory || !!currentSubcategory;

  return (
    <div className="space-y-6">
      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-ui font-semibold uppercase tracking-wider text-muted">
              Active Filters
            </h4>
            <Link
              href={buildHref({ category: undefined, subcategory: undefined })}
              onClick={onNavigate}
              className="text-xs text-accent hover:underline font-ui"
            >
              Clear all
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentCategory && (
              <Link
                href={buildHref({ category: undefined, subcategory: undefined })}
                onClick={onNavigate}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-white/10 text-muted hover:text-softWhite hover:border-white/20 transition-colors"
              >
                {categories[currentCategory]?.name || currentCategory}
                <X className="h-3 w-3" />
              </Link>
            )}
            {currentSubcategory && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-accent/30 text-accent">
                {subcategories.find((s) => s.slug === currentSubcategory)?.name ||
                  currentSubcategory}
              </span>
            )}
          </div>
          <Separator className="mt-4" />
        </div>
      )}

      {/* Category */}
      <div>
        <h4 className="text-xs font-ui font-semibold uppercase tracking-wider text-muted mb-3">
          Category
        </h4>
        <div className="space-y-1">
          {Object.values(categories).map((cat) => (
            <Link
              key={cat.slug}
              href={buildHref({
                category: cat.slug === currentCategory ? undefined : cat.slug,
                subcategory: undefined,
              })}
              onClick={onNavigate}
              className={cn(
                "block w-full text-left px-3 py-2 rounded-lg text-sm font-body transition-colors",
                currentCategory === cat.slug
                  ? "text-softWhite"
                  : "text-muted hover:text-softWhite"
              )}
              style={
                currentCategory === cat.slug
                  ? { backgroundColor: `${cat.accentColor}15`, color: cat.accentColor }
                  : undefined
              }
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Subcategories (only when a category is selected) */}
      {currentCategory && (
        <>
          <Separator />
          <div>
            <h4 className="text-xs font-ui font-semibold uppercase tracking-wider text-muted mb-3">
              Subcategory
            </h4>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-9 rounded-lg bg-white/5 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <>
                {/* Search input */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted/50" />
                  <input
                    type="text"
                    placeholder="Search subcategories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-white/10 text-sm text-softWhite placeholder:text-muted/40 font-body focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  {/* Show "All" link only when no search is active */}
                  {!debouncedQuery && (
                    <Link
                      href={buildHref({ subcategory: undefined })}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-sm font-body transition-colors",
                        !currentSubcategory
                          ? "text-softWhite"
                          : "text-muted hover:text-softWhite"
                      )}
                      style={
                        !currentSubcategory
                          ? {
                              backgroundColor: `${categories[currentCategory]?.accentColor}15`,
                              color: categories[currentCategory]?.accentColor,
                            }
                          : undefined
                      }
                    >
                      <span className="truncate">All {categories[currentCategory]?.name}</span>
                      <span className="text-xs text-muted/50 font-ui tabular-nums shrink-0">
                        {totalProductCount}
                      </span>
                    </Link>
                  )}
                  {filteredSubcategories.length > 0 ? (
                    filteredSubcategories.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={buildHref({ subcategory: sub.slug })}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-sm font-body transition-colors",
                          currentSubcategory === sub.slug
                            ? "text-softWhite"
                            : "text-muted hover:text-softWhite"
                        )}
                        style={
                          currentSubcategory === sub.slug
                            ? {
                                backgroundColor: `${categories[currentCategory]?.accentColor}15`,
                                color: categories[currentCategory]?.accentColor,
                              }
                            : undefined
                        }
                      >
                        <span className="flex-1 truncate">{sub.name}</span>
                        {sub.productCount !== undefined && (
                          <span className="text-xs text-muted/50 font-ui tabular-nums shrink-0">
                            {sub.productCount}
                          </span>
                        )}
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-muted font-body px-3 py-2">
                      No subcategories match &ldquo;{debouncedQuery}&rdquo;.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
