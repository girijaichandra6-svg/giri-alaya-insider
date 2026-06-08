"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@alaya/ui";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  const displayImages = images.length > 0
    ? images
    : ["/images/placeholder.svg"];

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-graphite cursor-crosshair group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Image
              src={displayImages[currentIndex] || "/images/placeholder.svg"}
              alt={`${title} - Image ${currentIndex + 1}`}
              fill
              className={cn(
                "object-cover transition-transform duration-200",
                isZoomed && "scale-150"
              )}
              style={
                isZoomed
                  ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` }
                  : undefined
              }
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev === 0 ? displayImages.length - 1 : prev - 1
                )
              }
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-obsidian/60 backdrop-blur-sm text-softWhite opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev === displayImages.length - 1 ? 0 : prev + 1
                )
              }
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-obsidian/60 backdrop-blur-sm text-softWhite opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-obsidian/60 backdrop-blur-sm">
          <span className="text-xs text-softWhite font-ui tabular-nums">
            {currentIndex + 1} / {displayImages.length}
          </span>
        </div>
      </div>

      {/* Thumbnail Strip */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              type="button"
              className={cn(
                "relative h-20 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                index === currentIndex
                  ? "border-accent"
                  : "border-transparent hover:border-white/20"
              )}
            >
              <Image
                src={image || "/images/placeholder.svg"}
                alt={`${title} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
