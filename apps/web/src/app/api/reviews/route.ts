import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/reviews?productId=xxx
 * Fetch reviews for a product.
 *
 * Query params:
 *   productId - The product ID to fetch reviews for
 *   page      - Page number (default 1)
 *   limit     - Items per page (default 10, max 50)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 10));
  const skip = (page - 1) * limit;

  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 }
    );
  }

  try {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { name: true, avatarUrl: true } },
        },
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    const avgRating =
      total > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
        : 0;

    return NextResponse.json({
      reviews,
      total,
      avgRating,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reviews
 * Update a review (rating, title, body). Requires authentication.
 * Body: { id: string, rating?: number, title?: string, body?: string }
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
    const { id, rating, title, body: reviewBody } = body;

    if (!id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!review || review.userId !== user.id) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    await prisma.review.update({
      where: { id },
      data: {
        ...(rating !== undefined ? { rating } : {}),
        ...(title !== undefined ? { title } : {}),
        ...(reviewBody !== undefined ? { body: reviewBody } : {}),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

/**
 * DELETE /api/reviews?id=xxx
 * Delete a review. Requires authentication.
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
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true },
    });

    if (!review || review.userId !== user.id) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    await prisma.review.delete({ where: { id: reviewId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
