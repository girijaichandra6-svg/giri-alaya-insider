"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { ProductCardData } from "@/components/shared/product-card";

interface EditorsPicksGridProps {
  products: ProductCardData[];
}

export function EditorsPicksGrid({ products }: EditorsPicksGridProps) {
  const featured = products[0];
  const rest = products.slice(1, 4);

  if (!featured) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Featured */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative group overflow-hidden rounded-2xl md:row-span-2"
      >
        <Link
          href={`/${featured.category.slug}/${featured.slug}`}
          className="block relative h-full"
        >
          <div className="relative aspect-[4/5] md:h-full md:aspect-auto min-h-[400px]">
            <Image
              src={featured.imageUrls?.[0] || "/images/placeholder.svg"}
              alt={featured.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <Badge
              variant="outline"
              className="mb-3"
              style={{
                borderColor: featured.category.accentColor,
                color: featured.category.accentColor,
              }}
            >
              Editor&apos;s Pick
            </Badge>
            <h3 className="font-heading text-2xl md:text-3xl font-medium text-softWhite group-hover:text-accent transition-colors">
              {featured.title}
            </h3>
            <p className="text-sm text-muted mt-2 font-body line-clamp-2">
              {featured.description}
            </p>
          </div>
        </Link>
      </motion.div>

      {/* Smaller cards */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {rest.map((product, index) => (
          <motion.div
            key={product.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="relative group overflow-hidden rounded-2xl"
          >
            <Link
              href={`/${product.category.slug}/${product.slug}`}
              className="block"
            >
              <div className="relative aspect-square">
                <Image
                  src={product.imageUrls?.[0] || "/images/placeholder.svg"}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span
                  className="text-[10px] font-ui font-semibold uppercase tracking-wider"
                  style={{ color: product.category.accentColor }}
                >
                  {product.category.name}
                </span>
                <h4 className="font-ui text-sm font-medium text-softWhite line-clamp-1 group-hover:text-accent transition-colors mt-1">
                  {product.title}
                </h4>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
