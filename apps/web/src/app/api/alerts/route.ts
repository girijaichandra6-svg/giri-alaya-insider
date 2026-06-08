import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/alerts
 * Fetch all price alerts for the current user.
 */
export async function GET() {
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
    const alerts = await prisma.priceAlert.findMany({
      where: { userId: user.id },
      orderBy: { id: "desc" },
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            title: true,
            basePrice: true,
            currency: true,
            imageUrls: true,
            category: { select: { slug: true } },
          },
        },
      },
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Alerts error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

/**
 * POST /api/alerts
 * Create a new price alert.
 * Body: { productId: string, targetPrice: number, currency?: string }
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
    const { productId, targetPrice, currency = "USD" } = body;

    if (!productId || !targetPrice) {
      return NextResponse.json({ error: "productId and targetPrice are required" }, { status: 400 });
    }

    const alert = await prisma.priceAlert.create({
      data: {
        userId: user.id,
        productId,
        targetPrice,
        currency,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error("Create alert error:", error);
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}

/**
 * PATCH /api/alerts
 * Update a price alert (toggle active status).
 * Body: { id: string, isActive: boolean }
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
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Alert ID is required" }, { status: 400 });
    }

    const alert = await prisma.priceAlert.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!alert || alert.userId !== user.id) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    await prisma.priceAlert.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update alert error:", error);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}

/**
 * DELETE /api/alerts?id=xxx
 * Delete a price alert.
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
    const alertId = searchParams.get("id");

    if (!alertId) {
      return NextResponse.json({ error: "Alert ID is required" }, { status: 400 });
    }

    const alert = await prisma.priceAlert.findUnique({
      where: { id: alertId },
      select: { userId: true },
    });

    if (!alert || alert.userId !== user.id) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    await prisma.priceAlert.delete({ where: { id: alertId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete alert error:", error);
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 });
  }
}
