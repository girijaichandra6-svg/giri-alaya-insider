"use client";

import * as React from "react";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { formatDate } from "@alaya/utils";
import { ReviewStars } from "@/components/shared/review-stars";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ReviewData } from "@/lib/api";

interface ProductReviewsProps {
  reviews: ReviewData[];
  productId: string;
}

export function ProductReviews({ reviews, productId: _productId }: ProductReviewsProps) {
  const [showForm, setShowForm] = React.useState(false);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="font-heading text-2xl font-medium mb-1">
            Customer Reviews
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3">
              <ReviewStars rating={avgRating} size="lg" />
              <span className="text-sm text-muted font-body">
                {avgRating.toFixed(1)} out of 5 ({reviews.length} reviews)
              </span>
            </div>
          )}
        </div>
        <Button variant="outline" onClick={() => setShowForm(!showForm)}>
          Write a Review
        </Button>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="mb-8 p-6 rounded-xl border border-white/10 bg-graphite">
          <h3 className="font-ui font-semibold text-softWhite mb-4">
            Write Your Review
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-2 font-ui">
                Rating
              </label>
              <ReviewStars rating={0} size="lg" interactive />
            </div>
            <div>
              <label className="block text-sm text-muted mb-2 font-ui">
                Review
              </label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-onyx px-4 py-3 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                placeholder="Share your experience..."
              />
            </div>
            <Button>Submit Review</Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted/30 mb-4" />
          <p className="text-muted font-body">
            No reviews yet. Be the first to review!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="p-6 rounded-xl border border-white/5 bg-graphite/30">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.user.avatarUrl || undefined} />
                    <AvatarFallback>
                      {(review.user.name || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-softWhite font-ui">
                      {review.user.name || "Anonymous"}
                    </p>
                    <p className="text-xs text-muted font-body">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                <ReviewStars rating={review.rating} size="sm" />
              </div>

              {review.title && (
                <h4 className="font-ui font-semibold text-softWhite mb-1">
                  {review.title}
                </h4>
              )}
              <p className="text-sm text-softWhite/80 leading-relaxed font-body">
                {review.body}
              </p>

              {(review.pros || review.cons) && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {review.pros && (
                    <div className="p-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5">
                      <span className="text-xs font-ui font-semibold text-emerald-400 uppercase tracking-wider">
                        Pros
                      </span>
                      <p className="text-sm text-softWhite/70 mt-1 font-body">
                        {review.pros}
                      </p>
                    </div>
                  )}
                  {review.cons && (
                    <div className="p-3 rounded-lg border border-coral/10 bg-coral/5">
                      <span className="text-xs font-ui font-semibold text-coral uppercase tracking-wider">
                        Cons
                      </span>
                      <p className="text-sm text-softWhite/70 mt-1 font-body">
                        {review.cons}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 mt-4">
                <button className="flex items-center gap-1 text-xs text-muted hover:text-softWhite transition-colors">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Helpful ({review.helpfulCount})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
