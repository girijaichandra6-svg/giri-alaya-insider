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
 * GET /api/admin/categories
 * List all categories with hierarchy and counts.
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        accentColor: true,
        imageUrl: true,
        parentId: true,
        metadata: true,
        _count: { select: { products: true, posts: true, children: true } },
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("List categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

/**
 * POST /api/admin/categories
 * Create a new category.
 * Body: { name: string, slug?: string, description?: string, accentColor?: string, parentId?: string, imageUrl?: string, metadata?: object }
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
    const { name, slug, description, accentColor, parentId, imageUrl, metadata } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const categorySlug = slug?.trim() || slugify(name);

    // Check for duplicate slug
    const existing = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (existing) {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });
    }

    // Validate parent exists if provided
    if (parentId) {
      const parent = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent) {
        return NextResponse.json({ error: "Parent category not found" }, { status: 404 });
      }
    }

    const category = await prisma.category.create({
      data: {
        slug: categorySlug,
        name: name.trim(),
        description: description?.trim() ?? null,
        accentColor: accentColor?.trim() || "#D4FF00",
        parentId: parentId || null,
        imageUrl: imageUrl?.trim() || null,
        metadata: metadata ?? undefined,
      },
    });

    await logAudit(userId, "category.create", "category", category.id, { name: name.trim(), slug: categorySlug }, req);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/categories
 * Update a category.
 * Body: { id: string, name?: string, slug?: string, description?: string, accentColor?: string, parentId?: string | null, imageUrl?: string, metadata?: object | null }
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
    const { id, name, slug, description, accentColor, parentId, imageUrl, metadata } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    // Prevent circular parent reference
    if (parentId === id) {
      return NextResponse.json({ error: "A category cannot be its own parent" }, { status: 400 });
    }

    // If setting a parent, ensure the parent is not a descendant (prevent circular hierarchy)
    if (parentId) {
      const parent = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent) {
        return NextResponse.json({ error: "Parent category not found" }, { status: 404 });
      }

      // Check if the target is already a descendant of this category
      const descendants = await getDescendantIds(id);
      if (descendants.includes(parentId)) {
        return NextResponse.json({ error: "Circular parent reference detected" }, { status: 400 });
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
    if (accentColor !== undefined) updateData.accentColor = accentColor.trim() || "#D4FF00";
    if (parentId !== undefined) updateData.parentId = parentId || null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl?.trim() || null;
    if (metadata !== undefined) updateData.metadata = metadata;

    await prisma.category.update({
      where: { id },
      data: updateData,
    });

    await logAudit(userId, "category.update", "category", id, updateData, req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/categories?id=xxx
 * Delete a category. Blocks deletion if the category has children or products.
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
    const categoryId = searchParams.get("id");

    if (!categoryId) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    // Check for children or products
    const cat = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        _count: { select: { children: true, products: true, posts: true } },
      },
    });

    if (!cat) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (cat._count.children > 0) {
      return NextResponse.json(
        { error: `Cannot delete: category has ${cat._count.children} subcategory(ies). Reassign or delete them first.` },
        { status: 409 }
      );
    }

    if (cat._count.products > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${cat._count.products} product(s) are assigned to this category. Reassign them first.` },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id: categoryId } });

    await logAudit(userId, "category.delete", "category", categoryId, undefined, req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

/** Recursively fetch all descendant IDs of a category */
async function getDescendantIds(categoryId: string): Promise<string[]> {
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  });

  const ids: string[] = [];
  for (const child of children) {
    ids.push(child.id);
    const grandchildIds = await getDescendantIds(child.id);
    ids.push(...grandchildIds);
  }
  return ids;
}
