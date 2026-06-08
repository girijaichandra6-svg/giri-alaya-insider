import { NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";
import { auth } from "@clerk/nextjs/server";
import { writeFileSync } from "fs";
import { join } from "path";
import { logAudit } from "@/lib/audit";

const SITEMAP_PATH = join(process.cwd(), "..", "..", "apps", "web", "public", "sitemap.xml");
const BASE_URL = "https://alayainsider.com";

/**
 * POST /api/admin/seo/sitemap/regenerate
 * Regenerates the sitemap.xml from the database with all active products, published posts, categories, and static pages.
 */
export async function POST() {
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
    // Fetch all dynamic data
    const [products, posts, categories, collections] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, category: { select: { slug: true } }, updatedAt: true },
      }),
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, type: true, updatedAt: true },
      }),
      prisma.category.findMany({
        select: { slug: true },
      }),
      prisma.collection.findMany({
        where: { isPublic: true },
        select: { slug: true },
      }),
    ]);

    // Generate XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Homepage -->
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

`;

    // Category pages
    for (const cat of categories) {
      xml += `  <url>
    <loc>${BASE_URL}/${cat.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

`;
    }

    // Product pages
    for (const product of products) {
      xml += `  <url>
    <loc>${BASE_URL}/${product.category.slug}/${product.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${product.updatedAt.toISOString().split("T")[0]}</lastmod>
  </url>

`;
    }

    // Post pages
    for (const post of posts) {
      const section = post.type === "GUIDE" ? "guides" : "blog";
      xml += `  <url>
    <loc>${BASE_URL}/${section}/${post.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${post.updatedAt.toISOString().split("T")[0]}</lastmod>
  </url>

`;
    }

    // Collection pages
    for (const col of collections) {
      xml += `  <url>
    <loc>${BASE_URL}/collections/${col.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>

`;
    }

    // Static pages
    const staticPages = [
      { path: "/deals", priority: "0.8", freq: "daily" },
      { path: "/search", priority: "0.6", freq: "weekly" },
      { path: "/blog", priority: "0.7", freq: "weekly" },
      { path: "/guides", priority: "0.7", freq: "weekly" },
      { path: "/collections", priority: "0.6", freq: "weekly" },
      { path: "/about", priority: "0.4", freq: "monthly" },
      { path: "/contact", priority: "0.4", freq: "monthly" },
      { path: "/faq", priority: "0.4", freq: "monthly" },
      { path: "/privacy", priority: "0.2", freq: "monthly" },
      { path: "/terms", priority: "0.2", freq: "monthly" },
      { path: "/disclosure", priority: "0.2", freq: "monthly" },
    ];

    for (const page of staticPages) {
      xml += `  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <changefreq>${page.freq}</changefreq>
    <priority>${page.priority}</priority>
  </url>

`;
    }

    xml += `</urlset>\n`;

    writeFileSync(SITEMAP_PATH, xml, "utf-8");

    const urlCount = (xml.match(/<url>/g) || []).length;

    await logAudit(userId, "sitemap.regenerate", "sitemap", undefined, { urlCount });

    return NextResponse.json({
      success: true,
      urlCount,
      message: `Sitemap regenerated with ${urlCount} URLs`,
    });
  } catch (error) {
    console.error("Regenerate sitemap error:", error);
    return NextResponse.json({ error: "Failed to regenerate sitemap" }, { status: 500 });
  }
}
