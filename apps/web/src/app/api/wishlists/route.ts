import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/wishlists?userId=xxx
 * Fetch all wishlists for a user.
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const wishlistId = searchParams.get("id");

  try {
    if (wishlistId) {
      const wishlist = await prisma.wishlist.findUnique({
        where: { id: wishlistId },
        include: {
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  brand: true,
                  description: true,
                  imageUrls: true,
                  basePrice: true,
                  currency: true,
                  category: { select: { slug: true, name: true, accentColor: true } },
                },
              },
            },
            orderBy: { addedAt: "desc" },
          },
        },
      });

      if (!wishlist || wishlist.userId !== user.id) {
        return NextResponse.json({ error: "Wishlist not found" }, { status: 404 });
      }

      return NextResponse.json(wishlist);
    }

    const wishlists = await prisma.wishlist.findMany({
      where: { userId: user.id },
      orderBy: { id: "desc" },
      include: {
        products: {
          take: 4,
          orderBy: { addedAt: "desc" },
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                title: true,
                imageUrls: true,
                basePrice: true,
                currency: true,
                brand: true,
                category: { select: { slug: true, name: true, accentColor: true } },
              },
            },
          },
        },
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ wishlists });
  } catch (error) {
    console.error("Wishlists error:", error);
    return NextResponse.json({ error: "Failed to fetch wishlists" }, { status: 500 });
  }
}

/**
 * POST /api/wishlists
 * Create a new wishlist.
 * Body: { name: string, isPublic?: boolean }
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { name, isPublic = false } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const wishlist = await prisma.wishlist.create({
      data: {
        userId: user.id,
        name: name.trim(),
        isPublic,
      },
    });

    return NextResponse.json(wishlist, { status: 201 });
  } catch (error) {
    console.error("Create wishlist error:", error);
    return NextResponse.json({ error: "Failed to create wishlist" }, { status: 500 });
  }
}

/**
 * DELETE /api/wishlists?id=xxx
 * Delete a wishlist.
 */
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const wishlistId = searchParams.get("id");

    if (!wishlistId) {
      return NextResponse.json({ error: "Wishlist ID is required" }, { status: 400 });
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { id: wishlistId },
      select: { userId: true },
    });

    if (!wishlist || wishlist.userId !== user.id) {
      return NextResponse.json({ error: "Wishlist not found" }, { status: 404 });
    }

    await prisma.wishlist.delete({ where: { id: wishlistId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete wishlist error:", error);
    return NextResponse.json({ error: "Failed to delete wishlist" }, { status: 500 });
  }
}

/**
 * PATCH /api/wishlists
 * Update a wishlist (add/remove items, rename, toggle public)
 */
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { id, name, isPublic, productId, action } = body;

    if (!id) {
      return NextResponse.json({ error: "Wishlist ID is required" }, { status: 400 });
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!wishlist || wishlist.userId !== user.id) {
      return NextResponse.json({ error: "Wishlist not found" }, { status: 404 });
    }

    // Update name or public status
    if (name !== undefined || isPublic !== undefined) {
      await prisma.wishlist.update({
        where: { id },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(isPublic !== undefined ? { isPublic } : {}),
        },
      });
      return NextResponse.json({ success: true });
    }

    // Toggle product in wishlist
    if (productId && action) {
      if (action === "add") {
        await prisma.wishlistItem.upsert({
          where: { wishlistId_productId: { wishlistId: id, productId } },
          update: {},
          create: { wishlistId: id, productId },
        });
      } else if (action === "remove") {
        await prisma.wishlistItem.deleteMany({
          where: { wishlistId: id, productId },
        });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "No valid update fields provided" }, { status: 400 });
  } catch (error) {
    console.error("Update wishlist error:", error);
    return NextResponse.json({ error: "Failed to update wishlist" }, { status: 500 });
  }
}
