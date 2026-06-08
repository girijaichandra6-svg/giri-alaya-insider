import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@alaya/db/client";
import type { Metadata } from "next";
import { AlertsList } from "./_components/alerts-list";

export const metadata: Metadata = {
  title: "Price Alerts | ALAYA INSIDER",
  robots: { index: false, follow: false },
};

export default async function AlertsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/?sign-in=true");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });
  if (!user) redirect("/?sign-in=true");

  const alerts = await prisma.priceAlert.findMany({
    where: { userId: user.id },
    orderBy: { id: "desc" },
    include: {
      product: {
        select: {
          id: true,
          slug: true,
          title: true,
          basePrice: true,
          currency: true,
          imageUrls: true,
          category: { select: { slug: true } },
        },
      },
    },
  });

  const alertData = alerts.map((alert) => ({
    id: alert.id,
    targetPrice: Number(alert.targetPrice),
    currency: alert.currency,
    isActive: alert.isActive,
    product: {
      id: alert.product.id,
      slug: alert.product.slug,
      title: alert.product.title,
      basePrice: alert.product.basePrice ? Number(alert.product.basePrice) : null,
      currency: alert.product.currency,
      imageUrls: alert.product.imageUrls,
      category: alert.product.category,
    },
  }));

  const activeCount = alerts.filter((a) => a.isActive).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-medium">Price Alerts</h1>
          <p className="text-sm text-muted font-body mt-1">
            {activeCount > 0
              ? `${activeCount} active alert${activeCount === 1 ? "" : "s"} monitoring prices`
              : alerts.length > 0
              ? "All alerts are paused"
              : "Track prices and get notified when they drop"}
          </p>
        </div>
      </div>

      <AlertsList alerts={alertData} />
    </div>
  );
}
