import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  subscribeToNewsletter,
  unsubscribe,
  getSubscriptionStatus,
  getSubscriberCount,
} from "@/server/api/email.service";

const subscribeSchema = z.object({
  email: z.string().email(),
  segments: z.array(z.string()).optional(),
});

/**
 * GET /api/newsletter
 * Get subscriber count and subscription status.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  try {
    if (email) {
      const status = await getSubscriptionStatus(email);
      if (!status) {
        return NextResponse.json(
          { subscribed: false },
          { status: 200 }
        );
      }
      return NextResponse.json({
        subscribed: status.status === "ACTIVE",
        status: status.status,
        segments: status.segments,
      });
    }

    const count = await getSubscriberCount();
    return NextResponse.json({ subscriberCount: count });
  } catch (error) {
    console.error("Newsletter status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch newsletter status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/newsletter
 * Subscribe an email to the newsletter.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const subscription = await subscribeToNewsletter(parsed.data);

    return NextResponse.json(
      {
        message: "Successfully subscribed",
        email: subscription.email,
        segments: subscription.segments,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/newsletter
 * Unsubscribe an email.
 */
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  try {
    await unsubscribe(email);
    return NextResponse.json({ message: "Successfully unsubscribed" });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
