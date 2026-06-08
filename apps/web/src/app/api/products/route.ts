import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";

/**
 * GET /api/products
 * List products with optional category filter, sorting, badge filter, and pagination.
 *
 * Query params:
 *   slug       - Get single product by slug
 *   category   - Filter by category slug
 *   subcategory - Filter by subcategory slug
 *   sort       - trending | newest | bestseller | price_asc | price_desc | rating
 *   badge      - Filter by editorial badge (e.g. "Editor's Pick")
 *   collection - Filter by collection slug
 *   page       - Page number (default 1)
 *   limit      - Items per page (default 24, max 100)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const category = searchParams.get("category");
  const subcategory = searchParams.get("subcategory");
  const sort = searchParams.get("sort") || "newest";
  const badge = searchParams.get("badge");
  const collection = searchParams.get("collection");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 24));
  const skip = (page - 1) * limit;

  try {
    // Single product by slug
    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          subcategory: true,
          productScores: true,
          reviews: {
            take: 10,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true, avatarUrl: true } } },
          },
          affiliateLinks: {
            where: { isActive: true },
            include: {
              retailer: { select: { id: true, name: true, logoUrl: true, trustScore: true } },
            },
            orderBy: { priority: "desc" },
          },
          deals: {
            where: { isActive: true },
            orderBy: { endDate: "asc" },
          },
          tags: {
            include: { tag: true },
          },
        },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(product);
    }

    // Build where clause
    const where: Record<string, unknown> = { isActive: true };

    if (category) {
      where.category = { slug: category };
    }

    if (subcategory) {
      where.subcategory = { slug: subcategory };
    }

    // Collection filter: find products in a collection
    if (collection) {
      where.collectionItems = {
        some: {
          collection: { slug: collection },
        },
      };
    }

    // Handle badge/special filters
    if (badge) {
      // Filter by tag or product score type
      where.tags = {
        some: {
          tag: { name: { contains: badge, mode: "insensitive" } },
        },
      };
    }

    // Determine sort order
    let orderBy: Record<string, unknown> = { createdAt: "desc" };

    switch (sort) {
      case "trending":
        // For trending, we sort by a combination of recent activity
        // Fall through to newest as default behavior
        orderBy = { createdAt: "desc" };
        break;
      case "bestseller":
        // Sort by highest base price first as proxy for bestseller score
        orderBy = { basePrice: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "price_asc":
        orderBy = { basePrice: "asc" };
        break;
      case "price_desc":
        orderBy = { basePrice: "desc" };
        break;
      case "rating":
        orderBy = { createdAt: "desc" }; // Fallback since we can't sort by relation aggregate easily
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: where as any,
        orderBy: orderBy as any,
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          brand: true,
          description: true,
          imageUrls: true,
          basePrice: true,
          currency: true,
          category: { select: { slug: true, name: true, accentColor: true } },
          subcategory: { select: { slug: true, name: true } },
          deals: {
            where: { isActive: true },
            select: { id: true, discount: true, endDate: true },
            take: 1,
          },
          productScores: {
            where: { type: "COMMUNITY" },
            select: { score: true },
            take: 1,
          },
          _count: { select: { reviews: true } },
          createdAt: true,
        },
      }),
      prisma.product.count({ where: where as any }),
    ]);

    return NextResponse.json({
      products: products.map((p) => ({
        ...p,
        avgRating: p.productScores[0]?.score || null,
        reviewCount: p._count.reviews,
        isNew: Date.now() - new Date(p.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
