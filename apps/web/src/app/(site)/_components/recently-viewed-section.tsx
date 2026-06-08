"use client";

import { useRecentlyViewed } from "@/stores/recently-viewed";
import { useState, useEffect } from "react";
import { ProductCard } from "@/components/shared/product-card";
import type { ProductCardData } from "@/components/shared/product-card";

export function RecentlyViewedSection() {
  const [mounted, setMounted] = useState(false);
  const { items } = useRecentlyViewed();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || items.length === 0) return null;

  const products: ProductCardData[] = items.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    brand: item.brand,
    description: "",
    imageUrls: [item.imageUrl],
    basePrice: item.basePrice,
    currency: item.currency,
    category: {
      slug: item.categorySlug,
      name: item.categorySlug,
      accentColor: "#D4FF00",
    },
  }));

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-xs font-ui font-semibold uppercase tracking-[0.2em] text-muted">
            Continue Exploring
          </span>
          <h2 className="section-heading mt-2">Recently Viewed</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.slice(0, 6).map((product) => (
          <ProductCard
            key={product.slug}
            product={product}
            variant="compact"
          />
        ))}
      </div>
    </div>
  );
}
