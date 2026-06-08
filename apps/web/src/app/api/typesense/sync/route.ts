import { NextRequest, NextResponse } from "next/server";
import { getTypesenseClient, ensureAllCollections } from "@/server/lib/typesense";
import { indexAllProducts, indexAllPosts } from "@/server/lib/typesense-index";

/**
 * POST /api/typesense/sync
 *
 * Full reindex of all products and posts to Typesense.
 * Protected by TYPESENSE_SYNC_SECRET — pass it as x-api-key or Authorization header.
 *
 * Usage:
 *   curl -X POST https://alaya.app/api/typesense/sync \
 *     -H "x-api-key: your-secret"
 *
 * Schedule via Vercel Cron Jobs (cron.json or vercel.json):
 *   {
 *     "crons": [{
 *       "path": "/api/typesense/sync",
 *       "schedule": "0 6 * * *"
 *     }]
 *   }
 */
export async function POST(req: NextRequest) {
  // Authenticate
  const secret =
    req.headers.get("x-api-key") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  const expectedSecret = process.env.TYPESENSE_SYNC_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if Typesense is configured before attempting sync
  if (!getTypesenseClient()) {
    return NextResponse.json(
      { warning: "Typesense not configured — set TYPESENSE_API_KEY and TYPESENSE_HOST" },
      { status: 200 }
    );
  }

  try {
    const start = Date.now();

    // Ensure Typesense collections exist
    await ensureAllCollections();

    // Run both indexes in parallel with error isolation
    const [productsResult, postsResult] = await Promise.all([
      indexAllProducts().then(
        () => ({ status: "ok" as const }),
        (err: unknown) => ({
          status: "error" as const,
          error: err instanceof Error ? err.message : "Unknown error",
        })
      ),
      indexAllPosts().then(
        () => ({ status: "ok" as const }),
        (err: unknown) => ({
          status: "error" as const,
          error: err instanceof Error ? err.message : "Unknown error",
        })
      ),
    ]);

    const duration = Date.now() - start;

    return NextResponse.json({
      success: productsResult.status === "ok" && postsResult.status === "ok",
      duration: `${duration}ms`,
      products: productsResult,
      posts: postsResult,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[Typesense Sync] Failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/typesense/sync
 * Lightweight health-check to verify the sync endpoint is reachable.
 */
export async function GET() {
  return NextResponse.json({
    configured: !!getTypesenseClient(),
    protected: !!process.env.TYPESENSE_SYNC_SECRET,
    docs: "POST with x-api-key header to trigger a full reindex",
  });
}
