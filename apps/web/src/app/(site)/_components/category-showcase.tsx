"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { categories } from "@alaya/config";


export function CategoryShowcase() {
  const catList = Object.values(categories);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {catList.map((cat, index) => (
        <motion.div
          key={cat.slug}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          <Link
            href={`/${cat.slug}`}
            className="group relative block rounded-2xl overflow-hidden"
          >
            <div
              className="relative aspect-[4/5] md:aspect-[3/4]"
              style={{
                background: `linear-gradient(135deg, ${cat.accentColor}15, ${cat.accentColor}05)`,
              }}
            >
              {/* Accent border glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  boxShadow: `inset 0 0 0 1px ${cat.accentColor}30`,
                }}
              />

              {/* Icon/Pattern area */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="h-24 w-24 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                  style={{ backgroundColor: cat.accentColor }}
                />
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <span className="text-xs font-ui font-semibold uppercase tracking-[0.2em] mb-2 transition-colors"
                  style={{ color: cat.accentColor }}>
                  {cat.slug === "electronics" ? "Tech" :
                   cat.slug === "fashion" ? "Style" :
                   cat.slug === "beauty" ? "Glow" :
                   cat.slug === "home-living" ? "Home" :
                   cat.slug === "travel" ? "Wander" :
                   cat.slug === "health-wellness" ? "Wellness" :
                   cat.slug === "food-nutrition" ? "Taste" : "Explore"}
                </span>
                <h3 className="font-heading text-2xl md:text-3xl font-medium text-softWhite mb-2">
                  {cat.name}
                </h3>
                <p className="text-sm text-muted font-body line-clamp-2">
                  {cat.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-ui text-softWhite/60 group-hover:text-softWhite transition-colors">
                  <span>Explore</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
