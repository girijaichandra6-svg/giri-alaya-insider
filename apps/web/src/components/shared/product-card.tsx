"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@alaya/ui";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@alaya/utils";
import { useWishlist } from "@/stores/wishlist";
import { useCurrency } from "@/stores/currency-store";

export interface ProductCardData {
  id: string;
  slug: string;
  title: string;
  brand: string | null;
  description: string;
  imageUrls: string[];
  basePrice: number | null;
  currency: string;
  category: {
    slug: string;
    name: string;
    accentColor: string;
  };
  subcategory?: {
    slug: string;
    name: string;
  } | null;
  deals?: Array<{
    id: string;
    discount: number | null;
    endDate: string;
  }>;
  avgRating?: number;
  reviewCount?: number;
  isNew?: boolean;
}

interface ProductCardProps {
  product: ProductCardData;
  variant?: "default" | "compact" | "editorial";
  priority?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  variant = "default",
  priority = false,
  className,
}: ProductCardProps) {
  const { toggleItem, hasItem } = useWishlist();
  const { convertPrice, selectedCurrency } = useCurrency();
  const isWishlisted = hasItem(product.slug);
  const imageUrl = product.imageUrls?.[0] || "/images/placeholder.svg";
  const hasDeal = product.deals && product.deals.length > 0;
  const discount = product.deals?.[0]?.discount;

  const displayPrice = product.basePrice
    ? formatCurrency(convertPrice(Number(product.basePrice)), selectedCurrency)
    : "Price unavailable";

  const wishlistData = {
    id: product.id,
    slug: product.slug,
    title: product.title,
    brand: product.brand,
    imageUrl,
    basePrice: product.basePrice,
    currency: product.currency,
    categorySlug: product.category.slug,
  };

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href={`/${product.category.slug}/${product.slug}`}
          className={cn("group block", className)}
        >
          <div className="relative aspect-square rounded-xl overflow-hidden bg-graphite mb-3">
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 25vw"
              priority={priority}
            />
            {hasDeal && (
              <Badge variant="danger" className="absolute top-2 left-2">
                -{discount}%
              </Badge>
            )}
            {product.isNew && (
              <Badge variant="new" className="absolute top-2 right-2">
                New
              </Badge>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleItem(wishlistData);
              }}
              className="absolute top-2 right-2 p-2 rounded-full bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isWishlisted ? "fill-coral text-coral" : "text-softWhite"
                )}
              />
            </button>
          </div>
          <p className="text-xs text-muted font-body mb-1 uppercase tracking-wider">
            {product.brand || product.category.name}
          </p>
          <h3 className="font-ui text-sm font-medium text-softWhite line-clamp-1 group-hover:text-accent transition-colors">
            {product.title}
          </h3>
          <p className="font-ui text-sm font-semibold text-softWhite mt-1">
            {displayPrice}
          </p>
        </Link>
      </motion.div>
    );
  }

  if (variant === "editorial") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <Link
          href={`/${product.category.slug}/${product.slug}`}
          className={cn("group block relative overflow-hidden rounded-2xl", className)}
        >
          <div className="relative aspect-[4/3]">
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="50vw"
              priority={priority}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <Badge
              variant="outline"
              className="mb-3"
              style={{ borderColor: product.category.accentColor, color: product.category.accentColor }}
            >
              {product.category.name}
            </Badge>
            <h3 className="font-heading text-xl font-medium text-softWhite group-hover:text-accent transition-colors line-clamp-2">
              {product.title}
            </h3>
            <p className="text-sm text-muted mt-2 font-body line-clamp-2">
              {product.description}
            </p>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
    >
      <Link
        href={`/${product.category.slug}/${product.slug}`}
        className={cn("group block", className)}
      >
        <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-graphite mb-4">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
          <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/20 transition-colors duration-500" />
          {hasDeal && (
            <Badge variant="danger" className="absolute top-3 left-3">
              -{discount}% Deal
            </Badge>
          )}
          {product.isNew && (
            <Badge variant="new" className="absolute top-3 right-3">
              New Arrival
            </Badge>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleItem(wishlistData);
            }}
            className="absolute top-3 right-3 p-2.5 rounded-full bg-obsidian/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isWishlisted ? "fill-coral text-coral" : "text-softWhite"
              )}
            />
          </button>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-[10px] font-ui font-semibold uppercase tracking-widest"
              style={{ color: product.category.accentColor }}
            >
              {product.category.name}
            </span>
            {product.subcategory && (
              <>
                <span className="text-muted/40">·</span>
                <span className="text-[10px] font-ui text-muted uppercase tracking-wider">
                  {product.subcategory.name}
                </span>
              </>
            )}
            {product.avgRating && (
              <span className="text-xs text-muted">
                ★ {product.avgRating.toFixed(1)}
              </span>
            )}
          </div>
          <h3 className="font-ui text-sm font-medium text-softWhite line-clamp-1 group-hover:text-accent transition-colors">
            {product.title}
          </h3>
          {product.brand && (
            <p className="text-xs text-muted font-body mt-0.5">{product.brand}</p>
          )}
          <p className="font-ui text-base font-semibold text-softWhite mt-2">
            {displayPrice}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
