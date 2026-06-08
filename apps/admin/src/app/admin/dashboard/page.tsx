import { prisma } from "@alaya/db/client";
import {
  Package,
  FileText,
  Users,
  MousePointerClick,
  Building2,
  Tag,
  LayoutGrid,
  Clock,
  TrendingUp,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

async function getStats() {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    productCount,
    postCount,
    userCount,
    clickCount24h,
    brandCount,
    dealCount,
    collectionCount,
    subcategoryCount,
    couponCount,
    affiliateNetworkCount,
    expiringDeals,
    recentConversions,
    recentProducts,
    recentPosts,
  ] = await Promise.all([
    // Existing counts
    prisma.product.count({ where: { isActive: true } }),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count(),

    // Clicks in last 24h
    prisma.click.count({
      where: { timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),

    // Entity counts
    prisma.brand.count(),
    prisma.deal.count({ where: { isActive: true, endDate: { gte: now } } }),
    prisma.collection.count({ where: { isPublic: true } }),
    prisma.subcategory.count(),
    prisma.coupon.count(),
    prisma.affiliateNetwork.count(),

    // Expiring deals — next 7 days
    prisma.deal.findMany({
      where: {
        isActive: true,
        endDate: { gte: now, lte: sevenDaysFromNow },
      },
      orderBy: { endDate: "asc" },
      take: 10,
      select: {
        id: true,
        title: true,
        discount: true,
        endDate: true,
        code: true,
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            basePrice: true,
            currency: true,
            imageUrls: true,
            category: { select: { name: true, accentColor: true } },
          },
        },
        retailer: { select: { name: true } },
      },
    }),

    // Revenue — last 30 days conversions
    prisma.conversion.findMany({
      where: {
        timestamp: { gte: thirtyDaysAgo },
        status: { in: ["confirmed", "paid"] },
      },
      orderBy: { timestamp: "desc" },
      take: 20,
      select: {
        id: true,
        amount: true,
        commission: true,
        currency: true,
        status: true,
        timestamp: true,
        orderId: true,
        affiliateLink: {
          select: {
            product: { select: { title: true, slug: true } },
            retailer: { select: { name: true } },
          },
        },
      },
    }),

    // Existing recent lists
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        basePrice: true,
        currency: true,
        category: { select: { name: true, accentColor: true } },
        _count: { select: { affiliateLinks: true } },
      },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        publishedAt: true,
        category: { select: { name: true, accentColor: true } },
      },
    }),
  ]);

  // Aggregate revenue from the fetched conversions
  const totalRevenue = recentConversions.reduce(
    (sum, c) => sum + Number(c.amount),
    0
  );
  const totalCommission = recentConversions.reduce(
    (sum, c) => sum + Number(c.commission || 0),
    0
  );

  return {
    productCount,
    postCount,
    userCount,
    clickCount24h,
    brandCount,
    dealCount,
    collectionCount,
    subcategoryCount,
    couponCount,
    affiliateNetworkCount,
    expiringDeals,
    recentConversions,
    totalRevenue,
    totalCommission,
    recentProducts,
    recentPosts,
  };
}

export const metadata = {
  title: "Dashboard | ALAYA INSIDER Admin",
};

