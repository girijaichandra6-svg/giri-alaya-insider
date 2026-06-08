import { prisma } from "@alaya/db/client";
import { headers } from "next/headers";

export async function recordClick(linkId: string, userId?: string) {
  const headerPayload = await headers();

  const click = await prisma.click.create({
    data: {
      linkId,
      userId: userId || null,
      ip: headerPayload.get("x-forwarded-for") || headerPayload.get("x-real-ip") || null,
      userAgent: headerPayload.get("user-agent") || null,
      country: headerPayload.get("cf-ipcountry") || null,
    },
  });

  return click;
}

export async function getRedirectUrl(
  linkId: string,
  country?: string
): Promise<string | null> {
  const link = await prisma.affiliateLink.findUnique({
    where: { id: linkId },
    include: { retailer: true },
  });

  if (!link || !link.isActive) {
    return null;
  }

  // Check for country-specific localized link
  if (country && link.localizedLinks) {
    const localized = (link.localizedLinks as Record<string, string>)[country];
    if (localized) {
      return localized;
    }
  }

  return link.url;
}

export async function getProductAffiliateLinks(productId: string) {
  return prisma.affiliateLink.findMany({
    where: { productId, isActive: true },
    include: {
      retailer: {
        select: { id: true, name: true, logoUrl: true, trustScore: true },
      },
      network: {
        select: { id: true, name: true },
      },
    },
    orderBy: { priority: "desc" },
  });
}
