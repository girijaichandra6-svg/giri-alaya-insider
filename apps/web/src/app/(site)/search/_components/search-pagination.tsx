"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@alaya/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SearchPaginationProps {
  currentPage: number;
  totalPages: number;
  query: string;
  sort?: string;
  category?: string;
  subcategory?: string;
  tab?: string;
}

export function SearchPagination({
  currentPage,
  totalPages,
  query,
  sort,
  category,
  subcategory,
  tab,
}: SearchPaginationProps) {
  const pathname = usePathname();

  if (totalPages <= 1) return null;

  function buildPageUrl(page: number): string {
    const sp = new URLSearchParams();
    sp.set("q", query);
    sp.set("page", String(page));
    if (sort && sort !== "relevance") sp.set("sort", sort);
    if (category) sp.set("category", category);
    if (subcategory) sp.set("subcategory", subcategory);
    if (tab && tab !== "products") sp.set("tab", tab);
    return `${pathname}?${sp.toString()}`;
  }

  // Generate page numbers to show: first, last, and a window around current
  const pages: (number | "...")[] = [];
  const delta = 2; // pages to show on each side of current

  if (totalPages <= 7) {
    // Show all pages
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    // Always show first page
    pages.push(1);

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");

    // Always show last page
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-12">
      {/* Previous */}
      <Link
        href={buildPageUrl(currentPage - 1)}
        className={cn(
          "flex items-center gap-1 h-10 px-3 rounded-lg text-sm font-ui transition-colors border",
          currentPage <= 1
            ? "border-white/5 text-muted/30 pointer-events-none"
            : "border-white/10 text-muted hover:text-softWhite hover:border-white/20"
        )}
        aria-disabled={currentPage <= 1}
        tabIndex={currentPage <= 1 ? -1 : undefined}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Link>

      {/* Page Numbers */}
      {pages.map((page, idx) =>
        page === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="h-10 w-10 flex items-center justify-center text-sm text-muted/40 font-ui"
          >
            &hellip;
          </span>
        ) : (
          <Link
            key={page}
            href={buildPageUrl(page)}
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center text-sm font-ui transition-colors",
              page === currentPage
                ? "bg-accent text-obsidian"
                : "text-muted hover:text-softWhite border border-white/10 hover:border-white/20"
            )}
          >
            {page}
          </Link>
        )
      )}

      {/* Next */}
      <Link
        href={buildPageUrl(currentPage + 1)}
        className={cn(
          "flex items-center gap-1 h-10 px-3 rounded-lg text-sm font-ui transition-colors border",
          currentPage >= totalPages
            ? "border-white/5 text-muted/30 pointer-events-none"
            : "border-white/10 text-muted hover:text-softWhite hover:border-white/20"
        )}
        aria-disabled={currentPage >= totalPages}
        tabIndex={currentPage >= totalPages ? -1 : undefined}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