export default async function AdminDashboardPage() {
  const stats = await getStats();

  // ── Stat Cards ──────────────────────────────────────────
  const statCards = [
    {
      label: "Active Products",
      value: stats.productCount,
      icon: Package,
      color: "text-cyan",
      bg: "bg-cyan/10",
      change: `${stats.subcategoryCount} subcategories`,
    },
    {
      label: "Published Posts",
      value: stats.postCount,
      icon: FileText,
      color: "text-accent",
      bg: "bg-accent/10",
      change: `${stats.postCount} total`,
    },
    {
      label: "Registered Users",
      value: stats.userCount,
      icon: Users,
      color: "text-coral",
      bg: "bg-coral/10",
      change: `${stats.userCount} total`,
    },
    {
      label: "Clicks (24h)",
      value: stats.clickCount24h,
      icon: MousePointerClick,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      change: "Last 24 hours",
    },
    {
      label: "Brands",
      value: stats.brandCount,
      icon: Building2,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
      change: `${stats.brandCount} total`,
    },
    {
      label: "Active Deals",
      value: stats.dealCount,
      icon: Tag,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      change: `${stats.couponCount} coupons`,
    },
    {
      label: "Collections",
      value: stats.collectionCount,
      icon: LayoutGrid,
      color: "text-pink-400",
      bg: "bg-pink-400/10",
      change: `${stats.affiliateNetworkCount} affiliate networks`,
    },
  ];

  // ── Revenue Summary ─────────────────────────────────────
  function formatCurrency(amount: number, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-medium">Dashboard</h1>
        <p className="text-sm text-muted font-body mt-1">
          Overview of your ALAYA INSIDER platform
        </p>
      </div>

      {/* Stat Cards — now 7 across */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 mb-10">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/10 bg-graphite/30 p-5 hover:bg-graphite/50 transition-colors"
          >
            <div
              className={`h-9 w-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}
            >
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="text-xl font-heading font-medium text-softWhite">
              {stat.value.toLocaleString()}
            </p>
            <p className="text-xs text-muted font-body mt-0.5">
              {stat.label}
            </p>
            <p className="text-[10px] text-muted/60 font-body mt-0.5">
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue + Expiring Deals row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Summary */}
        <div className="rounded-xl border border-white/10 bg-graphite/30 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-lg bg-emerald-400/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-medium">
                Revenue (30d)
              </h2>
              <p className="text-[10px] text-muted/60 font-body">
                Confirmed &amp; paid conversions
              </p>
            </div>
          </div>

          <div className="mb-5">
            <p className="text-3xl font-heading font-medium text-softWhite">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <p className="text-sm text-muted font-body mt-1">
              {stats.totalCommission > 0
                ? `Commission: ${formatCurrency(stats.totalCommission)}`
                : "No commission data yet"}
            </p>
          </div>

          {/* Recent conversions */}
          <div>
            <h3 className="text-xs font-ui font-semibold uppercase tracking-wider text-muted mb-3">
              Recent Conversions ({stats.recentConversions.length})
            </h3>
            {stats.recentConversions.length > 0 ? (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {stats.recentConversions.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-softWhite font-body truncate">
                        {conv.affiliateLink?.product?.title ||
                          conv.orderId ||
                          "Conversion"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {conv.affiliateLink?.retailer?.name && (
                          <span className="text-[10px] text-muted/60 font-body">
                            {conv.affiliateLink.retailer.name}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-ui font-semibold uppercase ${
                            conv.status === "paid"
                              ? "text-emerald-400"
                              : conv.status === "confirmed"
                              ? "text-accent"
                              : "text-amber-400"
                          }`}
                        >
                          {conv.status}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-ui font-semibold text-softWhite shrink-0 ml-3">
                      {formatCurrency(Number(conv.amount), conv.currency)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <TrendingUp className="h-8 w-8 text-muted/20 mb-2" />
                <p className="text-xs text-muted font-body">
                  No conversions yet
                </p>
                <p className="text-[10px] text-muted/50 font-body mt-1">
                  Data appears once affiliate sales are recorded
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Expiring Deals — spans 2 columns */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-graphite/30 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-lg bg-coral/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-coral" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-medium">
                Expiring Deals
              </h2>
              <p className="text-[10px] text-muted/60 font-body">
                Next 7 days &middot;{" "}
                {stats.expiringDeals.length} deal
                {stats.expiringDeals.length !== 1 ? "s" : ""} ending soon
              </p>
            </div>
          </div>

          {stats.expiringDeals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-[10px] font-ui font-semibold uppercase tracking-wider text-muted pb-3 pr-4">
                      Product
                    </th>
                    <th className="text-left text-[10px] font-ui font-semibold uppercase tracking-wider text-muted pb-3 pr-4">
                      Deal
                    </th>
                    <th className="text-left text-[10px] font-ui font-semibold uppercase tracking-wider text-muted pb-3 pr-4">
                      Discount
                    </th>
                    <th className="text-left text-[10px] font-ui font-semibold uppercase tracking-wider text-muted pb-3 pr-4">
                      Retailer
                    </th>
                    <th className="text-right text-[10px] font-ui font-semibold uppercase tracking-wider text-muted pb-3">
                      Ends
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.expiringDeals.map((deal) => {
                    const daysLeft = Math.ceil(
                      (deal.endDate.getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    );

                    return (
                      <tr
                        key={deal.id}
                        className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-softWhite font-body truncate max-w-[200px]">
                                {deal.product?.title || deal.title}
                              </p>
                              {deal.product?.category && (
                                <span
                                  className="text-[10px] font-ui font-semibold"
                                  style={{
                                    color: deal.product.category.accentColor,
                                  }}
                                >
                                  {deal.product.category.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-softWhite font-body">
                              {deal.title}
                            </span>
                            {deal.code && (
                              <span className="text-[10px] font-ui font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                                {deal.code}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          {deal.discount ? (
                            <span className="text-sm font-ui font-semibold text-coral">
                              -{deal.discount}%
                            </span>
                          ) : (
                            <span className="text-xs text-muted/50 font-body">
                              —
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-sm text-muted font-body">
                            {deal.retailer?.name || "—"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Clock className="h-3 w-3 text-coral" />
                            <span
                              className={`text-xs font-ui font-semibold ${
                                daysLeft <= 1
                                  ? "text-coral"
                                  : daysLeft <= 3
                                  ? "text-amber-400"
                                  : "text-muted"
                              }`}
                            >
                              {daysLeft === 0
                                ? "Today"
                                : daysLeft === 1
                                ? "Tomorrow"
                                : `${daysLeft} days`}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 text-center">
              <Clock className="h-10 w-10 text-muted/20 mb-3" />
              <p className="text-sm text-muted font-body">
                No deals expiring in the next 7 days
              </p>
              <p className="text-xs text-muted/50 font-body mt-1">
                All active deals have at least a week remaining
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Products & Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-white/10 bg-graphite/30 p-6">
          <h2 className="font-heading text-lg font-medium mb-4">
            Recent Products
          </h2>
          {stats.recentProducts.length > 0 ? (
            <div className="space-y-3">
              {stats.recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-softWhite font-body truncate">
                      {product.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-[10px] font-ui font-semibold"
                        style={{ color: product.category.accentColor }}
                      >
                        {product.category.name}
                      </span>
                      {product.basePrice && (
                        <span className="text-xs text-muted font-body">
                          ${Number(product.basePrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted font-body shrink-0 ml-3">
                    {product._count.affiliateLinks} links
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted font-body text-center py-8">
              No products yet.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-graphite/30 p-6">
          <h2 className="font-heading text-lg font-medium mb-4">
            Recent Posts
          </h2>
          {stats.recentPosts.length > 0 ? (
            <div className="space-y-3">
              {stats.recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-softWhite font-body truncate">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-ui font-semibold uppercase tracking-wider text-muted">
                        {post.type}
                      </span>
                      {post.category && (
                        <span
                          className="text-[10px] font-ui font-semibold"
                          style={{ color: post.category.accentColor }}
                        >
                          {post.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                  {post.publishedAt && (
                    <span className="text-xs text-muted font-body shrink-0 ml-3">
                      {post.publishedAt.toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted font-body text-center py-8">
              No posts yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
