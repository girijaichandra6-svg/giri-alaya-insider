"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, BookOpen } from "lucide-react";
import { EditCollectionDialog } from "./edit-collection-dialog";
import { DeleteCollectionButton } from "./delete-collection-button";

interface CollectionProductRef {
  productId: string;
  order: number;
  product: { id: string; title: string; slug: string };
}

interface CollectionRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isPublic: boolean;
  type: string;
  products: CollectionProductRef[];
  _count: { products: number };
}

interface ProductOption {
  id: string;
  title: string;
}

interface CollectionsTableProps {
  collections: CollectionRow[];
  products: ProductOption[];
  typeFilter: string;
  query: string;
  page: number;
  totalPages: number;
}

const TYPE_STYLES: Record<string, string> = {
  EDITORIAL: "bg-accent/10 text-accent",
  USER: "bg-blue-500/10 text-blue-400",
  SEASONAL: "bg-amber-500/10 text-amber-400",
};

function buildUrl(
  params: Record<string, string | undefined>,
  currentQuery: string,
  currentType: string
) {
  const sp = new URLSearchParams();
  if (currentQuery) sp.set("q", currentQuery);
  if (currentType) sp.set("type", currentType);
  if (params.type !== undefined || params.page) {
    if (params.type) sp.set("type", params.type);
    else if (params.type === "") sp.delete("type");
    if (params.page) sp.set("page", params.page);
  }
  const qs = sp.toString();
  return `/admin/collections${qs ? `?${qs}` : ""}`;
}

export function CollectionsTable({
  collections,
  products,
  typeFilter,
  query,
  page,
  totalPages,
}: CollectionsTableProps) {
  const router = useRouter();

  return (
    <>
      {/* Search & Type Filter */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);
          const q = formData.get("q") as string;
          const type = formData.get("type") as string;
          const url = new URL(window.location.href);
          if (q) url.searchParams.set("q", q);
          else url.searchParams.delete("q");
          if (type) url.searchParams.set("type", type);
          else url.searchParams.delete("type");
          url.searchParams.delete("page");
          router.push(url.pathname + url.search);
        }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search collections by title or slug..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-white/10 bg-onyx text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
          />
        </div>
        <select
          name="type"
          defaultValue={typeFilter}
          onChange={(e) => {
            const type = e.target.value;
            const url = new URL(window.location.href);
            if (type) url.searchParams.set("type", type);
            else url.searchParams.delete("type");
            url.searchParams.delete("page");
            router.push(url.pathname + url.search);
          }}
          className="w-full sm:w-auto h-10 rounded-lg border border-white/10 bg-onyx px-3 text-sm text-softWhite focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
        >
          <option value="">All types</option>
          <option value="EDITORIAL">Editorial</option>
          <option value="SEASONAL">Seasonal</option>
          <option value="USER">User</option>
        </select>
      </form>

      {/* Collections Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-onyx">
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Collection
                </th>
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">
                  Slug
                </th>
                <th className="text-center px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Type
                </th>
                <th className="text-center px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden md:table-cell">
                  Products
                </th>
                <th className="text-center px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {collections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted font-body">
                    {query
                      ? `No collections matching "${query}"`
                      : "No collections yet."}
                  </td>
                </tr>
              ) : (
                collections.map((col) => (
                  <tr key={col.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-onyx flex items-center justify-center shrink-0">
                          <BookOpen className="h-4 w-4 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-softWhite font-body truncate max-w-[200px]">
                            {col.title}
                          </p>
                          {col.description && (
                            <p className="text-[10px] text-muted font-body truncate max-w-[200px]">
                              {col.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-muted font-mono">{col.slug}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-ui font-semibold ${
                          TYPE_STYLES[col.type] || "bg-white/5 text-muted"
                        }`}
                      >
                        {col.type.charAt(0) + col.type.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      <span className="text-sm text-softWhite font-body">
                        {col._count.products}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-ui font-semibold ${
                          col.isPublic
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-white/5 text-muted"
                        }`}
                      >
                        {col.isPublic ? "Public" : "Private"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <EditCollectionDialog
                          collection={col as any}
                          products={products}
                        />
                        <DeleteCollectionButton
                          collectionId={col.id}
                          collectionTitle={col.title}
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
                href={buildUrl({ page: String(page - 1) }, query, typeFilter)}
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
                  href={buildUrl({ page: String(p) }, query, typeFilter)}
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
                href={buildUrl({ page: String(page + 1) }, query, typeFilter)}
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
