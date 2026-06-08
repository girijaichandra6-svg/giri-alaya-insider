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
 * POST /api/admin/content
 * Create a new post.
 * Body: { title: string, type?: string, excerpt?: string, categoryId?: string }
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
    const { title, type, excerpt, categoryId } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Validate type if provided
    const validTypes = ["ARTICLE", "GUIDE", "REVIEW", "COMPARISON", "DEAL", "NEWS", "GLOSSARY", "WEB_STORY", "VIDEO"];
    const postType = type && validTypes.includes(type) ? type : "ARTICLE";

    const slug = slugify(title);

    // Check for duplicate slug
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A post with this title already exists" }, { status: 409 });
    }

    // Auto-assign author if the user has a linked User record
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    const post = await prisma.post.create({
      data: {
        slug,
        title: title.trim(),
        excerpt: excerpt?.trim() ?? null,
        type: postType as any,
        status: "DRAFT",
        categoryId: categoryId || null,
        authorId: dbUser?.id || null,
      },
    });

    await logAudit(userId, "post.create", "post", post.id, { title: title.trim(), type: postType }, req);

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/content
 * Update a post (title, slug, status, excerpt, content).
 * Body: { id: string, title?: string, slug?: string, status?: PostStatus, excerpt?: string, content?: string }
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
    const { id, title, slug, status, excerpt, content } = body;

    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (status !== undefined) updateData.status = status;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;

    // If publishing, set publishedAt if not already set
    if (status === "PUBLISHED") {
      const existing = await prisma.post.findUnique({
        where: { id },
        select: { publishedAt: true },
      });
      if (existing && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    await prisma.post.update({
      where: { id },
      data: updateData,
    });

    await logAudit(userId, "post.update", "post", id, updateData, req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/content?id=xxx
 * Delete a post.
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
    const postId = searchParams.get("id");

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    await prisma.post.delete({ where: { id: postId } });

    await logAudit(userId, "post.delete", "post", postId, undefined, req);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
