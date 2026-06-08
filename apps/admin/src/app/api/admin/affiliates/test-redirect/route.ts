import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";
import { auth } from "@clerk/nextjs/server";

/**
 * POST /api/admin/affiliates/test-redirect
 * Test an affiliate link redirect by resolving its destination URL.
 * Body: { linkId?: string, path?: string }
 * - linkId: The affiliate link's UUID to look up directly
 * - path: The /go/[id] path segment (e.g., "aff_ninja-air-fryer")
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { linkId, path } = body;

    if (!linkId && !path) {
      return NextResponse.json({ error: "Provide linkId or path" }, { status: 400 });
    }

    let link;

    if (linkId) {
      link = await prisma.affiliateLink.findUnique({
        where: { id: linkId },
        include: {
          product: { select: { title: true, slug: true } },
          retailer: { select: { name: true, website: true } },
          network: { select: { name: true, identifier: true } },
        },
      });
    } else if (path) {
      // The seed data uses link IDs like "aff_ninja-air-fryer", so try ID lookup first
      link = await prisma.affiliateLink.findUnique({
        where: { id: path },
        include: {
          product: { select: { title: true, slug: true } },
          retailer: { select: { name: true, website: true } },
          network: { select: { name: true, identifier: true } },
        },
      });

      // If not found by ID, try finding by cloaked URL pattern
      if (!link) {
        link = await prisma.affiliateLink.findFirst({
          where: {
            OR: [
              { url: { contains: path } },
              { cloakedUrl: { contains: path } },
            ],
          },
          include: {
            product: { select: { title: true, slug: true } },
            retailer: { select: { name: true, website: true } },
            network: { select: { name: true, identifier: true } },
          },
        });
      }
    }

    if (!link) {
      return NextResponse.json({ error: "Affiliate link not found" }, { status: 404 });
    }

    const destinationUrl = link.cloakedUrl || link.url;

    return NextResponse.json({
      link: {
        id: link.id,
        url: link.url,
        cloakedUrl: link.cloakedUrl,
        resolvedUrl: destinationUrl,
        isActive: link.isActive,
        priority: link.priority,
      },
      product: link.product,
      retailer: link.retailer,
      network: link.network,
    });
  } catch (error) {
    console.error("Test redirect error:", error);
    return NextResponse.json({ error: "Failed to test redirect" }, { status: 500 });
  }
}
