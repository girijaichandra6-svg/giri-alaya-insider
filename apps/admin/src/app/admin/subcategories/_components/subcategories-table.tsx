"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, Layers } from "lucide-react";
import { EditSubcategoryDialog } from "./edit-subcategory-dialog";
import { DeleteSubcategoryButton } from "./delete-subcategory-button";

interface SubcategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  categoryId: string;
  category: { id: string; name: string; accentColor: string };
  _count: { products: number };
}

interface CategoryOption {
  id: string;
  name: string;
}

interface SubcategoriesTableProps {
  subcategories: SubcategoryRow[];
  categories: CategoryOption[];
  categoryIdFilter: string;
  query: string;
  page: number;
  totalPages: number;
}

function buildUrl(
  params: Record<string, string | undefined>,
  currentQuery: string,
  currentCategory: string
) {
  const sp = new URLSearchParams();
  if (currentQuery) sp.set("q", currentQuery);
  if (currentCategory) sp.set("categoryId", currentCategory);
  if (params.categoryId !== undefined || params.page) {
    if (params.categoryId) sp.set("categoryId", params.categoryId);
    else if (params.categoryId === "") sp.delete("categoryId");
    if (params.page) sp.set("page", params.page);
  }
  const qs = sp.toString();
  return `/admin/subcategories${qs ? `?${qs}` : ""}`;
}

export function SubcategoriesTable({
  subcategories,
  categories,
  categoryIdFilter,
  query,
  page,
  totalPages,
}: SubcategoriesTableProps) {
  const router = useRouter();

  return (
    <>
      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            const q = formData.get("q") as string;
            const cat = formData.get("categoryId") as string;
            const url = new URL(window.location.href);
            if (q) {
              url.searchParams.set("q", q);
            } else {
              url.searchParams.delete("q");
            }
            if (cat) {
              url.searchParams.set("categoryId", cat);
            } else {
              url.searchParams.delete("categoryId");
            }
            url.searchParams.delete("page");
            router.push(url.pathname + url.search);
          }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search subcategories by name or slug..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-white/10 bg-onyx text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
            />
          </div>
          <select
            name="categoryId"
            defaultValue={categoryIdFilter}
            onChange={(e) => {
              // Also navigate on direct change
              const cat = e.target.value;
              const url = new URL(window.location.href);
              if (cat) {
                url.searchParams.set("categoryId", cat);
              } else {
                url.searchParams.delete("categoryId");
              }
              url.searchParams.delete("page");
              router.push(url.pathname + url.search);
            }}
            className="w-full sm:w-auto h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </form>
      </div>

      {/* Subcategories Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-onyx">
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Subcategory
                </th>
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">
                  Slug
                </th>
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden md:table-cell">
                  Category
                </th>
                <th className="text-center px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">
                  Products
                </th>
                <th className="text-right px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subcategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-muted font-body">
                    {query
                      ? `No subcategories matching "${query}"`
                      : "No subcategories yet."}
                  </td>
                </tr>
              ) : (
                subcategories.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-onyx flex items-center justify-center shrink-0">
                          <Layers className="h-4 w-4 text-muted" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-softWhite font-body truncate max-w-[200px]">
                            {sub.name}
                          </p>
                          {sub.description && (
                            <p className="text-[10px] text-muted font-body truncate max-w-[200px]">
                              {sub.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-muted font-mono">{sub.slug}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span
                        className="text-xs font-ui font-medium"
                        style={{ color: sub.category.accentColor }}
                      >
                        {sub.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <span className="text-xs text-softWhite font-body">{sub._count.products}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <EditSubcategoryDialog
                          subcategory={sub as any}
                          categories={categories}
                        />
                        <DeleteSubcategoryButton
                          subcategoryId={sub.id}
                          subcategoryName={sub.name}
                          productCount={sub._count.products}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted font-body">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <a
                href={buildUrl({ page: String(page - 1) }, query, categoryIdFilter)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted hover:text-softWhite hover:bg-white/5 transition-colors font-ui"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </a>
            )}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p: number;
              if (totalPages <= 7) {
                p = i + 1;
              } else if (page <= 4) {
                p = i + 1;
              } else if (page >= totalPages - 3) {
                p = totalPages - 6 + i;
              } else {
                p = page - 3 + i;
              }
              return (
                <a
                  key={p}
                  href={buildUrl({ page: String(p) }, query, categoryIdFilter)}
                  className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-ui transition-colors ${
                    p === page
                      ? "bg-accent text-obsidian"
                      : "text-muted hover:text-softWhite hover:bg-white/5"
                  }`}
                >
                  {p}
                </a>
              );
            })}
            {page < totalPages && (
              <a
                href={buildUrl({ page: String(page + 1) }, query, categoryIdFilter)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted hover:text-softWhite hover:bg-white/5 transition-colors font-ui"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
