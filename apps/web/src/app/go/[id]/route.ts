import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";
import { recordClick } from "@/server/api/affiliate.service";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/server/lib/rate-limiter";

/**
 * GET /go/[id]
 * Cloaked affiliate link redirect with rate limiting.
 * Records the click with geo-targeting, then 302 redirects to the destination.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Rate limit by IP address to prevent click fraud
  const ip = getClientIp(req);
  const { success, headers: rateLimitHeaders } = await checkRateLimit(ip);

  if (!success) {
    return rateLimitResponse(rateLimitHeaders);
  }

  try {
    // Look up the affiliate link
    const link = await prisma.affiliateLink.findUnique({
      where: { id },
    });

    if (!link || !link.isActive) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Determine the target URL with geo-targeting
    const country = req.headers.get("cf-ipcountry") || undefined;
    const targetUrl = link.cloakedUrl || link.url;

    // Check for country-specific localized link
    let resolvedUrl = targetUrl;
    if (country && link.localizedLinks) {
      const localized = (link.localizedLinks as Record<string, string>)[country];
      if (localized) {
        resolvedUrl = localized;
      }
    }

    // Append UTM parameters for analytics
    const separator = resolvedUrl.includes("?") ? "&" : "?";
    const redirectUrl = `${resolvedUrl}${separator}utm_source=alaya&utm_medium=affiliate`;

    // Record the click asynchronously (don't block the redirect)
    void recordClick(link.id);

    // 302 redirect to the affiliate URL with rate limit headers
    return NextResponse.redirect(redirectUrl, {
      status: 302,
      headers: rateLimitHeaders,
    });
  } catch (error) {
    console.error("Go redirect error:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}
