import { prisma } from "@alaya/db/client";
import { UsersTable } from "./_components/users-table";

export const metadata = {
  title: "Users | ALAYA INSIDER Admin",
};

interface UsersPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    role?: string;
  }>;
}

const ITEMS_PER_PAGE = 20;

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const sp = await searchParams;
  const query = sp.q?.trim() || "";
  const page = Math.max(1, parseInt(sp.page || "1"));
  const roleFilter = sp.role || "all";
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Build where clause
  const where: Record<string, unknown> = {};
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
    ];
  }
  if (roleFilter !== "all") {
    where.role = roleFilter;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        deletedAt: true,
        createdAt: true,
        _count: { select: { reviews: true, posts: true, comments: true } },
      },
    }),
    prisma.user.count({ where: where as any }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-medium">User Management</h1>
          <p className="text-sm text-muted font-body mt-1">
            {total} user{total === 1 ? "" : "s"} total
          </p>
        </div>
      </div>

      <UsersTable
        users={users as any}
        query={query}
        roleFilter={roleFilter}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
