import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";

/**
 * GET /api/products/deals
 * Fetch active deals with optional limit.
 *
 * Query params:
 *   limit   - Number of deals to return (default 5, max 20)
 *   active  - Filter to only active deals (default true)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit")) || 5));
  const activeOnly = searchParams.get("active") !== "false";

  try {
    const where: Record<string, unknown> = {};
    if (activeOnly) {
      where.isActive = true;
      where.endDate = { gte: new Date() };
    }

    const deals = await prisma.deal.findMany({
      where: where as any,
      orderBy: { endDate: "asc" },
      take: limit,
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            title: true,
            imageUrls: true,
            basePrice: true,
            currency: true,
            category: { select: { slug: true, name: true, accentColor: true } },
          },
        },
        retailer: { select: { name: true, logoUrl: true } },
      },
    });

    return NextResponse.json({ deals, total: deals.length });
  } catch (error) {
    console.error("Deals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}
