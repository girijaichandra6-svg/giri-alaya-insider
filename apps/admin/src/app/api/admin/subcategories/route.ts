import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";
import { auth } from "@clerk/nextjs/server";
import { logAudit } from "@/lib/audit";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * GET /api/admin/subcategories
 * List subcategories with optional search, category filter, and pagination.
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
    const categoryId = searchParams.get("categoryId")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 30;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    const andConditions: Record<string, unknown>[] = [];

    if (query) {
      andConditions.push({
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
        ],
      });
    }
    if (categoryId) {
      andConditions.push({ categoryId });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const [subcategories, total] = await Promise.all([
      prisma.subcategory.findMany({
        where: where as any,
        orderBy: { name: "asc" },
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          categoryId: true,
          category: { select: { name: true, accentColor: true } },
          _count: { select: { products: true } },
        },
      }),
      prisma.subcategory.count({ where: where as any }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ subcategories, total, totalPages, page });
  } catch (error) {
    console.error("List subcategories error:", error);
    return NextResponse.json({ error: "Failed to fetch subcategories" }, { status: 500 });
  }
}

/**
 * POST /api/admin/subcategories
 * Create a new subcategory.
 * Body: { name: string, slug?: string, description?: string, categoryId: string }
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
    const { name, slug, description, categoryId } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    // Verify category exists
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const subSlug = slug?.trim() || slugify(name);

    // Check for duplicate slug
    const existing = await prisma.subcategory.findUnique({ where: { slug: subSlug } });
    if (existing) {
      return NextResponse.json({ error: "A subcategory with this slug already exists" }, { status: 409 });
    }

    const subcategory = await prisma.subcategory.create({
      data: {
        slug: subSlug,
        name: name.trim(),
        description: description?.trim() ?? null,
        categoryId,
      },
    });

    await logAudit(userId, "subcategory.create", "subcategory", subcategory.id, { name: name.trim(), slug: subSlug, categoryId }, req);

    return NextResponse.json(subcategory, { status: 201 });
  } catch (error) {
    console.error("Create subcategory error:", error);
    return NextResponse.json({ error: "Failed to create subcategory" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/subcategories
 * Update a subcategory.
 * Body: { id: string, name?: string, slug?: string, description?: string, categoryId?: string }
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
    const { id, name, slug, description, categoryId } = body;

    if (!id) {
      return NextResponse.json({ error: "Subcategory ID is required" }, { status: 400 });
    }

    // If changing category, verify it exists
    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) {
      if (name.trim().length === 0) {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      updateData.name = name.trim();
    }
    if (slug !== undefined) updateData.slug = slug.trim();
    if (description !== undefined) updateData.description = description?.trim() ?? null;
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;

    await prisma.subcategory.update({
      where: { id },
      data: updateData,
    });

    await logAudit(userId, "subcategory.update", "subcategory", id, updateData, req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update subcategory error:", error);
    return NextResponse.json({ error: "Failed to update subcategory" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/subcategories?id=xxx
 * Delete a subcategory.
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
    const subcategoryId = searchParams.get("id");

    if (!subcategoryId) {
      return NextResponse.json({ error: "Subcategory ID is required" }, { status: 400 });
    }

    // Check for products
    const sub = await prisma.subcategory.findUnique({
      where: { id: subcategoryId },
      select: { _count: { select: { products: true } } },
    });

    if (!sub) {
      return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
    }

    if (sub._count.products > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${sub._count.products} product(s) are assigned to this subcategory. Reassign them first.` },
        { status: 409 }
      );
    }

    await prisma.subcategory.delete({ where: { id: subcategoryId } });

    await logAudit(userId, "subcategory.delete", "subcategory", subcategoryId, undefined, req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete subcategory error:", error);
    return NextResponse.json({ error: "Failed to delete subcategory" }, { status: 500 });
  }
}
