import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@alaya/db/client";
import { auth } from "@clerk/nextjs/server";
import { logAudit } from "@/lib/audit";

/**
 * PATCH /api/admin/users
 * Update a user (role, ban/unban).
 * Body: { id: string, role?: string, banned?: boolean }
 */
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, role, banned } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Prevent self-modification (admins can't ban/demote themselves)
    if (id === user.id) {
      return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 });
    }

    // Prevent admins from modifying SUPER_ADMIN users (only SUPER_ADMIN can)
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only SUPER_ADMIN can modify other SUPER_ADMIN users
    if (targetUser.role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Cannot modify SUPER_ADMIN users" }, { status: 403 });
    }

    // ADMIN can only assign USER or EDITOR roles, not ADMIN or SUPER_ADMIN
    if (role && user.role !== "SUPER_ADMIN") {
      const validRoles = ["USER", "EDITOR"];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Forbidden: Cannot assign this role" }, { status: 403 });
      }
    }

    const updateData: Record<string, unknown> = {};

    if (role !== undefined) {
      const validRoles = ["USER", "EDITOR", "ADMIN", "SUPER_ADMIN"];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      updateData.role = role;
    }

    if (banned !== undefined) {
      updateData.deletedAt = banned ? new Date() : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    await logAudit(userId, "user.update", "user", id, updateData, req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
