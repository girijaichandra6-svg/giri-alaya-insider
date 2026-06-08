"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@alaya/ui";
import { Badge } from "@/components/ui/badge";

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  imageUrl?: string;
  accentColor?: string;
  overlay?: boolean;
  badge?: string;
  align?: "left" | "center" | "right";
  size?: "sm" | "md" | "lg" | "full";
  className?: string;
}

export function HeroBanner({
  title,
  subtitle,
  description,
  ctaText,
  ctaHref,
  imageUrl,
  accentColor = "#D4FF00",
  overlay = true,
  badge,
  align = "center",
  size = "lg",
  className,
}: HeroBannerProps) {
  const alignClasses = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  };

  const sizeClasses = {
    sm: "min-h-[30vh] py-16",
    md: "min-h-[50vh] py-24",
    lg: "min-h-[70vh] py-32",
    full: "min-h-screen py-40",
  };

  return (
    <section
      className={cn(
        "relative flex",
        sizeClasses[size],
        alignClasses[align],
        className
      )}
    >
      {/* Background */}
      {imageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-obsidian via-onyx to-graphite" />
      )}

      {overlay && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, rgba(10,10,10,0.3), rgba(10,10,10,0.8))`,
          }}
        />
      )}

      {/* Accent gradient */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse at center, ${accentColor}20 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn("max-w-3xl", align === "center" && "mx-auto")}
        >
          {badge && (
            <Badge
              variant="outline"
              className="mb-6"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              {badge}
            </Badge>
          )}
          {subtitle && (
            <p
              className="text-sm font-ui font-semibold uppercase tracking-[0.2em] mb-4"
              style={{ color: accentColor }}
            >
              {subtitle}
            </p>
          )}
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-tight text-softWhite">
            {title}
          </h1>
          {description && (
            <p className="mt-6 text-lg md:text-xl text-muted max-w-2xl font-body leading-relaxed">
              {description}
            </p>
          )}
          {ctaText && ctaHref && (
            <motion.a
              href={ctaHref}
              className="mt-10 inline-flex items-center gap-2 rounded-lg px-8 py-4 font-ui font-semibold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: accentColor, color: "#0A0A0A" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {ctaText}
              <span aria-hidden="true">&rarr;</span>
            </motion.a>
          )}
        </motion.div>
      </div>
    </section>
  );
}
