import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";
import { getTypesenseClient, ensureAllCollections } from "@/server/lib/typesense";
import {
  indexProduct,
  deleteProduct,
  indexPost,
  deletePost,
  indexAllProducts,
  indexAllPosts,
} from "@/server/lib/typesense-index";

/**
 * POST /api/webhooks/typesense
 *
 * Event-driven webhook for partial Typesense reindexing.
 * Protected by TYPESENSE_SYNC_SECRET — pass it as x-api-key or Authorization header.
 *
 * For entity events (product.updated, post.created, etc.), the webhook re-fetches
 * the full entity from the database to ensure Typesense documents include all
 * nested relations (categories, tags, scores, etc.).
 *
 * Accepts events:
 *   - product.created / product.updated  → re-fetch + indexProduct
 *   - product.deleted                    → deleteProduct(productId)
 *   - post.created / post.updated        → re-fetch + indexPost
 *   - post.deleted                       → deletePost(postId)
 *   - reindex                            → indexAllProducts() + indexAllPosts()
 *
 * Payload format:
 *   { "type": "product.created", "data": { "id": "...", ... } }
 *   { "type": "reindex" }
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

  // Check if Typesense is configured before proceeding
  if (!getTypesenseClient()) {
    return NextResponse.json(
      {
        warning:
          "Typesense not configured — set TYPESENSE_API_KEY and TYPESENSE_HOST",
      },
      { status: 200 }
    );
  }

  try {
    const body = (await req.json()) as {
      type: string;
      data?: Record<string, unknown>;
    };

    const { type, data } = body;

    if (!type) {
      return NextResponse.json({ error: "Missing 'type' field" }, { status: 400 });
    }

    switch (type) {
      // ---- Product Events ----
      case "product.created":
      case "product.updated": {
        const productId = data?.id as string | undefined;
        if (!productId) {
          return NextResponse.json(
            { error: "Missing 'data.id' for product" },
            { status: 400 }
          );
        }

        // Re-fetch full entity with all nested relations
        const product = await prisma.product.findUnique({
          where: { id: productId },
          include: {
            category: true,
            subcategory: true,
            tags: { include: { tag: true } },
            deals: {
              where: { isActive: true, endDate: { gte: new Date() } },
              take: 1,
            },
            productScores: { where: { type: "COMMUNITY" as const } },
            _count: { select: { reviews: true } },
          },
        });

        if (!product) {
          return NextResponse.json(
            { error: `Product ${productId} not found` },
            { status: 404 }
          );
        }

        await indexProduct(product);
        return NextResponse.json({ success: true, indexed: `product:${productId}` });
      }

      case "product.deleted": {
        const productId = data?.id as string | undefined;
        if (!productId) {
          return NextResponse.json(
            { error: "Missing 'data.id' for deleted product" },
            { status: 400 }
          );
        }
        await deleteProduct(productId);
        return NextResponse.json({ success: true, deleted: `product:${productId}` });
      }

      // ---- Post Events ----
      case "post.created":
      case "post.updated": {
        const postId = data?.id as string | undefined;
        if (!postId) {
          return NextResponse.json(
            { error: "Missing 'data.id' for post" },
            { status: 400 }
          );
        }

        // Re-fetch full entity with all nested relations
        const post = await prisma.post.findUnique({
          where: { id: postId },
          include: {
            category: true,
            tags: { include: { tag: true } },
            author: true,
          },
        });

        if (!post) {
          return NextResponse.json(
            { error: `Post ${postId} not found` },
            { status: 404 }
          );
        }

        await indexPost(post);
        return NextResponse.json({ success: true, indexed: `post:${postId}` });
      }

      case "post.deleted": {
        const postId = data?.id as string | undefined;
        if (!postId) {
          return NextResponse.json(
            { error: "Missing 'data.id' for deleted post" },
            { status: 400 }
          );
        }
        await deletePost(postId);
        return NextResponse.json({ success: true, deleted: `post:${postId}` });
      }

      // ---- Full Reindex ----
      case "reindex": {
        // Ensure collection schemas exist before importing
        await ensureAllCollections();

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

        return NextResponse.json({
          success:
            productsResult.status === "ok" && postsResult.status === "ok",
          products: productsResult,
          posts: postsResult,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown event type: ${type}` },
          { status: 400 }
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[Typesense Webhook] Failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
