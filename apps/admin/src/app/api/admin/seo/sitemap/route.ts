import { NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";
import { auth } from "@clerk/nextjs/server";
import { readFileSync } from "fs";
import { join } from "path";

const SITEMAP_PATH = join(process.cwd(), "..", "..", "apps", "web", "public", "sitemap.xml");

/**
 * GET /api/admin/seo/sitemap
 * Returns the current sitemap content and URL statistics.
 */
export async function GET() {
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
    const content = readFileSync(SITEMAP_PATH, "utf-8");

    // Count URLs in sitemap
    const urlCount = (content.match(/<url>/g) || []).length;

    // Get counts from DB for comparison
    const [productCount, postCount, categoryCount, collectionCount] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.category.count(),
      prisma.collection.count({ where: { isPublic: true } }),
    ]);

    return NextResponse.json({
      content,
      stats: {
        urlsInSitemap: urlCount,
        activeProducts: productCount,
        publishedPosts: postCount,
        categories: categoryCount,
        publicCollections: collectionCount,
      },
    });
  } catch (error) {
    console.error("Read sitemap error:", error);
    return NextResponse.json({ error: "Failed to read sitemap" }, { status: 500 });
  }
}
