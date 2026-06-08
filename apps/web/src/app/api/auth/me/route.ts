import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/auth/me
 * Simple auth check — returns user info if authenticated.
 */
export async function GET() {
  const { isAuthenticated, userId, claims } = await auth({
    acceptsToken: "api_key",
  });

  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ userId, claims });
}

/**
 * POST /api/auth/me
 * Advanced auth check with scope-based authorization.
 * Accepts session_token, oauth_token, and api_key types.
 */
export async function POST(req: NextRequest) {
  const authResult = await auth({
    acceptsToken: ["session_token", "oauth_token", "api_key"],
  });

  if (!authResult.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const r = authResult as {
    userId: string;
    tokenType: string;
    scopes: string[];
  };

  // API keys require specific scopes for write operations
  if (r.tokenType === "api_key" && !r.scopes?.includes("write:users")) {
    return NextResponse.json(
      { error: 'API Key missing the "write:users" scope' },
      { status: 401 }
    );
  }

  const body = await req.json();

  return NextResponse.json({
    userId: r.userId,
    tokenType: r.tokenType,
    scopes: r.scopes,
    data: body,
    message: "Authenticated with scope-based authorization",
  });
}
