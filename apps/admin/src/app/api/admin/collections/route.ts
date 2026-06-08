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

const VALID_TYPES = ["EDITORIAL", "USER", "SEASONAL"] as const;

/**
 * GET /api/admin/collections
 * List collections with search, type filter, and pagination.
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
    const typeFilter = searchParams.get("type")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 30;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    const andConditions: Record<string, unknown>[] = [];

    if (query) {
      andConditions.push({
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      });
    }
    if (typeFilter && VALID_TYPES.includes(typeFilter as any)) {
      andConditions.push({ type: typeFilter });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const [collections, total] = await Promise.all([
      prisma.collection.findMany({
        where: where as any,
        orderBy: { id: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          imageUrl: true,
          isPublic: true,
          type: true,
          _count: { select: { products: true } },
        },
      }),
      prisma.collection.count({ where: where as any }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ collections, total, totalPages, page });
  } catch (error) {
    console.error("List collections error:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

/**
 * POST /api/admin/collections
 * Create a new collection.
 * Body: { title: string, slug?: string, description?: string, imageUrl?: string, isPublic?: boolean, type?: CollectionType }
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
    const { title, slug, description, imageUrl, isPublic, type, productIds } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const collectionSlug = slug?.trim() || slugify(title);

    // Check for duplicate slug
    const existing = await prisma.collection.findUnique({ where: { slug: collectionSlug } });
    if (existing) {
      return NextResponse.json({ error: "A collection with this slug already exists" }, { status: 409 });
    }

    const collectionType = type && VALID_TYPES.includes(type) ? type : "EDITORIAL";

    const collection = await prisma.collection.create({
      data: {
        slug: collectionSlug,
        title: title.trim(),
        description: description?.trim() ?? null,
        imageUrl: imageUrl?.trim() || null,
        isPublic: isPublic !== undefined ? isPublic : true,
        type: collectionType,
        ...(Array.isArray(productIds) && productIds.length > 0
          ? {
              products: {
                createMany: {
                  data: productIds.map((item: { productId: string; order: number }) => ({
                    productId: item.productId,
                    order: item.order ?? 0,
                  })),
                },
              },
            }
          : {}),
      },
    });

    await logAudit(userId, "collection.create", "collection", collection.id, { title: title.trim(), slug: collectionSlug, type: collectionType, productCount: productIds?.length }, req);

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error("Create collection error:", error);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/collections
 * Update a collection and optionally sync its product assignments.
 * Body: { id: string, title?: string, slug?: string, description?: string, imageUrl?: string, isPublic?: boolean, type?: CollectionType, productIds?: { productId: string; order: number }[] }
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
    const { id, title, slug, description, imageUrl, isPublic, type, productIds } = body;

    if (!id) {
      return NextResponse.json({ error: "Collection ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) {
      if (title.trim().length === 0) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      }
      updateData.title = title.trim();
    }
    if (slug !== undefined) updateData.slug = slug.trim();
    if (description !== undefined) updateData.description = description?.trim() ?? null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl?.trim() || null;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (type !== undefined) updateData.type = type;

    // Use a transaction for the update + product sync
    await prisma.$transaction(async (tx) => {
      await tx.collection.update({
        where: { id },
        data: updateData,
      });

      // Sync product assignments if provided
      if (productIds !== undefined) {
        // Delete all existing product assignments
        await tx.collectionProduct.deleteMany({
          where: { collectionId: id },
        });

        // Create new product assignments
        if (Array.isArray(productIds) && productIds.length > 0) {
          await tx.collectionProduct.createMany({
            data: productIds.map((item: { productId: string; order: number }) => ({
              collectionId: id,
              productId: item.productId,
              order: item.order ?? 0,
            })),
          });
        }
      }
    });

    await logAudit(userId, "collection.update", "collection", id, { ...updateData, productCount: productIds?.length }, req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update collection error:", error);
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/collections?id=xxx
 * Delete a collection (cascades to CollectionProduct).
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
    const collectionId = searchParams.get("id");

    if (!collectionId) {
      return NextResponse.json({ error: "Collection ID is required" }, { status: 400 });
    }

    await prisma.collection.delete({ where: { id: collectionId } });

    await logAudit(userId, "collection.delete", "collection", collectionId, undefined, req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete collection error:", error);
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}
