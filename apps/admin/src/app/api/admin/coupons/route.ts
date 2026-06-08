import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";
import { auth } from "@clerk/nextjs/server";
import { logAudit } from "@/lib/audit";

/**
 * GET /api/admin/coupons
 * List coupons with pagination, search, and product/retailer filter.
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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 30;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query) {
      where.OR = [
        { code: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where: where as any,
        orderBy: { id: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          code: true,
          description: true,
          discount: true,
          expiresAt: true,
          product: { select: { id: true, title: true, slug: true } },
          retailer: { select: { id: true, name: true } },
        },
      }),
      prisma.coupon.count({ where: where as any }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ coupons, total, totalPages, page });
  } catch (error) {
    console.error("List coupons error:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

/**
 * POST /api/admin/coupons
 * Create a new coupon.
 * Body: { code: string, description: string, discount?: string, expiresAt?: string, productId?: string, retailerId?: string }
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
    const { code, description, discount, expiresAt, productId, retailerId } = body;

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }
    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discount: discount?.trim() ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        productId: productId || null,
        retailerId: retailerId || null,
      },
    });

    await logAudit(
      userId,
      "coupon.create",
      "coupon",
      coupon.id,
      { code: code.trim().toUpperCase(), discount, productId, retailerId },
      req
    );

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("Create coupon error:", error);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/coupons
 * Update a coupon.
 * Body: { id: string, code?: string, description?: string, discount?: string, expiresAt?: string, productId?: string, retailerId?: string }
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
    const { id, code, description, discount, expiresAt, productId, retailerId } = body;

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (code !== undefined) updateData.code = code.trim().toUpperCase();
    if (description !== undefined) updateData.description = description;
    if (discount !== undefined) updateData.discount = discount;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (productId !== undefined) updateData.productId = productId || null;
    if (retailerId !== undefined) updateData.retailerId = retailerId || null;

    await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    await logAudit(userId, "coupon.update", "coupon", id, updateData, req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update coupon error:", error);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/coupons?id=xxx
 * Delete a coupon.
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
    const couponId = searchParams.get("id");

    if (!couponId) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    await prisma.coupon.delete({ where: { id: couponId } });

    await logAudit(userId, "coupon.delete", "coupon", couponId, undefined, req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
