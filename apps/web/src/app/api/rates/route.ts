import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

let cachedRates: { rates: Record<string, number>; updatedAt: string } | null = null;
let lastFetch = 0;
const CACHE_TTL_MS = 3_600_000; // 1 hour

/**
 * GET /api/rates
 *
 * Returns exchange rates based on USD, fetched from the Frankfurter API
 * (powered by the European Central Bank). Results are cached in-memory for 1 hour.
 *
 * Response:
 *   { rates: { USD: 1, EUR: 0.92, GBP: 0.79, ... }, updatedAt: "2026-06-07T..." }
 */
export async function GET() {
  if (cachedRates && Date.now() - lastFetch < CACHE_TTL_MS) {
    return NextResponse.json(cachedRates, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  }

  try {
    const res = await fetch("https://api.frankfurter.dev/latest?from=USD", {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Frankfurter API error: ${res.status}`);
    }

    const data: FrankfurterResponse = await res.json();

    // Inject USD at 1 (Frankfurter doesn't include the base in rates)
    const rates: Record<string, number> = {
      USD: 1,
      ...data.rates,
    };

    cachedRates = {
      rates,
      updatedAt: new Date().toISOString(),
    };
    lastFetch = Date.now();

    return NextResponse.json(cachedRates, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  } catch (error) {
    // Return stale cache if available
    if (cachedRates) {
      return NextResponse.json(cachedRates, {
        headers: { "Cache-Control": "public, max-age=60" },
      });
    }

    // Fallback with hardcoded approximate rates
    const fallbackRates: Record<string, number> = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      INR: 83.5,
      JPY: 149.5,
      AUD: 1.54,
      CAD: 1.37,
    };

    console.error("Currency rates fetch failed, using fallback:", error);
    return NextResponse.json(
      {
        rates: fallbackRates,
        updatedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
