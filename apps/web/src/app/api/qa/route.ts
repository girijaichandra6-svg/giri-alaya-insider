import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";

/**
 * GET /api/qa?productId=xxx
 * Fetch Q&A for a product.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 }
    );
  }

  try {
    const questions = await prisma.qA.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
      },
    });

    return NextResponse.json({ questions, total: questions.length });
  } catch (error) {
    console.error("QA error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Q&A" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/qa
 * Submit a new question.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, question, userId } = body;

    if (!productId || !question || !userId) {
      return NextResponse.json(
        { error: "productId, question, and userId are required" },
        { status: 400 }
      );
    }

    const qa = await prisma.qA.create({
      data: { productId, question, userId },
    });

    return NextResponse.json(qa, { status: 201 });
  } catch (error) {
    console.error("QA create error:", error);
    return NextResponse.json(
      { error: "Failed to submit question" },
      { status: 500 }
    );
  }
}
