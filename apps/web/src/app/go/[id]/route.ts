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
 * Single-hop affiliate redirect per ALAYA OS Module 2 contract:
 *   1. Exactly one 302 from our domain to the genuine destination with the
 *      server-side tag. Never a second hop, never an HTML/meta/JS redirect.
 *   2. Tag comes from environment only — never derived from the request
 *      (prevents tag-injection commission theft).
 *   3. UTM params are captured for OUR click log and stripped before redirect.
 *   4. Unknown/inactive link → /good-finds, never a 404 on a social bio click.
 */
const BOT_UA_RE =
  /(bot|crawler|spider|slurp|preview|facebookexternalhit|slackbot|discordbot|telegrambot|linkedinbot|pinterestbot|whatsapp|bingpreview)/i;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

const SINGLE_HOP_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Alaya-Redirect": "single-hop",
  "Referrer-Policy": "no-referrer-when-downgrade",
};

function fallback(req: NextRequest, unavailable?: string) {
  const url = new URL("/good-finds", req.url);
  if (unavailable) url.searchParams.set("unavailable", unavailable);
  return NextResponse.redirect(url, { status: 302, headers: SINGLE_HOP_HEADERS });
}

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
      return fallback(req);
    }

    // Resolve destination: geo localized link > cloaked > base URL
    const country = req.headers.get("cf-ipcountry") || undefined;
    let resolvedUrl = link.cloakedUrl || link.url;
    if (country && link.localizedLinks) {
      const localized = (link.localizedLinks as Record<string, string>)[country];
      if (localized) resolvedUrl = localized;
    }

    let destination: URL;
    try {
      destination = new URL(resolvedUrl);
    } catch {
      return fallback(req);
    }

    // Fail-safe: if the destination is an Amazon URL, force the server-side
    // Associates tag onto it. Never trust a tag that arrived in the request.
    const tag = process.env.AMAZON_TAG;
    if (
      tag &&
      (destination.hostname === "www.amazon.com" ||
        destination.hostname.endsWith(".amazon.com"))
    ) {
      destination.searchParams.set("tag", tag);
    }

    // Capture UTM for OUR click log, then strip them from the destination.
    const utm: Record<string, string> = {};
    for (const k of UTM_KEYS) {
      const v = req.nextUrl.searchParams.get(k);
      if (v) {
        utm[k] = v.slice(0, 64);
        req.nextUrl.searchParams.delete(k);
      }
    }

    // Record the click asynchronously (don't block the redirect).
    // Includes UTM attribution + bot filtering so the log stays human-clean.
    const ua = req.headers.get("user-agent") || "";
    if (!BOT_UA_RE.test(ua)) {
      void recordClick(link.id, JSON.stringify(utm));
    }

    // Single 302 — the Location header is the whole story. No UTM forwarded.
    return NextResponse.redirect(destination.toString(), {
      status: 302,
      headers: { ...SINGLE_HOP_HEADERS, ...rateLimitHeaders },
    });
  } catch (error) {
    console.error("Go redirect error:", error);
    return fallback(req);
  }
}
