"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, Percent } from "lucide-react";
import { EditCouponDialog } from "./edit-coupon-dialog";
import { DeleteCouponButton } from "./delete-coupon-button";

interface CouponRow {
  id: string;
  code: string;
  description: string;
  discount: string | null;
  expiresAt: Date | null;
  product: { id: string; title: string } | null;
  retailer: { id: string; name: string } | null;
}

interface ProductOption {
  id: string;
  title: string;
}

interface RetailerOption {
  id: string;
  name: string;
}

interface CouponsTableProps {
  coupons: CouponRow[];
  products: ProductOption[];
  retailers: RetailerOption[];
  query: string;
  page: number;
  totalPages: number;
}

function buildUrl(params: Record<string, string | undefined>, currentQuery: string) {
  const sp = new URLSearchParams();
  if (currentQuery) sp.set("q", currentQuery);
  if (params.page) sp.set("page", params.page);
  const qs = sp.toString();
  return `/admin/coupons${qs ? `?${qs}` : ""}`;
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CouponsTable({
  coupons,
  products,
  retailers,
  query,
  page,
  totalPages,
}: CouponsTableProps) {
  const router = useRouter();
  const now = new Date();

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
            placeholder="Search coupons by code or description..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-white/10 bg-onyx text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
          />
        </form>
      </div>

      {/* Coupons Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-onyx">
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Code
                </th>
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">
                  Description
                </th>
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden md:table-cell">
                  Product
                </th>
                <th className="text-left px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">
                  Retailer
                </th>
                <th className="text-center px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Discount
                </th>
                <th className="text-center px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider hidden md:table-cell">
                  Expires
                </th>
                <th className="text-right px-4 py-3 text-xs font-ui font-semibold text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-muted font-body">
                    {query
                      ? `No coupons matching "${query}"`
                      : "No coupons yet."}
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < now;

                  return (
                    <tr
                      key={coupon.id}
                      className={`hover:bg-white/5 transition-colors ${isExpired ? "opacity-60" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-onyx flex items-center justify-center shrink-0">
                            <Percent className="h-4 w-4 text-accent" />
                          </div>
                          <span className="text-sm font-mono font-medium text-softWhite">
                            {coupon.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-muted font-body truncate block max-w-[200px]">
                          {coupon.description}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-softWhite font-body truncate block max-w-[150px]">
                          {coupon.product?.title || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-muted font-body">
                          {coupon.retailer?.name || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-ui font-semibold text-emerald-400">
                          {coupon.discount || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        <span className={`text-xs font-body ${isExpired ? "text-muted" : "text-softWhite"}`}>
                          {formatDate(coupon.expiresAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <EditCouponDialog
                            coupon={coupon as any}
                            products={products}
                            retailers={retailers}
                          />
                          <DeleteCouponButton
                            couponId={coupon.id}
                            couponCode={coupon.code}
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
