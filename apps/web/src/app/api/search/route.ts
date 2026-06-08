import { NextRequest, NextResponse } from "next/server";
import { searchAll, autocomplete, searchProducts } from "@/server/api/search.service";

/**
 * GET /api/search
 * Typesense-powered search with PostgreSQL fallback.
 * For autocomplete, add ?mode=autocomplete to the request.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const mode = searchParams.get("mode");

  try {
    // Autocomplete mode: lightweight, fast results for the search dropdown
    if (mode === "autocomplete") {
      const results = await autocomplete(query);
      return NextResponse.json(results);
    }

    const category = searchParams.get("category") || undefined;
    const subcategory = searchParams.get("subcategory") || undefined;

    // Full search mode: try Typesense first
    const results = await searchAll({
      query,
      filter: searchParams.get("filter") || undefined,
      sort_by: searchParams.get("sort") || undefined,
      page: Math.max(1, Number(searchParams.get("page")) || 1),
      per_page: Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20)),
      include: (searchParams.get("include") as any) || "both",
      category,
      subcategory,
    });

    // If Typesense returned no results (not configured or empty), fall back to PostgreSQL
    if (results.products.found === 0 && results.posts.found === 0 && query) {
      const pgResults = await searchProducts({
        q: query,
        category,
        subcategory,
        minPrice: searchParams.get("minPrice")
          ? Number(searchParams.get("minPrice"))
          : undefined,
        maxPrice: searchParams.get("maxPrice")
          ? Number(searchParams.get("maxPrice"))
          : undefined,
        brand: searchParams.get("brand") || undefined,
        sort: (searchParams.get("sort") as any) || undefined,
        page: Math.max(1, Number(searchParams.get("page")) || 1),
        limit: Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20)),
      });

      // Wrap PostgreSQL results in the same format as Typesense hits
      return NextResponse.json({
        products: {
          found: pgResults.total,
          hits: pgResults.products.map((p) => ({
            document: {
              ...p,
              image_urls: p.imageUrls,
              category_slug: p.categorySlug,
              category_name: p.categoryName,
              price: p.basePrice,
              created_at: 0,
              currency: p.currency || "USD",
            },
          })),
        },
        posts: { found: 0, hits: [] },
        source: "postgresql",
      });
    }

    return NextResponse.json({ ...results, source: "typesense" });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
