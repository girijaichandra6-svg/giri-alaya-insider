import { prisma } from "@alaya/db/client";
import type { NextRequest } from "next/server";

/**
 * Log an admin audit event to the database.
 *
 * @param clerkUserId - The Clerk user ID of the admin performing the action
 * @param action - A concise description of the action (e.g., "product.create", "user.ban")
 * @param entity - The name of the entity being acted upon (e.g., "product", "post", "user")
 * @param entityId - The ID of the entity being acted upon
 * @param changes - Optional JSON-serializable object describing what changed
 * @param req - Optional NextRequest to extract IP and user-agent for the audit log
 */
export async function logAudit(
  clerkUserId: string,
  action: string,
  entity: string,
  entityId?: string,
  changes?: Record<string, unknown>,
  req?: NextRequest
) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!user) return;

    // Use Prisma.JsonNull for explicit null, or pass the changes object
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action,
        entity,
        entityId: entityId ?? null,
        changes: (changes ?? undefined) as any,
        ip: req?.headers.get("x-forwarded-for")?.split(",")?.[0]?.trim() ?? req?.headers.get("x-real-ip") ?? null,
        userAgent: req?.headers.get("user-agent") || null,
      },
    });
  } catch (error) {
    // Audit logging should never break the main operation
    console.error("Audit log error:", error);
  }
}
