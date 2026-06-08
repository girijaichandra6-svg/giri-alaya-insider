import { prisma } from "@alaya/db/client";
import { ContentTable } from "./_components/content-table";
import { CreatePostDialog } from "./_components/create-post-dialog";

export const metadata = {
  title: "Content | ALAYA INSIDER Admin",
};

interface ContentPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    status?: string;
  }>;
}

const ITEMS_PER_PAGE = 20;

export default async function ContentPage({ searchParams }: ContentPageProps) {
  const sp = await searchParams;
  const query = sp.q?.trim() || "";
  const page = Math.max(1, parseInt(sp.page || "1"));
  const statusFilter = sp.status || "all";
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Build where clause
  const where: Record<string, unknown> = {};
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { excerpt: { contains: query, mode: "insensitive" } },
    ];
  }
  if (statusFilter !== "all") {
    where.status = statusFilter;
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        status: true,
        type: true,
        publishedAt: true,
        createdAt: true,
        category: { select: { name: true, accentColor: true } },
        author: { select: { name: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.post.count({ where: where as any }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-medium">Content Manager</h1>
          <p className="text-sm text-muted font-body mt-1">
            {total} post{total === 1 ? "" : "s"} total
          </p>
        </div>
        <CreatePostDialog />
      </div>

      <ContentTable
        posts={posts as any}
        query={query}
        statusFilter={statusFilter}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
