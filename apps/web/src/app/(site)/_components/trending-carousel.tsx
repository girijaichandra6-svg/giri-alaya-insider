"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/shared/product-card";
import type { ProductCardData } from "@/components/shared/product-card";

interface TrendingCarouselProps {
  products: ProductCardData[];
}

export function TrendingCarousel({ products }: TrendingCarouselProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -400 : 400;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <div className="relative group">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-6 px-6 pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div
            key={product.slug}
            className="snap-start shrink-0 w-[260px]"
          >
            <ProductCard product={product} variant="compact" />
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-3 rounded-full border border-white/10 bg-obsidian/80 backdrop-blur-sm text-muted hover:text-softWhite opacity-0 group-hover:opacity-100 transition-all"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-3 rounded-full border border-white/10 bg-obsidian/80 backdrop-blur-sm text-muted hover:text-softWhite opacity-0 group-hover:opacity-100 transition-all"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
