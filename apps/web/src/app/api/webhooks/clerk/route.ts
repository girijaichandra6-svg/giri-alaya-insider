import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { xprisma } from "@/server/lib/prisma-extensions";
import type { WebhookEvent } from "@clerk/nextjs/server";

/**
 * POST /api/webhooks/clerk
 *
 * Receives Clerk webhook events for user lifecycle (created, updated, deleted).
 *
 * Typesense Auto-Sync:
 * Products and Posts are automatically synced to the Typesense search index
 * via Prisma middleware (see @/server/lib/prisma-extensions.ts). Any create,
 * update, or delete operation on Product or Post through Prisma will
 * fire-and-forget an index/delete call to Typesense.
 *
 * For bulk reindexing, use:
 *   POST /api/typesense/sync   (full reindex, requires TYPESENSE_SYNC_SECRET)
 *   POST /api/webhooks/typesense  (event-driven, accepts product.* or post.* events)
 */
export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Missing CLERK_WEBHOOK_SECRET environment variable. " +
        "Add it from Clerk Dashboard > Webhooks."
    );
  }

  // Get Svix verification headers
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing Svix headers" },
      { status: 400 }
    );
  }

  // Read and verify the webhook payload
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;
  try {
    const wh = new Webhook(SIGNING_SECRET);
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  const eventType = evt.type;

  try {
    switch (eventType) {
      case "user.created":
      case "user.updated": {
        const clerkUser = evt.data;
        const primaryEmail =
          clerkUser.email_addresses?.find(
            (email) => email.id === clerkUser.primary_email_address_id
          )?.email_address ??
          clerkUser.email_addresses?.[0]?.email_address ??
          "";

        await xprisma.user.upsert({
          where: { clerkId: clerkUser.id },
          update: {
            email: primaryEmail,
            name:
              [clerkUser.first_name, clerkUser.last_name]
                .filter(Boolean)
                .join(" ") || undefined,
            avatarUrl: clerkUser.image_url,
            deletedAt: null, // Restore if previously deleted
          },
          create: {
            clerkId: clerkUser.id,
            email: primaryEmail,
            name:
              [clerkUser.first_name, clerkUser.last_name]
                .filter(Boolean)
                .join(" ") || undefined,
            avatarUrl: clerkUser.image_url,
            role: "USER",
            theme: "dark",
          },
        });

        console.log(
          `User ${eventType === "user.created" ? "created" : "updated"}: ${clerkUser.id}`
        );
        break;
      }

      case "user.deleted": {
        const clerkUserId = evt.data.id;
        if (clerkUserId) {
          // Use updateMany to avoid RecordNotFound if user doesn't exist locally
          const result = await xprisma.user.updateMany({
            where: { clerkId: clerkUserId },
            data: { deletedAt: new Date() },
          });
          if (result.count > 0) {
            console.log(`User soft-deleted: ${clerkUserId}`);
          } else {
            console.log(
              `User deletion skipped (not found in local DB): ${clerkUserId}`
            );
          }
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error(`Error processing webhook event ${eventType}:`, err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
