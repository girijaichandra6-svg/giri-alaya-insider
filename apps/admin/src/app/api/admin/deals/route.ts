import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";
import { auth } from "@clerk/nextjs/server";
import { logAudit } from "@/lib/audit";

/**
 * GET /api/admin/deals
 * List deals with pagination, search, and active filter.
 */
export async function GET(req: NextRequest) {
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
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";
    const activeFilter = searchParams.get("active")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 30;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { code: { contains: query, mode: "insensitive" } },
      ];
    }
    if (activeFilter === "true") where.isActive = true;
    else if (activeFilter === "false") where.isActive = false;

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where: where as any,
        orderBy: { endDate: "asc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          code: true,
          discount: true,
          startDate: true,
          endDate: true,
          isActive: true,
          product: { select: { id: true, title: true, slug: true } },
          retailer: { select: { id: true, name: true } },
        },
      }),
      prisma.deal.count({ where: where as any }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ deals, total, totalPages, page });
  } catch (error) {
    console.error("List deals error:", error);
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 });
  }
}

/**
 * POST /api/admin/deals
 * Create a new deal.
 * Body: { productId: string, title: string, description?: string, code?: string, discount?: number, startDate: string, endDate: string, retailerId?: string }
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
    const { productId, title, description, code, discount, startDate, endDate, retailerId } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!startDate) {
      return NextResponse.json({ error: "Start date is required" }, { status: 400 });
    }
    if (!endDate) {
      return NextResponse.json({ error: "End date is required" }, { status: 400 });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const deal = await prisma.deal.create({
      data: {
        productId,
        title: title.trim(),
        description: description?.trim() ?? null,
        code: code?.trim() ?? null,
        discount: discount ?? null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        retailerId: retailerId || null,
        isActive: true,
      },
    });

    await logAudit(
      userId,
      "deal.create",
      "deal",
      deal.id,
      { title: title.trim(), productId, discount, code, startDate, endDate },
      req
    );

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    console.error("Create deal error:", error);
    return NextResponse.json({ error: "Failed to create deal" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/deals
 * Update a deal.
 * Body: { id: string, title?: string, description?: string, code?: string, discount?: number, startDate?: string, endDate?: string, isActive?: boolean }
 */
export async function PATCH(req: NextRequest) {
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
    const { id, title, description, code, discount, startDate, endDate, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Deal ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (code !== undefined) updateData.code = code;
    if (discount !== undefined) updateData.discount = discount;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (isActive !== undefined) updateData.isActive = isActive;

    await prisma.deal.update({
      where: { id },
      data: updateData,
    });

    await logAudit(userId, "deal.update", "deal", id, updateData, req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update deal error:", error);
    return NextResponse.json({ error: "Failed to update deal" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/deals?id=xxx
 * Delete a deal.
 */
export async function DELETE(req: NextRequest) {
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
    const { searchParams } = new URL(req.url);
    const dealId = searchParams.get("id");

    if (!dealId) {
      return NextResponse.json({ error: "Deal ID is required" }, { status: 400 });
    }

    await prisma.deal.delete({ where: { id: dealId } });

    await logAudit(userId, "deal.delete", "deal", dealId, undefined, req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete deal error:", error);
    return NextResponse.json({ error: "Failed to delete deal" }, { status: 500 });
  }
}
