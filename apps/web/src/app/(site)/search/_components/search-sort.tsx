"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@alaya/ui";
import { ChevronDown } from "lucide-react";

interface SearchSortDropdownProps {
  currentSort: string;
  currentQuery: string;
  currentCategory?: string;
  currentSubcategory?: string;
  currentTab: string;
}

const sortOptions = [
  { value: "relevance", label: "Most Relevant" },
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export function SearchSortDropdown({
  currentSort,
  currentQuery,
  currentCategory,
  currentSubcategory,
  currentTab,
}: SearchSortDropdownProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function buildHref(sort: string): string {
    const sp = new URLSearchParams();
    sp.set("q", currentQuery);
    if (currentCategory) sp.set("category", currentCategory);
    if (currentSubcategory) sp.set("subcategory", currentSubcategory);
    if (currentTab && currentTab !== "products") sp.set("tab", currentTab);
    if (sort && sort !== "relevance") sp.set("sort", sort);
    return `${pathname}?${sp.toString()}`;
  }

  const activeOption =
    sortOptions.find((o) => o.value === currentSort) ?? sortOptions[0]!;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-ui transition-colors border",
          open
            ? "border-white/20 text-softWhite"
            : "border-white/10 text-muted hover:text-softWhite hover:border-white/20"
        )}
      >
        {activeOption.label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-obsidian shadow-xl shadow-black/40 overflow-hidden z-50">
          {sortOptions.map((option) => {
            const isActive = option.value === currentSort;
            return (
              <Link
                key={option.value}
                href={buildHref(option.value)}
                onClick={() => setOpen(false)}
                className={cn(
                  "block w-full text-left px-4 py-2.5 text-sm font-ui transition-colors",
                  isActive
                    ? "text-accent bg-accent/10"
                    : "text-muted hover:text-softWhite hover:bg-white/5"
                )}
              >
                {option.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
