import { Suspense } from "react";
import { prisma } from "@alaya/db/client";
import { DealsClient } from "./_components/deals-client";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import type { DealsResponse } from "./_components/deals-client";

export const metadata = {
  title: "Deals & Discounts",
  description:
    "Curated deals and exclusive discounts across premium products. Updated daily.",
};

// Pre-fetch first page of deals for SSR/ISR
async function getInitialDeals(): Promise<DealsResponse | null> {
  try {
    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where: {
          isActive: true,
          endDate: { gte: new Date() },
        },
        orderBy: { endDate: "asc" },
        take: 24,
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              title: true,
              brand: true,
              imageUrls: true,
              basePrice: true,
              currency: true,
              description: true,
              category: {
                select: { slug: true, name: true, accentColor: true },
              },
              subcategory: {
                select: { slug: true, name: true },
              },
              affiliateLinks: {
                where: { isActive: true },
                select: { id: true, url: true, priority: true },
                orderBy: { priority: "desc" },
                take: 1,
              },
            },
          },
          retailer: {
            select: { id: true, name: true, logoUrl: true },
          },
        },
      }),
      prisma.deal.count({
        where: {
          isActive: true,
          endDate: { gte: new Date() },
        },
      }),
    ]);

    return {
      deals: deals.map((deal) => ({
        id: deal.id,
        title: deal.title,
        description: deal.description,
        code: deal.code,
        discount: deal.discount,
        retailer: deal.retailer,
        startDate: deal.startDate.toISOString(),
        endDate: deal.endDate.toISOString(),
        product: {
          ...deal.product,
          basePrice: deal.product.basePrice ? Number(deal.product.basePrice) : null,
        },
        url: deal.product.affiliateLinks[0]?.url || null,
      })),
      total,
      page: 1,
      totalPages: Math.ceil(total / 24),
    };
  } catch {
    return null;
  }
}

export default async function DealsPage() {
  const initialDeals = await getInitialDeals();

  return (
    <main className="pt-28 pb-24">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <Breadcrumbs items={[{ label: "Deals" }]} />
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <span className="text-xs font-ui font-semibold uppercase tracking-[0.2em] text-accent">
          Savings
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-medium mt-3 mb-4">
          Deals &amp; Discounts
        </h1>
        <p className="text-muted font-body text-sm max-w-xl">
          Curated deals across premium products. Updated daily — grab them
          before they&apos;re gone.
        </p>
      </div>

      {/* Client-side filtering and deal grid */}
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-graphite/30 animate-pulse h-96"
                />
              ))}
            </div>
          </div>
        }
      >
        <DealsClient initialData={initialDeals} />
      </Suspense>
    </main>
  );
}
