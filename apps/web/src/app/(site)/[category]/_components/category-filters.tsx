"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@alaya/ui";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import { clientFetch } from "@/lib/api";
import type { SubcategoryData } from "@/lib/api";

interface CategoryFiltersProps {
  categorySlug: string;
  accentColor: string;
  currentSubcategory?: string;
  currentSort?: string;
}

const priceRanges = [
  { label: "Under $50", min: 0, max: 50, key: "0-50" },
  { label: "$50 - $100", min: 50, max: 100, key: "50-100" },
  { label: "$100 - $200", min: 100, max: 200, key: "100-200" },
  { label: "$200 - $500", min: 200, max: 500, key: "200-500" },
  { label: "$500+", min: 500, max: undefined, key: "500-inf" },
];

const ratings = [5, 4, 3, 2, 1];

export function CategoryFilters({
  categorySlug,
  accentColor,
  currentSubcategory,
  currentSort = "newest",
}: CategoryFiltersProps) {
  const pathname = usePathname();
  const [subcategories, setSubcategories] = React.useState<SubcategoryData[]>([]);
  const [totalProductCount, setTotalProductCount] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  // Debounce search query by 200ms
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
  }, [categorySlug]);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await clientFetch<{ subcategories: SubcategoryData[]; totalProductCount: number }>(
          `/subcategories?category=${categorySlug}`
        );
        setSubcategories(data.subcategories);
        setTotalProductCount(data.totalProductCount);
      } catch {
        // Silently fail — filter section just won't show
      }
    }
    load();
  }, [categorySlug]);

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
    const sort = params.sort || currentSort;
    if (sort && sort !== "newest") sp.set("sort", sort);
    if (params.subcategory) sp.set("subcategory", params.subcategory);
    const qs = sp.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      {/* Subcategories */}
      {subcategories.length > 0 && (
        <>
          <div>
            <h4 className="text-xs font-ui font-semibold uppercase tracking-wider text-muted mb-3">
              Subcategory
            </h4>
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
                  className={cn(
                    "flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-sm font-body transition-colors",
                    !currentSubcategory
                      ? "text-softWhite"
                      : "text-muted hover:text-softWhite"
                  )}
                  style={
                    !currentSubcategory
                      ? { backgroundColor: `${accentColor}15`, color: accentColor }
                      : undefined
                  }
                >
                  <span className="truncate">All {categorySlug}</span>
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
                    className={cn(
                      "flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-sm font-body transition-colors",
                      currentSubcategory === sub.slug
                        ? "text-softWhite"
                        : "text-muted hover:text-softWhite"
                    )}
                    style={
                      currentSubcategory === sub.slug
                        ? { backgroundColor: `${accentColor}15`, color: accentColor }
                        : undefined
                    }
                  >
                    <span className="truncate">{sub.name}</span>
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
          </div>
          <Separator />
        </>
      )}

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-ui font-semibold uppercase tracking-wider text-muted mb-3">
          Price Range
        </h4>
        <div className="space-y-1">
          {priceRanges.map((range) => (
            <Link
              key={range.key}
              href={buildHref({ subcategory: currentSubcategory })}
              className={cn(
                "block w-full text-left px-3 py-2 rounded-lg text-sm font-body transition-colors",
                "text-muted hover:text-softWhite"
              )}
            >
              {range.label}
            </Link>
          ))}
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div>
        <h4 className="text-xs font-ui font-semibold uppercase tracking-wider text-muted mb-3">
          Minimum Rating
        </h4>
        <div className="space-y-1">
          {ratings.map((rating) => (
            <button
              key={rating}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm font-body transition-colors",
                "text-muted hover:text-softWhite"
              )}
            >
              {"★".repeat(rating)}
              {"☆".repeat(5 - rating)} & up
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
