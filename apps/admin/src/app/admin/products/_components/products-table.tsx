"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { EditProductDialog } from "./edit-product-dialog";
import { DeleteProductButton } from "./delete-product-button";
import { BulkActionsBar } from "./bulk-actions-bar";

interface ProductRow {
  id: string;
  slug: string;
  title: string;
  brand: string | null;
  description: string;
  basePrice: unknown;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  category: { name: string; accentColor: string };
  subcategory: { name: string } | null;
  _count: { affiliateLinks: number; reviews: number };
}

interface ProductsTableProps {
  products: ProductRow[];
  query: string;
  sort: string;
  page: number;
  totalPages: number;
}

function buildUrl(
  params: Record<string, string | undefined>,
  currentQuery: string,
  currentSort: string
) {
  const sp = new URLSearchParams();
  if (currentQuery) sp.set("q", currentQuery);
  if (params.page) sp.set("page", params.page);
  if (params.sort || currentSort !== "newest")
    sp.set("sort", params.sort || currentSort);
  const qs = sp.toString();
  return `/admin/products${qs ? `?${qs}` : ""}`;
}

export function ProductsTable({
  products,
  query,
  sort,
  page,
  totalPages,
}: ProductsTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const allIds = React.useMemo(() => products.map((p) => p.id), [products]);
  const allSelected =
    products.length > 0 && selectedIds.size === products.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  // Scroll selectedIds into view when bulk actions bar appears
  React.useEffect(() => {
    if (selectedIds.size > 0) {
      const bar = document.getElementById("bulk-actions-bar");
      bar?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedIds.size]);

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  return (
    <>
      {/* Search & Filters */}
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
            placeholder="Search products..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-white/10 bg-onyx text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
          />
        </form>
        <div className="flex items-center gap-2">
          {["newest", "oldest", "price_asc", "price_desc"].map((s) => {
            const href = buildUrl({ sort: s, page: "1" }, query, sort);
            return (
              <a
                key={s}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-xs font-ui transition-colors ${
                  sort === s
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:text-softWhite hover:bg-white/5"
                }`}
              >
                {s === "newest" && "Newest"}
                {s === "oldest" && "Oldest"}
                {s === "price_asc" && "Price ↑"}
                {s === "price_desc" && "Price ↓"}
              </a>
            );
          })}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <div id="bulk-actions-bar">
        <BulkActionsBar
          selectedCount={selectedIds.size}
          selectedIds={Array.from(selectedIds)}
          onClearSelection={clearSelection}
        />
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-onyx">
                <th className="w-12 px-4 py-3">
                  <label className="flex items-center justify-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-white/20 bg-onyx text-accent focus:ring-accent focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="sr-only">Select all</span>
                  </label>
                </th>
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">
                  Category
                </th>
                <th className="text-right px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden md:table-cell">
                  Price
                </th>
                <th className="text-center px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">
                  Links
                </th>
                <th className="text-center px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">
                  Reviews
                </th>
                <th className="text-center px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-16 text-center text-muted font-body"
                  >
                    {query
                      ? `No products matching "${query}"`
                      : "No products yet."}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-white/5 transition-colors ${
                      selectedIds.has(product.id)
                        ? "bg-accent/5"
                        : ""
                    }`}
                  >
                    <td className="w-12 px-4 py-3">
                      <label className="flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product.id)}
                          onChange={() => toggleOne(product.id)}
                          className="h-4 w-4 rounded border-white/20 bg-onyx text-accent focus:ring-accent focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="sr-only">Select {product.title}</span>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-onyx flex items-center justify-center shrink-0">
                          <span className="text-[10px] text-muted font-ui">
                            {product.title[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-softWhite font-body truncate max-w-[200px] lg:max-w-[300px]">
                            {product.title}
                          </p>
                          {product.brand && (
                            <p className="text-xs text-muted font-body">
                              {product.brand}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className="text-xs font-ui font-medium"
                        style={{ color: product.category.accentColor }}
                      >
                        {product.category.name}
                      </span>
                      {product.subcategory && (
                        <p className="text-[10px] text-muted font-body mt-0.5">
                          {product.subcategory.name}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className="text-sm font-ui font-medium text-softWhite">
                        {product.basePrice
                          ? `$${Number(product.basePrice).toLocaleString()}`
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <span className="text-sm text-muted font-body">
                        {product._count.affiliateLinks}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <span className="text-sm text-muted font-body">
                        {product._count.reviews}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-ui font-semibold ${
                          product.isActive
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-white/5 text-muted"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <EditProductDialog
                          productId={product.id}
                          initialTitle={product.title}
                          initialDescription={product.description}
                          initialBasePrice={
                            product.basePrice
                              ? Number(product.basePrice)
                              : null
                          }
                          initialCurrency={product.currency}
                          initialIsActive={product.isActive}
                        />
                        <DeleteProductButton
                          productId={product.id}
                          productTitle={product.title}
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
                href={buildUrl({ page: String(page - 1) }, query, sort)}
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
                  href={buildUrl({ page: String(p) }, query, sort)}
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
                href={buildUrl({ page: String(page + 1) }, query, sort)}
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
