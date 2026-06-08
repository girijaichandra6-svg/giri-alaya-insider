"use client";

import * as React from "react";
import { Heart, Share2, Bell } from "lucide-react";
import { formatCurrency } from "@alaya/utils";
import { useCurrency } from "@/stores/currency-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ReviewStars } from "@/components/shared/review-stars";
import { useWishlist } from "@/stores/wishlist";
import { useRecentlyViewed } from "@/stores/recently-viewed";
import type { ProductDetail } from "@/lib/api";
import { cn } from "@alaya/ui";

interface ProductInfoProps {
  product: ProductDetail;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { toggleItem, hasItem } = useWishlist();
  const { addItem } = useRecentlyViewed();
  const { convertPrice, selectedCurrency } = useCurrency();
  const [priceAlert, setPriceAlert] = React.useState(false);

  const isWishlisted = hasItem(product.slug);
  const avgRating = product.productScores?.[0]?.score || 0;

  // Track recently viewed
  React.useEffect(() => {
    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      brand: product.brand,
      imageUrl: product.imageUrls?.[0] || "/images/placeholder.svg",
      basePrice: product.basePrice ? Number(product.basePrice) : null,
      currency: product.currency,
      categorySlug: product.category.slug,
    });
  }, []);

  const wishlistData = {
    id: product.id,
    slug: product.slug,
    title: product.title,
    brand: product.brand,
    imageUrl: product.imageUrls?.[0] || "/images/placeholder.svg",
    basePrice: product.basePrice ? Number(product.basePrice) : null,
    currency: product.currency,
    categorySlug: product.category.slug,
  };

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <div className="space-y-6">
      {/* Brand & Category */}
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          style={{
            borderColor: `${product.category.accentColor}40`,
            color: product.category.accentColor,
          }}
        >
          {product.category.name}
        </Badge>
        {product.brand && (
          <span className="text-sm font-ui text-muted">{product.brand}</span>
        )}
      </div>

      {/* Title */}
      <h1 className="font-heading text-3xl md:text-4xl font-medium tracking-tight leading-tight text-softWhite">
        {product.title}
      </h1>

      {/* Rating */}
      {avgRating > 0 && (
        <div className="flex items-center gap-3">
          <ReviewStars rating={avgRating} size="md" />
          <span className="text-sm text-muted font-body">
            ({product.reviews.length} reviews)
          </span>
        </div>
      )}

      <Separator />

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="font-heading text-4xl font-medium text-softWhite">
          {product.basePrice
            ? formatCurrency(convertPrice(Number(product.basePrice)), selectedCurrency)
            : "Price unavailable"}
        </span>
        {product.deals?.[0]?.discount && (
          <Badge variant="danger">
            -{product.deals[0].discount}% off
          </Badge>
        )}
      </div>

      {/* Deal info */}
      {product.deals?.[0] && (
        <div className="rounded-xl border border-coral/20 bg-coral/5 p-4">
          <p className="text-sm font-ui font-semibold text-coral">
            {product.deals[0].title}
          </p>
          {product.deals[0].code && (
            <p className="text-xs text-muted mt-1 font-body">
              Use code: <span className="font-mono text-softWhite">{product.deals[0].code}</span>
            </p>
          )}
        </div>
      )}

      {/* Description */}
      <div>
        <h3 className="text-xs font-ui font-semibold uppercase tracking-wider text-muted mb-2">
          Description
        </h3>
        <p className="text-sm text-softWhite/80 leading-relaxed font-body">
          {product.description}
        </p>
      </div>

      {/* Specs */}
      {product.specs && (
        <div>
          <h3 className="text-xs font-ui font-semibold uppercase tracking-wider text-muted mb-3">
            Key Features
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(product.specs).slice(0, 6).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <span className="text-[10px] font-ui text-muted uppercase tracking-wider">
                  {key}
                </span>
                <span className="text-sm text-softWhite font-body">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={() => toggleItem(wishlistData)}
          className="flex-1"
        >
          <Heart
            className={cn(
              "h-5 w-5 mr-2",
              isWishlisted ? "fill-coral text-coral" : ""
            )}
          />
          {isWishlisted ? "Saved" : "Save"}
        </Button>
        <Button variant="ghost" size="lg" onClick={handleShare}>
          <Share2 className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setPriceAlert(!priceAlert)}
          className={cn(priceAlert && "text-accent")}
        >
          <Bell className="h-5 w-5" />
        </Button>
      </div>

      {/* Price Alert Form */}
      {priceAlert && (
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
          <p className="text-sm font-ui font-semibold text-softWhite mb-2">
            Set Price Alert
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Target price"
              className="flex-1 rounded-lg border border-white/10 bg-onyx px-3 py-2 text-sm text-softWhite"
            />
            <Button size="sm">
              Notify Me
            </Button>
          </div>
        </div>
      )}

      {/* Tags */}
      {product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.tags.map((t) => (
            <Badge key={t.tag.name} variant="secondary" className="text-[10px]">
              {t.tag.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
