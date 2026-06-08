import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const caller = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });
  if (!caller || (caller.role !== "ADMIN" && caller.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action")?.trim() || "";
  const entity = searchParams.get("entity")?.trim() || "";
  const fromDate = searchParams.get("from")?.trim() || "";
  const toDate = searchParams.get("to")?.trim() || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 30;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Record<string, unknown> = {};
  const andConditions: Record<string, unknown>[] = [];

  if (action) {
    andConditions.push({ action: { contains: action, mode: "insensitive" } });
  }
  if (entity) {
    andConditions.push({ entity: { contains: entity, mode: "insensitive" } });
  }
  if (fromDate) {
    andConditions.push({ createdAt: { gte: new Date(fromDate) } });
  }
  if (toDate) {
    andConditions.push({ createdAt: { lte: new Date(toDate) } });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        changes: true,
        ip: true,
        userAgent: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.auditLog.count({ where: where as any }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({ logs, total, totalPages, page });
}
