"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Tag, ChevronRight, ExternalLink, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { clientFetch } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────

interface DealData {
  id: string;
  title: string;
  description: string | null;
  code: string | null;
  discount: number | null;
  startDate: string;
  endDate: string;
  url: string | null;
  product: {
    id: string;
    slug: string;
    title: string;
    brand: string | null;
    imageUrls: string[];
    basePrice: number | null;
    currency: string;
    description: string;
    category: { slug: string; name: string; accentColor: string };
    subcategory: { slug: string; name: string } | null;
  };
  retailer: { id: string; name: string; logoUrl: string | null } | null;
}

export interface DealsResponse {
  deals: DealData[];
  total: number;
  page: number;
  totalPages: number;
}

// ─── Countdown Timer ─────────────────────────────────────

function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = React.useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = React.useState(false);

  React.useEffect(() => {
    function update() {
      const now = Date.now();
      const end = new Date(endDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setExpired(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (expired) return null;

  return (
    <div className="flex items-center gap-1 text-xs font-ui font-medium text-coral">
      <Clock className="h-3 w-3" />
      {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
      <span>{String(timeLeft.hours).padStart(2, "0")}h</span>
      <span>{String(timeLeft.minutes).padStart(2, "0")}m</span>
      <span>{String(timeLeft.seconds).padStart(2, "0")}s</span>
    </div>
  );
}

// ─── Deal Card ───────────────────────────────────────────

function DealCard({ deal }: { deal: DealData }) {
  const imageUrl = deal.product.imageUrls?.[0] || "/images/placeholder.svg";
  const salePrice =
    deal.discount && deal.product.basePrice
      ? Number(deal.product.basePrice) * (1 - deal.discount / 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
    >
      <div className="group rounded-2xl border border-white/10 bg-graphite/30 overflow-hidden hover:border-accent/30 hover:bg-graphite/50 transition-all duration-300">
        {/* Image */}
        <Link
          href={`/${deal.product.category.slug}/${deal.product.subcategory?.slug ?? "product"}/product/${deal.product.slug}`}
          className="relative block aspect-[16/10] overflow-hidden bg-graphite"
        >
          <Image
            src={imageUrl}
            alt={deal.product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent" />

          {/* Discount Badge */}
          {deal.discount && (
            <div className="absolute top-3 left-3">
              <Badge variant="danger" className="text-sm px-3 py-1">
                -{deal.discount}%
              </Badge>
            </div>
          )}

          {/* Countdown */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-obsidian/80 backdrop-blur-sm rounded-lg px-3 py-2 inline-flex">
              <CountdownTimer endDate={deal.endDate} />
            </div>
          </div>
        </Link>

        {/* Content */}
        <div className="p-5">
          {/* Category & Brand */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[10px] font-ui font-semibold uppercase tracking-widest"
              style={{ color: deal.product.category.accentColor }}
            >
              {deal.product.category.name}
            </span>
            {deal.product.brand && (
              <>
                <span className="text-muted/40">·</span>
                <span className="text-[10px] font-ui text-muted uppercase tracking-wider">
                  {deal.product.brand}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="font-ui text-sm font-medium text-softWhite line-clamp-1 group-hover:text-accent transition-colors mb-2">
            <Link
              href={`/${deal.product.category.slug}/${deal.product.subcategory?.slug ?? "product"}/product/${deal.product.slug}`}
            >
              {deal.product.title}
            </Link>
          </h3>

          {/* Deal title */}
          {deal.title && (
            <p className="text-xs text-muted font-body line-clamp-2 mb-3">
              {deal.title}
            </p>
          )}

          {/* Coupon Code */}
          {deal.code && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1 text-xs font-ui font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-md border border-accent/20">
                <Tag className="h-3 w-3" />
                {deal.code}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            {deal.product.basePrice && salePrice && (
              <>
                <span className="font-ui text-lg font-semibold text-softWhite">
                  ${salePrice.toFixed(0)}
                </span>
                <span className="font-ui text-sm text-muted line-through">
                  ${Number(deal.product.basePrice).toFixed(0)}
                </span>
              </>
            )}
            {deal.product.basePrice && !salePrice && (
              <span className="font-ui text-lg font-semibold text-softWhite">
                ${Number(deal.product.basePrice).toFixed(0)}
              </span>
            )}
            <span className="text-xs text-muted/60 font-body">
              {deal.product.currency}
            </span>
          </div>

          {/* Action */}
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() => {
                if (deal.url) {
                  window.open(deal.url, "_blank", "noopener,noreferrer");
                } else {
                  window.open(
                    `/${deal.product.category.slug}/${deal.product.subcategory?.slug ?? "product"}/product/${deal.product.slug}`,
                    "_blank",
                    "noopener,noreferrer"
                  );
                }
              }}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Shop Now
            </Button>
            <Button variant="ghost" size="icon-sm" asChild>
              <Link
                href={`/${deal.product.category.slug}/${deal.product.subcategory?.slug ?? "product"}/product/${deal.product.slug}`}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Retailer */}
          {deal.retailer && (
            <p className="text-[10px] text-muted/50 font-body mt-3">
              via {deal.retailer.name}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Category Filter Button ──────────────────────────────

const categories = [
  { slug: "", name: "All Deals" },
  { slug: "electronics", name: "Electronics" },
  { slug: "fashion", name: "Fashion" },
  { slug: "beauty", name: "Beauty" },
  { slug: "home-living", name: "Home & Living" },
  { slug: "travel", name: "Travel" },
  { slug: "health-wellness", name: "Health & Wellness" },
  { slug: "food-nutrition", name: "Food & Nutrition" },
] as const;

// ─── Main Client Component ───────────────────────────────

export function DealsClient({ initialData }: { initialData?: DealsResponse | null }) {
  const [deals, setDeals] = React.useState<DealData[]>(initialData?.deals || []);
  const [total, setTotal] = React.useState(initialData?.total || 0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(initialData?.totalPages || 1);
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [sortBy, setSortBy] = React.useState("end_date");
  const [loading, setLoading] = React.useState(!initialData);
  const [error, setError] = React.useState<string | null>(null);

  async function fetchDeals() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set("category", selectedCategory);
      params.set("sort", sortBy);
      params.set("page", String(page));
      params.set("limit", "24");

      const data = await clientFetch<DealsResponse>(`/deals?${params.toString()}`);
      setDeals(data.deals);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError("Failed to load deals. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    // Only fetch client-side when filters change or initial load needed
    if (!initialData || selectedCategory || sortBy !== "end_date" || page !== 1) {
      fetchDeals();
    }
  }, [selectedCategory, sortBy, page]);

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => {
                setSelectedCategory(cat.slug);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-ui font-semibold transition-all ${
                selectedCategory === cat.slug
                  ? "bg-accent text-obsidian"
                  : "bg-onyx text-muted hover:text-softWhite border border-white/10"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-white/10 bg-onyx px-3 py-2 text-sm text-softWhite font-body outline-none focus:border-accent/50 transition-colors"
        >
          <option value="end_date">Ending Soon</option>
          <option value="discount">Biggest Discount</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-graphite/30 animate-pulse h-96"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-10 w-10 text-coral mb-4" />
          <p className="text-muted font-body">{error}</p>
          <button
            onClick={fetchDeals}
            className="mt-4 text-sm text-accent hover:underline font-ui"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && deals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Tag className="h-10 w-10 text-muted/30 mb-4" />
          <p className="text-muted font-body text-sm">
            No active deals found in this category.
          </p>
          <p className="text-xs text-muted/50 font-body mt-2">
            Check back soon — new deals are added daily.
          </p>
        </div>
      )}

      {/* Deal Grid */}
      {!loading && !error && deals.length > 0 && (
        <>
          <p className="text-xs text-muted font-body mb-6">
            Showing {deals.length} of {total} active deals
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg text-xs font-ui font-semibold bg-onyx text-muted hover:text-softWhite border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - page) <= 2
                )
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="text-muted/40 text-xs">...</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-xs font-ui font-semibold transition-all ${
                        p === page
                          ? "bg-accent text-obsidian"
                          : "bg-onyx text-muted hover:text-softWhite border border-white/10"
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg text-xs font-ui font-semibold bg-onyx text-muted hover:text-softWhite border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
