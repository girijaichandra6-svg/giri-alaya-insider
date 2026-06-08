"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@alaya/ui";

interface ReviewStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

export function ReviewStars({
  rating,
  maxRating = 5,
  size = "sm",
  interactive = false,
  onChange,
  showValue = false,
  className,
}: ReviewStarsProps) {
  const [hoveredRating, setHoveredRating] = React.useState(0);
  const displayRating = hoveredRating || rating;

  const sizeMap = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onMouseEnter={() => interactive && setHoveredRating(star)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
          onClick={() => {
            if (interactive && onChange) {
              onChange(star === rating ? 0 : star);
            }
          }}
          className={cn(
            "transition-all duration-150",
            interactive && "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            className={cn(
              sizeMap[size],
              "transition-colors",
              star <= displayRating
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-white/20"
            )}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-1.5 text-sm text-muted font-body">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
