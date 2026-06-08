"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, Tag, Calendar } from "lucide-react";
import { EditDealDialog } from "./edit-deal-dialog";
import { DeleteDealButton } from "./delete-deal-button";

interface DealRow {
  id: string;
  title: string;
  description: string | null;
  code: string | null;
  discount: number | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  product: { id: string; title: string; slug: string } | null;
  retailer: { id: string; name: string } | null;
}

interface ProductOption {
  id: string;
  title: string;
}

interface DealsTableProps {
  deals: DealRow[];
  products: ProductOption[];
  query: string;
  activeFilter: string;
  page: number;
  totalPages: number;
}

function buildUrl(
  params: Record<string, string | undefined>,
  currentQuery: string,
  currentActive: string
) {
  const sp = new URLSearchParams();
  if (currentQuery) sp.set("q", currentQuery);
  if (params.active || currentActive !== "all")
    sp.set("active", params.active || currentActive);
  if (params.page) sp.set("page", params.page);
  const qs = sp.toString();
  return `/admin/deals${qs ? `?${qs}` : ""}`;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DealsTable({
  deals,
  products,
  query,
  activeFilter,
  page,
  totalPages,
}: DealsTableProps) {
  const router = useRouter();

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
            placeholder="Search deals by title or code..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-white/10 bg-onyx text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
          />
        </form>
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "active", "expired"].map((f) => {
            const href = buildUrl({ active: f === "all" ? undefined : f, page: "1" }, query, activeFilter);
            return (
              <a
                key={f}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-xs font-ui transition-colors ${
                  activeFilter === f
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:text-softWhite hover:bg-white/5"
                }`}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </a>
            );
          })}
        </div>
      </div>

      {/* Deals Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-onyx">
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Deal
                </th>
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">
                  Product
                </th>
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden md:table-cell">
                  Retailer
                </th>
                <th className="text-center px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">
                  Code
                </th>
                <th className="text-center px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Discount
                </th>
                <th className="text-center px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden md:table-cell">
                  Duration
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
              {deals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-muted font-body">
                    {query
                      ? `No deals matching "${query}"`
                      : "No deals yet."}
                  </td>
                </tr>
              ) : (
                deals.map((deal) => {
                  const now = new Date();
                  const isPastEnd = new Date(deal.endDate) < now;
                  const isUpcoming = new Date(deal.startDate) > now;

                  return (
                    <tr
                      key={deal.id}
                      className={`hover:bg-white/5 transition-colors ${
                        (isPastEnd || !deal.isActive) ? "opacity-60" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-onyx flex items-center justify-center shrink-0">
                            <Tag className="h-4 w-4 text-accent" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-softWhite font-body truncate max-w-[180px]">
                              {deal.title}
                            </p>
                            {deal.description && (
                              <p className="text-[10px] text-muted font-body truncate max-w-[180px]">
                                {deal.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-softWhite font-body truncate block max-w-[150px]">
                          {deal.product?.title || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-muted font-body">
                          {deal.retailer?.name || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell">
                        {deal.code ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-softWhite">
                            {deal.code}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-ui font-semibold text-emerald-400">
                          {deal.discount ? `${deal.discount}%` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        <div className="flex items-center gap-1.5 justify-center">
                          <Calendar className="h-3 w-3 text-muted" />
                          <span className="text-[10px] text-muted font-body">
                            {formatDate(deal.startDate)}
                          </span>
                          <span className="text-[10px] text-muted">→</span>
                          <span className="text-[10px] text-muted font-body">
                            {formatDate(deal.endDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-ui font-semibold ${
                            isPastEnd
                              ? "bg-white/5 text-muted"
                              : !deal.isActive
                              ? "bg-coral/10 text-coral"
                              : isUpcoming
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          {isPastEnd
                            ? "Expired"
                            : !deal.isActive
                            ? "Inactive"
                            : isUpcoming
                            ? "Upcoming"
                            : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <EditDealDialog
                            deal={deal as any}
                            products={products}
                          />
                          <DeleteDealButton
                            dealId={deal.id}
                            dealTitle={deal.title}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                href={buildUrl({ page: String(page - 1) }, query, activeFilter)}
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
                  href={buildUrl({ page: String(p) }, query, activeFilter)}
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
                href={buildUrl({ page: String(page + 1) }, query, activeFilter)}
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
