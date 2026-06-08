import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";
import { auth } from "@clerk/nextjs/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { logAudit } from "@/lib/audit";

const ROBOTS_PATH = join(process.cwd(), "..", "..", "apps", "web", "public", "robots.txt");

/**
 * GET /api/admin/seo/robots
 * Returns the current robots.txt content.
 */
export async function GET() {
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
    const content = readFileSync(ROBOTS_PATH, "utf-8");
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Read robots.txt error:", error);
    return NextResponse.json({ error: "Failed to read robots.txt" }, { status: 500 });
  }
}

/**
 * POST /api/admin/seo/robots
 * Updates the robots.txt content.
 * Body: { content: string }
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
    const { content } = body;

    if (typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Basic validation: must contain at least one User-agent directive
    if (!content.includes("User-agent")) {
      return NextResponse.json(
        { error: "Invalid robots.txt: must include at least one User-agent directive" },
        { status: 400 }
      );
    }

    writeFileSync(ROBOTS_PATH, content, "utf-8");

    await logAudit(userId, "robots.update", "robots_txt", undefined, { contentLength: content.length }, req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Write robots.txt error:", error);
    return NextResponse.json({ error: "Failed to update robots.txt" }, { status: 500 });
  }
}
