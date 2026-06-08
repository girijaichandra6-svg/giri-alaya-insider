import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";

/**
 * GET /api/subcategories?category=fashion
 * Fetch subcategories for a given category slug.
 *
 * Query params:
 *   category - Category slug (required)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category");

  if (!categorySlug) {
    return NextResponse.json(
      { error: "category query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const [subcategories, totalProductCount] = await Promise.all([
      prisma.subcategory.findMany({
        where: { categoryId: category.id },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          _count: {
            select: {
              products: {
                where: { isActive: true },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.product.count({
        where: {
          categoryId: category.id,
          isActive: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalProductCount,
      subcategories: subcategories.map((sub) => ({
        id: sub.id,
        slug: sub.slug,
        name: sub.name,
        description: sub.description,
        productCount: sub._count.products,
      })),
    });
  } catch (error) {
    console.error("Subcategories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subcategories" },
      { status: 500 }
    );
  }
}
