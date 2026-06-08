"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, Building2 } from "lucide-react";
import { EditBrandDialog } from "./edit-brand-dialog";
import { DeleteBrandButton } from "./delete-brand-button";

interface BrandRow {
  id: string;
  name: string;
  logoUrl: string | null;
}

interface BrandsTableProps {
  brands: BrandRow[];
  query: string;
  page: number;
  totalPages: number;
}

function buildUrl(params: Record<string, string | undefined>, currentQuery: string) {
  const sp = new URLSearchParams();
  if (currentQuery) sp.set("q", currentQuery);
  if (params.page) sp.set("page", params.page);
  const qs = sp.toString();
  return `/admin/brands${qs ? `?${qs}` : ""}`;
}

export function BrandsTable({
  brands,
  query,
  page,
  totalPages,
}: BrandsTableProps) {
  const router = useRouter();

  return (
    <>
      {/* Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            const q = formData.get("q") as string;
            const url = new URL(window.location.href);
            if (q) {
              url.searchParams.set("q", q);
            } else {
              url.searchParams.delete("q");
            }
            url.searchParams.delete("page");
            router.push(url.pathname + url.search);
          }}
          className="relative flex-1 max-w-md"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search brands..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-white/10 bg-onyx text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
          />
        </form>
      </div>

      {/* Brands Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-onyx">
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Brand
                </th>
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">
                  Logo URL
                </th>
                <th className="text-right px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {brands.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-16 text-center text-muted font-body">
                    {query
                      ? `No brands matching "${query}"`
                      : "No brands yet."}
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-onyx flex items-center justify-center shrink-0 overflow-hidden">
                          {brand.logoUrl ? (
                            <img
                              src={brand.logoUrl}
                              alt=""
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <Building2 className="h-4 w-4 text-muted" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-softWhite font-body">
                            {brand.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {brand.logoUrl ? (
                        <span className="text-xs text-muted font-mono truncate block max-w-[300px]" title={brand.logoUrl}>
                          {brand.logoUrl}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <EditBrandDialog
                          brandId={brand.id}
                          initialName={brand.name}
                          initialLogoUrl={brand.logoUrl}
                        />
                        <DeleteBrandButton
                          brandId={brand.id}
                          brandName={brand.name}
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
                href={buildUrl({ page: String(page - 1) }, query)}
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
                  href={buildUrl({ page: String(p) }, query)}
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
                href={buildUrl({ page: String(page + 1) }, query)}
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
