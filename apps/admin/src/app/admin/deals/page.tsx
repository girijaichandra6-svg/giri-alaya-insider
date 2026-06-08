import { prisma } from "@alaya/db/client";
import { DealsTable } from "./_components/deals-table";
import { CreateDealDialog } from "./_components/create-deal-dialog";

export const metadata = {
  title: "Deals | ALAYA INSIDER Admin",
};

interface DealsPageProps {
  searchParams: Promise<{
    q?: string;
    active?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 20;

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const sp = await searchParams;
  const query = sp.q?.trim() || "";
  const activeFilter = sp.active || "all";
  const page = Math.max(1, parseInt(sp.page || "1"));
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Build where clause
  const where: Record<string, unknown> = {};
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { code: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }
  if (activeFilter === "active") where.isActive = true;
  else if (activeFilter === "expired") where.isActive = false;

  const [deals, total, products] = await Promise.all([
    prisma.deal.findMany({
      where: where as any,
      orderBy: { endDate: "asc" },
      skip,
      take: ITEMS_PER_PAGE,
      select: {
        id: true,
        title: true,
        description: true,
        code: true,
        discount: true,
        startDate: true,
        endDate: true,
        isActive: true,
        product: { select: { id: true, title: true, slug: true } },
        retailer: { select: { id: true, name: true } },
      },
    }),
    prisma.deal.count({ where: where as any }),
    prisma.product.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-medium">Deal Manager</h1>
          <p className="text-sm text-muted font-body mt-1">
            {total} deal{total === 1 ? "" : "s"} total
          </p>
        </div>
        <CreateDealDialog products={products as any} />
      </div>

      <DealsTable
        deals={deals as any}
        products={products as any}
        query={query}
        activeFilter={activeFilter}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
