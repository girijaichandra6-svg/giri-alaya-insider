"use client";

import { ArrowUpRight, Star } from "lucide-react";
import { formatCurrency } from "@alaya/utils";
import { Button } from "@/components/ui/button";
import type { AffiliateLinkData } from "@/lib/api";

interface PriceComparisonProps {
  affiliateLinks: AffiliateLinkData[];
  currency: string;
}

export function PriceComparison({
  affiliateLinks,
  currency,
}: PriceComparisonProps) {
  if (affiliateLinks.length === 0) {
    return (
      <div>
        <h2 className="font-heading text-2xl font-medium mb-6">
          Where to Buy
        </h2>
        <p className="text-muted font-body">
          No retailers listed yet. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-heading text-2xl font-medium mb-6">
        Price Comparison
      </h2>
      <div className="space-y-3">
        {affiliateLinks.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-white/20 transition-colors bg-graphite/50"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-onyx flex items-center justify-center text-xs font-ui text-muted">
                {link.retailer.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-softWhite font-ui">
                  {link.retailer.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-muted">
                      {link.retailer.trustScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-ui font-semibold text-softWhite">
                {formatCurrency(0, currency)}
              </span>
              <a
                href={`/go/${link.id}`}
                target="_blank"
                rel="sponsored nofollow noopener"
              >
                <Button size="sm" variant="primary">
                  <span className="hidden sm:inline">Buy at</span>{" "}
                  {link.retailer.name}
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </a>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted/50 mt-4 font-body">
        Prices may vary by retailer. Clicking &ldquo;Buy&rdquo; will redirect
        you to the retailer&apos;s website.
      </p>
    </div>
  );
}
