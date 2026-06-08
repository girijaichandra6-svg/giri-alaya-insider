import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";

/**
 * GET /api/deals
 * List active deals with optional filters, sorting, and pagination.
 *
 * Query params:
 *   category   - Filter by category slug
 *   sort       - end_date (default) | discount | newest
 *   page       - Page number (default 1)
 *   limit      - Items per page (default 24, max 50)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "end_date";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 24));
  const skip = (page - 1) * limit;

  try {
    // Build where clause — only active deals that haven't ended
    const where: Record<string, unknown> = {
      isActive: true,
      endDate: { gte: new Date() },
    };

    if (category) {
      where.product = {
        category: { slug: category },
      };
    }

    // Determine sort order
    let orderBy: Record<string, unknown> = { endDate: "asc" };

    switch (sort) {
      case "discount":
        orderBy = { discount: "desc" };
        break;
      case "newest":
        orderBy = { startDate: "desc" };
        break;
      case "end_date":
      default:
        orderBy = { endDate: "asc" };
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where: where as any,
        orderBy: orderBy as any,
        skip,
        take: limit,
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
              description: true,
              category: {
                select: { slug: true, name: true, accentColor: true },
              },
              subcategory: {
                select: { slug: true, name: true },
              },
              affiliateLinks: {
                where: { isActive: true },
                select: { id: true, url: true, priority: true },
                orderBy: { priority: "desc" },
                take: 1,
              },
            },
          },
          retailer: {
            select: { id: true, name: true, logoUrl: true },
          },
        },
      }),
      prisma.deal.count({ where: where as any }),
    ]);

    return NextResponse.json({
      deals: deals.map((deal) => ({
        id: deal.id,
        title: deal.title,
        description: deal.description,
        code: deal.code,
        discount: deal.discount,
        startDate: deal.startDate.toISOString(),
        endDate: deal.endDate.toISOString(),
        product: deal.product,
        retailer: deal.retailer,
        url: deal.product.affiliateLinks[0]?.url || null,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Deals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}
