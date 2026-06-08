import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  recordClick,
  getRedirectUrl,
  getProductAffiliateLinks,
} from "@/server/api/affiliate.service";

/**
 * GET /api/affiliate?productId=xxx
 * Get all active affiliate links for a product.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const linkId = searchParams.get("linkId");

  try {
    if (linkId) {
      // Get redirect URL for a specific link (used for /go/[id] style redirects)
      const country = req.headers.get("cf-ipcountry") || undefined;
      const url = await getRedirectUrl(linkId, country);

      if (!url) {
        return NextResponse.json(
          { error: "Affiliate link not found or inactive" },
          { status: 404 }
        );
      }

      return NextResponse.json({ url });
    }

    if (productId) {
      const links = await getProductAffiliateLinks(productId);
      return NextResponse.json({ links });
    }

    return NextResponse.json(
      { error: "Provide productId or linkId" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Affiliate error:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliate links" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/affiliate
 * Record an affiliate link click.
 */
export async function POST(req: NextRequest) {
  const authResult = await auth({
    acceptsToken: ["session_token", "api_key"],
  });

  if (!authResult.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { linkId } = body;

    if (!linkId) {
      return NextResponse.json(
        { error: "linkId is required" },
        { status: 400 }
      );
    }

    const r = authResult as { userId?: string };
    const click = await recordClick(linkId, r.userId);

    return NextResponse.json({ clickId: click.id }, { status: 201 });
  } catch (error) {
    console.error("Click tracking error:", error);
    return NextResponse.json(
      { error: "Failed to record click" },
      { status: 500 }
    );
  }
}
