import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";
import { auth } from "@clerk/nextjs/server";
import { logAudit } from "@/lib/audit";

/**
 * GET /api/admin/brands
 * List all brands with optional search and pagination.
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
      where.name = { contains: query, mode: "insensitive" };
    }

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where: where as any,
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.brand.count({ where: where as any }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ brands, total, totalPages, page });
  } catch (error) {
    console.error("List brands error:", error);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

/**
 * POST /api/admin/brands
 * Create a new brand.
 * Body: { name: string, logoUrl?: string }
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
    const { name, logoUrl } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check for duplicate name
    const existing = await prisma.brand.findUnique({ where: { name: name.trim() } });
    if (existing) {
      return NextResponse.json({ error: "A brand with this name already exists" }, { status: 409 });
    }

    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
        logoUrl: logoUrl?.trim() || null,
      },
    });

    await logAudit(userId, "brand.create", "brand", brand.id, { name: name.trim(), logoUrl }, req);

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error("Create brand error:", error);
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/brands
 * Update a brand.
 * Body: { id: string, name?: string, logoUrl?: string }
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
    const { id, name, logoUrl } = body;

    if (!id) {
      return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) {
      if (name.trim().length === 0) {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      updateData.name = name.trim();
    }
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl?.trim() || null;

    await prisma.brand.update({
      where: { id },
      data: updateData,
    });

    await logAudit(userId, "brand.update", "brand", id, updateData, req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update brand error:", error);
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/brands?id=xxx
 * Delete a brand.
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
    const brandId = searchParams.get("id");

    if (!brandId) {
      return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
    }

    await prisma.brand.delete({ where: { id: brandId } });

    await logAudit(userId, "brand.delete", "brand", brandId, undefined, req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete brand error:", error);
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
