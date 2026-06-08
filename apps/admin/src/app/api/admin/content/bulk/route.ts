import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";
import { auth } from "@clerk/nextjs/server";
import { logAudit } from "@/lib/audit";

/**
 * POST /api/admin/content/bulk
 * Perform bulk operations on posts.
 * Body: { action: "delete" | "archive", ids: string[] }
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
    const { action, ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Post IDs array is required" }, { status: 400 });
    }

    if (action === "delete") {
      await prisma.post.deleteMany({
        where: { id: { in: ids } },
      });
      await logAudit(userId, "post.bulk_delete", "post", undefined, { ids, count: ids.length }, req);
      return NextResponse.json({ success: true, count: ids.length, action: "deleted" });
    }

    if (action === "archive") {
      await prisma.post.updateMany({
        where: { id: { in: ids } },
        data: { status: "ARCHIVED" },
      });
      await logAudit(userId, "post.bulk_archive", "post", undefined, { ids, count: ids.length }, req);
      return NextResponse.json({ success: true, count: ids.length, action: "archived" });
    }

    return NextResponse.json({ error: "Invalid action. Use 'delete' or 'archive'." }, { status: 400 });
  } catch (error) {
    console.error("Bulk action error:", error);
    return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 });
  }
}
