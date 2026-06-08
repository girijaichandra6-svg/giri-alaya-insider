import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";
import { auth } from "@clerk/nextjs/server";

/**
 * POST /api/admin/seo/validate-jsonld
 * Fetches a page and extracts JSON-LD structured data for validation.
 * Body: { url: string }
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
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "ALAYA-Admin-SEO-Tool/1.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Extract JSON-LD scripts
    const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    const schemas: unknown[] = [];
    let match: RegExpExecArray | null;

    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const captured = match[1];
        if (!captured) continue;
        const parsed = JSON.parse(captured.trim());
        if (Array.isArray(parsed)) {
          schemas.push(...parsed);
        } else {
          schemas.push(parsed);
        }
      } catch {
        // Skip invalid JSON-LD blocks
      }
    }

    // Validate each schema
    const validated = schemas.map((schema: any, i) => {
      const errors: string[] = [];
      if (!schema["@type"]) errors.push("Missing @type");
      if (!schema["@context"] && !schema["@graph"]) errors.push("Missing @context or @graph");

      // Check for common required fields based on type
      if (schema["@type"] === "Organization" && !schema.name) {
        errors.push("Organization schema missing 'name'");
      }
      if (schema["@type"] === "WebSite" && !schema.url) {
        errors.push("WebSite schema missing 'url'");
      }
      if (schema["@type"] === "Product" && !schema.name) {
        errors.push("Product schema missing 'name'");
      }
      if (schema["@type"] === "Article" && !schema.headline) {
        errors.push("Article schema missing 'headline'");
      }

      return {
        index: i,
        type: schema["@type"] || "Unknown",
        hasContext: !!schema["@context"] || !!schema["@graph"],
        hasErrors: errors.length > 0,
        errors,
        preview: schema.name || schema.headline || schema.title || JSON.stringify(schema).slice(0, 100),
      };
    });

    return NextResponse.json({
      url,
      status: response.status,
      schemaCount: schemas.length,
      schemas: validated,
      hasErrors: validated.some((s) => s.hasErrors),
    });
  } catch (error) {
    console.error("Validate JSON-LD error:", error);
    return NextResponse.json({ error: "Failed to validate JSON-LD" }, { status: 500 });
  }
}
