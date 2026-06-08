import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@alaya/db/client";
import type { Metadata } from "next";
import { Star, Calendar } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@alaya/utils";
import { cn } from "@alaya/ui";
import { EditReviewDialog } from "./_components/edit-review-dialog";

export const metadata: Metadata = {
  title: "My Reviews | ALAYA INSIDER",
  robots: { index: false, follow: false },
};

export default async function ReviewsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/?sign-in=true");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });
  if (!user) redirect("/?sign-in=true");

  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          id: true,
          slug: true,
          title: true,
          brand: true,
          imageUrls: true,
          basePrice: true,
          currency: true,
          category: { select: { slug: true, name: true, accentColor: true } },
        },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-medium">My Reviews</h1>
          <p className="text-sm text-muted font-body mt-1">
            {reviews.length > 0
              ? `You've written ${reviews.length} review${reviews.length === 1 ? "" : "s"}`
              : "Reviews you write will appear here"}
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="p-12 rounded-xl border border-white/10 bg-graphite/30 text-center">
          <Star className="h-12 w-12 mx-auto text-muted/30 mb-4" />
          <p className="text-muted font-body mb-2">
            You haven&apos;t written any reviews yet.
          </p>
          <p className="text-sm text-muted/60 font-body mb-6">
            Share your experience with products to help the community.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-accent hover:underline font-ui"
          >
            Browse Products &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-white/10 bg-graphite/30 p-6 hover:bg-graphite/50 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Review content */}
                <div className="flex-1 min-w-0">
                  {/* Product info */}
                  <Link
                    href={`/${review.product.category.slug}/${review.product.slug}`}
                    className="text-xs text-muted hover:text-accent transition-colors font-body block mb-2"
                  >
                    on {review.product.title}
                    {review.product.brand && <span> &middot; {review.product.brand}</span>}
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5 rounded-full",
                          i < review.rating ? "bg-amber-400" : "bg-white/10"
                        )}
                      />
                    ))}
                  </div>

                  {/* Title */}
                  {review.title && (
                    <h3 className="font-ui text-sm font-semibold text-softWhite mb-1">
                      {review.title}
                    </h3>
                  )}

                  {/* Body */}
                  <p className="text-sm text-muted font-body leading-relaxed line-clamp-3">
                    {review.body}
                  </p>

                  {/* Date */}
                  <div className="flex items-center gap-2 mt-3">
                    <Calendar className="h-3 w-3 text-muted" />
                    <span className="text-xs text-muted font-body">
                      {formatDate(review.createdAt)}
                    </span>
                    {review.isVerifiedPurchase && (
                      <span className="text-[10px] text-accent font-ui border border-accent/20 bg-accent/5 px-1.5 py-0.5 rounded">
                        Verified Purchase
                      </span>
                    )}
                    <span className="text-xs text-muted font-body">
                      &middot; {review.helpfulCount} found helpful
                    </span>
                  </div>
                </div>

                {/* Edit button */}
                <EditReviewDialog
                  reviewId={review.id}
                  initialRating={review.rating}
                  initialTitle={review.title}
                  initialBody={review.body}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
