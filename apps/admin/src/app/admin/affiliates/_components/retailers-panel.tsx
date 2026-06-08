"use client";

import * as React from "react";
import { ExternalLink, Store, Star } from "lucide-react";

interface Retailer {
  id: string;
  name: string;
  website: string;
  trustScore: number;
  logoUrl: string | null;
  _count: { affiliateLinks: number; deals: number; coupons: number };
}

export function RetailersPanel({ retailers }: { retailers: Retailer[] }) {
  const [showAll, setShowAll] = React.useState(false);
  const displayed = showAll ? retailers : retailers.slice(0, 10);

  return (
    <div className="rounded-xl border border-white/10 bg-obsidian p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <Store className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-medium">Retailers</h2>
          <p className="text-xs text-muted font-body">{retailers.length} total</p>
        </div>
      </div>

      {retailers.length === 0 ? (
        <p className="text-sm text-muted font-body py-8 text-center">No retailers yet.</p>
      ) : (
        <div className="space-y-2">
          {displayed.map((retailer) => (
            <div
              key={retailer.id}
              className="flex items-center gap-4 rounded-lg bg-onyx p-3 hover:bg-white/[0.03] transition-colors"
            >
              {/* Logo */}
              <div className="w-9 h-9 rounded-lg bg-onyx flex items-center justify-center shrink-0 overflow-hidden border border-white/5">
                {retailer.logoUrl ? (
                  <img src={retailer.logoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm text-muted font-ui">{retailer.name.charAt(0)}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-softWhite font-body">{retailer.name}</p>
                <a
                  href={retailer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted font-body hover:text-accent transition-colors inline-flex items-center gap-1"
                >
                  {retailer.website.replace(/^https?:\/\//, "")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-400" />
                    <span className="text-sm font-ui font-semibold text-softWhite">
                      {retailer.trustScore.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted font-ui">Trust</p>
                </div>
                <div className="text-center">
                  <span className="text-sm font-ui font-semibold text-softWhite">
                    {retailer._count.affiliateLinks}
                  </span>
                  <p className="text-[10px] text-muted font-ui">Links</p>
                </div>
                <div className="text-center hidden sm:block">
                  <span className="text-sm font-ui font-semibold text-softWhite">
                    {retailer._count.deals}
                  </span>
                  <p className="text-[10px] text-muted font-ui">Deals</p>
                </div>
              </div>
            </div>
          ))}

          {retailers.length > 10 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full text-xs font-ui text-muted hover:text-accent transition-colors py-2"
            >
              {showAll
                ? "Show less"
                : `Show all ${retailers.length} retailers`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
