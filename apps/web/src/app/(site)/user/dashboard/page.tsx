import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@alaya/db/client";
import { cn } from "@alaya/ui";
import { Heart, Bell, Star, Clock, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@alaya/utils";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/?sign-in=true");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, name: true },
  });
  if (!user) redirect("/?sign-in=true");

  const [wishlistCount, alertCount, reviewCount, savedCount, recentProducts, recentReviews] = await Promise.all([
    prisma.wishlist.count({ where: { userId: user.id } }),
    prisma.priceAlert.count({ where: { userId: user.id, isActive: true } }),
    prisma.review.count({ where: { userId: user.id } }),
    prisma.savedProduct.count({ where: { userId: user.id } }),
    prisma.recentlyViewed.findMany({
      where: { userId: user.id },
      orderBy: { viewedAt: "desc" },
      take: 5,
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
    }),
    prisma.review.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        product: { select: { title: true, slug: true } },
      },
    }),
  ]);

  const stats = [
    {
      label: "Saved Items",
      value: String(savedCount),
      icon: Heart,
      href: "/user/wishlists",
      color: "text-coral",
      bg: "bg-coral/10",
    },
    {
      label: "Price Alerts",
      value: String(alertCount),
      icon: Bell,
      href: "/user/alerts",
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Reviews",
      value: String(reviewCount),
      icon: Star,
      href: "/user/reviews",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      label: "Wishlists",
      value: String(wishlistCount),
      icon: TrendingUp,
      href: "/user/wishlists",
      color: "text-cyan",
      bg: "bg-cyan/10",
    },
  ] as const;

  const hasNoData = savedCount === 0 && alertCount === 0 && reviewCount === 0 && recentProducts.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-medium">Dashboard</h1>
          {user.name && (
            <p className="text-sm text-muted font-body mt-1">Welcome back, {user.name}</p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="p-6 rounded-xl border border-white/10 bg-graphite/30 hover:bg-graphite/50 transition-all group"
          >
            <div
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center mb-4",
                stat.bg
              )}
            >
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </div>
            <p className="text-2xl font-heading font-medium text-softWhite">
              {stat.value}
            </p>
            <p className="text-sm text-muted font-body mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recently Viewed */}
        <div className="rounded-xl border border-white/10 bg-graphite/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted" />
              Recently Viewed
            </h2>
          </div>
          {recentProducts.length > 0 ? (
            <div className="space-y-3">
              {recentProducts.map((rv) => (
                <Link
                  key={rv.product.id}
                  href={`/${rv.product.category.slug}/${rv.product.slug}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-onyx overflow-hidden shrink-0 flex items-center justify-center">
                    <span className="text-xs text-muted font-ui">
                      {rv.product.brand?.[0] ?? rv.product.title[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-softWhite group-hover:text-accent transition-colors truncate font-body">
                      {rv.product.title}
                    </p>
                    <p className="text-xs text-muted font-body">
                      {rv.product.brand ?? rv.product.category.name}
                      {rv.product.basePrice && (
                        <span className="ml-2">
                          {formatCurrency(Number(rv.product.basePrice), rv.product.currency)}
                        </span>
                      )}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted font-body text-center py-8">
              Products you view will appear here.
            </p>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="rounded-xl border border-white/10 bg-graphite/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" />
              Recent Reviews
            </h2>
            {reviewCount > 0 && (
              <Link
                href="/user/reviews"
                className="text-xs text-accent hover:underline font-ui"
              >
                View all
              </Link>
            )}
          </div>
          {recentReviews.length > 0 ? (
            <div className="space-y-3">
              {recentReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-3 w-3 rounded-full",
                          i < rev.rating ? "bg-amber-400" : "bg-white/10"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-softWhite font-body truncate">
                    {rev.title || rev.body.slice(0, 80)}
                  </p>
                  <Link
                    href={`/product/${rev.product.slug}`}
                    className="text-xs text-muted hover:text-accent transition-colors font-body"
                  >
                    on {rev.product.title}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted font-body text-center py-8">
              Reviews you write will appear here.
            </p>
          )}
        </div>
      </div>

      {/* Empty State */}
      {hasNoData && (
        <div className="mt-8 p-12 rounded-xl border border-white/10 bg-graphite/30 text-center">
          <p className="text-muted font-body">
            Start exploring products and saving your favorites!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-4 text-sm text-accent hover:underline font-ui"
          >
            Browse Products &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
